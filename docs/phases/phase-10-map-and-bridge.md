# Phase 10: Map and Bridge

## Goal

Reduce tabbing by improving map/context handoff.

## Status

Partially closed for alpha. Current-system manual selection, route warnings, World API context, and the desktop companion overlay design are in place. A local log watcher and native bridge are not implemented yet; they now belong to Phase 12 / Phase 13A overlay work.

## Build

- copy/open map route actions
- route warning cards
- current-system manual selector
- optional Signal Bridge spec
- optional local log watcher prototype
- overlay feasibility test

## Acceptance Criteria

- Signal Vault can copy/open route/system context.
- Route dossier shows warnings.
- Current-system context can be selected quickly.
- Signal Bridge prototype, if built, does not block web app.

## Evidence

- `apps/web/src/features/worldContext/`
- `apps/web/src/features/routes/`
- `apps/web/src/features/routes/deriveRouteWarnings.test.ts`
- `docs/superpowers/specs/2026-05-12-desktop-overlay-companion-design.md`
