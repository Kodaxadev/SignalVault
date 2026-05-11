# EVE dApp Kit Compatibility Audit

## Date
2026-05-10

## Package Versions

| Package | Version |
|---|---|
| `@evefrontier/dapp-kit` | 0.1.9 |
| `react` | 19.2.6 |
| `react-dom` | 19.2.6 |
| `@tanstack/react-query` | 5.100.9 |
| `@mysten/dapp-kit-react` | 2.0.3 |
| `@mysten/sui` | 2.16.2 |
| `@mysten/dapp-kit-core` | 1.3.2 |
| `@mysten/wallet-standard` | 0.20.3 |

## React Version Analysis

### Before alignment
- App used React 18.3.1
- `@evefrontier/dapp-kit@0.1.9` brought React 19.2.6 as a direct dependency
- Result: **dual React copies** (18 + 19)

### After alignment
- Upgraded app to React 19.2.0 (^19.2.0 range resolves to 19.2.6)
- All packages resolve to **single React 19.2.6 copy**
- Confirmed via `pnpm why react`: Found 1 version of react

### Dependency tree (pnpm why react summary)
```
react@19.2.6
├─┬ @evefrontier/dapp-kit@0.1.9
├─┬ @mysten/dapp-kit-react@2.0.3
├─┬ @nanostores/react@1.1.0
├─┬ @tanstack/react-query@5.100.9
├─┬ @testing-library/react@16.3.2
├─┬ react-dom@19.2.6
├── react-router@7.15.0
├── react-router-dom@7.15.0
└── web@0.0.0 (dependencies)

Found 1 version of react
```

## Decision
**Upgrade to React 19.** The official dApp Kit docs explicitly warn to keep React, @mysten/dapp-kit-react, and @mysten/sui versions in sync. Keeping React 18 alongside dApp Kit's React 19 would risk hook context mismatches and provider failures.

## Single React Copy Confirmed
Yes. `pnpm why react` shows exactly one version: 19.2.6.

## TypeScript Note

`@evefrontier/dapp-kit@0.1.9` ships raw `.ts` source files (not compiled `.js` + `.d.ts`). TypeScript follows these files and applies our project's `strict: true` settings, which the package's internal code does not satisfy.

Workaround: the smoke test file (`dappKitSmoke.test.ts`) is excluded from `tsc` via `tsconfig.json` `exclude`. Vite handles the runtime import correctly since it bundles rather than type-checks.

The `tsconfig.json` exclusion:
```json
"exclude": ["node_modules", "src/features/frontier/dappKit/dappKitSmoke.test.ts"]
```

This is safe because:
- The test is validated by vitest (Vite bundler, not tsc)
- No production code imports from `@evefrontier/dapp-kit` directly in Phase 07A
- The `EveFrontierProviderBoundary` component is a passthrough with no dApp Kit imports

## Breaking Changes from React 18→19
- All 169 tests pass (168 existing + 1 smoke test)
- TypeScript typecheck passes
- Build passes
- No runtime errors observed

## Stub Usage Risk

Current tests and type-checking use a stub (`src/lib/evefrontier-stub.ts`) for `@evefrontier/dapp-kit`.

**How it works:**
- `tsconfig.json` `paths` mapping redirects `@evefrontier/dapp-kit` imports to the stub for `tsc --noEmit`
- `vitest.config.ts` `alias` redirects `@evefrontier/dapp-kit` imports to the stub for tests
- Production builds (`vite build`) do NOT use the stub — Vite resolves the real package from `node_modules`

**What this means:**
- Type-checking and tests validate against the stub's API shape (which mirrors the real package's exports)
- Runtime behavior depends entirely on the real package's actual implementation
- After every `@evefrontier/dapp-kit` upgrade, the production build must be separately tested

**Why the stub exists:**
`@evefrontier/dapp-kit@0.1.9` ships raw `.ts` source files (not compiled `.js` + `.d.ts`). TypeScript follows these imports and applies our project's `strict: true` settings, which the package's internal code does not satisfy. The stub is a type-containment measure, not a functional replacement.

**Verification step:**
After every dApp Kit version upgrade, run `pnpm build` and manually test the production output to confirm the real package behaves correctly.
