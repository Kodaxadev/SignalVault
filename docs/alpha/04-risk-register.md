# Signal Vault — Alpha Risk Register

**Status as of:** 2026-05-12 (Phase 10C.4)

Risk severity: **Critical** (blocks safe release) / **High** (significant UX or security impact) / **Medium** (notable, manageable) / **Low** (minor)

---

## Auth & Identity Risks

### RISK-01 — Dev-auth credentials in production

**Severity:** Critical  
**Area:** Auth  
**Description:** `VITE_REMOTE_DEV_AUTH=true` and `AUTH_DEV_MODE=true` disable real signature verification and accept any structurally valid token as authenticated. If either flag is enabled in a production deployment, any actor can push signals as any character.

**Mitigations in place:**
- Flags are off by default; must be explicitly set
- `RemoteSyncAlphaWarning` visibly labels "Dev auth" in the UI when active
- `isProductionCharacterTokenAvailable()` returns `false` permanently — code cannot accidentally assume the CCP JWT path is available
- In production Sui mode (`ENABLE_SUI_CHARACTER_RESOLUTION=true`, `AUTH_DEV_MODE=false`), any JWT/Bearer header returns `auth_mode_conflict` → 401, preventing silent dev-auth bleed into production
- Health endpoint (`GET /health`) exposes `identity.authDevMode` and `identity.mode` for runtime verification

**Residual risk:** Human error in deployment configuration. A production `.env` with dev auth flags enabled would not be caught by code unless CI checks are in place.

**Action required:** CI must assert `AUTH_DEV_MODE=false` and `VITE_REMOTE_DEV_AUTH` is unset in any production build pipeline before launch.

---

### RISK-02 — CCP JWT issuer unavailable; blockchain gateway unreachable

**Severity:** Medium (reduced from High — Sui identity path now resolves the character identity gap)  
**Area:** Auth / Identity  
**Description:** Two infrastructure gaps remain from the Phase 09L.0 audit:

1. **No trusted JWT issuer:** No JWKS endpoint or shared secret is published by CCP. The `trusted_character_jwt` identity path remains blocked.
2. **Blockchain gateway unreachable:** `GET /v2/smartcharacters/{address}` does not exist on the public World API (returns 404). The blockchain gateway is externally firewalled (exit code 6 on all connection attempts).

**Resolved by Sui PlayerProfile path (Phase 09L.1 / 09L.2):** Character identity (characterId, tribeId, wallet binding) is now resolved server-side via public Sui GraphQL — no CCP JWT, no blockchain gateway required. Tribe-scoped writes now work using Sui-derived `tribeId`.

**Remaining gaps:**
- `trusted_character_jwt` mode: still blocked (CCP JWT issuer unavailable)
- Blockchain gateway: still unreachable (separate gap, now less impactful)

**Mitigations in place:**
- Contract documented in `docs/backend/16-character-token-contract.md`
- Sui identity path documented in `docs/backend/18-production-identity-mode.md`
- Full audit in `docs/backend/19-world-api-character-resolution-audit.md`
- `CHARACTER_TOKEN_HARD_INVARIANTS` codified in `characterTokenContract.ts`
- No background sync (hard invariant — unconditional)
- Production guard: `auth_mode_conflict` returned when JWT present in production Sui mode

**Residual risk:** Players could supply arbitrary JWTs with falsified tribe membership if dev mode is exposed. The server would accept them in `AUTH_DEV_MODE=true`. In production Sui mode (`AUTH_DEV_MODE=false`), dev JWT headers are rejected.

**Action required:** Production deployment must set `AUTH_DEV_MODE=false` and `ENABLE_SUI_CHARACTER_RESOLUTION=true` with the confirmed Sui endpoint. CI must assert `AUTH_DEV_MODE=false` in any production build pipeline before launch.

---

### RISK-03 — Wallet signature verification is structural only

**Severity:** High  
**Area:** Auth  
**Description:** `verifyWalletSignature` in dev mode checks that the signature is non-empty and meets a minimum length threshold. It does not perform cryptographic recovery. Any string of the right shape passes.

**Mitigations in place:**
- `verifyChallengeSignature` abstraction is in place; prod path returns the right error shape
- Dev mode is gated behind `AUTH_DEV_MODE=true`
- Challenge store enforces one-time use, wallet binding, and 5-minute TTL even in dev mode

**Residual risk:** If dev mode is ever enabled in production (see RISK-01), the signature check provides no security.

**Action required:** Confirm EVE Frontier dApp Kit signature scheme (Ed25519 / Sui secp256k1) and implement real `recoverAddress` in `verifyWalletSignature` before any production push path is opened.

---

## Remote Sync Risks

### RISK-04 — Challenge store is in-memory, not persisted

**Severity:** Medium  
**Area:** Remote Sync / Backend  
**Description:** One-time challenges are stored in a `Map` on the backend process. A server restart or process crash loses all pending challenges. Any in-flight push at restart time will fail with `not_found`.

**Mitigations in place:**
- Challenges expire in 5 minutes; the window is short
- Push failure preserves the local signal (`sync_failed` state, not data loss)
- Retry is available from the UI

**Residual risk:** Low for single-developer alpha. Unacceptable for any multi-instance deployment.

**Action required:** Persist challenge store to database (Redis or Postgres row with TTL) before scaling backend beyond one instance.

---

### RISK-05 — No remote pull; sync divergence is invisible

**Severity:** Medium  
**Area:** Remote Sync  
**Description:** Signal Vault can push signals to remote but cannot pull them. Local and remote state can diverge. A player who pushes from device A and opens device B will see no remote signals on device B.

**Mitigations in place:**
- Export/import provides a manual data transfer path
- UI does not claim remote sync is bidirectional

**Residual risk:** Players may expect "sync" to mean bidirectional. The current UX does not clearly communicate that pull does not exist.

**Action required:** Ensure demo script and player-facing docs do not use the word "sync" without the qualifier "manual push only."

---

### RISK-06 — Single-signal manual push does not scale

**Severity:** Low (alpha) / High (beta)  
**Area:** Remote Sync / UX  
**Description:** There is no bulk push, no queue, no background sync. A player with 50 signals must click Push 50 times.

**Mitigations in place:**
- Alpha is explicitly scoped to manual push only
- `RemoteSyncAlphaWarning` labels this in the UI

**Residual risk:** Player frustration at scale. Not a concern for the alpha cohort size.

**Action required:** Background sync queue before any public or larger-scale release.

---

## Browser Storage Risks

### RISK-07 — Local data loss on browser clear

**Severity:** High  
**Area:** Storage  
**Description:** All signals are in IndexedDB. Browsers may evict IndexedDB data under storage pressure (especially on mobile). Users who clear site data, use private mode, or reinstall the browser lose all local signals with no warning.

**Mitigations in place:**
- Export/import allows manual backup
- `RemoteSyncExplainer` in the UI says "Your Signal is always preserved locally if push fails" — accurate but does not warn about browser-level data loss

**Residual risk:** A player who does not export regularly can lose all data permanently.

**Action required:** Add a storage health warning (estimated quota usage, last export date) before any public release. This is not present in alpha.

---

### RISK-08 — No cross-browser or cross-device sync without remote push

**Severity:** Medium  
**Area:** Storage  
**Description:** Signals created in Chrome are not visible in Firefox on the same machine. Two devices always diverge unless remote sync is used.

**Mitigations in place:**
- Export/import covers the manual case
- Remote push (when available) would address this

**Residual risk:** Common player expectation ("I logged in from my laptop and my signals are gone") will occur.

**Action required:** Document clearly in player-facing FAQ. No technical fix planned for alpha.

---

## EVE Infrastructure Risks

### RISK-09 — Atlas / World API availability

**Severity:** Medium  
**Area:** World API  
**Description:** Dossier enrichment (solar system names, tribe data, game types) depends on the EVE Frontier World API being available and returning expected schemas. If CCP changes schemas or takes the API offline, enrichment silently falls back.

**Mitigations in place:**
- World API client uses an 8-second timeout with graceful fallback (`{ status: 'unavailable' }`)
- Cross-session Dexie cache (Phase 10C.4): solar system and tribe data cached 30min, game type data cached 24h. Stale cache is served as fallback when network fails — dossier enrichment survives World API interruptions after the first successful fetch.
- Dossiers render without enrichment data; entity label is used as fallback

**Residual risk:** If the World API changes its schema, type errors may surface at runtime (TypeScript types are local snapshots of API shape). No schema contract or versioning exists.

**Action required:** Monitor World API changelog if one is published by CCP. Pin to known-good schema version if available.

---

### RISK-10 — dApp Kit package typing is not authoritative

**Severity:** Low  
**Area:** EVE / dApp Kit  
**Description:** The EVE Frontier dApp Kit (`@evefrontier/dapp-kit`) is typed locally. `useConnection()` return type does not include `signPersonalMessage` or `signMessage` — these are detected at runtime via property existence check. Type casts are used in tests.

**Mitigations in place:**
- `useWalletSigningAdapter` wraps the detection in a try/catch and returns `signing_not_supported` safely
- Tests use `as unknown as ReturnType<typeof dappKit.useConnection>` explicitly

**Residual risk:** If dApp Kit updates its API shape, the adapter may silently get `signing_not_supported` without a TypeScript error, breaking wallet signing invisibly.

**Action required:** Treat dApp Kit updates as breaking changes until the signing API is stable and typed. Pin to known-good version.

---

## Bundle & Isolation Risks

### RISK-11 — Bundle containment must be maintained on every dApp Kit dependency change

**Severity:** Medium  
**Area:** Bundle / Isolation  
**Description:** The main chunk must have 0 dApp Kit package references. World API URLs can legitimately contain `evefrontier`, so the local release gate checks for dApp Kit leakage after building the fresh bundle artifact.

**Mitigations in place:**
- `pnpm check:release` runs `pnpm build` before `pnpm check:bundle-clean`
- `WalletSigningContext.tsx` is the clean boundary — no dApp Kit import
- `useWalletSigningAdapter` is isolated to `frontier/dappKit/`

**Residual risk:** A future import mistake (e.g., a developer adds a dApp Kit import to a shared component) is caught only where `pnpm check:release` is actually run.

**Action required:** Add `pnpm check:release` as a CI step before any release build is published.

---

### RISK-12 — Cross-origin remote push requires explicit CORS policy

**Severity:** Medium  
**Area:** Remote Sync / Backend  
**Description:** The web client sends JSON plus authorization and wallet headers. If the web app and API are deployed on different origins, browsers will preflight those requests. The API does not yet install Hono CORS middleware or handle an explicit production origin allowlist.

**Mitigations in place:**
- Same-origin deployments are unaffected
- Remote push remains optional and manual

**Residual risk:** Cross-origin alpha deployments may fail before auth or policy checks run.

**Action required:** Add Hono CORS middleware with explicit allowed origins, methods, and headers before any cross-origin deployment.

---

### RISK-13 — Dependency audit has moderate dev-tool advisories

**Severity:** Medium  
**Area:** Tooling / Supply Chain  
**Description:** `pnpm audit --audit-level moderate` reports current esbuild and Vite advisories in the dev/build toolchain.

**Mitigations in place:**
- Advisories are not hidden by the release-blocker fix
- Runtime production dependencies were not upgraded in this scope

**Residual risk:** Local dev server and optimized dependency handling remain on vulnerable versions until dependency updates are planned and tested.

**Action required:** Schedule a dependency maintenance pass that upgrades Vite/Vitest/esbuild-compatible tooling and re-runs the full release gate plus dApp Kit bundle isolation check.
