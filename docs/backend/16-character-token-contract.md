# Phase 09J — Character Token Contract

## Status

**JWT path: BLOCKED — pending trusted issuer**  
**Sui PlayerProfile path: ACTIVE — implemented in Phase 09L.1 / hardened in Phase 09L.2 / dev-validated 2026-05-11**

No production-grade CCP-issued character JWT is available for EVE Frontier. However, character identity is now resolvable server-side via on-chain Sui GraphQL lookup (wallet → PlayerProfile → Character). The JWT contract below describes the requirements for the `trusted_character_jwt` path, which remains unavailable. The `sui_player_profile` path is the active production identity mechanism.

---

## Problem

Signal Vault's remote push path requires the server to trust that a request came from a specific EVE Frontier character. Wallet signature verification (Phase 09I) establishes wallet ownership. It does not establish character identity.

The server has no way to confirm that the wallet address maps to a specific character, tribe, or in-game identity without a trusted issuer.

---

## Current Dev Path

`VITE_REMOTE_DEV_CHARACTER_JWT` is a developer-supplied JWT that the client includes as the `Authorization: Bearer` header. The server verifies it in dev mode (`AUTH_DEV_MODE=true`) by decoding without signature verification.

This is intentional scaffolding. It lets the full auth pipeline run (wallet + JWT) during development. It must never be treated as a production auth path.

---

## Required Claims

A production character token must carry the following claims:

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | string | EVE Frontier character ID — authoritative server identity |
| `iss` | string | Token issuer URL — must match server-configured allowlist |
| `aud` | string | Intended audience — must match server's expected audience |
| `exp` | number | Expiry timestamp (Unix seconds) — server rejects expired tokens |
| `iat` | number | Issued-at timestamp |
| `tribe_id` | string (optional) | EVE Frontier tribe membership — issuer-supplied, not client-asserted |

The server never trusts client-supplied character identity. `sub` and `tribe_id` must come from the verified JWT payload only.

---

## Trust Anchor

The character token issuer must be an EVE Frontier authority capable of:

1. Authenticating a player's game account
2. Binding that account to a specific wallet address (or providing wallet attestation)
3. Issuing a signed JWT with the above claims
4. Exposing a JWKS endpoint or shared secret for server-side verification

The server verifies the token signature before trusting any claim. No claim is trusted from an unverified token.

---

## Verification Requirements

The server must:

- Reject tokens with invalid or missing `sub`
- Reject tokens past their `exp`
- Reject tokens from issuers not on the server allowlist (`JWT_ISSUER` env)
- Reject tokens with incorrect `aud`
- Fail closed when no JWKS endpoint or secret is configured (`AUTH_DEV_MODE=false`)

The server must NOT:

- Trust `tribe_id` or `sub` from the request body or headers — only from verified JWT payload
- Accept dev-mode tokens in production (`AUTH_DEV_MODE` must be `false` in production)

---

## Infrastructure Audit Finding (Phase 09L.0 — 2026-05-11)

A live audit of the EVE Frontier API surface confirmed two independent blockers, not one:

**Blocker 1 — No trusted JWT issuer (this document)**  
No JWKS endpoint or shared secret has been published by CCP for character token verification. The FusionAuth + zkLogin token issuance path is not externally callable.

**Blocker 2 — Blockchain gateway unreachable externally**  
The wallet-to-character lookup endpoint (`GET /v2/smartcharacters/{address}`) does not exist on the public World API (`world-api-stillness.live.tech.evefrontier.com` returns 404). It exists only on the blockchain gateway (`blockchain-gateway-stillness.live.tech.evefrontier.com`), which is firewalled — all external connection attempts return exit code 6 (no route).

Either blocker alone would prevent production character resolution. Both are real and independent.

See [docs/backend/19-world-api-character-resolution-audit.md](19-world-api-character-resolution-audit.md) for the full audit.

### Unblock Paths

**Path A — Request CCP open the blockchain gateway**  
`GET /v2/smartcharacters/{address}` is public (no auth per the Insomnia collection). If CCP exposed this endpoint on a publicly reachable host, character identity lookup would be available without a JWT.

**Path B — Sui GraphQL on-chain lookup (IMPLEMENTED)**  
Characters exist as `PlayerProfile` Move objects on the public Sui testnet (`4c78adac`). A two-hop Sui GraphQL query resolves `wallet address → PlayerProfile → Character → item_id / tribe_id`. This path is live and wired in Phase 09L.1. The production Sui GraphQL endpoint (`https://graphql.testnet.sui.io/graphql`) requires no authentication. See [docs/backend/18-production-identity-mode.md](18-production-identity-mode.md) and [docs/integration/sui-character-resolution-research.md](../integration/sui-character-resolution-research.md).

---

## Open Questions

| Question | Status |
|----------|--------|
| Will EVE Frontier provide a JWKS endpoint for character JWTs? | Unknown |
| Will the JWT include `tribe_id` directly, or require a separate lookup? | Unknown |
| Is wallet address binding included in the JWT, or handled separately? | Unknown |
| What is the token lifetime? | Unknown |
| Is refresh supported, or is re-issuance required per session? | Unknown |
| Will the blockchain gateway be publicly accessible to dApps? | Unknown — see [blockchain-gateway-access-questions.md](../integration/blockchain-gateway-access-questions.md) |
| Is the Stillness Sui GraphQL endpoint publicly available? | **Resolved** — `https://graphql.testnet.sui.io/graphql` is public, no auth required |

The JWT-related questions above must be resolved before the `trusted_character_jwt` path can be implemented. The `sui_player_profile` path does not require them.

---

## Hard Invariants

1. No background or automatic sync. This invariant is unconditional — it applies regardless of which identity path is active.
2. The server never trusts character identity from the request body or headers — only from a verified JWT or verified Sui on-chain resolution.
3. `AUTH_DEV_MODE=true` must never be set in production.
4. `VITE_REMOTE_DEV_CHARACTER_JWT` is local scaffolding only — it is not a production auth mechanism.
5. `tribe_id` used for tribe-scoped visibility must come from a verified source only: the Sui-resolved `Character.tribe_id` (primary production path) or a verified JWT payload. Never from the client.
6. Dev JWT fallback is blocked when `ENABLE_SUI_CHARACTER_RESOLUTION=true` and `AUTH_DEV_MODE=false`. A JWT/Bearer header in this mode returns `auth_mode_conflict` and is rejected.
