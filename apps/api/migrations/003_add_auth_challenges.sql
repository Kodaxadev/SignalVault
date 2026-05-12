-- Signal Vault: Durable auth challenges
-- Stores one-time wallet signing challenges for production API instances.

CREATE TABLE IF NOT EXISTS auth_challenges (
  challenge_id   UUID PRIMARY KEY,
  wallet_address VARCHAR NOT NULL,
  message        TEXT NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  used_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_challenges_wallet ON auth_challenges(wallet_address);
CREATE INDEX IF NOT EXISTS idx_auth_challenges_expires ON auth_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_challenges_unused ON auth_challenges(challenge_id)
  WHERE used_at IS NULL;
