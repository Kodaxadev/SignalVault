# Phase 02: Viewer Context

## Goal

Implement explicit viewer state.

## Status

Closed for alpha. Anonymous, wallet-connected, and character-resolved viewer states exist. Access-code UI exists locally, while production identity is now handled by the backend Sui identity path rather than an EVE-issued character JWT.

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

## Evidence

- `apps/web/src/features/viewer/`
- `apps/web/src/features/permissions/canReadSignal.test.ts`
- `apps/web/src/features/viewer/ViewerSessionProvider.test.tsx`
- `apps/api/__tests__/resolveServerViewerContextSui.test.ts`
