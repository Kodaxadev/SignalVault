# Phase 09J — Character Token Contract — Closeout

## Summary

Phase 09J is a documentation and contract-only phase. No token issuer was implemented. No fake production identity was introduced. `VITE_REMOTE_DEV_CHARACTER_JWT` remains unchanged.

The phase formalizes the gap between the current dev auth path and what production character identity requires, making that gap explicit in types and constants rather than implicit in code comments.

---

## What Was Built

| File | Purpose |
|------|---------|
| `docs/backend/16-character-token-contract.md` | Contract doc: status, problem, dev path, required claims, trust anchor, verification requirements, open questions, hard invariants |
| `apps/web/src/features/remote/characterTokenTypes.ts` | `CharacterTokenStatus`, `CharacterTokenClaims`, `CharacterTokenResult`, `CharacterTokenIssuer` — contract types only, no implementation |
| `apps/api/src/auth/characterTokenContract.ts` | `CHARACTER_TOKEN_CONTRACT_STATUS`, `REQUIRED_CHARACTER_TOKEN_CLAIMS`, `CHARACTER_TOKEN_HARD_INVARIANTS` constants; `isProductionCharacterTokenAvailable(): false` |

---

## Hard Invariants Codified

1. No background or automatic sync until production-grade character token issuance exists.
2. The server never trusts character identity from the request body or headers — only from a verified JWT.
3. `AUTH_DEV_MODE=true` must never be set in production.
4. `VITE_REMOTE_DEV_CHARACTER_JWT` is local scaffolding only — not a production auth mechanism.
5. `tribe_id` used for tribe-scoped visibility must come from the verified JWT payload, never from the client.

---

## Incidental Fix

`apps/api/__tests__/challengeRoutes.test.ts` line 36 had a latent TypeScript error (`string | undefined` passed to `new Date()`). Fixed with explicit cast (`body['expiresAt'] as string`). No behavior change.

---

## Test Coverage

| Suite | Before 09J | After 09J | Delta |
|-------|-----------|----------|-------|
| API (`apps/api`) | 146 / 5 skip | 151 / 5 skip | +5 |
| Web (`apps/web`) | 554 | 554 | — |
| TypeScript errors | 0 | 0 | — |

New API test file:
- `characterTokenContract.test.ts` — 5 tests: CONTRACT_STATUS value, `isProductionCharacterTokenAvailable` returns false, required claims present, hard invariants non-empty, no-background-sync rule present

---

## Acceptance Criteria

- [x] `docs/backend/16-character-token-contract.md` exists with full contract structure
- [x] `characterTokenTypes.ts` defines `CharacterTokenStatus`, `CharacterTokenClaims`, `CharacterTokenResult`, `CharacterTokenIssuer`
- [x] `characterTokenContract.ts` defines all three constants and `isProductionCharacterTokenAvailable(): false`
- [x] No token issuer implemented
- [x] No fake production identity introduced
- [x] `VITE_REMOTE_DEV_CHARACTER_JWT` unchanged
- [x] No network imports in new files
- [x] `isProductionCharacterTokenAvailable()` tested
- [x] API tests: 151 passed / 5 skipped
- [x] Web tests: 554 passed
- [x] TypeScript: 0 errors
- [x] Build: success
- [x] check:lines: all files under 400 lines
- [x] Main chunk: 0 evefrontier refs
