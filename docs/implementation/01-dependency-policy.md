# Dependency Policy

## Principle

Dependencies are chosen for EVE Frontier compatibility, not trendiness.

## Compatibility Anchor

`@evefrontier/dapp-kit` is the anchor dependency.

Before pinning final versions, run:

```bash
pnpm info @evefrontier/dapp-kit peerDependencies
pnpm info @evefrontier/dapp-kit dependencies
```

Then align React, Mysten/Sui, and TanStack Query versions accordingly.

## Recommended Baseline

- Node 24 LTS
- pnpm
- Vite
- React
- React Router Data Mode
- TypeScript
- Tailwind
- @evefrontier/dapp-kit
- TanStack Query
- Zustand
- Zod
- Dexie
- Supabase JS or thin API client
- Vitest
- Testing Library

## Avoid in v0.1

- graph rendering libraries
- rich block editors
- heavy map rendering
- Next.js
- direct game client injection
- unnecessary animation libraries
- redundant Mysten dApp packages outside EVE kit peer ranges
