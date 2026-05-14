-- Signal Vault: harden signal RLS for deployed-role verification
-- Phase 09P - replaces broad all-command policy with command-specific checks.

DROP POLICY IF EXISTS tribe_isolation ON signals;
DROP POLICY IF EXISTS write_auth ON signals;
DROP POLICY IF EXISTS signal_read_scope ON signals;
DROP POLICY IF EXISTS signal_insert_auth ON signals;
DROP POLICY IF EXISTS signal_update_auth ON signals;
DROP POLICY IF EXISTS signal_delete_auth ON signals;

ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE signals
  DROP CONSTRAINT IF EXISTS signals_identity_resolved_at_required_for_character;

ALTER TABLE audit_log
  DROP CONSTRAINT IF EXISTS audit_identity_source_required_for_character,
  DROP CONSTRAINT IF EXISTS audit_identity_resolved_at_required_for_character;

-- Public signals are globally readable. Private signals are readable only by
-- their author character. Tribe scopes are readable only inside current tribe.
CREATE POLICY signal_read_scope ON signals
  FOR SELECT
  USING (
    visibility = 'public'
    OR author_character_id = nullif(current_setting('app.current_character_id', true), '')
    OR (
      visibility IN ('tribe', 'officer', 'scout_cell')
      AND author_tribe_id = nullif(current_setting('app.current_tribe_id', true), '')
    )
  );

-- Inserted author identity must match the request-time context the API sets.
-- The app role can write through this policy, but mismatched row/context data
-- fails RLS instead of silently persisting forged author fields.
CREATE POLICY signal_insert_auth ON signals
  FOR INSERT
  WITH CHECK (
    author_wallet_address <> ''
    AND (
      author_character_id IS NULL
      OR author_character_id = nullif(current_setting('app.current_character_id', true), '')
    )
    AND (
      author_tribe_id IS NULL
      OR author_tribe_id = nullif(current_setting('app.current_tribe_id', true), '')
    )
    AND (
      visibility NOT IN ('tribe', 'officer', 'scout_cell')
      OR (
        author_character_id = nullif(current_setting('app.current_character_id', true), '')
        AND author_tribe_id = nullif(current_setting('app.current_tribe_id', true), '')
      )
    )
  );

CREATE POLICY signal_update_auth ON signals
  FOR UPDATE
  USING (
    author_character_id = nullif(current_setting('app.current_character_id', true), '')
  )
  WITH CHECK (
    author_wallet_address <> ''
    AND author_character_id = nullif(current_setting('app.current_character_id', true), '')
    AND (
      author_tribe_id IS NULL
      OR author_tribe_id = nullif(current_setting('app.current_tribe_id', true), '')
    )
  );

CREATE POLICY signal_delete_auth ON signals
  FOR DELETE
  USING (
    author_character_id = nullif(current_setting('app.current_character_id', true), '')
  );

-- New character-resolved rows must preserve request-time identity snapshots.
ALTER TABLE signals
  ADD CONSTRAINT signals_identity_resolved_at_required_for_character
  CHECK (
    author_character_id IS NULL OR identity_resolved_at IS NOT NULL
  ) NOT VALID;

ALTER TABLE audit_log
  ADD CONSTRAINT audit_identity_source_required_for_character
  CHECK (
    actor_character_id IS NULL OR identity_source IS NOT NULL
  ) NOT VALID;

ALTER TABLE audit_log
  ADD CONSTRAINT audit_identity_resolved_at_required_for_character
  CHECK (
    actor_character_id IS NULL OR identity_resolved_at IS NOT NULL
  ) NOT VALID;
