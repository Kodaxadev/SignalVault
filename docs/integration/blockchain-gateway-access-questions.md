# Phase 10C — Blockchain Gateway Access Questions

**Date:** 2026-05-11  
**Status:** RESEARCH — questions to ask CCP / EVE Frontier developer relations  
**Prerequisite for:** Production character identity (Path A unblock)

---

## Background

The EVE Frontier blockchain gateway (`blockchain-gateway-stillness.live.tech.evefrontier.com`) hosts the endpoints Signal Vault needs for production character resolution:

- `GET /v2/smartcharacters/{address}` — resolves a wallet address to an EVE character (character ID, tribe ID, name)
- `GET /v2/smartcharacters` — paginated list of all registered characters
- `GET /abis/config` — World Package ABIs and contract addresses

The World API (`world-api-stillness.live.tech.evefrontier.com`) does not expose these endpoints (confirmed 404).

All external connection attempts to the blockchain gateway return exit code 6 (no route / connection refused). The gateway appears to be firewalled for CCP-internal use only.

Per the Insomnia community API collection, `GET /v2/smartcharacters/{address}` requires **no authentication**. The data is effectively public — it is just not publicly reachable.

---

## Questions for CCP / EVE Frontier Developer Relations

### Accessibility

**Q1.** Will the blockchain gateway be publicly accessible to dApp developers and external services? If so, on what timeline?

**Q2.** Is there a planned CDN or proxy that will expose `/v2/smartcharacters/{address}` on a publicly reachable host? (For example, forwarded through the World API or a separate developer API endpoint.)

**Q3.** Is there a developer allowlist or API key program that would grant external access to the blockchain gateway during the Stillness phase?

### Authentication and Rate Limits

**Q4.** The Insomnia collection shows `GET /v2/smartcharacters/{address}` with no auth header. Is this accurate — is the endpoint unauthenticated for public reads?

**Q5.** If public access is opened, what rate limits apply? (requests per second, requests per IP, burst limits)

**Q6.** Are there IP allowlist or origin requirements? Would Signal Vault need to register a specific server IP or domain?

### Response Schema

**Q7.** What fields does `GET /v2/smartcharacters/{address}` return? Specifically:
- Does the response include `characterId` (the numeric EVE in-game character ID)?
- Does the response include `tribeId` (the character's current tribe membership)?
- Does the response include the character's display name?
- Is tribe membership stored in this endpoint's response, or is a separate call needed?

**Q8.** What does the endpoint return for a wallet address that has not yet registered a character? (404? Empty object? Error code?)

**Q9.** Is the response available in POD format via `?format=pod`? (This would allow cryptographic attestation of the response, which is valuable for trustless character verification.)

### Stability and Versioning

**Q10.** Will the `/v2/smartcharacters/{address}` schema be stable for the duration of the Stillness phase? Is there a changelog or versioning commitment?

**Q11.** Is this endpoint also available on a public Utopia (testnet/devnet) environment for development and testing?

### Alternative: On-Chain Resolution

**Q12.** Is character identity (wallet address → character ID → tribe ID) fully represented in on-chain Move objects on the Stillness Sui chain? If so:
- Is there a public Sui GraphQL endpoint for the Stillness chain?
- What is the `WORLD_PACKAGE_ID` for the EVE Frontier World Package?
- Is the Move package source published or available to dApp developers?

---

## What Signal Vault Needs

At minimum, Signal Vault needs a reliable way to answer:

> "Given a wallet address, what is the EVE character ID and tribe ID of the character bound to that wallet?"

This is needed server-side on every remote push to:
1. Attribute the signal to the correct character (audit log, ownership)
2. Validate tribe-scoped signal visibility against the character's actual tribe membership

Without this, all character identity claims in Signal Vault remain unverifiable, and tribe-scoped remote writes cannot be enabled in production.

---

## Where to Ask

- **EVE Frontier developer Discord:** Primary channel for dApp developer questions
- **EVE Frontier developer documentation / forums:** If CCP publishes a developer portal for Stillness
- **Atlas / community resources:** `atlas.kodaxa.dev` — community-maintained API reference; may have updated schema or contact guidance

---

## Current Workarounds

While gateway access is blocked:

- Dev-auth path (`VITE_REMOTE_DEV_CHARACTER_JWT`) remains the only functioning character token path
- Remote push stays manual, dev-auth, and alpha-labeled
- `isProductionCharacterTokenAvailable()` returns `false` — the codebase correctly reflects the blocked state
- No background sync or tribe-scoped production writes are enabled

This is the correct state. Signal Vault does not fake production character identity.
