const DEFAULT_VAULT_URL: &str = "http://localhost:5173/app";

pub fn configured_vault_url() -> String {
    std::env::var("SIGNAL_VAULT_WEB_URL")
        .ok()
        .filter(|url| is_valid_vault_url(url))
        .unwrap_or_else(|| DEFAULT_VAULT_URL.to_string())
}

fn is_valid_vault_url(url: &str) -> bool {
    url.starts_with("http://") || url.starts_with("https://")
}

#[cfg(test)]
mod tests {
    use super::is_valid_vault_url;

    #[test]
    fn accepts_http_and_https_urls() {
        assert!(is_valid_vault_url("http://localhost:5173/app"));
        assert!(is_valid_vault_url("https://signal-vault.example/app"));
    }

    #[test]
    fn rejects_non_web_urls() {
        assert!(!is_valid_vault_url("file:///tmp/vault"));
        assert!(!is_valid_vault_url("javascript:alert(1)"));
    }
}
