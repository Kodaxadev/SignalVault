# Phase 02: Viewer Context

## Goal

Implement explicit viewer state.

## Build

- `viewerTypes.ts`
- `resolveViewerContext.ts`
- anonymous viewer state
- session viewer state
- access-code generation endpoint
- access-code consume endpoint
- ViewerBadge
- ConnectIdentityPanel
- AccessCodePanel

## Acceptance Criteria

- Anonymous state works.
- Public dossier visible without login.
- Anonymous cannot create shared/tribe Signal.
- External app can generate access code.
- In-game app can consume access code.
- Session can be revoked.
- Every Signal write path requires ViewerContext.
