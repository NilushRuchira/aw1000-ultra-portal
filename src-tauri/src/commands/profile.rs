use crate::models::RouterProfile;
use std::fs;
use std::path::PathBuf;

fn get_storage_path() -> Result<PathBuf, String> {
    let mut dir = dirs::config_dir().ok_or_else(|| "Could not determine config directory".to_string())?;
    dir.push("aw1000-ultra-portal");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create config dir: {}", e))?;
    }
    dir.push("profiles.json");
    Ok(dir)
}

fn get_default_profile() -> RouterProfile {
    RouterProfile {
        id: "arcadyan-aw1000-default".to_string(),
        name: "Arcadyan AW1000_Ultra (Primary)".to_string(),
        host: "192.168.1.1".to_string(),
        http_port: 80,
        ssh_port: 22,
        username: "root".to_string(),
        auth_type: "password".to_string(),
        password: None,
        private_key: None,
        use_https: false,
        auto_connect: Some(true),
    }
}

#[tauri::command]
pub fn get_profiles() -> Result<Vec<RouterProfile>, String> {
    let path = get_storage_path()?;
    if !path.exists() {
        return Ok(vec![get_default_profile()]);
    }
    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read profiles file: {}", e))?;
    let profiles: Vec<RouterProfile> = serde_json::from_str(&content).unwrap_or_else(|_| vec![get_default_profile()]);
    if profiles.is_empty() {
        Ok(vec![get_default_profile()])
    } else {
        Ok(profiles)
    }
}

#[tauri::command]
pub fn save_profile(profile: RouterProfile) -> Result<Vec<RouterProfile>, String> {
    let mut list = get_profiles()?;
    if let Some(pos) = list.iter().position(|p| p.id == profile.id) {
        list[pos] = profile;
    } else {
        list.push(profile);
    }
    let path = get_storage_path()?;
    let data = serde_json::to_string_pretty(&list).map_err(|e| format!("Failed to serialize profiles: {}", e))?;
    fs::write(&path, data).map_err(|e| format!("Failed to write profiles: {}", e))?;
    Ok(list)
}

#[tauri::command]
pub fn delete_profile(id: String) -> Result<Vec<RouterProfile>, String> {
    let mut list = get_profiles()?;
    list.retain(|p| p.id != id);
    if list.is_empty() {
        list.push(get_default_profile());
    }
    let path = get_storage_path()?;
    let data = serde_json::to_string_pretty(&list).map_err(|e| format!("Failed to serialize profiles: {}", e))?;
    fs::write(&path, data).map_err(|e| format!("Failed to write profiles: {}", e))?;
    Ok(list)
}
