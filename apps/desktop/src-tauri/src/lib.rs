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
            bridge_pairing::get_bridge_pairing_token
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
            if let Err(error) = bridge_server::spawn_bridge_server(bridge_state, pairing_token) {
                eprintln!("[bridge] failed to start localhost bridge: {error}");
            }

            tray::create_tray(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Signal Vault Companion");
}
