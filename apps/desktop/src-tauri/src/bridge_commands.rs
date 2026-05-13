use rand::{distributions::Alphanumeric, Rng};
use serde_json::json;
use std::sync::{Arc, Mutex};

pub const MAX_QUICK_NOTE_LENGTH: usize = 500;
pub const MAX_CURRENT_SYSTEM_INPUT_LENGTH: usize = 100;

#[derive(Clone, Default)]
pub struct BridgeCommandQueue {
    pending: Arc<Mutex<Vec<BridgeCommand>>>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct BridgeCommand {
    pub id: String,
    pub command_type: String,
    pub created_at: String,
    pub body: String,
    pub current_system_name: Option<String>,
    pub system_input: Option<String>,
}

pub struct QuickNoteDraft {
    pub body: String,
    pub created_at: Option<String>,
    pub current_system_name: Option<String>,
}

pub struct CurrentSystemDraft {
    pub system_input: String,
    pub created_at: Option<String>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum BridgeCommandError {
    EmptyQuickNote,
    QuickNoteTooLong,
    EmptyCurrentSystem,
    CurrentSystemTooLong,
    StoreUnavailable,
}

impl BridgeCommandQueue {
    pub fn queue_quick_note(
        &self,
        draft: QuickNoteDraft,
    ) -> Result<BridgeCommand, BridgeCommandError> {
        let body = draft.body.trim().to_string();
        if body.is_empty() {
            return Err(BridgeCommandError::EmptyQuickNote);
        }
        if body.len() > MAX_QUICK_NOTE_LENGTH {
            return Err(BridgeCommandError::QuickNoteTooLong);
        }

        let command = BridgeCommand {
            id: format!("cmd-{}", random_suffix()),
            command_type: "quick_note".to_string(),
            created_at: draft.created_at.unwrap_or_default(),
            body,
            current_system_name: draft
                .current_system_name
                .and_then(|system| (!system.trim().is_empty()).then(|| system.trim().to_string())),
            system_input: None,
        };

        self.pending
            .lock()
            .map_err(|_| BridgeCommandError::StoreUnavailable)?
            .push(command.clone());

        Ok(command)
    }

    pub fn queue_current_system(
        &self,
        draft: CurrentSystemDraft,
    ) -> Result<BridgeCommand, BridgeCommandError> {
        let system_input = draft.system_input.trim().to_string();
        if system_input.is_empty() {
            return Err(BridgeCommandError::EmptyCurrentSystem);
        }
        if system_input.len() > MAX_CURRENT_SYSTEM_INPUT_LENGTH {
            return Err(BridgeCommandError::CurrentSystemTooLong);
        }

        let command = BridgeCommand {
            id: format!("cmd-{}", random_suffix()),
            command_type: "set_current_system".to_string(),
            created_at: draft.created_at.unwrap_or_default(),
            body: String::new(),
            current_system_name: None,
            system_input: Some(system_input),
        };

        self.pending
            .lock()
            .map_err(|_| BridgeCommandError::StoreUnavailable)?
            .push(command.clone());

        Ok(command)
    }

    #[cfg(test)]
    pub fn pending_commands(&self) -> Vec<BridgeCommand> {
        self.pending
            .lock()
            .map(|commands| commands.clone())
            .unwrap_or_default()
    }

    pub fn pending_json(&self) -> Result<String, BridgeCommandError> {
        let commands = self
            .pending
            .lock()
            .map_err(|_| BridgeCommandError::StoreUnavailable)?;
        let values = commands.iter().map(command_json).collect::<Vec<_>>();

        Ok(serde_json::to_string(&values).unwrap_or_else(|_| "[]".to_string()))
    }

    pub fn ack_command(&self, id: &str) -> bool {
        let Ok(mut commands) = self.pending.lock() else {
            return false;
        };
        let before = commands.len();
        commands.retain(|command| command.id != id);
        commands.len() != before
    }
}

#[tauri::command]
pub fn queue_quick_note_command(
    body: String,
    created_at: Option<String>,
    current_system_name: Option<String>,
    queue: tauri::State<'_, BridgeCommandQueue>,
) -> Result<(), String> {
    queue
        .queue_quick_note(QuickNoteDraft {
            body,
            created_at,
            current_system_name,
        })
        .map(|_| ())
        .map_err(|error| format!("{error:?}"))
}

#[tauri::command]
pub fn queue_current_system_command(
    system_input: String,
    created_at: Option<String>,
    queue: tauri::State<'_, BridgeCommandQueue>,
) -> Result<(), String> {
    queue
        .queue_current_system(CurrentSystemDraft {
            system_input,
            created_at,
        })
        .map(|_| ())
        .map_err(|error| format!("{error:?}"))
}

fn command_json(command: &BridgeCommand) -> serde_json::Value {
    let mut payload = if command.command_type == "set_current_system" {
        json!({
            "systemInput": command.system_input,
        })
    } else {
        json!({
            "body": command.body,
        })
    };

    if let (Some(system_name), Some(payload_object)) =
        (&command.current_system_name, payload.as_object_mut())
    {
        payload_object.insert("currentSystemName".to_string(), json!(system_name));
    }

    json!({
        "id": command.id,
        "type": command.command_type,
        "createdAt": command.created_at,
        "payload": payload,
    })
}

fn random_suffix() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(10)
        .map(char::from)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::{BridgeCommandQueue, CurrentSystemDraft, QuickNoteDraft};

    #[test]
    fn queues_quick_note_commands() {
        let queue = BridgeCommandQueue::default();

        let command = queue
            .queue_quick_note(QuickNoteDraft {
                body: "Hostile contact at node".to_string(),
                created_at: Some("2026-05-13T12:00:00.000Z".to_string()),
                current_system_name: Some("OQQ-0R8".to_string()),
            })
            .expect("quick note should queue");

        assert_eq!(command.command_type, "quick_note");
        assert_eq!(queue.pending_commands().len(), 1);
    }

    #[test]
    fn rejects_empty_and_oversized_quick_notes() {
        let queue = BridgeCommandQueue::default();

        assert!(queue
            .queue_quick_note(QuickNoteDraft {
                body: "   ".to_string(),
                created_at: None,
                current_system_name: None,
            })
            .is_err());
        assert!(queue
            .queue_quick_note(QuickNoteDraft {
                body: "x".repeat(501),
                created_at: None,
                current_system_name: None,
            })
            .is_err());
        assert_eq!(queue.pending_commands().len(), 0);
    }

    #[test]
    fn ack_removes_pending_command_only_after_requested() {
        let queue = BridgeCommandQueue::default();
        let command = queue
            .queue_quick_note(QuickNoteDraft {
                body: "Hostile contact at node".to_string(),
                created_at: None,
                current_system_name: None,
            })
            .expect("quick note should queue");

        assert!(queue.ack_command(&command.id));

        assert!(queue.pending_commands().is_empty());
    }

    #[test]
    fn pending_json_omits_missing_current_system_name() {
        let queue = BridgeCommandQueue::default();
        let _ = queue.queue_quick_note(QuickNoteDraft {
            body: "Hostile contact at node".to_string(),
            created_at: Some("2026-05-13T12:00:00.000Z".to_string()),
            current_system_name: None,
        });

        let json = queue.pending_json().expect("pending JSON should serialize");

        assert!(!json.contains("currentSystemName"));
    }

    #[test]
    fn queues_set_current_system_commands() {
        let queue = BridgeCommandQueue::default();

        let command = queue
            .queue_current_system(CurrentSystemDraft {
                system_input: "  30000142  ".to_string(),
                created_at: Some("2026-05-13T12:20:00.000Z".to_string()),
            })
            .expect("current system should queue");

        assert_eq!(command.command_type, "set_current_system");
        assert!(queue
            .pending_json()
            .expect("pending JSON should serialize")
            .contains(r#""systemInput":"30000142""#));
    }
}
