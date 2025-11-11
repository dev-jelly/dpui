//! Display management module for macOS using displayplacer CLI.
//!
//! This module provides Rust bindings for the displayplacer command-line tool,
//! enabling programmatic control of macOS display configurations including
//! layout, resolution, rotation, and enabling/disabling displays.
//!
//! # Example
//! ```no_run
//! use displayplacer::{get_displays, toggle_display_enabled};
//!
//! // Get current display configuration
//! let config = get_displays().await?;
//!
//! // Toggle a display off
//! toggle_display_enabled("37D8832A-2D66-02CA-B9F7-8F30A301B230".to_string(), false).await?;
//! ```

use serde::{Deserialize, Serialize};
use std::process::Command;

/// Represents a single display/monitor in the system.
///
/// Contains all the configuration parameters for a display including
/// its unique identifier, resolution, position, rotation, and enabled state.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Display {
    /// Unique identifier for the display (UUID format)
    pub id: String,
    /// Display resolution in format "WIDTHxHEIGHT" (e.g., "2560x1440")
    pub resolution: String,
    /// Display position as (x, y) coordinates where (0,0) is the primary display
    pub origin: (i32, i32),
    /// Display rotation in degrees (0, 90, 180, or 270)
    pub rotation: i32,
    /// Whether the display is currently enabled
    pub enabled: bool,
}

/// Complete display configuration including all connected displays.
///
/// Contains both parsed display information and the raw displayplacer
/// command output for debugging purposes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayConfig {
    /// List of all displays found in the system
    pub displays: Vec<Display>,
    /// Raw output from displayplacer command for debugging
    pub raw_command: String,
}

/// Get current display configuration by running displayplacer list.
///
/// Executes the `displayplacer list` command and parses the output to
/// extract display information. This function retrieves the current state
/// of all connected displays including their positions, resolutions, and
/// enabled states.
///
/// # Returns
/// * `Ok(DisplayConfig)` - Successfully retrieved display configuration
/// * `Err(String)` - Error message if displayplacer fails or parsing fails
///
/// # Errors
/// * displayplacer not installed or not in PATH
/// * displayplacer command fails to execute
/// * Unable to parse displayplacer output
#[tauri::command]
pub async fn get_displays() -> Result<DisplayConfig, String> {
    let output = Command::new("displayplacer")
        .arg("list")
        .output()
        .map_err(|e| format!("Failed to execute displayplacer: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "displayplacer failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    // Parse the displayplacer output
    let displays = parse_displayplacer_output(&stdout)?;

    Ok(DisplayConfig {
        displays,
        raw_command: stdout.to_string(),
    })
}

/// Apply a display configuration using displayplacer.
///
/// Executes a displayplacer command with the provided configuration string.
/// This can be used to apply preset layouts or custom display arrangements.
///
/// # Arguments
/// * `config` - displayplacer command arguments (e.g., "id:xxx res:2560x1440 origin:(0,0)")
///
/// # Returns
/// * `Ok(())` - Configuration applied successfully
/// * `Err(String)` - Error message if the configuration fails
///
/// # Example
/// ```no_run
/// apply_config("id:37D88 res:2560x1440 origin:(0,0) degree:0".to_string()).await?;
/// ```
#[tauri::command]
pub async fn apply_config(config: String) -> Result<(), String> {
    let output = Command::new("displayplacer")
        .arg(&config)
        .output()
        .map_err(|e| format!("Failed to execute displayplacer: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "displayplacer failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}

/// Toggle a display's enabled/disabled state.
///
/// Enables or disables a specific display using its unique identifier.
/// This is the core function for turning displays on and off programmatically.
///
/// # Arguments
/// * `id` - Unique display identifier (UUID format)
/// * `enabled` - `true` to enable the display, `false` to disable
///
/// # Returns
/// * `Ok(())` - Display state changed successfully
/// * `Err(String)` - Error message if the operation fails
///
/// # Safety
/// The frontend should implement safety checks to prevent disabling all displays.
/// This function will execute the command regardless of safety implications.
///
/// # Example
/// ```no_run
/// // Turn off a display
/// toggle_display_enabled("37D8832A-2D66-02CA-B9F7-8F30A301B230".to_string(), false).await?;
///
/// // Turn on a display
/// toggle_display_enabled("37D8832A-2D66-02CA-B9F7-8F30A301B230".to_string(), true).await?;
/// ```
#[tauri::command]
pub async fn toggle_display_enabled(id: String, enabled: bool) -> Result<(), String> {
    let enabled_str = if enabled { "true" } else { "false" };
    let config = format!("id:{} enabled:{}", id, enabled_str);

    let output = Command::new("displayplacer")
        .arg(&config)
        .output()
        .map_err(|e| format!("Failed to execute displayplacer: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "displayplacer failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}

/// Parse displayplacer output to extract display information.
///
/// Parses the raw output from `displayplacer list` command and extracts
/// display configurations. The function looks for the "Execute the command below"
/// section and parses only actual displayplacer commands (filtering out examples).
///
/// # Arguments
/// * `output` - Raw stdout from displayplacer list command
///
/// # Returns
/// * `Ok(Vec<Display>)` - List of parsed displays
/// * `Err(String)` - Error message if no displays found or parsing fails
///
/// # Implementation Details
/// The parser:
/// 1. Searches for "Execute the command below" marker
/// 2. Filters lines that start with "displayplacer" and contain both "id:" and "origin:"
/// 3. Extracts display parameters from quoted configuration strings
fn parse_displayplacer_output(output: &str) -> Result<Vec<Display>, String> {
    let mut displays = Vec::new();
    let mut found_execute_line = false;

    // Look for the "Execute the command below" section
    for line in output.lines() {
        // Check if we found the "Execute the command below" marker
        if line.contains("Execute the command below") {
            found_execute_line = true;
            continue;
        }

        // Only parse displayplacer commands after the "Execute" marker
        // and that contain both "id:" and "origin:" (to filter out examples)
        if found_execute_line
            && line.trim().starts_with("displayplacer")
            && line.contains("id:")
            && line.contains("origin:") {
            // Extract display configurations from the command
            // Example: displayplacer "id:1 res:2560x1440 origin:(0,0) degree:0"

            let parts: Vec<&str> = line.split('"').collect();
            for part in parts.iter() {
                if part.contains("id:") && part.contains("origin:") {
                    if let Some(display) = parse_display_string(part) {
                        displays.push(display);
                    }
                }
            }
        }
    }

    if displays.is_empty() {
        return Err("No displays found in displayplacer output".to_string());
    }

    Ok(displays)
}

/// Parse a single display configuration string.
///
/// Extracts display parameters from a displayplacer configuration string
/// containing id, resolution, origin, rotation, and enabled state.
///
/// # Arguments
/// * `config` - Configuration string like "id:xxx res:2560x1440 origin:(0,0) degree:0"
///
/// # Returns
/// * `Some(Display)` - Successfully parsed display
/// * `None` - If the string doesn't contain a valid display ID
///
/// # Example
/// ```
/// let config = "id:37D88 res:2560x1440 origin:(0,0) degree:0";
/// let display = parse_display_string(config);
/// ```
fn parse_display_string(config: &str) -> Option<Display> {
    let mut id = String::new();
    let mut resolution = String::new();
    let mut origin = (0, 0);
    let mut rotation = 0;
    let enabled = !config.contains("disabled");

    // Split by spaces and parse each parameter
    for part in config.split_whitespace() {
        if part.starts_with("id:") {
            id = part.strip_prefix("id:").unwrap_or("").to_string();
        } else if part.starts_with("res:") {
            resolution = part.strip_prefix("res:").unwrap_or("").to_string();
        } else if part.starts_with("origin:") {
            // Parse origin:(x,y)
            let origin_str = part.strip_prefix("origin:").unwrap_or("");
            if let Some(coords) = parse_coordinates(origin_str) {
                origin = coords;
            }
        } else if part.starts_with("degree:") {
            rotation = part
                .strip_prefix("degree:")
                .unwrap_or("0")
                .parse()
                .unwrap_or(0);
        }
    }

    if !id.is_empty() {
        Some(Display {
            id,
            resolution,
            origin,
            rotation,
            enabled,
        })
    } else {
        None
    }
}

/// Parse coordinates in format (x,y).
///
/// Extracts x and y coordinates from a string formatted as "(x,y)".
/// Handles both positive and negative values.
///
/// # Arguments
/// * `s` - Coordinate string like "(0,0)", "(2560,0)", or "(-1920,0)"
///
/// # Returns
/// * `Some((x, y))` - Successfully parsed coordinates as tuple
/// * `None` - If the string is not in valid format
///
/// # Examples
/// ```
/// assert_eq!(parse_coordinates("(0,0)"), Some((0, 0)));
/// assert_eq!(parse_coordinates("(2560,0)"), Some((2560, 0)));
/// assert_eq!(parse_coordinates("(-1920,0)"), Some((-1920, 0)));
/// ```
fn parse_coordinates(s: &str) -> Option<(i32, i32)> {
    let cleaned = s.trim_matches(|c| c == '(' || c == ')');
    let parts: Vec<&str> = cleaned.split(',').collect();

    if parts.len() == 2 {
        let x = parts[0].parse().ok()?;
        let y = parts[1].parse().ok()?;
        Some((x, y))
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_coordinates() {
        assert_eq!(parse_coordinates("(0,0)"), Some((0, 0)));
        assert_eq!(parse_coordinates("(2560,0)"), Some((2560, 0)));
        assert_eq!(parse_coordinates("(-1920,0)"), Some((-1920, 0)));
    }

    #[test]
    fn test_parse_display_string() {
        let config = "id:1 res:2560x1440 origin:(0,0) degree:0";
        let display = parse_display_string(config).unwrap();

        assert_eq!(display.id, "1");
        assert_eq!(display.resolution, "2560x1440");
        assert_eq!(display.origin, (0, 0));
        assert_eq!(display.rotation, 0);
        assert!(display.enabled);
    }
}
