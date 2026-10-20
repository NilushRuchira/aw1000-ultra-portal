pub mod commands;
pub mod models;

use commands::{
    profile::{delete_profile, get_profiles, save_profile},
    ssh::{
        close_ssh_session, exec_ssh_command, resize_ssh_session, send_ssh_input, start_ssh_session,
    },
    test_connection,
    ubus::ubus_call,
    uci::update_wifi_uci,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            test_connection,
            exec_ssh_command,
            start_ssh_session,
            send_ssh_input,
            resize_ssh_session,
            close_ssh_session,
            ubus_call,
            update_wifi_uci,
            get_profiles,
            save_profile,
            delete_profile,
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
