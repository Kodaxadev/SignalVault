# Phase 07: EVE Frontier Integration

## Goal

Integrate official EVE/Sui data paths.

## Status

Closed for alpha, with production validation follow-ups tracked separately. dApp Kit is isolated to the object-context route chunk, wallet/object adapters degrade safely, World API enrichment is cached, and backend Sui PlayerProfile character resolution is implemented. Live EVE Vault signing validation remains production hardening.

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

## Evidence

- `apps/web/src/features/frontier/dappKit/`
- `apps/web/src/features/worldApi/`
- `apps/web/src/features/worldApiCache/`
- `apps/api/src/auth/resolveCharacterFromSui.ts`
- `apps/api/__tests__/resolveCharacterFromSui.test.ts`
