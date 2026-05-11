# Testing Strategy

## Test Pyramid

### Unit Tests

Pure functions:

- `resolveViewerContext`
- `mergeResolutionCandidates`
- `canReadSignal`
- `evaluateSignalStaleness`
- `detectContradictions`
- `buildQuickSignal`

### Component Tests

- `InGameShell`
- `UnknownObjectDossier`
- `GateDossier`
- `StorageDossier`
- `ViewerBadge`
- `QuickSignalButtons`

### Integration Tests

- anonymous object page flow
- access-code consume flow
- manual classification flow
- quick Signal capture flow
- local draft persistence flow

## Required Tests by Phase

Phase 00:

- smoke render
- route render

Phase 02:

- anonymous cannot shared-write
- access code expiry
- session revoke

Phase 03:

- unknown object
- manual classification
- conflict resolution

Phase 04:

- quick Signals
- Signal context snapshot
- local storage

## CI Gates

Every PR must pass:

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
```

## AI-Assisted Coding Rule

If AI changes domain logic, it must add or update tests in the same phase.
