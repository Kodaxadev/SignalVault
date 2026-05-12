-- Signal Vault: request-time character identity snapshots
-- Preserves historical authorship if a wallet later resolves to a different character.

ALTER TABLE signals
  ADD COLUMN IF NOT EXISTS author_character_name VARCHAR,
  ADD COLUMN IF NOT EXISTS identity_resolved_at TIMESTAMPTZ;

ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS actor_character_name VARCHAR,
  ADD COLUMN IF NOT EXISTS identity_resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_signals_identity_resolved_at
  ON signals(identity_resolved_at DESC);
