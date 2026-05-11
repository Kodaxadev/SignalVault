# Phase 09L.1 / 09L.2 — Production Identity Mode

**Status:** ACTIVE — `sui_player_profile` mode proven, wired, and production-hardened  
**Date:** 2026-05-11

---

## Identity Mode Enum

```typescript
type ProductionIdentityMode =
  | 'none'                  // No identity available
  | 'dev_character_jwt'     // Dev-supplied JWT, no sig verification (AUTH_DEV_MODE only)
  | 'sui_player_profile'    // On-chain resolution via Sui GraphQL (active production path)
  | 'trusted_character_jwt' // CCP-issued JWT with JWKS verification (not yet available)
```

Current active mode: **`sui_player_profile`**

---

## Sui PlayerProfile Resolution (Active Path)

Enabled by `ENABLE_SUI_CHARACTER_RESOLUTION=true`.

### Resolution Flow

```
1. Client signs server challenge with Sui wallet (SIWS)
2. Server verifies wallet signature → authoritative wallet address
3. Server queries Sui testnet GraphQL for wallet-owned objects
4. Server finds PlayerProfile (type: <PKG>::character::PlayerProfile)
5. Server reads PlayerProfile.character_id → Sui object address of Character
6. Server queries Character shared object at that address
7. Server verifies Character.character_address === verified wallet address
8. Server extracts:
     characterId = Character.key.item_id     (EVE numeric character ID)
     characterName = Character.metadata.name  (display name)
     tribeId = Character.tribe_id             (numeric tribe ID)
9. Server evaluates tribe policy against tribeId
10. Server writes Signal + audit log entry
```

### Critical Schema Notes

| Field | Source | Type | Notes |
|-------|--------|------|-------|
| `PlayerProfile.character_id` | Sui object address | string | Points to Character object — NOT the EVE numeric ID |
| `Character.key.item_id` | EVE character ID | string | The numeric EVE character identifier |
| `Character.metadata.name` | Display name | string | Character display name |
| `Character.tribe_id` | Tribe membership | number | Numeric EVE tribe ID |
| `Character.character_address` | Wallet binding | string | Must match verified wallet |
| `Character.key.tenant` | Environment | string | `"stillness"` or `"utopia"` |

### Package ID Discovery

The `WORLD_PACKAGE_ID` is **not hardcoded**. It is extracted dynamically from the `PlayerProfile` type repr:

```
type repr: "0x28b4...::character::PlayerProfile"
                ^ split on "::" → package ID
```

This makes the resolver robust to future package upgrades.

### Confirmed Sui Infrastructure

| Component | Value |
|-----------|-------|
| Chain | Sui testnet (`4c78adac`) |
| GraphQL endpoint | `https://graphql.testnet.sui.io/graphql` |
| Auth required | None — fully public |
| Live package ID (Stillness, 2026-05-11) | `0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c` |

---

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `ENABLE_SUI_CHARACTER_RESOLUTION` | Yes (set to `true`) | Activates Sui identity path |
| `SUI_GRAPHQL_URL` | No | Defaults to `https://graphql.testnet.sui.io/graphql`. Must be set explicitly for any non-Stillness environment. |
| `AUTH_DEV_MODE` | Must be `false` in production | When `false` + Sui enabled: dev JWT fallback is blocked. When `true` + Sui enabled: Sui wins on success, JWT fallback on Sui failure. |

---

## What Remains Unchanged

| Property | Value | Reason |
|----------|-------|--------|
| `isProductionCharacterTokenAvailable()` | `false` | The CCP-issued JWT path is still blocked |
| `CHARACTER_TOKEN_CONTRACT_STATUS` | `'blocked_pending_trusted_issuer'` | JWT issuer still unavailable |
| No background sync | — | Hard invariant unchanged |
| No remote pull | — | Not implemented |

The JWT token path is a separate mechanism from the Sui resolution path. Both can independently contribute to `character_resolved` context — but only the Sui path is available today.

---

## Production Guard (Phase 09L.2)

When `ENABLE_SUI_CHARACTER_RESOLUTION=true` and `AUTH_DEV_MODE=false`, the server enforces hard identity source separation:

| Condition | Result |
|-----------|--------|
| JWT/Bearer header present | `auth_mode_conflict` → 401. Rejected before Sui is called. Surfaces misconfiguration immediately. |
| Sui resolution succeeds | `character_resolved` (identitySource: `sui_player_profile`) |
| Sui resolution fails | `identity_resolution_failed` → 401. No JWT fallback. |

The `identitySource` field on `ServerViewerContext.character_resolved` records how identity was derived. It is propagated through `VerifiedAuth` so policy and audit layers can see the source.

### Request Headers in Production Sui Mode

**Do not send `Authorization: Bearer` in production Sui mode.** The server rejects any request that includes a Bearer token header, returning `401 auth_mode_conflict` before Sui resolution is attempted. This is a hard guard — not a soft warning.

Correct headers for production Sui mode:

```
X-Wallet-Signature: <walletSignature>
X-Challenge-Id: <challengeId>
X-Wallet-Address: <walletAddress>
```

The `Authorization` header must be **absent**. Wallet signature headers alone are sufficient to resolve identity through Sui PlayerProfile lookup.

## Fallback Behavior (Dev Mode)

When `ENABLE_SUI_CHARACTER_RESOLUTION=true` and `AUTH_DEV_MODE=true`, the server allows a JWT fallback after Sui failure:

| Condition | Result |
|-----------|--------|
| Sui resolution succeeds | `character_resolved` (identitySource: `sui_player_profile`) |
| Sui resolution fails, JWT present and valid | `character_resolved` (identitySource: `dev_character_jwt`) + `console.warn` |
| Sui resolution fails, no JWT | `wallet_verified` → write blocked |

This ensures `AUTH_DEV_MODE=true` + dev JWT still works for internal testing when `ENABLE_SUI_CHARACTER_RESOLUTION=true`.

When `ENABLE_SUI_CHARACTER_RESOLUTION=false`, the server uses only the JWT path (dev auth) and `identitySource` is `dev_character_jwt`.

---

## Files

| File | Purpose |
|------|---------|
| `apps/api/src/character/suiCharacterTypes.ts` | Types: `SuiPlayerProfile`, `SuiCharacter`, `ProductionIdentityMode`, `SuiCharacterResolutionResult` |
| `apps/api/src/character/suiEnv.ts` | Env: `SUI_GRAPHQL_URL`, `ENABLE_SUI_CHARACTER_RESOLUTION` |
| `apps/api/src/character/suiGraphqlClient.ts` | HTTP wrapper for Sui GraphQL POST |
| `apps/api/src/character/suiCharacterExtractors.ts` | Pure extraction functions (testable, no I/O) |
| `apps/api/src/character/resolveCharacterFromSui.ts` | Two-hop resolver |
| `apps/api/src/auth/authEnv.ts` | Env: `AUTH_DEV_MODE` (mockable for tests) |
| `apps/api/src/auth/authTypes.ts` | `ServerIdentitySource` type; `auth_mode_conflict` / `identity_resolution_failed` in `AuthFailureReason`; `identitySource` on `VerifiedAuth` |
| `apps/api/src/auth/resolveServerViewerContext.ts` | Wired: production guard, Sui path, JWT fallback |
| `apps/api/src/auth/verifyAuth.ts` | Maps new context kinds to `AuthResult`; propagates `identitySource` |
| `apps/api/src/auth/characterTokenContract.ts` | `ProductionIdentityMode`, `isSuiPlayerProfileResolutionAvailable()`, `getProductionIdentityMode()` |
| `apps/api/src/health/healthHandler.ts` | Reports `identity` block: mode, suiEnabled, suiGraphqlUrl, authDevMode |
| `apps/api/__tests__/resolveServerViewerContextProd.test.ts` | Production mode guard tests (mocks authEnv, suiEnv, verifyWalletSignature) |
| `scripts/lookup-player-profile.mjs` | Reference implementation / probe tool |
| `docs/integration/sui-character-resolution-research.md` | Full research audit with confirmed schema |
