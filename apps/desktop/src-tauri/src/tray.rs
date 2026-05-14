use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    App, Manager, Wry,
};
use tauri_plugin_opener::OpenerExt;

use crate::vault_url::configured_vault_url;

const SHOW_OVERLAY: &str = "show_overlay";
const HIDE_OVERLAY: &str = "hide_overlay";
const TOGGLE_OVERLAY: &str = "toggle_overlay";
const OPEN_VAULT: &str = "open_vault";
const QUIT: &str = "quit";

pub fn create_tray(app: &mut App<Wry>) -> tauri::Result<()> {
    let show_overlay = MenuItem::with_id(app, SHOW_OVERLAY, "Show Overlay", true, None::<&str>)?;
    let hide_overlay = MenuItem::with_id(app, HIDE_OVERLAY, "Hide Overlay", true, None::<&str>)?;
    let toggle_overlay =
        MenuItem::with_id(app, TOGGLE_OVERLAY, "Toggle Overlay", true, None::<&str>)?;
    let open_vault = MenuItem::with_id(app, OPEN_VAULT, "Open Vault", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, QUIT, "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(
        app,
        &[
            &show_overlay,
            &hide_overlay,
            &toggle_overlay,
            &open_vault,
            &quit,
        ],
    )?;

    TrayIconBuilder::new()
        .tooltip("Signal Vault Companion")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| {
            if let Err(error) = handle_tray_menu_event(app, event.id().as_ref()) {
                eprintln!("[tray] {error}");
            }
        })
        .build(app)?;

    Ok(())
}

fn handle_tray_menu_event(app: &tauri::AppHandle, id: &str) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window("main") else {
        return Ok(());
    };

    match id {
        SHOW_OVERLAY => {
            window.show()?;
            window.set_focus()?;
        }
        HIDE_OVERLAY => {
            window.hide()?;
        }
        TOGGLE_OVERLAY => {
            if window.is_visible()? {
                window.hide()?;
            } else {
                window.show()?;
                window.set_focus()?;
            }
        }
        OPEN_VAULT => open_vault_url(app)?,
        QUIT => app.exit(0),
        _ => {}
    }

    Ok(())
}

fn open_vault_url(app: &tauri::AppHandle) -> tauri::Result<()> {
    if let Err(error) = app.opener().open_url(configured_vault_url(), None::<&str>) {
        eprintln!("[tray] failed to open Signal Vault URL: {error}");
    }

    Ok(())
}
