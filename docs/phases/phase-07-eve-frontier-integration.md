# Phase 07: EVE Frontier Integration

## Goal

Integrate official EVE/Sui data paths.

## Build

- `@evefrontier/dapp-kit` provider boundary
- Smart Object context hook
- wallet connection flow
- GraphQL adapter
- character resolver from wallet/Profile
- assembly resolver
- entity confidence promotion

## Acceptance Criteria

- App reads object context when available.
- Wallet connection hydrates wallet viewer.
- Character resolution upgrades viewer state.
- Entity resolution can upgrade to indexed/on-chain verified.
- Failure degrades to manual/unknown gracefully.
