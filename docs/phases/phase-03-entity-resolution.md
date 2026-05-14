# Phase 03: Entity Resolution

## Goal

Implement object/entity resolver with confidence states.

## Status

Closed for alpha. URL hints, manual classification, dApp Kit claims, World API type hints, conflict representation, and unknown-object fallbacks are implemented.

## Build

- `entityTypes.ts`
- `resolveEntity.ts`
- `resolveFromUrlHint.ts`
- `resolveFromManualRegistry.ts`
- `EntityResolutionBadge`
- `UnknownEntityPanel`
- manual classification flow

## Acceptance Criteria

- URL hint is displayed as hint only.
- Unknown object can be manually classified.
- Manual classification is visibly marked.
- Entity record preserves tenant/itemId/objectId.
- Conflicting classification can be represented.
- Dossier never crashes on unknown type.

## Evidence

- `apps/web/src/features/entities/`
- `apps/web/src/features/entities/resolveEntity.test.ts`
- `apps/web/src/features/entities/resolutionSources/resolveFromWorldApi.test.ts`
- `apps/web/src/features/dossiers/UnknownObjectDossier.test.tsx`
