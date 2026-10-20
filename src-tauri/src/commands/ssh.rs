use crate::models::{RouterProfile, SshExecResult};
use parking_lot::Mutex;
use ssh2::{Channel, Session};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

// Structure to hold an active SSH streaming session
struct ActiveSession {
    channel: Arc<Mutex<Channel>>,
    is_alive: Arc<AtomicBool>,
}

use std::sync::OnceLock;

fn get_session_map() -> &'static Mutex<HashMap<String, ActiveSession>> {
    static MAP: OnceLock<Mutex<HashMap<String, ActiveSession>>> = OnceLock::new();
    MAP.get_or_init(|| Mutex::new(HashMap::new()))
}

pub fn create_session(profile: &RouterProfile) -> Result<Session, String> {
    let addr = format!("{}:{}", profile.host, profile.ssh_port);
    let socket = TcpStream::connect_timeout(
        &addr
            .parse()
            .map_err(|e| format!("Invalid host/port address '{}': {}", addr, e))?,
        Duration::from_secs(5),
    )
    .map_err(|e| format!("Could not connect to {}: {}", addr, e))?;

    let mut session = Session::new().map_err(|e| format!("Failed to create SSH session: {}", e))?;
    session.set_tcp_stream(socket);
    session.handshake().map_err(|e| format!("SSH handshake failed: {}", e))?;

    if profile.auth_type == "privateKey" {
        if let Some(key_path) = &profile.private_key {
            let path = std::path::Path::new(key_path);
            if path.exists() {
                session
                    .userauth_pubkey_file(
                        &profile.username,
                        None,
                        path,
                        profile.password.as_deref(),
                    )
                    .map_err(|e| format!("SSH public key auth failed: {}", e))?;
            } else {
                return Err(format!("Private key file not found: {}", key_path));
            }
        } else {
            return Err("Private key path not specified".to_string());
        }
    } else {
        let pass = profile.password.as_deref().unwrap_or("");
        session
            .userauth_password(&profile.username, pass)
            .map_err(|e| format!("SSH password authentication failed: {}", e))?;
    }

    if !session.authenticated() {
        return Err("SSH authentication failed (invalid credentials)".to_string());
    }

    Ok(session)
}

#[tauri::command]
pub fn exec_ssh_command(profile: RouterProfile, command: String) -> Result<SshExecResult, String> {
    let session = create_session(&profile)?;
    let mut channel = session
        .channel_session()
        .map_err(|e| format!("Failed to open channel: {}", e))?;

    // Map common aliases that OpenWrt's BusyBox ash lacks out-of-the-box
    let trimmed = command.trim();
    let effective_cmd = if trimmed == "ll" {
        "ls -la 2>/dev/null || ls -l".to_string()
    } else if trimmed.starts_with("ll ") {
        format!("ls -la {}", &trimmed[3..])
    } else {
        command.clone()
    };

    channel
        .exec(&effective_cmd)
        .map_err(|e| format!("Failed to exec command '{}': {}", command, e))?;

    let mut stdout = String::new();
    let mut stderr = String::new();

    let _ = channel.read_to_string(&mut stdout);
    let _ = channel.stderr().read_to_string(&mut stderr);
    let _ = channel.wait_close();

    let exit_code = channel.exit_status().unwrap_or(0);

    Ok(SshExecResult {
        stdout,
        stderr,
        exit_code,
    })
}

#[tauri::command]
pub fn start_ssh_session(
    app: AppHandle,
    profile: RouterProfile,
    cols: u32,
    rows: u32,
) -> Result<String, String> {
    let session = create_session(&profile)?;
    let mut channel = session
        .channel_session()
        .map_err(|e| format!("Failed to open channel for PTY: {}", e))?;

    channel
        .request_pty(
            "xterm-256color",
            None,
            Some((cols, rows, 0, 0)),
        )
        .map_err(|e| format!("Failed to request PTY: {}", e))?;

    channel
        .shell()
        .map_err(|e| format!("Failed to start shell: {}", e))?;

    // Seed OpenWrt shell environment with convenient aliases (like ll) quietly
    let _ = channel.write_all(b"alias ll='ls -la 2>/dev/null || ls -l'\n");
    let _ = channel.flush();

    let session_id = Uuid::new_v4().to_string();
    let channel_arc = Arc::new(Mutex::new(channel));
    let is_alive = Arc::new(AtomicBool::new(true));

    {
        let mut map = get_session_map().lock();
        map.insert(
            session_id.clone(),
            ActiveSession {
                channel: channel_arc.clone(),
                is_alive: is_alive.clone(),
            },
        );
    }

    // Spawn read thread
    let sid = session_id.clone();
    let channel_read = channel_arc.clone();
    let is_alive_read = is_alive.clone();

    std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        while is_alive_read.load(Ordering::Relaxed) {
            let read_result = {
                let mut chan = channel_read.lock();
                chan.read(&mut buf)
            };

            match read_result {
                Ok(0) => {
                    // EOF reached
                    break;
                }
                Ok(n) => {
                    let chunk = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app.emit(&format!("ssh-data-{}", sid), chunk);
                }
                Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    std::thread::sleep(Duration::from_millis(20));
                }
                Err(_) => {
                    break;
                }
            }
        }

        is_alive_read.store(false, Ordering::Relaxed);
        let _ = app.emit(&format!("ssh-exit-{}", sid), ());
        let mut map = get_session_map().lock();
        map.remove(&sid);
    });

    Ok(session_id)
}

#[tauri::command]
pub fn send_ssh_input(session_id: String, data: String) -> Result<(), String> {
    let map = get_session_map().lock();
    if let Some(sess) = map.get(&session_id) {
        if sess.is_alive.load(Ordering::Relaxed) {
            let mut chan = sess.channel.lock();
            chan.write_all(data.as_bytes())
                .map_err(|e| format!("Failed to send data to SSH shell: {}", e))?;
            chan.flush().map_err(|e| format!("Failed to flush SSH input: {}", e))?;
            return Ok(());
        }
    }
    Err("SSH session not active".to_string())
}

#[tauri::command]
pub fn resize_ssh_session(session_id: String, cols: u32, rows: u32) -> Result<(), String> {
    let map = get_session_map().lock();
    if let Some(sess) = map.get(&session_id) {
        if sess.is_alive.load(Ordering::Relaxed) {
            let mut chan = sess.channel.lock();
            chan.request_pty_size(cols, rows, None, None)
                .map_err(|e| format!("Failed to resize PTY: {}", e))?;
            return Ok(());
        }
    }
    Err("SSH session not active".to_string())
}

#[tauri::command]
pub fn close_ssh_session(session_id: String) -> Result<(), String> {
    let mut map = get_session_map().lock();
    if let Some(sess) = map.remove(&session_id) {
        sess.is_alive.store(false, Ordering::Relaxed);
        let mut chan = sess.channel.lock();
        let _ = chan.send_eof();
        let _ = chan.close();
    }
    Ok(())
}
