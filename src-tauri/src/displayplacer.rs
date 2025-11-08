use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Display {
    pub id: String,
    pub resolution: String,
    pub origin: (i32, i32),
    pub rotation: i32,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayConfig {
    pub displays: Vec<Display>,
    pub raw_command: String,
}

/// Get current display configuration by running displayplacer list
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

/// Apply a display configuration
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

/// Parse displayplacer output to extract display information
fn parse_displayplacer_output(output: &str) -> Result<Vec<Display>, String> {
    let mut displays = Vec::new();

    // Look for lines that start with "displayplacer"
    for line in output.lines() {
        if line.contains("displayplacer") {
            // Extract display configurations from the command
            // Example: displayplacer "id:1 res:2560x1440 origin:(0,0) degree:0"

            let parts: Vec<&str> = line.split('"').collect();
            for part in parts.iter() {
                if part.contains("id:") {
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

/// Parse a single display configuration string
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

/// Parse coordinates in format (x,y)
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
