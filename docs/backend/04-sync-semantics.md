# Sync Semantics

## Promotion Rules

### local_private

- `promotableDirectly: false`
- `requiresVisibilityChange: true`
- `requiresPolicyCheck: true`

Must first change visibility to `private`/`public`/`tribe`/`officer`/`scout_cell` via explicit user action. Then the target visibility's policy rules apply.

### private

- `promotableDirectly: true`
- `requiresVisibilityChange: false`
- `requiresPolicyCheck: false`

Requires explicit user action to promote.

### tribe / officer / scout_cell

- `promotableDirectly: true`
- `requiresVisibilityChange: false`
- `requiresPolicyCheck: true`

Requires server-side policy verification (tribe membership, role, cell identity).

### public

- `promotableDirectly: true`
- `requiresVisibilityChange: false`
- `requiresPolicyCheck: false`

Minimal checks required.

## Sync Flow

```
local_only → remote_pending (optimistic) → remote_saved (confirmed)
                                       → sync_failed (retry)
```

1. User creates/updates signal locally
2. Signal marked `remote_pending`
3. Sync attempt to remote API
4. On success: marked `remote_saved`
5. On failure: marked `sync_failed`, queued for retry

## Retry Strategy

- Exponential backoff: 1s → 2s → 4s
- Max 3 retries per sync attempt
- After max retries: permanently `sync_failed`
- User can manually retry failed signals

## Degradation

- Failed sync keeps local signal **intact**
- UI shows sync status badge on signal cards
- No data loss on sync failure
- Offline signals queue locally, sync on reconnect

## Conflict Resolution

- **Last-write-wins** by `updatedAt` timestamp
- Server timestamp is authoritative
- Client clock skew handled via server response normalization
- Concurrent edits: server version wins, client syncs down

## Offline Behavior

- All writes queue locally in Dexie
- Sync triggered on reconnect
- Queue processed FIFO with retry limits
- User can continue working offline while sync is pending
