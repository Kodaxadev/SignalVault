-- Signal Vault: Initial Schema
-- Phase 09C — signals + audit_log tables with RLS
-- Target: Postgres 15+

-- Enums

CREATE TYPE signal_visibility AS ENUM (
  'tribe',
  'officer',
  'scout_cell',
  'public',
  'private'
);

CREATE TYPE audit_outcome AS ENUM (
  'success',
  'denied'
);

CREATE TYPE audit_event_type AS ENUM (
  'signal_created',
  'signal_updated',
  'signal_deleted',
  'signal_exported',
  'visibility_changed'
);

-- Signals
-- author_* columns are server-derived from verified auth, never from client payload

CREATE TABLE IF NOT EXISTS signals (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  author_character_id   VARCHAR,
  author_wallet_address VARCHAR       NOT NULL,
  author_tribe_id       VARCHAR,
  visibility            signal_visibility NOT NULL,
  signal_type           VARCHAR       NOT NULL,
  confidence            VARCHAR       NOT NULL,
  title                 VARCHAR       NOT NULL,
  body                  TEXT          NOT NULL,
  linked_entities       JSONB         NOT NULL DEFAULT '[]',
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  expires_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_signals_author_character_id ON signals(author_character_id);
CREATE INDEX IF NOT EXISTS idx_signals_author_tribe_id     ON signals(author_tribe_id);
CREATE INDEX IF NOT EXISTS idx_signals_visibility          ON signals(visibility);
CREATE INDEX IF NOT EXISTS idx_signals_created_at          ON signals(created_at DESC);

ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Cross-tribe reads denied; public signals (null tribe) visible to all
CREATE POLICY tribe_isolation ON signals
  FOR SELECT
  USING (
    author_tribe_id IS NULL
    OR author_tribe_id = current_setting('app.current_tribe_id', true)
  );

-- All writes require matching authenticated character
CREATE POLICY write_auth ON signals
  FOR ALL
  USING (author_character_id = current_setting('app.current_character_id', true));

-- Audit log
-- Append-only: no UPDATE or DELETE permitted.
-- Retains denied attempts — denial_reason populated when outcome = 'denied'.

CREATE TABLE IF NOT EXISTS audit_log (
  id                    UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type            audit_event_type  NOT NULL,
  actor_character_id    VARCHAR,
  actor_wallet_address  VARCHAR           NOT NULL,
  actor_tribe_id        VARCHAR,
  actor_role_snapshot   JSONB             NOT NULL DEFAULT '{}',
  target_signal_id      UUID              NOT NULL,
  old_visibility        VARCHAR,
  new_visibility        VARCHAR,
  outcome               audit_outcome     NOT NULL,
  denial_reason         VARCHAR,
  request_id            VARCHAR           NOT NULL,
  metadata              JSONB             NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_signal  ON audit_log(target_signal_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor   ON audit_log(actor_character_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Append-only enforcement at RLS level
CREATE POLICY audit_append ON audit_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY audit_read ON audit_log
  FOR SELECT USING (true);
