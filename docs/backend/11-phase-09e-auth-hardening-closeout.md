# Phase 09E Closeout: Auth Hardening

## What Was Built

Replaced placeholder min-length auth with an explicit verification boundary. Real JWT verification is wired via `jose`. Wallet signature verification has a structural dev path and a documented production stub. Server identity is now resolved through a unified `resolveServerViewerContext` pipeline.

## New Files

| File | Purpose |
|---|---|
| `src/auth/authEnv.ts` | Auth env vars: `AUTH_DEV_MODE`, `JWT_SECRET`, `JWT_JWKS_URL`, `JWT_ISSUER`, `JWT_AUDIENCE` |
| `src/auth/jwtTypes.ts` | `CharacterJwtClaims`, `JwtVerifyResult`, `JwtFailureReason` |
| `src/auth/walletSignatureTypes.ts` | `WalletSignatureInput`, `WalletVerifyResult`, `MIN_SIGNATURE_LENGTH` |
| `src/auth/verifyCharacterJwt.ts` | Dev: `jose.decodeJwt` (no sig check). Prod: `jose.jwtVerify` with JWKS or secret |
| `src/auth/verifyWalletSignature.ts` | Dev: structural length check + hint passthrough. Prod: stub with implementation notes |
| `src/auth/resolveServerViewerContext.ts` | Combines wallet + JWT verification into typed `ServerViewerContext` union |
| `docs/backend/10-auth-header-contract.md` | Auth header design, current vs. target state, production requirements |

## Updated Files

| File | Change |
|---|---|
| `src/auth/authTypes.ts` | Added `wallet_signature_malformed`, `character_token_expired` to `AuthFailureReason` |
| `src/auth/verifyAuth.ts` | Delegates to `resolveServerViewerContext`; maps context kind to `AuthResult` |
| `src/signals/signalRoutes.ts` | `await verifyAuth(...)` (now async) |
| `vitest.config.ts` | Added `env: { AUTH_DEV_MODE: 'true' }` for test isolation |
| `__tests__/verifyAuth.test.ts` | Rewrote to use real JWTs generated with `jose.SignJWT` |
| `__tests__/signalRoutes.test.ts` | Added `beforeAll` JWT generation; real JWT in all auth fields |

## Verification Chain

```
POST /api/v1/signals
  │
  ├─ Zod schema validation → 400 if invalid
  │
  ├─ verifyAuth(walletSignature, characterJwt)
  │     │
  │     └─ resolveServerViewerContext
  │           ├─ verifyWalletSignature → derivedAddress (dev: structural; prod: crypto)
  │           └─ verifyCharacterJwt   → characterId, tribeId (dev: decode; prod: JWKS/secret)
  │
  ├─ anonymous     → 401 wallet_signature_invalid
  ├─ wallet_verified → 401 character_token_invalid
  │
  ├─ checkPolicy(characterId, tribeId, visibility) → 403 + audit event if denied
  │
  └─ ENABLE_REMOTE_SIGNAL_WRITES=false → 503 (default)
```

## Dev Mode Behavior

`AUTH_DEV_MODE=true` (set in `vitest.config.ts` for all tests):
- `verifyCharacterJwt`: decodes JWT without signature verification
- `verifyWalletSignature`: accepts any signature ≥ 20 chars, returns hint or `dev:<prefix>` stub

`AUTH_DEV_MODE` is never set in production. When unset, production paths require `JWT_SECRET` or `JWT_JWKS_URL`. Wallet crypto verification fails closed with a documented stub.

## What Is Still Pending

| Item | Phase |
|---|---|
| Wallet signature crypto recovery (Sui) | After EVE dApp Kit format confirmed |
| Nonce challenge endpoint + replay protection | 09G |
| Auth header migration (body → headers) | 09G |

## Risk Register Updates

| Risk | Status after 09E |
|---|---|
| R-B01 — Auth placeholder | **Resolved** — JWT verified via `jose`; wallet structural in dev, stub in prod |
| R-B05 — Writes disabled | Still managed — Phase 09F |
| R-B06 — No client sync | Still managed — Phase 09G |

## Test Counts at Closeout

- API test suite: **95 passed, 4 skipped** (DB smoke gate), **12 files**, 0 failures
- Web test suite: **443 passed**, 75 files, 0 failures
- TypeScript: 0 errors

## Acceptance Criteria — All Met

- [x] Placeholder min-length auth replaced with verification boundary
- [x] JWT verification module exists (`verifyCharacterJwt.ts`)
- [x] Wallet signature verification module exists (`verifyWalletSignature.ts`)
- [x] Server-side viewer context derived from verified auth (`resolveServerViewerContext.ts`)
- [x] Auth failure returns typed error codes (`AuthFailureReason`)
- [x] Denied write attempts can be audited (403 path still fires `insertAuditEvent`)
- [x] DB write gate remains disabled by default (`ENABLE_REMOTE_SIGNAL_WRITES=false`)
- [x] No frontend remote sync added
- [x] API tests pass (95 passed)
- [x] Web tests unchanged (443 passed)
