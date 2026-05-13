# Phase 01: Object Context Shell

## Goal

Build the compact object-context route shell.

## Status

Closed for alpha. The route remains named `/ingame/object` for compatibility, but the product framing is now object context plus future desktop companion overlay, not a dependency on a current in-game browser.

## Build

- `InGameShell`
- `/ingame/object?tenant=&itemId=`
- `/ingame/object/:objectId`
- query param parser
- compact page layout
- unknown object placeholder
- identity/resolution header slots

## Acceptance Criteria

- Object route loads with tenant/itemId.
- Object route loads with objectId.
- Missing params render safe error state.
- Unknown object page renders.
- No authentication required for public shell.
- In-game UI is compact and readable.

## Evidence

- `apps/web/src/app/InGameShell.tsx`
- `apps/web/src/app/InGameShell.test.tsx`
- `apps/web/src/app/routes.tsx`
