# Phase 08: Tribe Vault

## Goal

Add shared operational memory.

## Status

Partially closed for alpha. Tribe/officer visibility, policy evaluation, readiness UI, tribe dossier, remote policy checks, and audit writes exist. Scout-cell scope is intentionally locked because no cell identity model exists. A full tribe vault management UI is future work.

## Build

- tribe-scoped Signals
- officer visibility
- scout-cell visibility locked state
- roles
- audit log
- tribe dossier view
- shared object dossier filtering

## Acceptance Criteria

- Character-resolved viewer can publish tribe Signal through eligible remote push.
- Anonymous viewer cannot read tribe Signal.
- Role-gated visibility works.
- Audit log records shared writes.
- Tribe vault can filter by object/system/route.

## Evidence

- `apps/web/src/features/tribeVault/`
- `apps/web/src/features/permissions/canReadSignal.test.ts`
- `apps/api/src/policy/checkPolicy.ts`
- `apps/api/__tests__/checkPolicy.test.ts`
- `apps/api/src/audit/insertAuditEvent.ts`
