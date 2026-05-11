# Sui Identity Validation — Results Template

Copy this template for each validation run. Fill in all fields. Archive completed copies.

---

## Validation Type

Mark which type this run represents:

- [ ] **Production Sui validation** — `AUTH_DEV_MODE=false` + real wallet signature. Proves cryptographic auth + Sui identity path end-to-end.
- [ ] **Dev Sui validation** — `AUTH_DEV_MODE=true` + structural stub. Proves Sui identity lookup, backend policy/write path, and audit wiring. Does NOT prove cryptographic signature verification.
- [ ] **Blocked — signing input unavailable** — `AUTH_DEV_MODE=false` but no `SIGNAL_VAULT_TEST_SIG`. Record as: *Sui resolver configured, but cryptographic signing input unavailable.* Run dev validation separately.

---

## Run Metadata

| Field | Value |
|-------|-------|
| Date | |
| Validator | |
| API version / phase | |
| API URL | |
| Sui GraphQL URL | |
| AUTH_DEV_MODE | true / false |
| ENABLE_SUI_CHARACTER_RESOLUTION | true / false |
| Test wallet address | |
| SIGNAL_VAULT_TEST_SIG used | real / structural-stub / none |
| Expected character ID | |
| Expected tribe ID | |

---

## Health Check

| Field | Expected | Actual | Pass / Fail |
|-------|----------|--------|-------------|
| `status` | `ok` | | |
| `identity.mode` | `sui_player_profile` | | |
| `identity.suiEnabled` | `true` | | |
| `identity.authDevMode` | `false` (prod) / `true` (dev) | | |
| `db` | `connected` | | |
| `writesEnabled` | `true` | | |

---

## Validation Script Results

```
(paste full script output here)
```

| Check | Result | Notes |
|-------|--------|-------|
| 1 — identity.mode = sui_player_profile | PASS / FAIL / SKIP | |
| 2 — identity.suiEnabled = true | PASS / FAIL / SKIP | |
| 3 — Challenge flow | PASS / FAIL / SKIP / BLOCKED-NO-SIG | |
| 4 — Tribe push (no JWT) | PASS / FAIL / SKIP | |
| 5 — identitySource audit wiring | PASS / FAIL / SKIP | |
| 6 — Unknown wallet rejected | PASS / FAIL / SKIP | |
| 7 — Dev JWT rejected (auth_mode_conflict) | PASS / FAIL / SKIP (dev mode) | |
| 8 — Sui unavailable (manual) | PASS / FAIL / SKIP / MANUAL | |

**Summary:** `__ passed  __ failed  __ skipped/manual`

---

## What This Run Proves

Check which claims are supported by this run's results:

- [ ] Sui GraphQL endpoint reachable and returning PlayerProfile data
- [ ] wallet → PlayerProfile → Character resolution succeeds for known wallet
- [ ] tribeId derived from on-chain data (not dev credential)
- [ ] `identitySource = 'sui_player_profile'` recorded in audit log
- [ ] Unknown wallet correctly rejected (`identity_resolution_failed`)
- [ ] `Authorization: Bearer` rejected in production Sui mode (`auth_mode_conflict`)
- [ ] Real cryptographic wallet signature verified *(production run only)*
- [ ] Sui endpoint failure returns clear error *(manual check 8 only)*

---

## Audit Log Verification

SQL run:
```sql
SELECT id, event_type, actor_wallet_address, outcome, identity_source, created_at
FROM audit_log
ORDER BY created_at DESC
LIMIT 5;
```

| Column | Expected | Actual |
|--------|----------|--------|
| `identity_source` | `sui_player_profile` | |
| `outcome` | `success` | |
| `event_type` | `signal_created` | |

Migration 002 applied: yes / no

---

## Manual Check 8 — Sui Endpoint Unreachable

| Step | Result |
|------|--------|
| API restarted with `SUI_GRAPHQL_URL=https://invalid.example.com` | yes / no / skipped |
| Push request sent | yes / no / skipped |
| Response code | |
| Response body `code` | `identity_resolution_failed` / other |
| API restored to correct `SUI_GRAPHQL_URL` | yes / no |

---

## Issues Found

| # | Description | Severity | Resolution |
|---|-------------|----------|------------|
| | | | |

---

## Overall Result

**Validation type:** Production Sui / Dev Sui / Blocked — signing input unavailable

- [ ] All automated checks passed (or expected skips only)
- [ ] Audit log shows `identity_source = 'sui_player_profile'`
- [ ] Manual check 8 verified (or deferred — reason: )
- [ ] Issues found: none / see table above

**Signed off by:** ___________________  
**Date:** ___________________
