# Phase 06: Local-First Sync

## Goal

Prevent data loss and support offline/unauthenticated capture.

## Build

- Dexie schema
- local draft store
- pending sync queue
- sync status badges
- import/export JSON
- conflict-safe remote sync

## Acceptance Criteria

- Local Signals persist offline.
- Drafts survive reload.
- Queued Signals sync after auth/backend availability.
- Failed sync does not delete local data.
- Export/import works.
