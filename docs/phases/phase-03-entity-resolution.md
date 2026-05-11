# Phase 03: Entity Resolution

## Goal

Implement object/entity resolver with confidence states.

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
