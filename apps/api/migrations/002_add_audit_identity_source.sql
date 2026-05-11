-- Signal Vault: Add identity_source to audit_log
-- Phase 09M — records how character identity was derived for each audit event

ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS identity_source TEXT;

ALTER TABLE audit_log
  ADD CONSTRAINT audit_log_identity_source_check
  CHECK (
    identity_source IS NULL OR identity_source IN (
      'sui_player_profile',
      'dev_character_jwt',
      'trusted_character_jwt'
    )
  );
