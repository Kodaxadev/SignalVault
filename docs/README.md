# Signal Vault Documentation Pack

Signal Vault is a field-first intelligence and field-memory dApp for **EVE Frontier**.  
It expands the basic note concept into a structured system of Signals, dossiers, entity-linked records, quick field capture, confidence/staleness, and tribe-scoped operational memory.

This documentation pack is intended to keep development on course across AI-assisted coding, audits, and future phases.

## Core Rule

Signal Vault is **not** a generic Notion/Obsidian clone.

It is:

> A field-first EVE Frontier intelligence layer that resolves viewer and object context defensively, supports browser-based local intel today, and moves in-play use toward a desktop companion overlay until a current EVE Frontier dApp browser exists and is verified.

## Documentation Map



### App Specification

- [`app-spec/00-complete-app-function-inventory.md`](app-spec/00-complete-app-function-inventory.md)
- [`app-spec/01-ingame-interaction-flow-catalog.md`](app-spec/01-ingame-interaction-flow-catalog.md)
- [`app-spec/02-object-specific-function-matrix.md`](app-spec/02-object-specific-function-matrix.md)
- [`app-spec/03-quick-action-catalog.md`](app-spec/03-quick-action-catalog.md)
- [`app-spec/04-ability-and-permission-matrix.md`](app-spec/04-ability-and-permission-matrix.md)
- [`app-spec/05-signal-lifecycle.md`](app-spec/05-signal-lifecycle.md)
- [`app-spec/06-user-journey-scenarios.md`](app-spec/06-user-journey-scenarios.md)
- [`app-spec/07-mvp-vs-later-feature-boundaries.md`](app-spec/07-mvp-vs-later-feature-boundaries.md)
- [`app-spec/08-ingame-ui-state-machine.md`](app-spec/08-ingame-ui-state-machine.md)

### Policy

- [`policy/00-privacy-and-data-ownership.md`](policy/00-privacy-and-data-ownership.md)
- [`policy/01-object-classification-and-dispute-workflow.md`](policy/01-object-classification-and-dispute-workflow.md)
- [`policy/02-attachments-and-screenshots-spec.md`](policy/02-attachments-and-screenshots-spec.md)

### Product
- [`product/00-prd.md`](product/00-prd.md)
- [`product/01-product-thesis.md`](product/01-product-thesis.md)
- [`product/02-feature-to-gameplay-map.md`](product/02-feature-to-gameplay-map.md)
- [`product/03-naming-language-and-lore.md`](product/03-naming-language-and-lore.md)
- [`product/04-success-metrics.md`](product/04-success-metrics.md)

### Architecture
- [`architecture/00-system-overview.md`](architecture/00-system-overview.md)
- [`architecture/01-frontend-architecture.md`](architecture/01-frontend-architecture.md)
- [`architecture/02-backend-architecture.md`](architecture/02-backend-architecture.md)
- [`architecture/03-viewer-context.md`](architecture/03-viewer-context.md)
- [`architecture/04-entity-resolution.md`](architecture/04-entity-resolution.md)
- [`architecture/05-signal-domain-model.md`](architecture/05-signal-domain-model.md)
- [`architecture/06-ingame-mode.md`](architecture/06-ingame-mode.md)
- [`architecture/07-data-sources.md`](architecture/07-data-sources.md)
- [`architecture/08-security-and-permissions.md`](architecture/08-security-and-permissions.md)

### ADRs
- [`decisions/ADR-001-stack-choice.md`](decisions/ADR-001-stack-choice.md)
- [`decisions/ADR-002-ingame-first.md`](decisions/ADR-002-ingame-first.md)
- [`decisions/ADR-003-viewer-context.md`](decisions/ADR-003-viewer-context.md)
- [`decisions/ADR-004-entity-resolution.md`](decisions/ADR-004-entity-resolution.md)
- [`decisions/ADR-005-local-first-capture.md`](decisions/ADR-005-local-first-capture.md)
- [`decisions/ADR-006-no-graph-first.md`](decisions/ADR-006-no-graph-first.md)
- [`decisions/ADR-007-eve-dapp-kit-anchor.md`](decisions/ADR-007-eve-dapp-kit-anchor.md)

### Development Phases
- [`phases/phase-00-scaffold.md`](phases/phase-00-scaffold.md)
- [`phases/phase-01-ingame-shell.md`](phases/phase-01-ingame-shell.md)
- [`phases/phase-02-viewer-context.md`](phases/phase-02-viewer-context.md)
- [`phases/phase-03-entity-resolution.md`](phases/phase-03-entity-resolution.md)
- [`phases/phase-04-signals-mvp.md`](phases/phase-04-signals-mvp.md)
- [`phases/phase-05-dossiers.md`](phases/phase-05-dossiers.md)
- [`phases/phase-06-local-first-sync.md`](phases/phase-06-local-first-sync.md)
- [`phases/phase-07-eve-frontier-integration.md`](phases/phase-07-eve-frontier-integration.md)
- [`phases/phase-08-tribe-vault.md`](phases/phase-08-tribe-vault.md) — **08A/08B closed: local-first + staleness/contradiction hardening. 08C: alpha polish in progress.**
- [`phases/phase-09-indexer-events.md`](phases/phase-09-indexer-events.md)
- [`phases/phase-10-map-and-bridge.md`](phases/phase-10-map-and-bridge.md)
- [`phases/phase-11-frontierwarden-integration.md`](phases/phase-11-frontierwarden-integration.md)
- [`phases/phase-13a-desktop-overlay-feasibility.md`](phases/phase-13a-desktop-overlay-feasibility.md)
- [`phases/phase-completion-audit.md`](phases/phase-completion-audit.md)

### Implementation
- [`implementation/00-repo-structure.md`](implementation/00-repo-structure.md)
- [`implementation/01-dependency-policy.md`](implementation/01-dependency-policy.md)
- [`implementation/02-package-json-baseline.md`](implementation/02-package-json-baseline.md)
- [`implementation/03-routes.md`](implementation/03-routes.md)
- [`implementation/04-api-contracts.md`](implementation/04-api-contracts.md)
- [`implementation/05-database-schema.md`](implementation/05-database-schema.md)
- [`implementation/06-typescript-contracts.md`](implementation/06-typescript-contracts.md)
- [`implementation/07-ui-components.md`](implementation/07-ui-components.md)
- [`implementation/08-testing-strategy.md`](implementation/08-testing-strategy.md)
- [`implementation/09-ai-coding-guardrails.md`](implementation/09-ai-coding-guardrails.md)

### Support

- [`alpha/00-alpha-guide.md`](alpha/00-alpha-guide.md) — **Alpha player guide: local data, backups, limitations**
- [`support/00-player-faq.md`](support/00-player-faq.md)
- [`support/01-ingame-auth-troubleshooting.md`](support/01-ingame-auth-troubleshooting.md)
- [`support/02-browser-compatibility-requirements.md`](support/02-browser-compatibility-requirements.md)
- [`support/10k-question-simulation-report.md`](support/10k-question-simulation-report.md)
- [`support/documentation-gap-backlog.md`](support/documentation-gap-backlog.md)

### Operations
- [`operations/00-env-vars.md`](operations/00-env-vars.md)
- [`operations/01-deployment.md`](operations/01-deployment.md)
- [`operations/02-qa-checklist.md`](operations/02-qa-checklist.md)
- [`operations/03-risk-register.md`](operations/03-risk-register.md)
- [`operations/04-release-checklist.md`](operations/04-release-checklist.md)
- [`operations/06-desktop-companion-alpha-readiness.md`](operations/06-desktop-companion-alpha-readiness.md)

## Non-Negotiable Development Rules

1. Opening Signal Vault from EVE Frontier proves **context**, not identity.
2. URL params are hints, not truth.
3. Every object page must work when unresolved.
4. Every Signal stores author context and entity-resolution snapshot.
5. Manual intel is valid but visibly labeled.
6. Indexed/on-chain data can promote confidence, not erase history.
7. In-game mode prioritizes one-click capture over editor power.
8. External mode handles admin, templates, graph, and tribe management.
9. Signal Vault complements map tools before trying to replace them.
10. No shared/tribe write without resolved viewer context.
