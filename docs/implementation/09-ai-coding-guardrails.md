# AI Coding Guardrails

## Non-Negotiables

1. No monolithic files.
2. No `App.tsx` business logic.
3. No file above ~400 lines without justification.
4. No shared Signal write without ViewerContext.
5. No URL param treated as verified identity or object truth.
6. No fake API-confirmed labels for manual data.
7. No graph/editor dependencies in v0.1 without approval.
8. No hardcoded secrets.
9. No stale dependency upgrades without checking EVE dApp Kit peers.
10. No broad rewrites without phase-specific acceptance criteria.

## Patch Discipline

Before changes:

- identify phase
- identify files touched
- identify expected tests
- identify blast radius

After changes:

- run typecheck
- run tests
- run build
- summarize exactly what changed

## Required Architecture Files

If a change modifies one of these domains, update its doc:

- ViewerContext
- EntityResolution
- Signal model
- API contracts
- database schema
- permissions
- phase acceptance criteria
