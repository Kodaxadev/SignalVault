# Risk Register

## R1: In-game browser cannot use wallet extension

Severity: High  
Mitigation: in-game access code fallback.

## R2: Object type cannot be resolved reliably in v0.1

Severity: High  
Mitigation: unknown object page + manual classification + confidence display.

## R3: EVE dApp Kit dependency drift

Severity: High  
Mitigation: treat dApp Kit as dependency anchor; inspect peer dependencies before upgrades.

## R4: Users trust stale/manual intel too much

Severity: Medium  
Mitigation: confidence badges, staleness rules, manual labels.

## R5: Backend unavailable during in-game use

Severity: Medium  
Mitigation: Dexie local-first capture and sync queue.

## R6: Product becomes generic note app

Severity: High  
Mitigation: feature-to-gameplay map and in-game-first acceptance criteria.

## R7: Scope creep into graph/map/marketplace

Severity: Medium  
Mitigation: ADR-006; defer graph and marketplace until core object Signals work.

## R8: Permission leakage

Severity: High  
Mitigation: server-side checks, ViewerContext, audit log, no shared writes anonymous.
