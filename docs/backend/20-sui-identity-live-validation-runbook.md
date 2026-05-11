# Sui Identity Live Validation Runbook

**Status:** ACTIVE  
**Phase:** 09M / 09N  
**Date:** 2026-05-11

Operational runbook for validating the Sui PlayerProfile identity path against a live API deployment. Run this after any change to `resolveCharacterFromSui.ts`, `resolveServerViewerContext.ts`, `challengeStore.ts`, or `auditRepository.ts`.

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| Sui wallet with a PlayerProfile object on Stillness testnet | `node scripts/lookup-player-profile.mjs` |
| PostgreSQL database with migration 001 and 002 applied | `psql $DATABASE_URL -c '\dt audit_log'` |
| API running with Sui identity env vars | See startup section below |
| `SIGNAL_VAULT_TEST_WALLET` known | Your Sui wallet address |

---

## Step 1 — Apply Migrations

If the database has not had migration 002 applied yet (adds `identity_source` column to `audit_log`):

```sql
-- Check current state
SELECT column_name FROM information_schema.columns
WHERE table_name = 'audit_log' AND column_name = 'identity_source';
```

If the column is missing, run:

```bash
psql $DATABASE_URL -f apps/api/migrations/002_add_audit_identity_source.sql
```

Verify:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_log' AND column_name = 'identity_source';
-- Expected: identity_source | text | YES
```

---

## Step 2 — Start the API

Production Sui mode requires these env vars:

```ini
AUTH_DEV_MODE=false
ENABLE_SUI_CHARACTER_RESOLUTION=true
SUI_GRAPHQL_URL=https://graphql.testnet.sui.io/graphql
DATABASE_URL=postgresql://...
ENABLE_REMOTE_SIGNAL_WRITES=true
PORT=3001
NODE_ENV=production
```

Start the API:

```bash
cd apps/api
pnpm dev
# or: node dist/index.js (production build)
```

Verify the API is responding:

```bash
curl http://localhost:3001/health | jq .
```

Expected health response:

```json
{
  "status": "ok",
  "version": "0.0.1",
  "phase": "09L2",
  "db": "connected",
  "writesEnabled": true,
  "identity": {
    "mode": "sui_player_profile",
    "suiEnabled": true,
    "suiGraphqlUrl": "https://graphql.testnet.sui.io/graphql",
    "authDevMode": false
  }
}
```

If `identity.mode` is not `sui_player_profile`, check `ENABLE_SUI_CHARACTER_RESOLUTION=true` is set and the API restarted.

---

## Step 3 — Run the Validation Script

```bash
# Required
export SIGNAL_VAULT_API_URL=http://localhost:3001
export SIGNAL_VAULT_TEST_WALLET=0x<your-wallet-address>

# Optional — for assertion checks
export SIGNAL_VAULT_EXPECTED_CHAR_ID=<expected-eve-character-id>
export SIGNAL_VAULT_EXPECTED_TRIBE_ID=<expected-tribe-id>

# Optional — real cryptographic signature (required when AUTH_DEV_MODE=false)
# Omit to use structural stub (only works with AUTH_DEV_MODE=true)
export SIGNAL_VAULT_TEST_SIG=<wallet-signature-bytes>

node scripts/validate-sui-identity.mjs
```

> **Validation type matters — use the right label:**
>
> | Mode | `AUTH_DEV_MODE` | `SIGNAL_VAULT_TEST_SIG` | What it proves |
> |------|----------------|------------------------|----------------|
> | **Production Sui** | `false` | Real signature required | Cryptographic auth + Sui identity path end-to-end |
> | **Dev Sui** | `true` | Structural stub accepted | Sui identity lookup, policy, write path, audit wiring — not cryptographic sig |
> | **Blocked** | `false` | Missing | Record as: *Sui resolver configured, but cryptographic signing input unavailable.* Run dev mode separately. |
>
> If Check 3 fails only because `SIGNAL_VAULT_TEST_SIG` is absent in production mode, that is not a Sui identity failure — it is a missing test input. Do not conflate the two.

---

## Step 4 — Expected Output (All Passing)

```
═══════════════════════════════════════════════════════
  Signal Vault — Sui Identity Operational Validation
═══════════════════════════════════════════════════════
  API:    http://localhost:3001
  Wallet: 0x<wallet>

Check 1 + 2: /health identity block
  ✅ identity.mode = sui_player_profile
  ✅ identity.suiEnabled = true
  ℹ  authDevMode: false, suiGraphqlUrl: https://graphql.testnet.sui.io/graphql

Check 3: Challenge/signature flow
  ✅ Challenge issued (id: <8-char-prefix>…, expires: <ISO8601>)

Check 4: Tribe-scoped push — no JWT, Sui-derived tribeId
  ✅ Auth + policy accepted tribe push (writes disabled — expected in dev)
  # or: ✅ Tribe signal written (id: <signalId>)

Check 5: identitySource audit wiring
  ✅ identitySource wired to audit calls (verified by passing auth in check 4)
  ℹ  To confirm DB row: SELECT identity_source FROM audit_log ORDER BY created_at DESC LIMIT 5;

Check 6: Unknown wallet → identity failure
  ✅ Unknown wallet → identity_resolution_failed (production Sui mode)

Check 7: Dev JWT rejected in production Sui mode
  ✅ Dev JWT Bearer header → 401 auth_mode_conflict (production Sui mode guard working)

Check 8: Sui unavailable
  🔧 Sui endpoint unreachable → clear identity failure — MANUAL CHECK REQUIRED

───────────────────────────────────────────────────────
  Results: 7 passed  0 failed  1 skipped/manual
───────────────────────────────────────────────────────

✅ All automated checks passed. Sui identity path is operational.
```

---

## Step 5 — Verify Audit Log (DB)

After a successful push (check 4), confirm `identity_source` is recorded:

```sql
SELECT
  id,
  event_type,
  actor_wallet_address,
  outcome,
  identity_source,
  created_at
FROM audit_log
ORDER BY created_at DESC
LIMIT 5;
```

Expected for a Sui-resolved push:

```
identity_source = 'sui_player_profile'
outcome         = 'success'
event_type      = 'signal_created'
```

If `identity_source` is `NULL`, check that migration 002 was applied and that `signalRoutes.ts` includes `identitySource: authResult.auth.identitySource` in the `insertAuditEvent` calls.

---

## Step 6 — Manual Check 8 (Sui Endpoint Unreachable)

This check requires temporarily reconfiguring the API:

1. Stop the API.
2. Set `SUI_GRAPHQL_URL=https://invalid.example.com` (do not modify production config — use a separate terminal or test env).
3. Restart the API.
4. Send a push request with valid wallet signature headers.
5. Confirm the response is `401 identity_resolution_failed`.
6. Restore `SUI_GRAPHQL_URL` to `https://graphql.testnet.sui.io/graphql` and restart.

---

## Failure Cases and Remediation

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `identity.mode = dev_character_jwt` in health | `ENABLE_SUI_CHARACTER_RESOLUTION` not set or not `true` | Set env var and restart |
| `identity.suiEnabled = false` | Same as above | Set env var and restart |
| Check 3 fails — challenge request fails | API not reachable or challenge endpoint missing | Confirm `POST /api/v1/auth/challenge` route exists |
| Check 4 returns `401 wallet_signature_invalid` | Structural stub used with `AUTH_DEV_MODE=false` | Set `SIGNAL_VAULT_TEST_SIG` to real signature |
| Check 4 returns `401 identity_resolution_failed` | Wallet has no PlayerProfile on Sui testnet | Use a wallet with a confirmed PlayerProfile |
| Check 4 returns `403 tribe_identity_missing` | Sui resolved character but policy rejected tribe scope | Check tribe membership on-chain |
| Check 6 fails — unknown wallet not rejected | `isProductionSuiMode` not active | Confirm `AUTH_DEV_MODE=false` |
| Check 7 fails — Bearer not rejected | `isProductionSuiMode` not active | Confirm `AUTH_DEV_MODE=false` |
| `identity_source NULL` in audit_log | Migration 002 not applied | Run `apps/api/migrations/002_add_audit_identity_source.sql` |

---

## Rollback / Disable Sui Identity

To disable Sui identity and revert to dev JWT mode:

```ini
# In API .env:
ENABLE_SUI_CHARACTER_RESOLUTION=false
AUTH_DEV_MODE=true  # dev only
```

Restart the API. The health endpoint will report `identity.mode = dev_character_jwt` and `identity.suiEnabled = false`. Requests must include `Authorization: Bearer <jwt>` again.

No database changes required — the `identity_source` column remains but will be `NULL` for JWT-resolved events (which is correct).

---

## Related Files

| File | Purpose |
|------|---------|
| `scripts/validate-sui-identity.mjs` | Automated validation script (this runbook drives it) |
| `apps/api/src/character/resolveCharacterFromSui.ts` | Two-hop Sui resolver |
| `apps/api/src/auth/resolveServerViewerContext.ts` | Auth guard and identity mode routing |
| `apps/api/src/audit/insertAuditEvent.ts` | Audit event creation with `identitySource` |
| `apps/api/migrations/002_add_audit_identity_source.sql` | Adds `identity_source` column |
| `docs/backend/18-production-identity-mode.md` | Full identity mode specification |
| `docs/backend/21-sui-identity-validation-results-template.md` | Results recording template |
