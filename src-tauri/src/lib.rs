mod displayplacer;
mod presets;

use displayplacer::{apply_config, get_displays, toggle_display_enabled};
use presets::{add_preset, delete_preset, load_presets, save_presets, update_preset};

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
        .invoke_handler(tauri::generate_handler![
            get_displays,
            apply_config,
            toggle_display_enabled,
            load_presets,
            save_presets,
            add_preset,
            delete_preset,
            update_preset,
        ])
        .setup(|app| {
            // Create windows on all displays
            if let Err(e) = create_multi_display_windows(&app.handle()) {
                eprintln!("Failed to create multi-display windows: {}", e);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
