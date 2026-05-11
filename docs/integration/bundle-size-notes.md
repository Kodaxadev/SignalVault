# Bundle Size Notes — EVE Frontier Integration

## Phase Baseline

| Phase | Description | Main Chunk (KB) | Lazy Chunk (KB) | Total (KB) |
|-------|-------------|----------------:|----------------:|-----------:|
| 06 | Local-first persistence (Dexie) | 355 | — | 355 |
| 07A | dApp Kit install + provider boundary (root) | 406 | — | 406 |
| 07B | Smart Object context adapter (root) | 795 | — | 795 |
| 07B.1 | Route-level code splitting | 374 | 421 (InGameRoute) | 795 |
| 07C | Wallet connection adapter | 374 | 423 (InGameRoute) | 797 |
| 07D | Character resolution boundary | 375 | 425 (InGameRoute) | 800 |
| 08A | In-game UX hardening | 375 | 428 (InGameRoute) | 803 |

## Phase 07B.1 Improvement

After moving `EveFrontierProviderBoundary` to the `/ingame/*` route tree:

- **Main chunk** (`index-*.js`): 374 KB — no dApp Kit code
- **InGameRoute chunk** (`InGameRoute-*.js`): 421 KB — contains all dApp Kit

The `/app` and `/compat` routes load only the 374KB main chunk.
The `/ingame/object` route lazy-loads the additional 421KB chunk.

## Phase 07B Analysis

The 421KB InGameRoute chunk contains:
- **@evefrontier/dapp-kit** and its transitive dependencies (GraphQL client, notification system, vault SDK)
- **EveFrontierProvider** nests multiple providers internally (QueryClientProvider, DAppKitProvider, VaultProvider, SmartObjectProvider, NotificationProvider)
- The adapter layer itself (extractors, claim mapper, resolution source) is negligible (~2KB)

## Observations

- `skipLibCheck` does not apply to `.ts` files in `node_modules` — @evefrontier/dapp-kit ships raw TypeScript
- Containment strategy: `paths` mapping in tsconfig.json redirects `@evefrontier/dapp-kit` to a local stub for type-checking
- Vite resolves the real package at runtime; the stub is only used by `tsc --noEmit`
- `tsc -b` (build mode) caused path resolution issues on Windows/Git Bash — switched to `tsc --noEmit`

## Chunk Verification

Verified via build output:
- Main chunk (`index-*.js`): 0 references to `evefrontier`
- InGameRoute chunk (`InGameRoute-*.js`): contains `evefrontier` code
- /app and /compat routes do not trigger download of InGameRoute chunk
- /ingame/object triggers lazy download of InGameRoute chunk on navigation
