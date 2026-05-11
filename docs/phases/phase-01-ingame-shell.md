# Phase 01: In-Game Shell

## Goal

Build the compact in-game route shell.

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
