//! Global hotkey management for preset activation.
//!
//! This module handles system-wide keyboard shortcuts that allow users
//! to quickly apply display presets without switching to the application.

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

/// Represents a hotkey binding for a preset.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotkeyBinding {
    /// Unique preset ID
    pub preset_id: String,
    /// Shortcut string (e.g., "Cmd+Shift+1")
    pub shortcut: String,
    /// Human-readable description
    pub description: String,
}

/// Result type for hotkey operations
pub type HotkeyResult<T> = Result<T, String>;

/// Register a global hotkey for a preset.
///
/// # Arguments
/// * `app` - Tauri application handle
/// * `preset_id` - Unique identifier for the preset
/// * `shortcut_str` - Keyboard shortcut string (e.g., "Cmd+Shift+1")
///
/// # Returns
/// * `Ok(())` - Hotkey registered successfully
/// * `Err(String)` - Error message if registration fails
#[tauri::command]
pub async fn register_preset_hotkey(
    app: AppHandle,
    preset_id: String,
    shortcut_str: String,
) -> HotkeyResult<()> {
    let shortcut = match shortcut_str.parse::<Shortcut>() {
        Ok(s) => s,
        Err(e) => return Err(format!("Invalid shortcut format: {}", e)),
    };

    // Check if shortcut is already registered
    let shortcuts = app.global_shortcut();
    if shortcuts.is_registered(shortcut) {
        return Err(format!("Shortcut {} is already in use", shortcut_str));
    }

    // Register the shortcut
    let preset_id_clone = preset_id.clone();
    let app_clone = app.clone();

    shortcuts
        .on_shortcut(shortcut, move |_app, _shortcut, _event| {
            if matches!(_event.state, ShortcutState::Pressed) {
                // Emit event to frontend to apply the preset
                let _ = app_clone.emit("apply-preset-hotkey", &preset_id_clone);

                // Log the hotkey activation
                println!("[Hotkey] Activated preset: {}", preset_id_clone);
            }
        })
        .map_err(|e| format!("Failed to register shortcut: {}", e))?;

    // Store the binding for later reference
    let _ = app.emit("hotkey-registered", HotkeyBinding {
        preset_id,
        shortcut: shortcut_str.clone(),
        description: format!("Apply preset with {}", shortcut_str),
    });

    Ok(())
}

/// Unregister a global hotkey.
///
/// # Arguments
/// * `app` - Tauri application handle
/// * `shortcut_str` - Keyboard shortcut string to unregister
///
/// # Returns
/// * `Ok(())` - Hotkey unregistered successfully
/// * `Err(String)` - Error message if unregistration fails
#[tauri::command]
pub async fn unregister_hotkey(app: AppHandle, shortcut_str: String) -> HotkeyResult<()> {
    let shortcut = match shortcut_str.parse::<Shortcut>() {
        Ok(s) => s,
        Err(e) => return Err(format!("Invalid shortcut format: {}", e)),
    };

    let shortcuts = app.global_shortcut();

    shortcuts
        .unregister(shortcut)
        .map_err(|e| format!("Failed to unregister shortcut: {}", e))?;

    println!("[Hotkey] Unregistered: {}", shortcut_str);
    Ok(())
}

/// Unregister all global hotkeys.
///
/// # Arguments
/// * `app` - Tauri application handle
///
/// # Returns
/// * `Ok(())` - All hotkeys unregistered successfully
/// * `Err(String)` - Error message if unregistration fails
#[tauri::command]
pub async fn unregister_all_hotkeys(app: AppHandle) -> HotkeyResult<()> {
    let shortcuts = app.global_shortcut();

    shortcuts
        .unregister_all()
        .map_err(|e| format!("Failed to unregister all shortcuts: {}", e))?;

    println!("[Hotkey] Unregistered all shortcuts");
    Ok(())
}

/// Check if a hotkey is available (not already registered).
///
/// # Arguments
/// * `app` - Tauri application handle
/// * `shortcut_str` - Keyboard shortcut string to check
///
/// # Returns
/// * `Ok(bool)` - true if available, false if already in use
/// * `Err(String)` - Error message if check fails
#[tauri::command]
pub async fn is_hotkey_available(app: AppHandle, shortcut_str: String) -> HotkeyResult<bool> {
    let shortcut = match shortcut_str.parse::<Shortcut>() {
        Ok(s) => s,
        Err(e) => return Err(format!("Invalid shortcut format: {}", e)),
    };

    let shortcuts = app.global_shortcut();
    Ok(!shortcuts.is_registered(shortcut))
}

/// Get list of all registered hotkeys.
///
/// Note: This is a placeholder as Tauri doesn't provide a way to list all shortcuts.
/// In a real implementation, you would maintain your own registry.
#[tauri::command]
pub async fn get_registered_hotkeys() -> Vec<HotkeyBinding> {
    // TODO: Maintain a persistent registry of hotkey bindings
    // For now, return empty list
    vec![]
}

/// Validate a hotkey string format.
///
/// # Arguments
/// * `shortcut_str` - Keyboard shortcut string to validate
///
/// # Returns
/// * `Ok(())` - Valid format
/// * `Err(String)` - Error message describing the validation issue
#[tauri::command]
pub async fn validate_hotkey_format(shortcut_str: String) -> HotkeyResult<()> {
    match shortcut_str.parse::<Shortcut>() {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Invalid shortcut format: {}. Examples: Cmd+Shift+1, Ctrl+Alt+D", e)),
    }
}

/// Initialize default hotkeys on application startup.
///
/// This function can be called from the main.rs setup to register
/// default hotkeys for existing presets with configured shortcuts.
pub fn initialize_default_hotkeys(_app: &AppHandle) -> HotkeyResult<()> {
    // Load presets and register their hotkeys
    // This would typically load from your preset storage

    println!("[Hotkey] Initialized default hotkeys");
    Ok(())
}