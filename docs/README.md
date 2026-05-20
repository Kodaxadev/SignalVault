# Signal Vault Docs

This is the operating library for Signal Vault: product decisions, architecture,
alpha status, backend hardening, desktop companion work, and EVE Frontier
integration notes.

Signal Vault is a field-first intelligence layer for EVE Frontier. It is not a
generic notes clone. The core product rule is:

> Capture what was known at the time. Label the source. Reconfirm before acting.

## Start Here

| Need | Read |
|---|---|
| What the alpha can and cannot claim | [`alpha/01-alpha-release-readiness.md`](alpha/01-alpha-release-readiness.md) |
| How a tester should use it | [`alpha/00-alpha-guide.md`](alpha/00-alpha-guide.md) |
| Current risks and follow-ups | [`operations/08-signal-vault-action-register.md`](operations/08-signal-vault-action-register.md) |
| Product thesis | [`product/01-product-thesis.md`](product/01-product-thesis.md) |
| Architecture overview | [`architecture/00-system-overview.md`](architecture/00-system-overview.md) |
| Desktop companion status | [`phases/phase-13a-desktop-overlay-feasibility.md`](phases/phase-13a-desktop-overlay-feasibility.md) |
| Railway backend setup | [`operations/12-railway-backend-deployment.md`](operations/12-railway-backend-deployment.md) |

## Product And UX

- [`product/00-prd.md`](product/00-prd.md)
- [`product/01-product-thesis.md`](product/01-product-thesis.md)
- [`product/02-feature-to-gameplay-map.md`](product/02-feature-to-gameplay-map.md)
- [`product/03-naming-language-and-lore.md`](product/03-naming-language-and-lore.md)
- [`product/04-success-metrics.md`](product/04-success-metrics.md)
- [`app-spec/00-complete-app-function-inventory.md`](app-spec/00-complete-app-function-inventory.md)
- [`app-spec/06-user-journey-scenarios.md`](app-spec/06-user-journey-scenarios.md)
- [`app-spec/08-ingame-ui-state-machine.md`](app-spec/08-ingame-ui-state-machine.md)

## Architecture

- [`architecture/00-system-overview.md`](architecture/00-system-overview.md)
- [`architecture/01-frontend-architecture.md`](architecture/01-frontend-architecture.md)
- [`architecture/02-backend-architecture.md`](architecture/02-backend-architecture.md)
- [`architecture/04-entity-resolution.md`](architecture/04-entity-resolution.md)
- [`architecture/05-signal-domain-model.md`](architecture/05-signal-domain-model.md)
- [`architecture/07-data-sources.md`](architecture/07-data-sources.md)
- [`architecture/08-security-and-permissions.md`](architecture/08-security-and-permissions.md)

## EVE Frontier Integration

- [`integration/eve-dapp-kit-compatibility-audit.md`](integration/eve-dapp-kit-compatibility-audit.md)
- [`integration/world-api-enrichment-audit.md`](integration/world-api-enrichment-audit.md)
- [`integration/frontier-static-game-data.md`](integration/frontier-static-game-data.md)
- [`integration/sui-character-resolution-research.md`](integration/sui-character-resolution-research.md)
- [`backend/23-biomassing-identity-continuity.md`](backend/23-biomassing-identity-continuity.md)

## Backend And Remote Sync

- [`backend/00-shared-persistence-contract.md`](backend/00-shared-persistence-contract.md)
- [`backend/01-api-contracts.md`](backend/01-api-contracts.md)
- [`backend/16-character-token-contract.md`](backend/16-character-token-contract.md)
- [`backend/18-production-identity-mode.md`](backend/18-production-identity-mode.md)
- [`backend/20-sui-identity-live-validation-runbook.md`](backend/20-sui-identity-live-validation-runbook.md)
- [`operations/11-deployed-rls-verification.md`](operations/11-deployed-rls-verification.md)

## Alpha And Operations

- [`alpha/00-alpha-guide.md`](alpha/00-alpha-guide.md)
- [`alpha/03-known-limitations.md`](alpha/03-known-limitations.md)
- [`alpha/05-player-facing-faq.md`](alpha/05-player-facing-faq.md)
- [`alpha/06-demo-operator-checklist.md`](alpha/06-demo-operator-checklist.md)
- [`operations/04-release-checklist.md`](operations/04-release-checklist.md)
- [`operations/05-production-readiness-checklist.md`](operations/05-production-readiness-checklist.md)
- [`operations/06-desktop-companion-alpha-readiness.md`](operations/06-desktop-companion-alpha-readiness.md)
- [`operations/10-desktop-packaged-smoke-test.md`](operations/10-desktop-packaged-smoke-test.md)

## Design Decisions

- [`decisions/ADR-001-stack-choice.md`](decisions/ADR-001-stack-choice.md)
- [`decisions/ADR-002-ingame-first.md`](decisions/ADR-002-ingame-first.md)
- [`decisions/ADR-003-viewer-context.md`](decisions/ADR-003-viewer-context.md)
- [`decisions/ADR-004-entity-resolution.md`](decisions/ADR-004-entity-resolution.md)
- [`decisions/ADR-005-local-first-capture.md`](decisions/ADR-005-local-first-capture.md)
- [`decisions/ADR-006-no-graph-first.md`](decisions/ADR-006-no-graph-first.md)
- [`decisions/ADR-007-eve-dapp-kit-anchor.md`](decisions/ADR-007-eve-dapp-kit-anchor.md)

## Non-Negotiable Development Rules

1. Opening Signal Vault from EVE Frontier proves context, not identity.
2. URL params are hints, not truth.
3. Every object page must work when unresolved.
4. Every Signal stores author context and entity-resolution snapshot.
5. Manual intel is valid but visibly labeled.
6. Indexed or on-chain data can promote confidence, not erase history.
7. In-game mode prioritizes fast capture over editor power.
8. Signal Vault complements map tools before trying to replace them.
9. No shared or tribe write without resolved viewer context.
10. Remote production claims require live verification, not just local tests.
