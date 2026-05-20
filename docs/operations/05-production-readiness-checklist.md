# Signal Vault Production Readiness Checklist

**Status date:** 2026-05-12  
**Purpose:** Track every known broken, unresolved, or under-verified production concern for Signal Vault. This is stricter than alpha readiness: local-first demo safety is not the same as production remote sync.

## Evidence Baseline

| Evidence | Authority | Why it matters |
|---|---|---|
| Atlas record [`679dd42f`](https://atlas.kodaxa.dev/api/records/679dd42f9b9014cf029d13bdde24af37eb5ec2402a384d385c1dec79dc92f0e1) | official_docs | `@evefrontier/dapp-kit` is the official React SDK surface for EVE Vault wallet connection, Smart Object data, sponsored transactions, auto-polling, and peer dependency alignment. |
| Atlas record [`30360997`](https://atlas.kodaxa.dev/api/records/30360997cd3ca52909c2579511618c0c77b2ce55ca7d39f7fc74ccfc3b8ef795) | official_docs | EVE Vault is the wallet and identity surface for EVE Frontier Sui assets and dApp ecosystem connection. |
| Atlas record [`9c755810`](https://atlas.kodaxa.dev/api/records/9c7558104aa193a8445150eecc796004103ec5ecb97dba013b7a918e78eae025) | official_tooling | EVE Vault has wallet signing context code with localnet/zklogin modes and chain-aware signing helpers. |
| Atlas record [`e731cc6e`](https://atlas.kodaxa.dev/api/records/e731cc6ebafd01f8413c7808acf7807ebfaa75baebe1e043e10519662b09213a) | official_tooling | EVE Vault includes a SignPersonalMessage UI path. |
| Atlas record [`0309227c`](https://atlas.kodaxa.dev/api/records/0309227c87d12448b180eb715f3030aaf7c8dbd07c76bca2b61a4579bb48e58f) | official_tooling | EVE Vault implements the Sui Wallet Standard adapter surface including personal message signing types. |
| Atlas record [`cb0c66e`](https://atlas.kodaxa.dev/api/records/cb0c66e05d6e3a2886211f1047c663a86379f1995bf2a39e3b077fa6b826d5c8) | authoritative_source | EVE world-contract scripts include Sui personal-message signature verification tooling. |
| Atlas record [`2e8138ad`](https://atlas.kodaxa.dev/api/records/2e8138ad08ab87b2e8e727aa272e0c863554a28bf1d1823acccabdc672b20632) | official_docs | In-game dApps open from an Assembly interaction and owners can submit on-chain sponsored transactions from the base dApp. |
| Atlas record [`9c722c40`](https://atlas.kodaxa.dev/api/records/9c722c40b26aadc0648721354af2d61a542397b0978ed04f8047307dbb72d048) | official_docs | External dApps use Sui Wallet Standard, currently with EVE Vault, and select assembly context from `tenant` and `itemId` query params. |
| Atlas World API records [`355b0230`](https://atlas.kodaxa.dev/api/records/355b023063e34dc3063180a2ca5e9dfad205ebd30a343416f7c1afdd2c6f9e40), [`35af8953`](https://atlas.kodaxa.dev/api/records/35af895334439bbecf2142fe998ab512a637ff607e30f5fec1fd2791d2a6b362), [`0d7d9751`](https://atlas.kodaxa.dev/api/records/0d7d9751c27fddbccffea46971aeda164cbec239cced11141f2fc9c913b71172) | official_api_docs | Stillness World API is current live-shard/testnet evidence for solar systems, game types, and POD verification. |
| Sui TypeScript SDK docs | external_foundation_docs | `verifyPersonalMessageSignature` verifies personal messages and can verify against an expected Sui address; zkLogin verification may require a Sui GraphQL client on testnet. See [Mysten SDK keypairs docs](https://sdk.mystenlabs.com/sui/cryptography/keypairs). |
| Hono CORS docs | framework_docs | Hono supports explicit origins, methods, headers, credentials, and environment-dependent CORS middleware. See [Hono CORS middleware](https://hono.dev/docs/middleware/builtin/cors). |
| GitHub advisories | security_advisory | Current audit follow-ups are the esbuild dev-server CORS advisory [GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99) and Vite `.map` path traversal advisory [GHSA-4w7w-66w2-5vf9](https://github.com/advisories/GHSA-4w7w-66w2-5vf9). |

## P0 Release Blockers

- [x] **Implement production wallet signature verification.**
  [`verifyWalletSignature.ts`](../../apps/api/src/auth/verifyWalletSignature.ts) now uses Sui `verifyPersonalMessageSignature` with expected-address verification and derives the Sui address from the verified public key. Covered by real Ed25519 `signPersonalMessage` tests in [`verifyWalletSignature.test.ts`](../../apps/api/__tests__/verifyWalletSignature.test.ts). Follow-up: live EVE Vault / zkLogin signature fixture validation remains required. Evidence: Atlas [`9c755810`](https://atlas.kodaxa.dev/api/records/9c7558104aa193a8445150eecc796004103ec5ecb97dba013b7a918e78eae025), [`e731cc6e`](https://atlas.kodaxa.dev/api/records/e731cc6ebafd01f8413c7808acf7807ebfaa75baebe1e043e10519662b09213a), [`0309227c`](https://atlas.kodaxa.dev/api/records/0309227c87d12448b180eb715f3030aaf7c8dbd07c76bca2b61a4579bb48e58f), [`cb0c66e`](https://atlas.kodaxa.dev/api/records/cb0c66e05d6e3a2886211f1047c663a86379f1995bf2a39e3b077fa6b826d5c8), and [Sui SDK docs](https://sdk.mystenlabs.com/sui/cryptography/keypairs).

- [x] **Remove dev JWT from the signed push path.**
  The signed wallet path no longer requires or sends `VITE_REMOTE_DEV_CHARACTER_JWT`; [`buildSignedAuthHeaders`](../../apps/web/src/features/remote/remoteSignedAuthHeaders.ts) emits wallet challenge headers only. Dev JWT remains isolated to the explicit dev-auth path.

- [x] **Persist challenges outside process memory.**
  [`challengeStore.ts`](../../apps/api/src/auth/challengeStore.ts) now persists issued challenges through [`challengeRepository.ts`](../../apps/api/src/db/challengeRepository.ts), backed by migration [`003_add_auth_challenges.sql`](../../apps/api/migrations/003_add_auth_challenges.sql). The in-memory map remains a local fallback when the DB is unavailable.

- [x] **Install explicit API CORS policy before cross-origin deployment.**
  [`server.ts`](../../apps/api/src/server.ts) now installs [`apiCors.ts`](../../apps/api/src/middleware/apiCors.ts) before API routes. `API_CORS_ORIGINS` controls allowed origins and signed auth headers are included in preflight. Evidence: [Hono CORS options](https://hono.dev/docs/middleware/builtin/cors).

- [x] **Add baseline read/write rate limits.**
  [`server.ts`](../../apps/api/src/server.ts) now installs [`rateLimit.ts`](../../apps/api/src/middleware/rateLimit.ts) for `/api/*`; `API_RATE_LIMIT_MAX` and `API_RATE_LIMIT_WINDOW_MS` control the per-IP budget and return `429 rate_limited`. Follow-up: distributed/per-wallet limits and audit events for denied abuse paths remain P1 hardening.

- [x] **Wire real remote reads.**
  `GET /api/v1/signals` and `GET /api/v1/signals/:id` now call [`signalRepository.ts`](../../apps/api/src/db/signalRepository.ts), serialize DB rows, optionally authenticate supplied read credentials, and rely on Postgres RLS filtering through the repository session context. Follow-up: pagination/filter query params are still not implemented.

- [ ] **Verify Postgres RLS under the actual application role.**  
  Migration [`005_harden_signal_rls.sql`](../../apps/api/migrations/005_harden_signal_rls.sql) replaces the broad all-command signal policy with command-specific RLS checks and new identity snapshot constraints. Migration readiness now checks required policies and constraints as well as tables/columns. [`verify-deployed-rls.ts`](../../apps/api/scripts/verify-deployed-rls.ts) provides the deployed-role probe (`pnpm verify:rls`). This remains open until the probe passes with `SIGNAL_VAULT_RLS_DATABASE_URL` against the deployed app role. Evidence: [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html).
  The verifier now runs a schema preflight before behavior probes: row security must be enabled on `signals` and `audit_log`, required policies must exist, and identity snapshot constraints must be installed.

## P1 Hardening Before Public Production

- [ ] **Resolve dependency advisories instead of documenting them forever.**  
  `pnpm audit --audit-level moderate` reports the known esbuild and Vite dev-tool advisories. Production acceptance requires a dependency maintenance pass, full `pnpm check:release`, and dApp Kit bundle isolation verification. Evidence: [esbuild advisory](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99), [Vite advisory](https://github.com/advisories/GHSA-4w7w-66w2-5vf9).

- [ ] **Add real lint/static-analysis tooling or stop exposing `pnpm lint`.**  
  `pnpm lint` is currently non-authoritative. Production acceptance requires configured lint rules for TypeScript, React hooks, accessibility where applicable, and CI enforcement, or removal of the script from developer-facing claims.

- [ ] **Pin and audit EVE dApp Kit peer dependency compatibility.**  
  The official dApp Kit docs require React, `@mysten/dapp-kit-react`, and `@mysten/sui` versions to stay in sync with the package ranges. Production acceptance requires a dependency upgrade note that records the installed package versions, peer ranges, and a successful build/browser smoke test. Evidence: Atlas [`679dd42f`](https://atlas.kodaxa.dev/api/records/679dd42f9b9014cf029d13bdde24af37eb5ec2402a384d385c1dec79dc92f0e1).

- [ ] **Validate in-game and external-browser entry paths separately.**  
  EVE docs describe both in-game Assembly navigation and external browser navigation with `tenant` / `itemId` params. Production acceptance requires browser tests for `/ingame/object/:objectId`, external query-param context, missing EVE Vault, locked EVE Vault, and unsupported wallet states. Evidence: Atlas [`2e8138ad`](https://atlas.kodaxa.dev/api/records/2e8138ad08ab87b2e8e727aa272e0c863554a28bf1d1823acccabdc672b20632), [`9c722c40`](https://atlas.kodaxa.dev/api/records/9c722c40b26aadc0648721354af2d61a542397b0978ed04f8047307dbb72d048).

- [x] **Define environment separation for Stillness and Utopia.**  
  [`assert-world-api-env.mjs`](../../scripts/assert-world-api-env.mjs) now runs in `pnpm check:release`. `SIGNAL_VAULT_RELEASE_ENV=stillness` requires `VITE_WORLD_API_ENV=stillness`, `VITE_DEFAULT_TENANT=stillness`, and the confirmed Stillness World API host; Utopia remains allowed only as the default or explicit sandbox release. Evidence: Atlas World API records [`355b0230`](https://atlas.kodaxa.dev/api/records/355b023063e34dc3063180a2ca5e9dfad205ebd30a343416f7c1afdd2c6f9e40), [`35af8953`](https://atlas.kodaxa.dev/api/records/35af895334439bbecf2142fe998ab512a637ff607e30f5fec1fd2791d2a6b362).

- [ ] **Complete operational health, readiness, and migration checks.**  
  `/health` now reports database configuration, required migration status, auth mode, and remote-write gate status without exposing raw secrets. Migration readiness uses PostgreSQL `information_schema.tables` and `information_schema.columns`, matching the stable SQL metadata interface documented by PostgreSQL. Remaining production acceptance work: add World API base/environment reporting, decide whether stale migrations should fail a dedicated readiness endpoint, and verify behavior against the deployed DB role. Evidence: [PostgreSQL information schema](https://www.postgresql.org/docs/current/information-schema.html), [columns view](https://www.postgresql.org/docs/current/infoschema-columns.html), and Atlas record [`62bb91fb`](https://atlas.kodaxa.dev/api/records/62bb91fb8c83a31d36deb280386ecb7eeb9598d62fd1b4784f037b91b94c4c10).

- [ ] **Harden audit persistence and retention.**  
  Audit insert exists and now records request-time identity snapshots for biomassing/identity-continuity safety. Production acceptance still requires retention policy enforcement, denial-path persistence tests with DB enabled, and a read policy that does not expose all audit rows to every app role. Local evidence: [`auditRepository.ts`](../../apps/api/src/db/auditRepository.ts), [`001_initial_schema.sql`](../../apps/api/migrations/001_initial_schema.sql), [`23-biomassing-identity-continuity.md`](../backend/23-biomassing-identity-continuity.md).

- [ ] **Confirm EVE Frontier character deletion/recreation semantics.**
  EVE Online officially documents character deletion/biomassing, but EVE Frontier's exact PlayerProfile/Character lifecycle after deletion or recreation remains unconfirmed. Production acceptance requires official EVE Frontier evidence for whether `PlayerProfile.character_id`, `Character.key.item_id`, and character names can disappear, change, or be reused.

- [x] **Add secret and environment validation at API boot.**  
  [`validateApiEnv.ts`](../../apps/api/src/env/validateApiEnv.ts) now fails API startup for dangerous production configurations: `AUTH_DEV_MODE=true`, remote writes without `DATABASE_URL`, missing explicit Sui character resolution, missing/invalid `SUI_GRAPHQL_URL`, missing CORS origins, or wildcard CORS origins while production remote writes are enabled. Follow-up remains for web build env validation and Stillness/Utopia environment separation. Evidence: [Hono CORS options](https://hono.dev/docs/middleware/builtin/cors).

- [ ] **Replace in-memory rate limiting with a shared limiter before horizontal scale.**
  The new API limiter is intentionally small and process-local. Production deployments with more than one API instance need a Redis/Postgres-backed limiter keyed by IP plus verified wallet address, with audit events for denied abuse paths.

## P2 Product/Trust Gaps

- [ ] **Write the privacy and data-retention contract for players.**  
  Signal Vault stores local intel in IndexedDB and can optionally push remote signals; production needs player-facing disclosure for what leaves the device, what is public/tribe/officer scoped, and retention/deletion rules.

- [ ] **Define moderation and takedown workflow for public signals.**  
  Public remote signals need abuse handling, auditability, and admin operations before production exposure. The API currently has no real PATCH/DELETE implementation in [`signalRoutes.ts`](../../apps/api/src/signals/signalRoutes.ts).

- [ ] **Create rollback and incident runbooks.**  
  Production remote writes need rollback for bad deployments, DB migrations, compromised env vars, broken World API dependencies, and dApp Kit upgrades.

- [ ] **Add observability beyond request IDs.**  
  Production needs structured logs, metrics for auth failures, challenge failures, policy denials, World API failure rates, DB errors, and bundle-check status in CI.

## Current Green Gates

- [x] `pnpm check:release` runs web/API typecheck, web/API/script tests, web build, prod-auth, World API env guard, fresh bundle isolation, docs, and line-limit checks.
- [x] Main bundle guard checks dApp Kit leakage specifically, while allowing legitimate World API hostnames.
- [x] `AUTH_DEV_MODE=true` and `VITE_REMOTE_DEV_AUTH=true` are blocked by `pnpm check:prod-auth`.
- [x] World API enrichment remains optional and is not used to infer Smart Assembly identity; dApp Kit remains the Smart Assembly authority. Evidence: Atlas [`679dd42f`](https://atlas.kodaxa.dev/api/records/679dd42f9b9014cf029d13bdde24af37eb5ec2402a384d385c1dec79dc92f0e1), Stillness World API records above.
- [x] Remote signals and audit logs preserve request-time character identity snapshots (`characterId`, `characterName`, `tribeId`, `identitySource`, `identityResolvedAt`) instead of assuming a wallet maps to the same character forever.
- [x] `/health` reports DB schema readiness against required migration `005_harden_signal_rls` without exposing `DATABASE_URL`.
