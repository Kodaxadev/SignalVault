# Signal Vault — Alpha Release Readiness

**Date:** 2026-05-12  
**Phase:** 10C.4 complete (10C.1–10C.4 World-Aware Navigation & Context; 09L.2 backend Sui identity)  
**Status:** Internal alpha — local-first features complete; remote sync functional; Sui-based production identity implemented and dev-validated; World API cross-session cache implemented

---

## What Is Ready

### Fully working, no caveats

| Feature | Status | Notes |
|---------|--------|-------|
| Signal creation | ✅ Ready | All 12 signal types, 6 visibility levels |
| Confidence levels | ✅ Ready | observed / inferred / rumor / unverified |
| Local persistence | ✅ Ready | IndexedDB via Dexie; survives page reload |
| Staleness tracking | ✅ Ready | Per-type thresholds (hostile_contact critical at 24h; field_note at 30d) |
| Dossiers | ✅ Ready | 8 object types with signal aggregation, intel health panels, contradiction badges |
| Entity classification | ✅ Ready | Gate, Storage, System, Route, Market, Tribe, Object, Unknown |
| Export (JSON) | ✅ Ready | v1 schema; includes signals + classifications |
| Import (merge/replace) | ✅ Ready | Validates before import; reports counts |
| World API enrichment | ✅ Ready | HTTP client with solar system, tribe, and type data; cross-session Dexie cache with 30min/24h TTL and stale fallback |
| Current system selector | ✅ Ready | Manual system context for players outside in-game browser; numeric ID confirmed via World API, text stored as manual |
| Route warning cards | ✅ Ready | Derive warnings from local Signals linked to route systems; level-degraded on critical staleness; sorted critical→info |
| dApp Kit wallet adapter | ✅ Ready | Wallet address extraction from EVE Frontier provider |
| InGame surface detection | ✅ Ready | `/ingame/object/:objectId` path → ingame context |
| Tribe/officer scope gating | ✅ Ready | Policy enforced client- and server-side |
| Chunk isolation | ✅ Ready | Main chunk 0 dApp Kit refs; dApp Kit in InGameRoute chunk only |

### Working under dev-auth or Sui-auth constraints (see limitations)

| Feature | Status | Notes |
|---------|--------|-------|
| Remote signal push (dev-auth) | ⚠️ Dev-auth mode | Functional with `VITE_REMOTE_DEV_AUTH=true`; uses dev JWT, not EVE-issued credential |
| Remote signal push (Sui identity) | ⚠️ Sui mode | Functional when `ENABLE_SUI_CHARACTER_RESOLUTION=true`; uses on-chain character resolution — no dev JWT required. Dev-validated 2026-05-11. Production end-to-end validation pending real Sui wallet signature tooling. |
| Wallet signing (InGame) | ⚠️ Adapter ready | `useWalletSigningAdapter` wired; real signing available when EVE Frontier provides signing provider |
| Challenge/signature auth | ⚠️ Infra complete | Backend issues challenges, server verifies; crypto recovery pending EVE dApp Kit scheme confirmation |
| Remote sync UX | ⚠️ Alpha labeled | Button shows "Alpha · Manual only"; blocked reasons are specific and actionable |

---

## What Is Local-Only

The following features store data exclusively in browser IndexedDB. No data leaves the device without a manual push.

- All created signals
- All entity classifications
- All staleness evaluations
- Dossier views and intel aggregation
- Export files (written to disk by browser download)

**Implication for players:** Clearing browser storage or switching browsers loses all local data. Export before clearing. This is by design for the alpha — remote backup is manual and gated.

---

## What Is Dev-Auth Only

The `VITE_REMOTE_DEV_AUTH=true` path remains dev-auth only:

1. **Character JWT** — `VITE_REMOTE_DEV_CHARACTER_JWT` is a developer-supplied token decoded without signature verification. Not an EVE-issued credential.
2. **Dev auth flag** — `VITE_REMOTE_DEV_AUTH=true` enables a static-credentials shortcut not appropriate for players.

**The dev-auth path must never reach production.**

## What Is Production-Capable (Sui Identity Mode)

Remote push with `ENABLE_SUI_CHARACTER_RESOLUTION=true` (API) does not require a dev JWT:

1. Client signs a server-issued challenge with their Sui wallet (existing Phase 09I infra).
2. Server verifies the wallet signature and queries Sui GraphQL to resolve character identity.
3. Server extracts `characterId`, `characterName`, `tribeId` from on-chain `Character` object.
4. Tribe-scoped writes succeed using the Sui-derived `tribeId` — no dev JWT required.

**Remaining production gaps:** Wallet crypto recovery (structural-only in dev mode) and challenge store persistence (in-memory) still need hardening before public deployment.

**Current client caveat:** The web signing path still treats `VITE_REMOTE_DEV_CHARACTER_JWT` as required before attempting a signed push. Removing that dev-token dependency is follow-up hardening and is not part of the release-blocker fix.

---

## What Must Not Be Marketed as Production

| Item | Reason |
|------|--------|
| Remote signal storage as reliable backup | Challenge store is in-memory; data lost on server restart |
| Scout cell scope | Locked — no cell identity model exists yet |
| Wallet signature cryptographic recovery | Structural check only in dev mode; real recovery pending EVE dApp Kit signature scheme confirmation |
| Background or automatic sync | Not implemented; hard invariant |
| Remote signal pull | Not implemented |

---

## What Can Be Safely Demoed

A demo session using only local-first features is fully safe and does not require any backend:

1. Open in browser (standalone or InGame shell)
2. Connect EVE Frontier wallet (InGame) — populates wallet address and smart object context
3. Create signals: pick type, set confidence, set visibility, add body text
4. View dossier for a smart gate or system — aggregated signal intel, staleness indicators
5. Mark a signal as stale or contradicted — watch intel health update in dossier
6. Export signals to JSON — download file
7. Import on another device — merge or replace

**Optional (requires backend + dev credentials):**

8. Push a single signal to remote backend — manual, labeled alpha, local signal preserved on failure

The demo does not require remote sync. Local-first is the complete story for alpha.

---

## What Is Blocked Pending EVE/CCP Trusted Character Token

See [docs/backend/16-character-token-contract.md](../backend/16-character-token-contract.md) for the full contract.

Short version:

- Signal Vault cannot issue a character JWT itself
- The CCP-issued character JWT (`trusted_character_jwt`) remains unavailable — no JWKS endpoint or shared secret has been published
- **Mitigated:** The Sui PlayerProfile path (`sui_player_profile`) resolves character identity server-side from on-chain data, removing the JWT dependency for the primary production path

Still pending CCP-issued JWT:

- Character identity bound to a CCP-authenticated game account (rather than on-chain wallet data)
- Token-based delegation flows that depend on CCP as a trust anchor

**No timeline exists for trusted character token issuer availability.** The Sui path is the production identity mechanism until that changes.

---

## Gate Status

| Gate | Result |
|------|--------|
| TypeScript | 0 errors |
| Web tests | 658 passed |
| API tests | 222 passed / 5 skipped |
| Build | ✅ success |
| Line limit (400 lines) | ✅ all files pass |
| Main chunk dApp Kit refs | 0 |
| No background sync | ✅ confirmed |
| `isProductionCharacterTokenAvailable()` | `false` — JWT path still blocked |
| Sui identity production guard | ✅ `auth_mode_conflict` on JWT-in-prod-Sui-mode |
| Dependency audit | ⚠️ 2 moderate dev-tool advisories tracked as follow-up |
