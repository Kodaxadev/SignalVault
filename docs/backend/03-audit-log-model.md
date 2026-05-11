# Audit Log Model

## Event Types

### signal_created

Fired when a signal is successfully created remotely.

**Fields captured:**
- `actor_wallet_address` — wallet that signed the request
- `actor_character_id` — character from JWT
- `actor_tribe_id` — tribe from server-side identity
- `actor_role_snapshot` — roles at time of creation
- `target_signal_id` — new signal ID
- `new_visibility` — scope the signal was created with
- `outcome` — success or denied

### signal_updated

Fired when a signal's content is modified.

**Fields captured:**
- All actor fields
- `target_signal_id` — modified signal ID
- `old_visibility` / `new_visibility` — if visibility changed
- `outcome` — success or denied

### signal_deleted

Fired when a signal is deleted.

**Fields captured:**
- All actor fields
- `target_signal_id` — deleted signal ID
- Authorization basis (why actor was allowed to delete)
- `outcome` — success or denied

### signal_exported

Fired when a signal is exported.

**Fields captured:**
- All actor fields
- `target_signal_id` — exported signal ID
- Export destination/format
- `outcome` — success or denied

### visibility_changed

Fired when a signal's visibility scope is changed.

**Fields captured:**
- All actor fields
- `target_signal_id` — affected signal ID
- `old_visibility` — previous scope
- `new_visibility` — new scope
- Authorization basis
- `outcome` — success or denied

## Denied Attempts

All write attempts that fail policy checks are logged with:
- `outcome: 'denied'`
- `denial_reason` — specific reason from policy engine
- Full actor context (wallet, character, tribe, roles)
- Request correlation ID

This enables audit of unauthorized access attempts and policy enforcement gaps.

## Immutability

- Audit log is **append-only** — no UPDATE or DELETE operations
- Retention policy: **90 days minimum**
- Future: archival to cold storage after retention period

## Request Correlation

Each audit event includes `request_id` for correlating client requests with server-side outcomes. Enables debugging and audit trail reconstruction.
