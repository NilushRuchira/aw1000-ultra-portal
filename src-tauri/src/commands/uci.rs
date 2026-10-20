use crate::commands::ssh::create_session;
use crate::models::{RouterProfile, UciUpdateResponse};
use std::io::Read;

#[tauri::command]
pub fn update_wifi_uci(
    profile: RouterProfile,
    _device: String,
    ifname: String,
    new_ssid: String,
    new_key: Option<String>,
    encryption: Option<String>,
) -> Result<UciUpdateResponse, String> {
    let session = create_session(&profile)?;

    // Escape single quotes in SSID and key
    let safe_ssid = new_ssid.replace('\'', "'\\''");

    // We can locate the specific wifi-iface matching ifname or update default
    let mut script = format!(
        "for sec in $(uci show wireless | grep -E '\\.ifname=[\"\\']?{}[\"\\']?' | cut -d'.' -f2 | cut -d'=' -f1); do \
            uci set wireless.$sec.ssid='{}'; ",
        ifname, safe_ssid
    );

    if let Some(key) = new_key {
        if !key.is_empty() {
            let safe_key = key.replace('\'', "'\\''");
            script.push_str(&format!("uci set wireless.$sec.key='{}'; ", safe_key));
        }
    }

    if let Some(enc) = encryption {
        script.push_str(&format!("uci set wireless.$sec.encryption='{}'; ", enc));
    }

    script.push_str("done; uci commit wireless && (wifi reload 2>&1 || /etc/init.d/network reload 2>&1)");

    let mut channel = session
        .channel_session()
        .map_err(|e| format!("Failed to open channel: {}", e))?;

    channel
        .exec(&script)
        .map_err(|e| format!("Failed to exec UCI update script: {}", e))?;

    let mut output = String::new();
    let _ = channel.read_to_string(&mut output);
    let _ = channel.wait_close();

    Ok(UciUpdateResponse {
        success: true,
        message: format!("SSID updated to '{}' and wireless configuration reloaded.", new_ssid),
    })
}
