mod displayplacer;
mod presets;
mod hotkeys;
mod system_tray;

use displayplacer::{apply_config, get_displays, toggle_display_enabled};
use presets::{add_preset, delete_preset, load_presets, save_presets, update_preset};
use hotkeys::{
    register_preset_hotkey, unregister_hotkey, unregister_all_hotkeys,
    is_hotkey_available, get_registered_hotkeys, validate_hotkey_format,
    initialize_default_hotkeys
};
use system_tray::{init_system_tray, handle_tray_menu_event, update_tray_menu};

/// Update the system tray menu (command for frontend)
#[tauri::command]
async fn update_tray_presets(app: tauri::AppHandle) -> Result<(), String> {
    update_tray_menu(&app)
        .map_err(|e| format!("Failed to update tray menu: {}", e))
}

/// Create windows on all available displays
fn create_multi_display_windows(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Get all available monitors
    let _monitors = app.primary_monitor()?.ok_or("No primary monitor found")?;
    let available_monitors = app.available_monitors()?;

    println!("Found {} monitors", available_monitors.len());

    // If only one monitor, just use the main window
    if available_monitors.len() <= 1 {
        return Ok(());
    }

    // Create a secondary window on each additional monitor
    for (idx, monitor) in available_monitors.iter().enumerate().skip(1) {
        let position = monitor.position();
        let size = monitor.size();

        // Create a smaller window centered on each display
        let window_width = 600.0;
        let window_height = 700.0;
        let x = position.x as f64 + (size.width as f64 - window_width) / 2.0;
        let y = position.y as f64 + (size.height as f64 - window_height) / 2.0;

        tauri::WebviewWindowBuilder::new(
            app,
            format!("display_{}", idx),
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title(format!("DPUI - Display {}", idx + 1))
        .inner_size(window_width, window_height)
        .position(x, y)
        .resizable(true)
        .build()?;

        println!("Created window on display {} at ({}, {})", idx + 1, x, y);
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_displays,
            apply_config,
            toggle_display_enabled,
            load_presets,
            save_presets,
            add_preset,
            delete_preset,
            update_preset,
            // Hotkey commands
            register_preset_hotkey,
            unregister_hotkey,
            unregister_all_hotkeys,
            is_hotkey_available,
            get_registered_hotkeys,
            validate_hotkey_format,
            // System tray commands
            update_tray_presets,
        ])
        .setup(|app| {
            // Create windows on all displays
            if let Err(e) = create_multi_display_windows(&app.handle()) {
                eprintln!("Failed to create multi-display windows: {}", e);
            }

            // Initialize default hotkeys
            if let Err(e) = initialize_default_hotkeys(&app.handle()) {
                eprintln!("Failed to initialize default hotkeys: {}", e);
            }

            // Initialize system tray
            if let Err(e) = init_system_tray(app) {
                eprintln!("Failed to initialize system tray: {}", e);
            }

            Ok(())
        })
        .on_menu_event(|app, event| {
            // Handle tray menu events
            handle_tray_menu_event(app, &event.id.as_ref());
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
