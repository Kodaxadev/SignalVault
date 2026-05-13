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

            tray::create_tray(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Signal Vault Companion");
}
