use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preset {
    pub id: String,
    pub name: String,
    pub config: String,
    pub hotkey: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresetStore {
    pub version: String,
    pub presets: Vec<Preset>,
}

impl Default for PresetStore {
    fn default() -> Self {
        Self {
            version: "1.0".to_string(),
            presets: Vec::new(),
        }
    }
}

/// Get the path to the presets file
fn get_presets_path() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let config_dir = home.join(".config").join("dpui");

    // Create directory if it doesn't exist
    fs::create_dir_all(&config_dir).map_err(|e| format!("Failed to create config directory: {}", e))?;

    Ok(config_dir.join("presets.json"))
}

/// Load presets from file
#[tauri::command]
pub async fn load_presets() -> Result<PresetStore, String> {
    let path = get_presets_path()?;

    if !path.exists() {
        return Ok(PresetStore::default());
    }

    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read presets: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse presets: {}", e))
}

/// Save presets to file
#[tauri::command]
pub async fn save_presets(store: PresetStore) -> Result<(), String> {
    let path = get_presets_path()?;

    let content =
        serde_json::to_string_pretty(&store).map_err(|e| format!("Failed to serialize presets: {}", e))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write presets: {}", e))?;

    Ok(())
}

/// Add a new preset
#[tauri::command]
pub async fn add_preset(name: String, config: String, hotkey: Option<String>) -> Result<Preset, String> {
    let mut store = load_presets().await?;

    let preset = Preset {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        config,
        hotkey,
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    store.presets.push(preset.clone());
    save_presets(store).await?;

    Ok(preset)
}

/// Delete a preset
#[tauri::command]
pub async fn delete_preset(id: String) -> Result<(), String> {
    let mut store = load_presets().await?;

    store.presets.retain(|p| p.id != id);
    save_presets(store).await?;

    Ok(())
}

/// Update a preset
#[tauri::command]
pub async fn update_preset(
    id: String,
    name: Option<String>,
    config: Option<String>,
    hotkey: Option<String>,
) -> Result<Preset, String> {
    let mut store = load_presets().await?;

    let preset = store
        .presets
        .iter_mut()
        .find(|p| p.id == id)
        .ok_or("Preset not found")?;

    if let Some(n) = name {
        preset.name = n;
    }
    if let Some(c) = config {
        preset.config = c;
    }
    if hotkey.is_some() {
        preset.hotkey = hotkey;
    }

    let updated_preset = preset.clone();
    save_presets(store).await?;

    Ok(updated_preset)
}
