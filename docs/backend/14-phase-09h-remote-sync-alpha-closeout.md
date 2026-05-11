# Phase 09H — Remote Sync Alpha — Closeout

## Summary

Phase 09H introduced the first end-to-end remote push path for signals — from in-app button click through to the backend API. This is a **dev-only alpha** using static credentials behind an explicit feature flag. No real wallet signing, no automatic sync, no queue.

---

## What Was Built

### Data Model

| File | Change |
|------|--------|
| `signalTypes.ts` | Added `SignalRemoteMeta` interface (`remoteId?`, `lastAttemptAt?`, `lastError?`) and `remote?` field on `Signal` |
| `signalMemory.ts` | Added `update(signal)` — replaces signal in-place within its entity bucket |
| `localSignalRepository.ts` | Added `updateSignal(db, signal)` — Dexie `put()` upsert |
| `SignalProvider.tsx` | Added `updateSignal` to context value; calls memory update + db upsert + re-render |

### Remote Push Flow

| File | Purpose |
|------|---------|
| `remoteDevCredentials.ts` | Returns `RemoteCredentials \| null` from env vars; gates on `VITE_REMOTE_DEV_AUTH=true` |
| `remoteSignalMapping.ts` | Pure functions: `applyRemotePending`, `applyRemoteSaved`, `applyRemoteFailed`, `getRemoteId`, `hasRemoteId` |
| `remoteSignalPush.ts` | Orchestrates: payload conversion → auth headers → `remotePost` → result |

### UI

| File | Purpose |
|------|---------|
| `RemoteSyncButton.tsx` | State-aware push button on `SignalCard`; hides for ineligible signals, shows Syncing/Retry/Push remote states |
| `RemoteSyncStatusBadge.tsx` | Inline badge: green `Remote · <id>` on saved, red `Push failed` on error, blue `Syncing…` on pending |
| `SignalCard.tsx` | Wires both components into the card layout |

### New Env Vars (client)

| Var | Purpose |
|-----|---------|
| `VITE_REMOTE_DEV_AUTH` | `'true'` to enable dev push; never set in production |
| `VITE_REMOTE_DEV_CHARACTER_JWT` | Dev JWT (not a real signed token) |
| `VITE_REMOTE_DEV_WALLET_SIGNATURE` | Dev wallet signature bytes |
| `VITE_REMOTE_DEV_WALLET_ADDRESS` | Dev wallet address |
| `VITE_REMOTE_DEV_SIGNATURE_MESSAGE` | Signed message (defaults to `signal-vault:dev`) |

---

## Push Flow

```
[Push remote button clicked]
  → checkRemoteSyncPreflight (7 gates)
      backend_not_configured → backend_unreachable → remote_writes_disabled
      → viewer_not_authenticated → auth_headers_unavailable
      → signal_local_private / anonymous_author
      → policy_denied
  ← preflight.status === 'blocked' → show inline error, no state change

  → applyRemotePending(signal) → updateSignal (memory + db)
  → pushSignalToRemote (POST /api/v1/signals with auth headers)
    ← ok: true  → applyRemoteSaved(signal, remoteId) → updateSignal
    ← ok: false → applyRemoteFailed(signal, reason) → updateSignal
```

---

## Hard Constraints (enforced, not deferred)

- No automatic sync — push is always user-initiated
- No sync queue — state lives on the Signal itself (`syncState` + `remote`)
- No pull / delete-after-push
- No real wallet signing — dev credentials only, gated by `VITE_REMOTE_DEV_AUTH`
- `local_private` and `anonymous_local` signals never reach the push path
- Preflight must pass before `remote_pending` is set — failed preflight leaves signal untouched

---

## Test Coverage

| Suite | Before | After | Delta |
|-------|--------|-------|-------|
| API (`apps/api`) | 118 / 5 skip | 118 / 5 skip | — |
| Web (`apps/web`) | 477 | 526 | +49 |
| TypeScript errors | 0 | 0 | — |

New test files added (web):

- `signalMemory.test.ts` — 2 new tests (`update` replaces in-place, no-op for unknown id)
- `localSignalRepository.test.ts` — 1 new test (`updateSignal` persists changes)
- `remoteDevCredentials.test.ts` — 8 tests (flag states, missing vars, default message)
- `remoteSignalMapping.test.ts` — 17 tests (all 5 mapping functions)
- `remoteSignalPush.test.ts` — 7 tests (success, auth failure, payload error, network error, header/body assertions)
- `RemoteSyncStatusBadge.test.tsx` — 6 tests (each sync state rendered correctly)
- `RemoteSyncButton.test.tsx` — 8 tests (all render states, disabled conditions)

---

## Known Limitations / Deferred to Later Phases

| Item | Deferred to |
|------|------------|
| Real wallet signing via dApp Kit | Phase 09I or later |
| Nonce challenge / replay protection | Future auth hardening |
| Pull / fetch remote signals | Future sync phase |
| Sync queue with retry backoff | Future sync phase |
| Production credential flow | After real signing is wired |

---

## Completion Criteria (all met)

- [x] Push button visible on eligible `SignalCard` entries
- [x] Dev auth gated by `VITE_REMOTE_DEV_AUTH=true`
- [x] `local_private` shows "Local only", never gets a push button
- [x] Anonymous-authored signals silently hidden from push
- [x] Preflight failure shows inline error without changing signal state
- [x] `remote_pending` → `remote_saved` or `sync_failed` based on API response
- [x] `RemoteSyncStatusBadge` reflects all terminal states
- [x] TypeScript: 0 errors
- [x] API test count unchanged: 118 passed
- [x] Web test count: 526 passed (up from 477)
