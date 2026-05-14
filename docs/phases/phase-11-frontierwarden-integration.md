# Phase 11: FrontierWarden Integration

## Goal

Use FrontierWarden as an optional trust/policy layer.

## Status

Not closed. Signal Vault now has internal tribe/officer policy and remote write policy, but no FrontierWarden integration code, policy-domain mapping, or sealed-intel enforcement exists in this repo. Keep this phase as a future optional integration until FrontierWarden contracts are selected and documented.

## Build

- policy-domain mapping
- GatePolicy-aware visibility
- trust-domain scopes
- sealed intel access rules
- operator-controlled vault domains

## Acceptance Criteria

- Signal Vault does not assume platform owns all policies.
- Tribe/operator controls their own visibility domain.
- FrontierWarden policy can gate sealed Signals.
- Existing Signal Vault visibility still works without FrontierWarden.

## Evidence

- Implemented internal policy: `apps/web/src/features/tribeVault/`, `apps/api/src/policy/`
- Missing FrontierWarden adapter, contract mapping, and sealed Signal tests.
