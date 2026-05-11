# Phase 09F Closeout: Controlled Remote Write

## What Was Built

Implemented the first real signal write path behind the existing `ENABLE_REMOTE_SIGNAL_WRITES` env gate. When the gate is `true`, a valid, policy-cleared POST request inserts into `signals` and records a success audit event. When the gate is `false` (default), the 503 response is unchanged — no client-visible behavior change in dev/test.

## Updated Files

| File | Change |
|---|---|
| `src/db/signalRepository.ts` | Added `DbInsertSignalInput`, `buildInsertSignalValues` (pure), `insertSignal` (async) |
| `src/signals/signalRoutes.ts` | Replaced Phase 09F stub with real `insertSignal` call + success audit + 201 response |
| `__tests__/dbSmoke.test.ts` | Added `insertSignal` integration smoke test (skips when no DB) |

## New Files

| File | Purpose |
|---|---|
| `__tests__/signalRepository.test.ts` | 16 unit tests for `buildInsertSignalValues` positional values |

## Write Pipeline (when `ENABLE_REMOTE_SIGNAL_WRITES=true`)

```
POST /api/v1/signals
  │
  ├─ Zod validation → 400
  ├─ verifyAuth → 401
  ├─ checkPolicy → 403 + denied audit event
  ├─ enableRemoteSignalWrites=false → 503 (default)
  │
  ├─ insertSignal({ authorCharacterId, authorWalletAddress, authorTribeId, ... })
  │     └─ INSERT INTO signals ... RETURNING *
  │         throws on no pool or no row returned
  │
  ├─ insertSignal throws → 503 server_error
  │
  ├─ insertAuditEvent({ outcome: 'success', targetSignalId: inserted.id })
  │
  └─ 201 { signalId, requestId }
```

## Server Identity Rules Enforced

All `author_*` columns in the DB row are derived from verified auth — never from the client request body:

| DB column | Source |
|---|---|
| `author_wallet_address` | `authResult.auth.walletAddress` (from `resolveServerViewerContext`) |
| `author_character_id` | `authResult.auth.characterId` (from verified JWT `sub` claim) |
| `author_tribe_id` | `authResult.auth.tribeId` (from verified JWT `tribe_id` claim) |

## What Is Still Pending

| Item | Phase |
|---|---|
| Nonce challenge endpoint + replay protection | 09G |
| Auth header migration (body → headers) | 09G |
| Client remote sync wired in `apps/web/features/remote/` | 09G |
| Wallet signature crypto recovery (Sui) | After EVE dApp Kit format confirmed |

## Risk Register Updates

| Risk | Status after 09F |
|---|---|
| R-B01 — Auth placeholder | Resolved (09E) |
| R-B05 — Writes disabled | **Resolved** — gate exists; write path works when enabled |
| R-B06 — No client sync | Still managed — Phase 09G |

## Test Counts at Closeout

- API test suite: **111 passed, 5 skipped** (DB smoke gate), **13 files**, 0 failures
- Web test suite: **443 passed**, 75 files, 0 failures
- TypeScript: 0 errors

## Acceptance Criteria — All Met

- [x] `insertSignal` function exists in `signalRepository.ts`
- [x] `buildInsertSignalValues` is pure and unit-tested (16 tests, 11 positional values)
- [x] `author_*` columns come from verified auth, not the request body
- [x] Success audit event inserted with real `targetSignalId` after write
- [x] 201 response includes `signalId` and `requestId`
- [x] DB write failure returns 503 (try/catch around `insertSignal`)
- [x] `ENABLE_REMOTE_SIGNAL_WRITES=false` still returns 503 (unchanged default)
- [x] DB integration smoke test added (skips when `DATABASE_URL` absent)
- [x] No frontend remote sync added
- [x] API tests pass (111 passed)
- [x] Web tests unchanged (443 passed)
