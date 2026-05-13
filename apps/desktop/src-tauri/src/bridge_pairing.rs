use std::{
    fs, io,
    path::{Path, PathBuf},
};

const TOKEN_FILE_NAME: &str = "bridge-token.txt";

#[derive(Clone)]
pub struct BridgePairingToken {
    token: String,
}

impl BridgePairingToken {
    pub fn new(token: String) -> Self {
        Self { token }
    }

    pub fn token(&self) -> &str {
        &self.token
    }
}

#[tauri::command]
pub fn get_bridge_pairing_token(state: tauri::State<'_, BridgePairingToken>) -> String {
    state.token().to_string()
}

pub fn load_or_create_pairing_token(config_dir: &Path) -> io::Result<String> {
    let token_path = token_path(config_dir);

    if let Ok(existing) = fs::read_to_string(&token_path) {
        let token = existing.trim();
        if is_valid_token_shape(token) {
            return Ok(token.to_string());
        }
    }

    fs::create_dir_all(config_dir)?;
    let token = generate_pairing_token();
    fs::write(token_path, &token)?;
    Ok(token)
}

fn token_path(config_dir: &Path) -> PathBuf {
    config_dir.join(TOKEN_FILE_NAME)
}

fn generate_pairing_token() -> String {
    let bytes: [u8; 32] = rand::random();
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn is_valid_token_shape(token: &str) -> bool {
    token.len() == 64 && token.chars().all(|char| char.is_ascii_hexdigit())
}

#[cfg(test)]
mod tests {
    use super::load_or_create_pairing_token;
    use std::{fs, path::PathBuf};

    #[test]
    fn creates_and_persists_a_pairing_token() {
        let dir = test_dir("creates");

        let first = load_or_create_pairing_token(&dir).expect("token should create");
        let second = load_or_create_pairing_token(&dir).expect("token should load");

        assert_eq!(first.len(), 64);
        assert_eq!(first, second);
    }

    #[test]
    fn replaces_malformed_persisted_token() {
        let dir = test_dir("malformed");
        fs::create_dir_all(&dir).expect("dir should create");
        fs::write(dir.join("bridge-token.txt"), "not-a-token").expect("token should write");

        let token = load_or_create_pairing_token(&dir).expect("token should replace");

        assert_eq!(token.len(), 64);
        assert_ne!(token, "not-a-token");
    }

    fn test_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "signal-vault-bridge-token-{name}-{}",
            std::process::id()
        ));
        let _ = fs::remove_dir_all(&dir);
        dir
    }
}
