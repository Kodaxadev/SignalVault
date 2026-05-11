# Character Resolution Audit

## Date
2026-05-10

## Phase
07D (Character Resolution Boundary) — Approved, not yet wired to real APIs

## What This Phase Covers

Phase 07D creates the full adapter boundary for upgrading a `wallet_connected` viewer into `character_resolved`. It defines types, defensive extractors, a pure resolver function, and a manual trigger (button) — all tested with mock/stub data.

**Phase 07D.1** will wire the real EVE dApp Kit character/profile queries once the API stabilizes.

## Known Data Sources

### 1. `useSmartObject()` — Assembly Owner (NOT the viewer)

From `@evefrontier/dapp-kit`:
```ts
interface SmartObjectContextValue {
  tenant: string;
  assembly: Record<string, unknown> | null;
  assemblyOwner: unknown;  // Identifies the assembly owner, NOT the connected player
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

**Critical rule**: `assemblyOwner` must NOT be treated as the viewer's character unless the wallet address can be extracted from it AND matches the connected wallet. This is labeled as `source: 'assembly_owner_candidate'` in the snapshot type.

### 2. `useConnection()` — Wallet Connection State

From `@mysten/dapp-kit` (via dApp Kit wrapper):
```ts
interface Connection {
  isConnected: boolean;
  account?: string;
  // Other fields TBD
}
```

Used to check if wallet is connected before attempting character resolution.

### 3. SUI Wallet Standard — Character/Profile Resolution (TBD)

From `@mysten/dapp-kit` / `@mysten/wallet-standard`:
- Wallet standard provides account/address access
- Character/profile query shape is **not yet stable or well-documented**
- Exact hooks, return types, and query patterns will be determined in 07D.1

## Failure Cases

| Case | Snapshot Status | Reason |
|------|----------------|--------|
| Wallet not connected | `unavailable` | `wallet_not_connected` |
| Profile query returns nothing | `unavailable` | `profile_not_found` |
| Character not found in profile | `unavailable` | `character_not_found` |
| Real resolver API not yet implemented | `unavailable` | `resolver_unavailable` |
| dApp Kit provider missing | `unavailable` | `provider_missing` |
| Unknown error | `unavailable` | `unknown` |

## Resolution Flow (Planned for 07D.1)

```
wallet_connected viewer
  ↓
useConnection() → connected?
  ↓ yes
Attempt character/profile query
  ↓
Profile found + character data extracted?
  ↓ yes
FrontierCharacterSnapshot { status: 'resolved', source: 'wallet_profile', ... }
  ↓
resolveFrontierCharacter(viewer, snapshot)
  ↓
character_resolved ViewerContext
```

### Fallback: Assembly Owner Candidate

If wallet profile is unavailable but `assemblyOwner` data exists:
1. Extract wallet address from `assemblyOwner`
2. Compare with `viewer.walletAddress`
3. If match → `source: 'assembly_owner_candidate'` → resolve
4. If no match → leave viewer unchanged

## What This Phase Does NOT Cover

- Tribe vault features, officer/scout roles
- Backend auth, Supabase, sponsored transactions
- Signal persistence/auth changes
- Remote Signal sync
- Role inference (always `roles: []`)

## Wire Plan (07D.1)

Once the real dApp Kit character/profile API stabilizes:
1. Update `useFrontierCharacterAdapter.ts` to use real query hooks
2. Update `frontierCharacterExtractors.ts` with actual field paths
3. Remove `resolver_unavailable` fallback when real resolver is available
4. Test against real EVE Frontier environment

## Key Constraints

- `assemblyOwner` is NOT the viewer's character unless wallet match is proven
- `roles: []` always — no officer/scout inference
- `resolveFrontierCharacter` is a pure function — no React/dApp Kit imports
- `viewer/index.ts` must NOT re-export `FrontierCharacterSnapshot`
- Manual trigger (button), not auto-effect loop
