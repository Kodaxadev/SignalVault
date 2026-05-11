# Phase 09K — Remote Sync UX Hardening (Manual-Only) — Closeout

## Summary

Phase 09K hardens the remote sync UI for alpha users. No new auth, no background sync, no bulk sync. All 09J invariants hold. The push path is unchanged — only the copy, blocked states, and retry UX are improved.

---

## What Was Built

### New Components

| File | Purpose |
|------|---------|
| `remote/components/RemoteSyncAlphaWarning.tsx` | "Alpha · Manual only" label; "Alpha · Dev auth · Manual only" when dev auth is active |
| `remote/components/RemoteSyncBlockedReason.tsx` | Actionable copy for 6 blocked states: no_backend_url, no_auth_method, signing_not_supported, wallet_not_connected, provider_missing, character_token_blocked |
| `remote/components/RemoteSyncExplainer.tsx` | One-line reminder: remote push is manual/alpha, local Signal always preserved |
| `remote/components/RemoteSyncRetryPanel.tsx` | sync_failed UX: "Push failed — your Signal is saved locally." + last error + retry button |

### Modified

| File | Change |
|------|--------|
| `remote/components/RemoteSyncButton.tsx` | Uses all four new components; adds character JWT preflight check for signing path (shows `character_token_blocked` before user clicks); maps wallet signing reason to specific `BlockedSyncReason` |
| `remote/components/RemoteSyncStatusBadge.tsx` | `sync_failed` title now says "preserved locally"; `remote_saved` title now shows full remote ID |
| `signals/components/SignalCard.tsx` | Shows `RemoteSyncExplainer` for eligible signals in local_only or sync_failed state |

---

## Blocked State Coverage

| Condition | Before 09K | After 09K |
|-----------|-----------|---------|
| No VITE_REMOTE_SYNC_URL | Disabled button with title | `RemoteSyncBlockedReason: no_backend_url` |
| No auth, signing unsupported | "wallet signing not supported" inline | `RemoteSyncBlockedReason: signing_not_supported` |
| No auth, wallet not connected | Generic | `RemoteSyncBlockedReason: wallet_not_connected` |
| No auth, provider missing | Generic | `RemoteSyncBlockedReason: provider_missing` |
| Signing available but no JWT | Would fail at server | `RemoteSyncBlockedReason: character_token_blocked` (preflight) |
| Dev auth active | Unlabeled | `RemoteSyncAlphaWarning: Alpha · Dev auth · Manual only` |

---

## Test Coverage

| Suite | Before 09K | After 09K | Delta |
|-------|-----------|----------|-------|
| Web (`apps/web`) | 554 | 575 | +21 |
| API (`apps/api`) | 151 / 5 skip | 151 / 5 skip | — |
| TypeScript errors | 0 | 0 | — |

New web test files:
- `RemoteSyncAlphaWarning.test.tsx` — 3 tests
- `RemoteSyncBlockedReason.test.tsx` — 6 tests (one per reason)
- `RemoteSyncExplainer.test.tsx` — 2 tests
- `RemoteSyncRetryPanel.test.tsx` — 6 tests

Updated:
- `RemoteSyncButton.test.tsx` — +4 tests (alpha warning, retry panel, blocked reasons, JWT check)
- `RemoteSyncStatusBadge.test.tsx` — updated assertions for new tooltip copy, +1 test (remote_saved full ID)

---

## Acceptance Criteria

- [x] Remote sync UI clearly says alpha/manual-only (`RemoteSyncAlphaWarning`)
- [x] Dev auth mode is visibly labeled when active
- [x] Missing character token shows contract-blocked explanation (`character_token_blocked`)
- [x] Signing unavailable shows actionable reason (maps signing reason → specific copy)
- [x] Failed sync clearly says local Signal is preserved (`RemoteSyncRetryPanel` + badge title)
- [x] Retry only appears for sync_failed
- [x] remote_saved shows remote ID with full ID in title
- [x] No automatic sync added
- [x] No background queue added
- [x] No production character token behavior added
- [x] Web tests: 575 passed
- [x] TypeScript: 0 errors
- [x] Build: success
- [x] check:lines: all files under 400 lines
- [x] Main chunk: 0 evefrontier refs
