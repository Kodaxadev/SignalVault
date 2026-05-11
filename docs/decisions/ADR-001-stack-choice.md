# ADR-001: Stack Choice

## Status

Accepted for v0.1.

## Decision

Use:

- Vite
- React
- React Router Data Mode
- TypeScript
- Node 24 LTS
- pnpm
- @evefrontier/dapp-kit
- TanStack Query
- Zustand
- Dexie
- Zod
- Tailwind
- Supabase or thin Node API

## Rationale

Signal Vault needs compatibility with EVE Frontier dApp Kit and EVE Vault/wallet ecosystem more than it needs a custom frontend framework.

EVE Frontier's dApp Kit is React-oriented, so React reduces integration risk.

Vite provides a static asset shell suitable for in-game browser usage.

Node 24 LTS is preferred over newer current releases for stability.

## Rejected

### Next.js

Rejected because SSR/server components add complexity and do not help the in-game dApp surface.

### Vanilla TypeScript / Web Components

Rejected for v0.1 because lower bundle size is outweighed by EVE React SDK integration cost.

### Svelte/Vue/Solid

Rejected for v0.1 because official EVE/Sui dApp tooling is React-first.

### Node Current

Rejected because stability matters more than newest runtime features.

## Consequence

The framework is standard, but the architecture must be custom.
