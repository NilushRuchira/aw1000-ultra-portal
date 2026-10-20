use crate::commands::ssh::create_session;
use crate::models::RouterProfile;
use serde_json::{json, Value};
use std::io::Read;

#[tauri::command]
pub fn get_router_logs(
    profile: RouterProfile,
    source: String,
    lines: u32,
    filter: Option<String>,
) -> Result<Value, String> {
    let session = create_session(&profile)?;

    let line_count = if lines == 0 { 100 } else { lines };
    let grep_filter = filter.unwrap_or_default().trim().to_string();

    let cmd = match source.as_str() {
        "kernel" => {
            if grep_filter.is_empty() {
                format!("dmesg | tail -n {}", line_count)
            } else {
                format!("dmesg | grep -iE '{}' | tail -n {}", grep_filter, line_count)
            }
        }
        "cellular" => {
            let expr = if grep_filter.is_empty() {
                "modem|wwan|cdc|ttyUSB|quectel|uqmi|mmcli|lte|5g|qmi|cops|qeng|qnw"
            } else {
                &grep_filter
            };
            format!(
                "(logread | grep -iE '{}' | tail -n {}) || (dmesg | grep -iE '{}' | tail -n {})",
                expr, line_count, expr, line_count
            )
        }
        "firewall" => {
            let expr = if grep_filter.is_empty() {
                "firewall|drop|reject|conntrack|iptables|nft"
            } else {
                &grep_filter
            };
            format!("logread | grep -iE '{}' | tail -n {}", expr, line_count)
        }
        "dhcp_wifi" => {
            let expr = if grep_filter.is_empty() {
                "dnsmasq|hostapd|wlan|station|dhcp"
            } else {
                &grep_filter
            };
            format!("logread | grep -iE '{}' | tail -n {}", expr, line_count)
        }
        _ => {
            if grep_filter.is_empty() {
                format!("logread -l {} 2>/dev/null || logread | tail -n {}", line_count, line_count)
            } else {
                format!("logread | grep -iE '{}' | tail -n {}", grep_filter, line_count)
            }
        }
    };

    let mut channel = session.channel_session().map_err(|e| format!("Channel error: {}", e))?;
    channel.exec(&cmd).map_err(|e| format!("Exec error: {}", e))?;

    let mut raw_logs = String::new();
    let _ = channel.read_to_string(&mut raw_logs);
    let _ = channel.wait_close();

    // Parse lines into structured log items
    let mut parsed_items = Vec::new();
    let mut item_index = 0;

    for line in raw_logs.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        item_index += 1;
        let id = format!("log-{}-{}", item_index, source);

        // Classify severity
        let lower = trimmed.to_lowercase();
        let severity = if lower.contains("err") || lower.contains("fail") || lower.contains("fatal") || lower.contains("panic") {
            "error"
        } else if lower.contains("warn") || lower.contains("timeout") || lower.contains("conflict") || lower.contains("collision") {
            "warn"
        } else if lower.contains("notice") || lower.contains("attached") || lower.contains("established") || lower.contains("connected") {
            "notice"
        } else if lower.contains("debug") {
            "debug"
        } else {
            "info"
        };

        // Extract daemon/facility heuristic
        let mut daemon = "system".to_string();
        let mut message = trimmed.to_string();
        let mut timestamp = "Just now".to_string();

        // Check if OpenWrt format: "Tue Oct 20 21:55:01 2026 daemon.info netifd: Interface 'wan' is up"
        let parts: Vec<&str> = trimmed.split_whitespace().collect();
        if parts.len() >= 6 && (parts[0].len() == 3 || parts[0].chars().all(|c| c.is_alphabetic())) {
            timestamp = parts[0..3].join(" ");
            let rest = parts[3..].join(" ");
            if let Some(colon_pos) = rest.find(':') {
                daemon = rest[..colon_pos].trim().to_string();
                message = rest[colon_pos + 1..].trim().to_string();
            }
        } else if trimmed.starts_with('[') {
            // Kernel dmesg format: "[ 120.456789] qmi_wwan 1-1.2:1.4 wwan0: register 'qmi_wwan'..."
            if let Some(bracket_end) = trimmed.find(']') {
                timestamp = trimmed[1..bracket_end].trim().to_string();
                let rest = trimmed[bracket_end + 1..].trim();
                if let Some(colon_pos) = rest.find(':') {
                    daemon = rest[..colon_pos].trim().to_string();
                    message = rest[colon_pos + 1..].trim().to_string();
                } else {
                    daemon = "kernel".to_string();
                    message = rest.to_string();
                }
            }
        }

        parsed_items.push(json!({
            "id": id,
            "timestamp": timestamp,
            "severity": severity,
            "facility": source,
            "daemon": daemon,
            "message": message
        }));
    }

    Ok(json!({
        "source": source,
        "total": parsed_items.len(),
        "items": parsed_items,
        "raw": raw_logs
    }))
}

#[tauri::command]
pub fn get_vnstat_traffic(profile: RouterProfile) -> Result<Value, String> {
    let session = create_session(&profile)?;

    // Probe vnStat installation and capture JSON or fallback /proc/net/dev
    let probe_cmd = r#"
if which vnstat >/dev/null 2>&1; then
    echo "VNSTAT_INSTALLED:1"
    vnstat --version 2>&1 | head -n 1
    vnstat --json 2>/dev/null
else
    echo "VNSTAT_INSTALLED:0"
    echo "NETDEV_START"
    cat /proc/net/dev 2>/dev/null
    echo "NETDEV_END"
fi
"#;

    let mut channel = session.channel_session().map_err(|e| format!("Channel error: {}", e))?;
    channel.exec(probe_cmd).map_err(|e| format!("Exec error: {}", e))?;

    let mut output = String::new();
    let _ = channel.read_to_string(&mut output);
    let _ = channel.wait_close();

    let is_installed = output.contains("VNSTAT_INSTALLED:1");

    if is_installed {
        // Try parsing JSON from vnstat --json output
        if let Some(json_start) = output.find('{') {
            let json_str = &output[json_start..];
            if let Ok(val) = serde_json::from_str::<Value>(json_str) {
                return Ok(json!({
                    "installed": true,
                    "rawVnstat": val,
                    "message": "Live vnStat traffic data collected"
                }));
            }
        }

        Ok(json!({
            "installed": true,
            "message": "vnStat is installed on router but database is populating."
        }))
    } else {
        Ok(json!({
            "installed": false,
            "message": "vnStat is not currently installed on OpenWrt."
        }))
    }
}

#[tauri::command]
pub fn install_vnstat(profile: RouterProfile) -> Result<Value, String> {
    let session = create_session(&profile)?;

    // Install vnstat and enable the daemon on OpenWrt
    let install_cmd = "opkg update && opkg install vnstat vnstati && \
                       /etc/init.d/vnstat enable && /etc/init.d/vnstat start";

    let mut channel = session.channel_session().map_err(|e| format!("Channel error: {}", e))?;
    channel.exec(install_cmd).map_err(|e| format!("Exec error: {}", e))?;

    let mut out = String::new();
    let _ = channel.read_to_string(&mut out);
    let _ = channel.wait_close();

    let success = out.contains("Configuring vnstat") || out.contains("already installed") || !out.contains("Unknown package");

    Ok(json!({
        "success": success,
        "message": if success {
            "vnStat installed successfully and service started."
        } else {
            "Installation attempted. Check opkg output."
        },
        "output": out
    }))
}
