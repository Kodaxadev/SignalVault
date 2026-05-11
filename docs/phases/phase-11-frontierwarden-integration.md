# Phase 11: FrontierWarden Integration

## Goal

Use FrontierWarden as an optional trust/policy layer.

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
