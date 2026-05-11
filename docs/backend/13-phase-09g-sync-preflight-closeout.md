# Phase 09G Closeout: Client Sync Preflight + Transport Migration

## What Was Built

Transport migration (auth body → HTTP headers) and a client-side preflight layer that answers "can this client safely attempt remote sync?" without sending any Signals. No remote push was enabled in this phase.

## Hard Rules Enforced

1. No remote Signal push.
2. No sync queue.
3. No `remote_pending → remote_saved` transition.
4. No automatic promotion.
5. No `POST /api/v1/signals` from normal client flow.
6. Server reads auth from HTTP headers as primary path.
7. Body auth removed from all schemas.

## New Files

### Server

| File | Purpose |
|---|---|
| `apps/api/src/auth/parseAuthHeaders.ts` | Extracts `Authorization`, `X-Wallet-Signature`, `X-Signature-Message`, `X-Wallet-Address` from request headers |
| `apps/api/__tests__/parseAuthHeaders.test.ts` | 7 unit tests for header parsing |

### Client (`apps/web/src/features/remote/`)

| File | Purpose |
|---|---|
| `remoteBackendHealth.ts` | `checkBackendHealth(url)` → `{ reachable, writesEnabled }` |
| `remoteAuthHeaders.ts` | `buildRemoteAuthHeaders(viewer, credentials?)` → `RemoteAuthHeaderResult` |
| `remoteEligibility.ts` | `checkSignalEligibility(signal)` → `SignalEligibilityResult` |
| `remoteSyncPreflight.ts` | `checkRemoteSyncPreflight(ctx)` → `RemoteSyncPreflightResult` |
| `remoteClient.ts` | `remoteGet`, `remotePost` — base HTTP client with auth header support |
| `remoteBackendHealth.test.ts` | 5 tests |
| `remoteAuthHeaders.test.ts` | 7 tests |
| `remoteEligibility.test.ts` | 7 tests |
| `remoteSyncPreflight.test.ts` | 10 tests |
| `remoteClient.test.ts` | 5 tests |

## Updated Files

### Server

| File | Change |
|---|---|
| `src/auth/verifyAuth.ts` | Replaced `verifyAuth(walletSignature, characterJwt)` with `verifyAuthFromHeaders(AuthInputs)` |
| `src/signals/signalValidation.ts` | Removed `auth` from `createSignalRequestSchema`; body carries `signal` only |
| `src/signals/signalRoutes.ts` | Reads auth from headers via `parseAuthHeaders` + `verifyAuthFromHeaders` |
| `src/health/healthHandler.ts` | Bumped to `phase: '09G'`; added `writesEnabled: boolean` to health response |
| `__tests__/signalValidation.test.ts` | Removed auth body tests; added body-only schema tests |
| `__tests__/verifyAuth.test.ts` | Updated to use `verifyAuthFromHeaders` with `AuthInputs` |
| `__tests__/signalRoutes.test.ts` | Auth now in HTTP headers; body has `signal` only |
| `__tests__/health.test.ts` | Updated phase assertion to `'09G'`; added `writesEnabled` assertion |

### Client

| File | Change |
|---|---|
| `src/lib/env.ts` | Added `VITE_REMOTE_SYNC_URL`, `VITE_REMOTE_DEV_AUTH` |
| `src/features/remote/remoteApiContracts.ts` | Removed `auth` from mutation request bodies; updated `CreateSignalResponse` to match server 201 shape |
| `src/features/remote/index.ts` | Added exports for all five new modules |

## Auth Header Contract (Final)

```
Authorization: Bearer <characterJwt>
X-Wallet-Signature: <walletSignature>
X-Signature-Message: <signedMessage>
X-Wallet-Address: <walletAddress>   (hint only; server derives authoritative address)
```

Server rejects any request where `Authorization` or `X-Wallet-Signature` is absent → `auth_missing`.

## Preflight Check Order

```
checkRemoteSyncPreflight(ctx)
  │
  ├─ backendUrl configured?        → backend_not_configured
  ├─ /health reachable?            → backend_unreachable
  ├─ writesEnabled in health?      → remote_writes_disabled
  ├─ viewer not anonymous?         → viewer_not_authenticated
  ├─ buildRemoteAuthHeaders ready? → auth_headers_unavailable
  ├─ signal not local_private?     → signal_local_private
  ├─ author not anonymous_local?   → anonymous_author
  ├─ visibility remote-eligible?   → visibility_not_remote_eligible
  ├─ tribe policy for tribe scopes → policy_denied
  │
  └─ { status: 'ready' }
```

## Dev Auth Note

`VITE_REMOTE_DEV_AUTH=true` enables passing mock `RemoteCredentials` to `buildRemoteAuthHeaders` for local testing. Dev auth is not production auth. In production, `buildRemoteAuthHeaders` returns `blocked: wallet_signature_unavailable` until Phase 09H implements wallet signing.

## What Is Pending

| Item | Phase |
|---|---|
| Wallet signing (real `RemoteCredentials` from dApp Kit) | 09H |
| `remote_pending → remote_saved` transition | 09H |
| Retry behavior and local preservation on failure | 09H |
| Remote UUID mapping back to local Signal | 09H |

## Risk Register Updates

| Risk | Status after 09G |
|---|---|
| R-B01 — Auth placeholder | Resolved (09E) |
| R-B05 — Writes disabled | Resolved (09F) |
| R-B06 — No client sync | **Partial** — preflight exists; push requires 09H |

## Test Counts at Closeout

- API test suite: **118 passed, 5 skipped** (DB smoke gate), **14 files**, 0 failures
- Web test suite: **477 passed**, **80 files**, 0 failures
- TypeScript: 0 errors (both packages)

## Acceptance Criteria — All Met

- [x] Server reads auth from HTTP headers
- [x] Body auth removed from request schema
- [x] Client can build remote auth headers only when eligible (`buildRemoteAuthHeaders`)
- [x] Backend health check works from remote client (`checkBackendHealth`)
- [x] Preflight blocks missing backend URL
- [x] Preflight blocks backend unreachable
- [x] Preflight blocks anonymous viewer
- [x] Preflight blocks `local_private` Signals
- [x] Preflight blocks anonymous-authored Signals
- [x] Preflight blocks policy-denied tribe/officer/scout scopes
- [x] Preflight does not send Signals
- [x] No remote sync queue added
- [x] No `POST /api/v1/signals` from normal client flow
- [x] Existing local-first flow unchanged
- [x] API tests pass (118 passed)
- [x] Web tests pass (477 passed)
- [x] TypeScript 0 errors (both packages)
