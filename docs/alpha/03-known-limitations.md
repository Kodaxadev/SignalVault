# Signal Vault — Known Limitations (Alpha)

**Status as of:** 2026-05-11 (Phase 10C.4)

This document describes what Signal Vault cannot do in alpha, why, and whether there is a known path to resolution.

---

## Auth & Identity

### 1. CCP-issued character token (`trusted_character_jwt`) unavailable

**What it means:** Signal Vault cannot obtain a character JWT from a CCP-trusted issuer. No JWKS endpoint or shared secret has been published by CCP.

**Impact (JWT path):**
- Character identity bound to a CCP-authenticated game account is not verifiable
- The `trusted_character_jwt` identity mode is blocked

**Mitigated by Sui PlayerProfile resolution (Phase 09L.1):**  
Character identity is now resolvable server-side via on-chain Sui GraphQL lookup (wallet → PlayerProfile → Character). This resolves the character identity gap without requiring a CCP JWT:

- `characterId` (`Character.key.item_id`) — EVE numeric character ID
- `tribeId` (`Character.tribe_id`) — tribe membership (number, coerced to string)
- Wallet binding verified: `Character.character_address` must match the request's verified wallet

**Remaining blockers (JWT path only):**
- **No JWT issuer:** CCP JWKS endpoint unavailable — `trusted_character_jwt` mode blocked
- **Blockchain gateway unreachable:** `GET /v2/smartcharacters/{address}` does not exist on the public World API; blockchain gateway is externally firewalled — unrelated to the Sui path

**Production deployment:** Set `ENABLE_SUI_CHARACTER_RESOLUTION=true` and `AUTH_DEV_MODE=false`. The Sui identity path is the active production mechanism.

See [docs/backend/16-character-token-contract.md](../backend/16-character-token-contract.md), [docs/backend/18-production-identity-mode.md](../backend/18-production-identity-mode.md), and [docs/backend/19-world-api-character-resolution-audit.md](../backend/19-world-api-character-resolution-audit.md).

---

### 2. Wallet signature verification is structural only (dev mode)

**What it means:** In `AUTH_DEV_MODE=true`, wallet signatures are checked for structural validity (non-empty, minimum length) but are not cryptographically verified against an on-chain key.

**Impact:** Any string of the right format will pass signature verification in dev mode. This is intentional for testing but must never ship.

**Path to resolution:** EVE Frontier dApp Kit signature scheme confirmation (Ed25519 or secp256k1 from Sui). Then `verifyWalletSignature` in production mode will do real recovery. The abstraction (`verifyChallengeSignature`) is already in place.

---

### 3. Client-side character resolver uses assemblyowner fallback

**What it means:** When the InGame shell pulls character identity from the dApp Kit, it uses an assemblyOwner fallback rather than a real character resolver. Client-side `characterId` may reflect the owner of the smart object, not the piloting character.

**Note:** Server-side character identity is now resolved from on-chain Sui data (see limitation #1). This limitation applies specifically to the client-side context display, not to remote push authentication.

**Impact:** Character-scoped features (character dossier, per-character signal views, client-displayed character attribution) are unreliable in alpha.

**Path to resolution:** Phase 07D.1 — real client-side character resolution from EVE Frontier identity API.

---

## Remote Sync

### 4. Remote sync is manual, single-signal only

**What it means:** Push is triggered per-signal via a button. There is no queue, no background sync, no automatic retry, no bulk push. This applies to both dev-auth mode and Sui identity mode.

**Impact:**
- Players must push each signal individually
- Missed pushes require manual retry
- There is no "sync everything" action
- Remote state and local state can diverge silently if player forgets to push

**Path to resolution:** Background sync queue (deferred — see hard invariant in [docs/backend/16-character-token-contract.md](../backend/16-character-token-contract.md)).

---

### 5. Challenge store is in-memory

**What it means:** The backend's one-time challenge store is an in-memory `Map`. Challenges are lost on server restart.

**Impact:** Any in-flight push during a server restart will fail. Not a concern for development; unacceptable for production.

**Path to resolution:** Persist challenge store to database with TTL cleanup.

---

### 6. No remote signal pull or merge

**What it means:** Signal Vault can push signals to the backend but cannot pull them back down. There is no sync — only write.

**Impact:** Remote signals are not visible in the UI. A player on a second device cannot see signals they pushed from the first device (no pull implemented).

**Path to resolution:** Remote pull and merge protocol (not yet scheduled).

---

## Scope & Visibility

### 7. Scout cell scope is locked

**What it means:** The `scout_cell` visibility exists as a type but is not selectable or functional. No cell identity model exists.

**Impact:** Signal Vault cannot support sub-tribe intel cells in alpha.

**Path to resolution:** Cell identity model (not yet designed or scheduled).

---

### 8. Tribe-scoped remote writes require `character_resolved` with verified `tribeId`

**What it means:** Pushing a `tribe`, `officer`, or `scout_cell` signal to remote requires `character_resolved` viewer state with a verified `tribeId`.

**Status:** Resolved for the Sui identity path. When `ENABLE_SUI_CHARACTER_RESOLUTION=true`, `tribeId` is derived server-side from `Character.tribe_id` on-chain — no dev JWT required.

**Still limited for dev-auth path:** Dev credentials must supply the correct `tribe_id` in the JWT. This is unchanged.

**`scout_cell` scope:** Locked regardless of identity mode. No cell identity model exists.

---

## Storage & Data

### 9. Local data lives in browser IndexedDB

**What it means:** All signals and classifications are stored in the browser's local IndexedDB database. They are tied to the browser profile and origin.

**Impact:**
- Clearing browser data deletes all signals
- Private/incognito mode does not persist between sessions
- Switching browsers loses local data
- Multiple devices do not share data automatically

**Workaround:** Export before clearing. Import on the new device.

---

### 10. No signal editing

**What it means:** Created signals cannot be edited. They can only be deleted (local) or superseded by a new signal.

**Impact:** Correction of errors requires creating a new signal and mentally discarding the old one.

**Path to resolution:** Signal editing (local + remote update endpoint) — not yet scheduled.

---

## Performance & Scale

### 11. No pagination for large signal sets

**What it means:** All signals are loaded from IndexedDB on app start. No pagination, no lazy loading, no virtual scroll in the signal list.

**Impact:** Performance degrades with a large number of signals (exact threshold not measured).

**Path to resolution:** Pagination / virtual list (not yet scheduled).

---

### 12. ~~World API calls are uncached per session~~ — RESOLVED (Phase 10C.4)

World API data (solar systems, tribes, types) is now persisted in a cross-session Dexie cache (`worldApiCache` table).

- Solar system and tribe data is cached for 30 minutes.
- Game type data is cached for 24 hours.
- On cache hit, data is returned immediately without a network call.
- If the network fails but a stale cached record exists, the stale data is returned as `stale_fallback` and the badge shows "stale".
- If no cache exists and the network fails, enrichment shows as unavailable.

The `WorldApiStatusBadge` now distinguishes: `pending` / `success` (live network) / `cache` (served from cache) / `stale` (stale fallback) / `unavailable`.

---

## Bundle

### 13. InGameRoute chunk exceeds 500 kB minified

**What it means:** The InGame chunk that includes dApp Kit is ~530 kB minified (~148 kB gzip). Vite warns about this.

**Impact:** Slightly longer first load for InGame users. Not a functional issue.

**Path to resolution:** Code-split or evaluate dApp Kit tree-shaking. Low priority for alpha.
