# Phase 05: Dossiers

## Goal

Specialize object pages by entity type.

## Status

Closed for alpha. Gate, storage, market, system, route, tribe, object, and unknown dossier paths are implemented. Turret/network-node still route through the unknown/object-safe fallback until dedicated layouts are needed.

## Build

- ObjectDossier router
- GateDossier
- StorageDossier
- TurretDossier
- NetworkNodeDossier
- SystemDossier
- RouteDossier

## Acceptance Criteria

- Gate dossier shows access/risk/recent reports.
- Storage dossier shows purpose/access/manifest state.
- Unknown dossier remains safe.
- System dossier aggregates linked Signals.
- Route dossier aggregates gate/system Signals.

## Evidence

- `apps/web/src/features/dossiers/`
- `apps/web/src/features/dossiers/ObjectDossier.test.tsx`
- `apps/web/src/features/dossiers/SystemDossier.test.tsx`
- `apps/web/src/features/dossiers/TribeDossier.test.tsx`
