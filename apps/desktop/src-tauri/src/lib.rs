mod bridge_server;
mod bridge_state;
mod tray;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_global_shortcut::Builder::new().build())?;

            if let Some(window) = app.get_webview_window("main") {
                window.set_title("Signal Vault Companion")?;
            }

            let bridge_state = bridge_state::BridgeStateStore::default();
            if let Err(error) = bridge_server::spawn_bridge_server(bridge_state) {
                eprintln!("[bridge] failed to start localhost bridge: {error}");
            }

            tray::create_tray(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Signal Vault Companion");
}
