use std::io;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct BridgeHostStatus {
    value: &'static str,
}

impl BridgeHostStatus {
    pub fn running() -> Self {
        Self { value: "running" }
    }

    pub fn from_start_error(error: &io::Error) -> Self {
        if error.kind() == io::ErrorKind::AddrInUse {
            return Self {
                value: "port_conflict",
            };
        }

        Self { value: "failed" }
    }

    pub fn as_str(&self) -> &'static str {
        self.value
    }
}

#[tauri::command]
pub fn get_bridge_host_status(status: tauri::State<'_, BridgeHostStatus>) -> String {
    status.as_str().to_string()
}

#[cfg(test)]
mod tests {
    use super::BridgeHostStatus;
    use std::io;

    #[test]
    fn classifies_addr_in_use_as_port_conflict() {
        let error = io::Error::from(io::ErrorKind::AddrInUse);

        assert_eq!(
            BridgeHostStatus::from_start_error(&error).as_str(),
            "port_conflict"
        );
    }

    #[test]
    fn classifies_other_start_errors_as_failed() {
        let error = io::Error::from(io::ErrorKind::PermissionDenied);

        assert_eq!(BridgeHostStatus::from_start_error(&error).as_str(), "failed");
    }
}
