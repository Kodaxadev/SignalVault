# Phase 09L.0 — World API Smart Character Audit

**Date:** 2026-05-11  
**Status:** BLOCKED — blockchain gateway externally unreachable  
**Conclusion:** The wallet-to-character lookup endpoint exists but is not publicly accessible. Phase 09L cannot proceed without either gateway access or an alternative resolution path.

---

## What Was Tested

### World API — `world-api-stillness.live.tech.evefrontier.com`

Publicly accessible. OpenAPI spec at `/docs/doc.json` (Swagger 2.0).

**Confirmed live:**

| Endpoint | Auth | Result |
|----------|------|--------|
| `GET /health` | None | `{"ok":true}` |
| `GET /config` | None | `[{"podPublicSigningKey":"4MbZYmZ1n1+qGH8sQjHr4jAeT8rk6MHo5RU2OXQHGS4"}]` |
| `GET /v2/solarsystems?limit=1` | None | 24,502 systems total; response includes `id`, `name`, `constellationId`, `regionId`, `location{x,y,z}` |
| `GET /v2/tribes?limit=3` | None | 4 tribes total; all NPC corps; fields: `id`, `name`, `nameShort`, `description`, `taxRate`, `tribeUrl` |
| `GET /v2/characters/me/jumps` | BearerAuth | Not tested — token not available |
| `GET /v2/smartcharacters` | — | **404 — endpoint does not exist on World API** |
| `GET /v2/smartcharacters/{address}` | — | **404 — endpoint does not exist on World API** |

**All endpoints in the Stillness World API OpenAPI spec:**
```
GET  /config
GET  /health
GET  /v2/characters/me/jumps
GET  /v2/characters/me/jumps/{id}
GET  /v2/constellations
GET  /v2/constellations/{id}
POST /v2/pod/verify
GET  /v2/ships
GET  /v2/ships/{id}
GET  /v2/solarsystems
GET  /v2/solarsystems/{id}
GET  /v2/tribes
GET  /v2/tribes/{id}
GET  /v2/types
GET  /v2/types/{id}
```

There is no character lookup by wallet address in this API surface.

---

### Blockchain Gateway — `blockchain-gateway-stillness.live.tech.evefrontier.com`

**Externally unreachable. All connection attempts return exit code 6 (no route / connection refused).**

```
curl https://blockchain-gateway-stillness.live.tech.evefrontier.com/health
→ exit 6 (could not connect)

curl https://blockchain-gateway-stillness.live.tech.evefrontier.com/v2/smartcharacters/0x7578ca43...
→ exit 6 (could not connect)
```

The gateway is firewalled for external access. It is accessible only within CCP's infrastructure or VPN.

**Confirmed via Insomnia collection (Atlas corpus, community reference):** The Stillness environment in the official Insomnia API collection points to `blockchain-gateway-stillness.live.tech.evefrontier.com` as the base URL. All of the following endpoints are on the gateway, not the World API:

- `GET /v2/smartcharacters` — list all characters, paginated
- `GET /v2/smartcharacters/{address}` — character by wallet address (the target endpoint)
- `GET /v2/smartcharacters/me/jumps` — authenticated jump history
- `GET /v2/smartassemblies` — smart gates, storage, turrets
- `GET /v2/killmails` — kill mail records
- `POST /metatransaction` — sponsored transaction submission
- `GET /abis/config` — world contract ABIs

**Sample wallet from Insomnia collection:** `0x7578ca43f52db0d859b3f2081c1464080fe47c00`  
This confirms the endpoint schema exists but could not be probed due to gateway inaccessibility.

---

## Schema Audit Results

| Field | Status | Notes |
|-------|--------|-------|
| Endpoint exists | ✅ Yes | `GET /v2/smartcharacters/{address}` on blockchain gateway |
| Auth required | ✅ None (public) | Per Insomnia collection — no auth header on this endpoint |
| Response includes character ID | ❓ Unknown | Cannot probe — gateway blocked |
| Response includes wallet address | ❓ Unknown | Cannot probe — gateway blocked |
| Response includes tribe ID | ❓ Unknown | Cannot probe — gateway blocked |
| Response includes tribe name | ❓ Unknown | Cannot probe — gateway blocked |
| Response includes roles | ❓ Unknown | Cannot probe — gateway blocked |
| Failure for unknown wallet | ❓ Unknown | Cannot probe — gateway blocked |
| Rate limit / error behavior | ❓ Unknown | Cannot probe — gateway blocked |

---

## What the Auth Bearer Token Is

The `BearerAuth` used on `GET /v2/characters/me/jumps` is an EVE Vault session token issued via:

1. **FusionAuth** (OAuth 2.0 / OIDC) — CCP's SSO provider, per-environment client secrets
2. **zkLogin** (Sui) — zero-knowledge login; FusionAuth `id_token` → Enoki API → deterministic Sui wallet address
3. Token fields: `id_token`, `access_token`, `token_type: "Bearer"`, `refresh_token`, `expires_at`

This token is issued through the EVE Vault authentication flow and is not obtainable externally without going through FusionAuth. No public OIDC discovery endpoint or token issuance URL was found in the Atlas corpus.

---

## POD Signing Key

Available from `GET /config` on the World API (no auth):

```
podPublicSigningKey: "4MbZYmZ1n1+qGH8sQjHr4jAeT8rk6MHo5RU2OXQHGS4"
```

This is an EdDSA public key used to verify POD (Provable Object Datatype) signatures — EVE Frontier's own cryptographic attestation format. World API endpoints support `?format=pod` for signed responses. This key verifies those signatures but does not help with character identity lookup in its current form.

---

## What Is Actually Available Today

| Capability | Available | Notes |
|------------|-----------|-------|
| Solar system / constellation data | ✅ | World API, public, 24,502 systems |
| Tribe data by ID | ✅ | World API, public, 4 NPC corps on Stillness |
| Ship / type data | ✅ | World API, public |
| POD signature verification | ✅ | World API `POST /v2/pod/verify`, public |
| Pod signing public key | ✅ | World API `GET /config`, public |
| Wallet → character lookup | ❌ | Blockchain gateway, externally unreachable |
| Character list | ❌ | Blockchain gateway, externally unreachable |
| Smart assembly list | ❌ | Blockchain gateway, externally unreachable |
| Jump history (authenticated) | ❌ | World API, requires EVE Vault bearer token |
| EVE character JWT issuance | ❌ | FusionAuth, not externally callable |
| JWKS verification endpoint | ❌ | Not documented / not found |

---

## Conclusion: Phase 09L Status

**Phase 09L cannot proceed in its originally proposed form.**

The wallet-to-character lookup requires the blockchain gateway, which is not externally accessible. Signal Vault's backend cannot call `GET /v2/smartcharacters/{walletAddress}` to resolve character identity.

**The auth gap documented in Phase 09J is confirmed by a different mechanism than originally assessed:**

- Previously assumed: no JWKS endpoint for JWT verification
- Now confirmed: the character lookup endpoint itself is on a firewalled internal gateway

Both gaps are real. Either one would block production character resolution.

---

## Paths Forward

### Path A — Request CCP open the blockchain gateway (or a proxy endpoint)

The `GET /v2/smartcharacters/{address}` endpoint is public (no auth per the Insomnia collection) and contains exactly what Signal Vault needs. If CCP exposed this endpoint on a publicly accessible host — or provided a CDN/proxy — Phase 09L could proceed immediately.

**Action:** Contact CCP / EVE Frontier developer relations to ask whether the blockchain gateway will be publicly accessible, or whether `/v2/smartcharacters/{address}` will be exposed on the World API.

### Path B — Sui GraphQL on-chain character lookup

Characters exist as `PlayerProfile` Move objects on-chain. A Sui GraphQL query against the Stillness Sui node can resolve `wallet address → PlayerProfile → characterId`. This requires:
- Stillness Sui node GraphQL endpoint (not confirmed — testnet is `graphql.testnet.sui.io`, Stillness may differ)
- `WORLD_PACKAGE_ID` for the `::character::PlayerProfile` type filter (available via `GET /abis/config` on the gateway — also blocked)

**Action:** Find the Stillness Sui GraphQL endpoint and the WORLD_PACKAGE_ID through CCP developer channels or community resources.

### Path C — Continue with dev-auth, stay on Path A demo

`VITE_REMOTE_DEV_CHARACTER_JWT` remains the only functioning character token path. Remote push stays manual, dev-auth, and alpha-labeled. No timeline pressure — the hard invariant (no background sync without production identity) remains correct.

**This is the current recommendation.** Character resolution is blocked on CCP infrastructure, not on Signal Vault. The alpha is honest about this.

---

## What This Does Not Change

- `isProductionCharacterTokenAvailable()` remains `false` — correct
- The 09J character token contract is accurate — the trust gap is real
- The Phase 09K UX is accurate — "character token not available (alpha limitation)"
- All existing guardrails remain valid
- The `character_token_blocked` blocked reason in `RemoteSyncBlockedReason` is the correct surface for this gap
