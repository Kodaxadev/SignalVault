# Phase 04: Signals MVP

## Goal

Create, list, and store Signals attached to object context.

## Status

Closed for alpha. Signal creation, quick actions, visibility badges, confidence, local storage, context snapshots, and author/entity snapshots are implemented.

## Build

- Signal types
- Signal CRUD
- QuickSignalButtons
- SignalList
- SignalEditor minimal
- ConfidenceBadge
- VisibilityBadge
- local/private/public visibility
- local-first draft storage

## Acceptance Criteria

- Gate quick actions create Signals.
- Storage quick actions create Signals.
- Signals attach to current object.
- Signals store author context.
- Signals store entity-resolution snapshot.
- Anonymous shared writes are blocked.
- Local private Signals persist across reload.

## Evidence

- `apps/web/src/features/signals/`
- `apps/web/src/features/local/localSignalRepository.test.ts`
- `apps/web/src/features/signals/createSignalDraft.test.ts`
- `apps/web/src/features/signals/signalContextSnapshot.test.ts`
