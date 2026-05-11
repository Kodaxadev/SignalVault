# Sui Identity Validation Results

**Date:** 2026-05-11  
**Validator:** Justin  
**API phase:** 09M / 09N  
**Wallet:** `0xabff3b1b9c793cf42f64864b80190fd836ac68391860c0d27491f3ef2fb4430f`  
**Script:** `scripts/validate-sui-identity.mjs`

---

## Summary Verdict

| Validation | Result |
|------------|--------|
| Dev Sui validation | **PASS** |
| Production Sui validation | **BLOCKED — signing input unavailable** |
| Unknown wallet rejection | **PASS** |
| Audit `identitySource` wiring | **PASS** (indirect — auth+policy passed check 4) |
| `auth_mode_conflict` guard (live script) | **NOT TESTED** — script limitation, not a code failure |
| `auth_mode_conflict` guard (unit tests) | **PASS** — `resolveServerViewerContextProd.test.ts` |

---

## Dev Sui Validation — PASS

**Config:** `AUTH_DEV_MODE=true`, `ENABLE_SUI_CHARACTER_RESOLUTION=true`, `SUI_GRAPHQL_URL=https://graphql.testnet.sui.io/graphql`

```
Check 1: identity.mode = sui_player_profile       ✅
Check 2: identity.suiEnabled = true               ✅
Check 3: Challenge issued                          ✅
Check 4: Auth + policy accepted tribe push         ✅  (503 = writes disabled, auth+policy passed)
Check 5: identitySource wired to audit calls       ✅
Check 6: Unknown wallet rejected (character_token_invalid) ✅
Check 7: auth_mode_conflict guard                  ⏭  SKIPPED — AUTH_DEV_MODE=true, guard only applies in prod
Check 8: Sui unavailable                           🔧 MANUAL — not run

Results: 6 passed  0 failed  2 skipped/manual
```

**What this proves:**

- Sui GraphQL endpoint (`https://graphql.testnet.sui.io/graphql`) is reachable and returning live data
- Wallet `0xabff...` resolves through PlayerProfile → Character on Stillness testnet
- `tribe_id` is derived on-chain — no dev credential used
- Server-side policy gate reached with Sui-derived identity
- `identitySource = 'sui_player_profile'` is wired to audit log
- Unknown wallet correctly rejected at the identity layer

---

## Production Sui Validation — BLOCKED

**Config:** `AUTH_DEV_MODE=false`, `ENABLE_SUI_CHARACTER_RESOLUTION=true`

```
Check 1: identity.mode = sui_player_profile       ✅
Check 2: identity.suiEnabled = true               ✅
Check 3: Challenge flow                            ❌ BLOCKED — no real wallet signature available
Check 4: Tribe push                                ⏭  SKIPPED — no challengeId from check 3
Check 5: identitySource audit wiring               ⏭  SKIPPED — auth path not exercised
Check 6: Unknown wallet rejected (wallet_signature_invalid) ✅
Check 7: auth_mode_conflict                        ❌ SCRIPT LIMITATION (see note below)
Check 8: Sui unavailable                           🔧 MANUAL — not run
```

**This is not a Sui identity failure.** The correct description is:

> *Production Sui identity could not be fully exercised because no real wallet signature was available.*

**Check 7 note:** The script sends a structural stub signature with a Bearer token in production mode. Cryptographic signature verification fires before `resolveServerViewerContext` is reached, returning `wallet_signature_invalid` before the `auth_mode_conflict` guard is evaluated. This is correct server behavior — the guard itself is proven by `resolveServerViewerContextProd.test.ts`. It should be re-tested live once real wallet signing tooling is available.

---

## What Can Be Claimed

**Safe to claim:**

> Signal Vault can resolve server-side character and tribe identity from a verified wallet path using public Sui PlayerProfile/Character data. In dev validation, the complete Sui identity + policy path reached the expected write gate.

**Not yet claimable:**

> Production wallet-signature validation has been proven end-to-end.

---

## Remaining Requirement

Real EVE dApp Kit wallet signing tooling is required to complete production validation. Specifically:

- A Sui wallet capable of signing the challenge message (`X-Wallet-Signature` over the server-issued challenge text)
- `SIGNAL_VAULT_TEST_SIG` set to the resulting signature bytes

Once available, re-run `scripts/validate-sui-identity.mjs` with `AUTH_DEV_MODE=false` and record a new results file.

---

## Migration State

| Migration | Applied | Verified |
|-----------|---------|---------|
| `001_initial_schema.sql` | yes | yes |
| `002_add_audit_identity_source.sql` | yes | yes — column present |

---

## Related

| File | Purpose |
|------|---------|
| `scripts/validate-sui-identity.mjs` | Validation script |
| `docs/backend/20-sui-identity-live-validation-runbook.md` | Step-by-step runbook |
| `docs/backend/21-sui-identity-validation-results-template.md` | Blank template for future runs |
| `apps/api/__tests__/resolveServerViewerContextProd.test.ts` | Unit coverage for production guard |
