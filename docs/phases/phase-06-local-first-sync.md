# Phase 06: Local-First Sync

## Goal

Prevent data loss and support offline/unauthenticated capture.

## Status

Closed for alpha after scope correction. Local persistence, import/export, remote sync status, manual single-signal push, retry UX, and failure preservation are implemented. Background queues and automatic sync are intentionally not implemented and are a hard invariant for alpha.

## Build

- Dexie schema
- local draft store
- manual remote push status
- sync status badges
- import/export JSON
- conflict-safe remote sync

## Acceptance Criteria

- Local Signals persist offline.
- Drafts survive reload.
- Manual push can move one eligible Signal at a time when backend/auth are available.
- Failed sync does not delete local data.
- Export/import works.

## Evidence

- `apps/web/src/features/local/`
- `apps/web/src/features/remote/`
- `apps/web/src/features/local/localExport.test.ts`
- `apps/web/src/features/local/localImport.test.ts`
- `apps/web/src/features/remote/remoteSignalPush.test.ts`
