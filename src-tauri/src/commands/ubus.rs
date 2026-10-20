use crate::models::RouterProfile;
use reqwest::Client;
use serde_json::{json, Value};
use std::time::Duration;

pub fn get_ubus_url(profile: &RouterProfile) -> String {
    let scheme = if profile.use_https { "https" } else { "http" };
    format!("{}://{}:{}/ubus", scheme, profile.host, profile.http_port)
}

fn build_client() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(6))
        .danger_accept_invalid_certs(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))
}

pub async fn get_session_token(client: &Client, profile: &RouterProfile) -> Result<String, String> {
    let url = get_ubus_url(profile);
    let payload = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "call",
        "params": [
            "00000000000000000000000000000000",
            "session",
            "login",
            {
                "username": profile.username,
                "password": profile.password.as_deref().unwrap_or("")
            }
        ]
    });

    let resp = client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("HTTP request to uBus failed at '{}': {}", url, e))?;

    if !resp.status().is_success() {
        return Err(format!("uBus HTTP status {}: {}", resp.status(), resp.status().canonical_reason().unwrap_or("")));
    }

    let val: Value = resp.json().await.map_err(|e| format!("Invalid JSON from uBus: {}", e))?;

    // Result is array: [code, { ubus_rpc_session: "..." }]
    if let Some(res_arr) = val.get("result").and_then(|r| r.as_array()) {
        if let Some(code) = res_arr.first().and_then(|c| c.as_i64()) {
            if code != 0 {
                return Err(format!("uBus login returned error code {}", code));
            }
        }
        if let Some(obj) = res_arr.get(1).and_then(|o| o.as_object()) {
            if let Some(token) = obj.get("ubus_rpc_session").and_then(|t| t.as_str()) {
                return Ok(token.to_string());
            }
        }
    }

    if let Some(err) = val.get("error") {
        return Err(format!("uBus error: {}", err));
    }

    Err("Invalid uBus login response format".to_string())
}

#[tauri::command]
pub async fn ubus_call(
    profile: RouterProfile,
    path: String,
    method: String,
    params: Value,
) -> Result<Value, String> {
    let client = build_client()?;
    let token = get_session_token(&client, &profile).await?;
    let url = get_ubus_url(&profile);

    let payload = json!({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "call",
        "params": [
            token,
            path,
            method,
            params
        ]
    });

    let resp = client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("uBus call failed: {}", e))?;

    let val: Value = resp.json().await.map_err(|e| format!("Failed to parse response: {}", e))?;

    if let Some(res_arr) = val.get("result").and_then(|r| r.as_array()) {
        if let Some(code) = res_arr.first().and_then(|c| c.as_i64()) {
            if code != 0 {
                return Err(format!("uBus error code {} for {}.{}", code, path, method));
            }
        }
        if let Some(data) = res_arr.get(1) {
            return Ok(data.clone());
        }
    }

    if let Some(err) = val.get("error") {
        return Err(format!("uBus JSON-RPC error: {}", err));
    }

    Ok(val)
}
