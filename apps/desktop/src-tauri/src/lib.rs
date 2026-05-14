mod bridge_commands;
mod bridge_host_status;
mod bridge_pairing;
mod bridge_server;
mod bridge_state;
mod tray;
mod vault_url;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            bridge_host_status::get_bridge_host_status,
            bridge_pairing::get_bridge_pairing_token,
            bridge_commands::queue_current_system_command,
            bridge_commands::queue_quick_note_command
        ])
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_global_shortcut::Builder::new().build())?;

            if let Some(window) = app.get_webview_window("main") {
                window.set_title("Signal Vault Companion")?;
            }

            let pairing_token =
                bridge_pairing::load_or_create_pairing_token(&app.path().app_config_dir()?)?;
            app.manage(bridge_pairing::BridgePairingToken::new(
                pairing_token.clone(),
            ));

            let bridge_state = bridge_state::BridgeStateStore::default();
            let command_queue = bridge_commands::BridgeCommandQueue::default();
            app.manage(command_queue.clone());
            let bridge_host_status = match bridge_server::spawn_bridge_server(
                bridge_state,
                command_queue,
                pairing_token,
            ) {
                Ok(_) => bridge_host_status::BridgeHostStatus::running(),
                Err(error) => {
                    eprintln!("[bridge] failed to start localhost bridge: {error}");
                    bridge_host_status::BridgeHostStatus::from_start_error(&error)
                }
            };
            app.manage(bridge_host_status);

            tray::create_tray(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Signal Vault Companion");
}
