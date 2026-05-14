use std::sync::{Arc, Mutex};

#[derive(Clone, Default)]
pub struct BridgeStateStore {
    latest_state: Arc<Mutex<Option<String>>>,
}

impl BridgeStateStore {
    pub fn latest_state(&self) -> Option<String> {
        self.latest_state
            .lock()
            .ok()
            .and_then(|state| state.clone())
    }

    pub fn accept_state(&self, body: &str) -> Result<(), BridgeStateError> {
        validate_bridge_state(body)?;

        let mut state = self
            .latest_state
            .lock()
            .map_err(|_| BridgeStateError::StoreUnavailable)?;
        *state = Some(body.to_string());

        Ok(())
    }
}

#[derive(Debug, PartialEq, Eq)]
pub enum BridgeStateError {
    InvalidJson,
    WrongApp,
    WrongSchema,
    InvalidShape,
    StoreUnavailable,
}

fn validate_bridge_state(body: &str) -> Result<(), BridgeStateError> {
    let value: serde_json::Value =
        serde_json::from_str(body).map_err(|_| BridgeStateError::InvalidJson)?;

    if value.get("app").and_then(|app| app.as_str()) != Some("signal-vault") {
        return Err(BridgeStateError::WrongApp);
    }

    if value
        .get("schemaVersion")
        .and_then(|schema| schema.as_i64())
        != Some(1)
    {
        return Err(BridgeStateError::WrongSchema);
    }

    if !value
        .get("generatedAt")
        .is_some_and(|generated_at| generated_at.is_string())
        || !value
            .get("warnings")
            .is_some_and(|warnings| warnings.is_array())
        || !value
            .get("latestSignals")
            .is_some_and(|signals| signals.is_array())
    {
        return Err(BridgeStateError::InvalidShape);
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{BridgeStateError, BridgeStateStore};

    const VALID_STATE: &str = r#"{
      "app":"signal-vault",
      "schemaVersion":1,
      "generatedAt":"2026-05-12T12:00:00.000Z",
      "warnings":[],
      "latestSignals":[]
    }"#;

    #[test]
    fn accepts_valid_signal_vault_state() {
        let store = BridgeStateStore::default();

        store.accept_state(VALID_STATE).expect("state should parse");

        assert_eq!(store.latest_state(), Some(VALID_STATE.to_string()));
    }

    #[test]
    fn rejects_wrong_app_state() {
        let store = BridgeStateStore::default();
        let result = store.accept_state(
            r#"{"app":"other","schemaVersion":1,"generatedAt":"now","warnings":[],"latestSignals":[]}"#,
        );

        assert_eq!(result, Err(BridgeStateError::WrongApp));
        assert_eq!(store.latest_state(), None);
    }

    #[test]
    fn rejects_wrong_schema_state() {
        let store = BridgeStateStore::default();
        let result = store.accept_state(
            r#"{"app":"signal-vault","schemaVersion":2,"generatedAt":"now","warnings":[],"latestSignals":[]}"#,
        );

        assert_eq!(result, Err(BridgeStateError::WrongSchema));
    }

    #[test]
    fn rejects_state_without_read_arrays() {
        let store = BridgeStateStore::default();
        let result =
            store.accept_state(r#"{"app":"signal-vault","schemaVersion":1,"generatedAt":"now"}"#);

        assert_eq!(result, Err(BridgeStateError::InvalidShape));
    }
}
