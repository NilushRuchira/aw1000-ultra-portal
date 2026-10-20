pub mod cellular;
pub mod logs;
pub mod profile;
pub mod ssh;
pub mod ubus;
pub mod uci;

use crate::models::{ConnectionTestResult, RouterProfile};
use reqwest::Client;
use std::time::Duration;

#[tauri::command]
pub async fn test_connection(profile: RouterProfile) -> Result<ConnectionTestResult, String> {
    let mut result = ConnectionTestResult {
        ubus_available: false,
        ssh_available: false,
        ubus_error: None,
        ssh_error: None,
        missing_packages: None,
    };

    // 1. Test uBus HTTP endpoint
    let client = Client::builder()
        .timeout(Duration::from_secs(4))
        .danger_accept_invalid_certs(true)
        .build();

    match client {
        Ok(c) => match ubus::get_session_token(&c, &profile).await {
            Ok(_) => {
                result.ubus_available = true;
            }
            Err(e) => {
                let err_str = e.clone();
                result.ubus_error = Some(e);
                if err_str.contains("404") || err_str.contains("error code 4") {
                    result.missing_packages = Some(vec![
                        "rpcd-mod-rpcsys".to_string(),
                        "uhttpd-mod-ubus".to_string(),
                    ]);
                }
            }
        },
        Err(e) => {
            result.ubus_error = Some(format!("Client creation error: {}", e));
        }
    }

    // 2. Test SSH handshake and authentication
    let prof_clone = profile.clone();
    let ssh_res = tokio::task::spawn_blocking(move || ssh::create_session(&prof_clone)).await;

    match ssh_res {
        Ok(Ok(_sess)) => {
            result.ssh_available = true;
        }
        Ok(Err(e)) => {
            result.ssh_error = Some(e);
        }
        Err(e) => {
            result.ssh_error = Some(format!("SSH task join error: {}", e));
        }
    }

    Ok(result)
}
