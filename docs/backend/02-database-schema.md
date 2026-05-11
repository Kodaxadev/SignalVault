# Database Schema

## signals

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, NOT NULL | Signal identifier |
| author_character_id | varchar | INDEX, NULLABLE | Server-derived from JWT |
| author_wallet_address | varchar | NOT NULL | Server-derived from wallet signature |
| author_tribe_id | varchar | INDEX, NULLABLE | Server-derived, required for tribe/officer/scout_cell |
| visibility | enum | NOT NULL | tribe, officer, scout_cell, public, private |
| signal_type | varchar | NOT NULL | Signal type identifier |
| confidence | varchar | NOT NULL | Confidence level |
| title | varchar | NOT NULL | Signal title |
| body | text | NOT NULL | Signal body |
| linked_entities | jsonb | NOT NULL | Normalized snapshots only, no raw payloads |
| created_at | timestamp | NOT NULL | Creation time |
| updated_at | timestamp | NOT NULL | Last update time |
| expires_at | timestamp | NULLABLE | Optional expiry |

### Indexes

```sql
CREATE INDEX idx_signals_author_character_id ON signals(author_character_id);
CREATE INDEX idx_signals_author_tribe_id ON signals(author_tribe_id);
CREATE INDEX idx_signals_visibility ON signals(visibility);
CREATE INDEX idx_signals_created_at ON signals(created_at DESC);
```

### RLS Policies

```sql
-- Cross-tribe reads denied
CREATE POLICY tribe_isolation ON signals
  FOR SELECT
  USING (
    author_tribe_id IS NULL  -- public signals
    OR author_tribe_id = current_setting('app.current_tribe_id')  -- matching tribe
  );

-- Write requires authenticated character
CREATE POLICY write_auth ON signals
  FOR ALL
  USING (author_character_id = current_setting('app.current_character_id'));
```

## audit_log

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, NOT NULL | Audit event identifier |
| event_type | enum | NOT NULL | signal_created, signal_updated, signal_deleted, signal_exported, visibility_changed |
| actor_character_id | varchar | NULLABLE | Server-derived |
| actor_wallet_address | varchar | NOT NULL | Server-derived |
| actor_tribe_id | varchar | NULLABLE | Server-derived |
| actor_role_snapshot | jsonb | NOT NULL | Roles at time of action |
| target_signal_id | uuid | NOT NULL | Affected signal |
| old_visibility | varchar | NULLABLE | Previous visibility |
| new_visibility | varchar | NULLABLE | New visibility |
| outcome | enum | NOT NULL | success, denied |
| denial_reason | varchar | NULLABLE | Why denied (if outcome=denied) |
| request_id | varchar | NOT NULL | Client request correlation ID |
| metadata | jsonb | NOT NULL | Additional context |
| created_at | timestamp | NOT NULL | Event time |

### Indexes

```sql
CREATE INDEX idx_audit_signal ON audit_log(target_signal_id);
CREATE INDEX idx_audit_actor ON audit_log(actor_character_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

### RLS Policies

```sql
-- Append-only: no updates or deletes
CREATE POLICY audit_append ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- Read by authenticated users (future: restrict by role)
CREATE POLICY audit_read ON audit_log
  FOR SELECT
  USING (true);
```
