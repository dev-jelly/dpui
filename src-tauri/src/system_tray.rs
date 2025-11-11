//! System tray (menu bar) integration for macOS.
//!
//! Provides quick access to display presets and application controls
//! through the macOS menu bar.

use tauri::{
    menu::{Menu, PredefinedMenuItem, Submenu, MenuItemBuilder},
    tray::{TrayIcon, TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState},
    AppHandle, Emitter, Manager, Runtime,
};

/// Initialize the system tray icon and menu.
///
/// Creates a menu bar icon with quick access to presets and app controls.
///
/// # Arguments
/// * `app` - Tauri application handle
///
/// # Returns
/// * `Ok(())` - Tray initialized successfully
/// * `Err(String)` - Error message if initialization fails
pub fn init_system_tray<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>>
where
    R: Runtime,
    AppHandle<R>: Manager<R>,
{
    // Create the tray menu
    let menu = create_tray_menu(app)?;

    // Create tray icon
    // Note: You need to add an icon file in src-tauri/icons/tray-icon.png
    let _tray = TrayIconBuilder::with_id("main")
        .tooltip("DPUI - Display Manager")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            handle_tray_event(tray, event);
        })
        .build(app)?;

    println!("[Tray] System tray initialized");
    Ok(())
}

/// Create the tray menu structure.
fn create_tray_menu<R: Runtime>(app: &AppHandle<R>) -> Result<Menu<R>, Box<dyn std::error::Error>> {
    let menu = Menu::new(app)?;

    // Show/Hide Window
    let show_hide = MenuItemBuilder::with_id("show_hide", "Show/Hide DPUI")
        .build(app)?;
    menu.append(&show_hide)?;

    // Separator
    menu.append(&PredefinedMenuItem::separator(app)?)?;

    // Quick Presets submenu
    let presets_menu = create_presets_submenu(app)?;
    menu.append(&presets_menu)?;

    // Separator
    menu.append(&PredefinedMenuItem::separator(app)?)?;

    // Refresh Displays
    let refresh = MenuItemBuilder::with_id("refresh", "Refresh Displays")
        .accelerator("Cmd+R")
        .build(app)?;
    menu.append(&refresh)?;

    // Separator
    menu.append(&PredefinedMenuItem::separator(app)?)?;

    // Quit
    let quit = MenuItemBuilder::with_id("quit", "Quit DPUI")
        .accelerator("Cmd+Q")
        .build(app)?;
    menu.append(&quit)?;

    Ok(menu)
}

/// Create the presets submenu.
fn create_presets_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, Box<dyn std::error::Error>> {
    let presets_menu = Submenu::with_id(app, "presets", "Quick Presets", true)?;

    // Note: Presets will be loaded asynchronously and the menu will be updated
    // via update_tray_menu() once presets are available

    // Add "Manage Presets" option
    let manage_presets = MenuItemBuilder::with_id("manage_presets", "Manage Presets...")
        .build(app)?;
    presets_menu.append(&manage_presets)?;

    Ok(presets_menu)
}

/// Handle tray icon events.
fn handle_tray_event(_tray: &TrayIcon, event: TrayIconEvent) {
    match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Down,
            ..
        } => {
            // Left click - could show a quick status popup
            println!("[Tray] Left click");
        }
        TrayIconEvent::Click {
            button: MouseButton::Right,
            button_state: MouseButtonState::Down,
            ..
        } => {
            // Right click - show the menu (this is default behavior)
            println!("[Tray] Right click - showing menu");
        }
        _ => {}
    }
}

/// Handle tray menu item clicks.
///
/// This function should be called from the main app event handler.
///
/// # Arguments
/// * `app` - Application handle
/// * `id` - Menu item ID that was clicked
pub fn handle_tray_menu_event<R: Runtime>(app: &AppHandle<R>, id: &str) {
    match id {
        "show_hide" => {
            toggle_window_visibility(app);
        }
        "refresh" => {
            refresh_displays(app);
        }
        "manage_presets" => {
            show_main_window(app);
        }
        "quit" => {
            app.exit(0);
        }
        id if id.starts_with("preset_") => {
            apply_preset_from_tray(app, id);
        }
        _ => {
            println!("[Tray] Unknown menu item: {}", id);
        }
    }
}

/// Toggle main window visibility.
fn toggle_window_visibility<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
            println!("[Tray] Window hidden");
        } else {
            let _ = window.show();
            let _ = window.set_focus();
            println!("[Tray] Window shown");
        }
    }
}

/// Show the main window and bring it to front.
fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.unminimize();
        println!("[Tray] Main window shown");
    }
}

/// Refresh display configuration.
fn refresh_displays<R: Runtime>(app: &AppHandle<R>) {
    // Emit event to frontend to refresh displays
    let _ = app.emit("refresh-displays", ());
    println!("[Tray] Refresh displays requested");
}

/// Apply a preset from the tray menu.
fn apply_preset_from_tray<R: Runtime>(app: &AppHandle<R>, menu_id: &str) {
    // Extract preset ID from menu ID (format: "preset_<uuid>")
    if let Some(preset_id) = menu_id.strip_prefix("preset_") {
        // Emit event to frontend to apply the preset
        let _ = app.emit("apply-preset-from-tray", preset_id);
        println!("[Tray] Apply preset: {}", preset_id);

        // Show a native notification (optional)
        #[cfg(target_os = "macos")]
        {
            // You could add native notification here
            println!("[Tray] Preset applied via tray: {}", preset_id);
        }
    }
}

/// Update the tray menu with new presets.
///
/// Call this when presets are added, removed, or modified.
///
/// # Arguments
/// * `app` - Application handle
pub fn update_tray_menu<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    // Recreate the menu with updated presets
    let menu = create_tray_menu(app)?;

    // Update the tray icon's menu
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_menu(Some(menu))?;
        println!("[Tray] Menu updated");
    }

    Ok(())
}

/// Show tray notification.
///
/// Displays a temporary notification near the tray icon.
///
/// # Arguments
/// * `title` - Notification title
/// * `message` - Notification message
#[allow(dead_code)]
pub fn show_tray_notification(title: &str, message: &str) {
    // This would typically use native notification APIs
    // For now, just log it
    println!("[Tray Notification] {}: {}", title, message);

    // On macOS, you could use:
    #[cfg(target_os = "macos")]
    {
        // Implementation would go here using native macOS notification center
        // or a third-party crate like notify-rust
    }
}