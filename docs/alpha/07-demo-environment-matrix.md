# Signal Vault — Demo Environment Matrix

Complete reference for every configurable env var. Organized by where it lives, what it does, and whether it is safe, required, or forbidden in each context.

**Legend:**  
✅ Safe to set / recommended  
⚠️ Dev-only — must not reach production  
❌ Not available / blocked  
— Not applicable / leave unset

---

## Web (Frontend) — Build-Time `VITE_*` Variables

These are baked into the web bundle at build time via `pnpm build`. They are readable by all browser users — do not put secrets here.

| Variable | Local-Only Demo | Remote Dev-Auth Demo | Production | Notes |
|----------|----------------|---------------------|------------|-------|
| `VITE_REMOTE_SYNC_URL` | — (leave unset) | ✅ Required — API base URL | ✅ Required | Preflight checks this before any network call. Unset = remote push disabled. |
| `VITE_REMOTE_DEV_AUTH` | — | ⚠️ `true` | ❌ Never | Enables static dev-credential shortcut. `check:prod-auth` blocks build if set. |
| `VITE_REMOTE_DEV_CHARACTER_JWT` | — | ⚠️ Required with dev auth | ❌ Never | Developer-supplied JWT decoded without signature verification. |
| `VITE_REMOTE_DEV_WALLET_SIGNATURE` | — | ⚠️ Required with dev auth | ❌ Never | Static wallet signature used in dev auth path. |
| `VITE_REMOTE_DEV_WALLET_ADDRESS` | — | ⚠️ Optional with dev auth | ❌ Never | Hint only — not authoritative. Server derives address from signature. |
| `VITE_REMOTE_DEV_SIGNATURE_MESSAGE` | — | ⚠️ Optional | ❌ Never | Defaults to `signal-vault:dev` if unset. |
| `VITE_WORLD_API_BASE_URL` | ✅ Optional | ✅ Optional | ✅ Optional | World API enrichment (solar systems, tribes, types). Falls back gracefully if unset. |
| `VITE_WORLD_API_ENV` | ✅ `utopia` | ✅ `utopia` | ✅ `stillness` or `utopia` | Selects the EVE Frontier environment. Defaults to `utopia`. Must be `stillness` or `utopia`. |
| `VITE_DEFAULT_TENANT` | ✅ `utopia` | ✅ `utopia` | ✅ per env | EVE tenant for entity resolution context. Defaults to `utopia`. |
| `VITE_API_URL` | — | ✅ Optional | ✅ Optional | General API base URL. Used separately from `VITE_REMOTE_SYNC_URL` for non-signal endpoints. |
| `VITE_GRAPHQL_URL` | — | ✅ Optional | ✅ Optional | GraphQL endpoint (EVE Frontier). Optional enrichment path. |

### Safe local-only `.env.local` (web)

```ini
VITE_WORLD_API_BASE_URL=https://world-api.evefrontier.com
VITE_WORLD_API_ENV=utopia
VITE_DEFAULT_TENANT=utopia
```

No remote sync vars. No dev auth vars. Safe to share.

### Dev-auth demo `.env.local` (web)

```ini
VITE_REMOTE_SYNC_URL=http://localhost:3001
VITE_REMOTE_DEV_AUTH=true
VITE_REMOTE_DEV_CHARACTER_JWT=<dev-jwt-here>
VITE_REMOTE_DEV_WALLET_SIGNATURE=<dev-sig-here>
VITE_REMOTE_DEV_SIGNATURE_MESSAGE=signal-vault:dev
VITE_WORLD_API_BASE_URL=https://world-api.evefrontier.com
VITE_WORLD_API_ENV=utopia
VITE_DEFAULT_TENANT=utopia
```

⚠️ Never commit this file. Never use in a production build.

---

## API (Backend) — Runtime Environment Variables

Server-side only. Never exposed to the browser.

| Variable | Local Dev | Remote Dev-Auth Demo | Production | Notes |
|----------|-----------|---------------------|------------|-------|
| `AUTH_DEV_MODE` | ⚠️ `true` | ⚠️ `true` | ❌ Never `true` | Disables real signature verification. `check:prod-auth` blocks build if set. Must be `false` in production Sui mode. |
| `DATABASE_URL` | ✅ Required | ✅ Required | ✅ Required | Postgres connection string. Required for signal persistence. |
| `ENABLE_REMOTE_SIGNAL_WRITES` | ✅ `true` (dev) | ✅ `true` | ✅ `true` when ready | Must be `true` for POST /api/v1/signals to work. Defaults to `false`. |
| `ENABLE_SUI_CHARACTER_RESOLUTION` | — | ⚠️ Optional | ✅ `true` | Activates Sui PlayerProfile identity path. When `true` + `AUTH_DEV_MODE=false`: dev JWT rejected, Sui failure → 401. |
| `SUI_GRAPHQL_URL` | — | ⚠️ Optional | ✅ Optional | Defaults to `https://graphql.testnet.sui.io/graphql` (Stillness / Sui testnet). Set explicitly for non-Stillness environments. |
| `PORT` | ✅ Optional | ✅ Optional | ✅ Optional | Defaults to 3001 if unset. |
| `NODE_ENV` | `development` | `development` | `production` | Affects logging and error detail. |
| `JWT_SECRET` | ⚠️ Optional | ⚠️ Optional | — | HS256 secret for dev JWTs. Not used when Sui identity is the active path. |
| `JWT_JWKS_URL` | — | — | ❌ Not yet available | Production JWT verification via JWKS endpoint. Blocked pending EVE/CCP issuer. |
| `JWT_ISSUER` | — | — | ❌ Not yet available | Validated `iss` claim. Required in production mode when JWKS is available. |
| `JWT_AUDIENCE` | — | — | ❌ Not yet available | Validated `aud` claim. Required in production mode when JWKS is available. |
| `SUPABASE_URL` | ✅ Optional | ✅ Optional | ✅ Optional | Supabase project URL if using Supabase as Postgres host. |
| `SUPABASE_ANON_KEY` | ✅ Optional | ✅ Optional | ✅ Optional | Supabase anon key (safe to expose). |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Optional | ✅ Optional | ✅ Required if RLS | Service role key — never expose to frontend. |

### Safe dev-auth demo `.env` (API)

```ini
AUTH_DEV_MODE=true
DATABASE_URL=postgresql://localhost:5432/signal_vault_dev
ENABLE_REMOTE_SIGNAL_WRITES=true
PORT=3001
NODE_ENV=development
```

⚠️ Never deploy with `AUTH_DEV_MODE=true`.

### Production Sui identity `.env` (API)

```ini
AUTH_DEV_MODE=false
ENABLE_SUI_CHARACTER_RESOLUTION=true
SUI_GRAPHQL_URL=https://graphql.testnet.sui.io/graphql
DATABASE_URL=postgresql://...
ENABLE_REMOTE_SIGNAL_WRITES=true
PORT=3001
NODE_ENV=production
```

With this configuration:
- Character identity is resolved from on-chain Sui data (wallet → PlayerProfile → Character)
- Requests must include `X-Wallet-Signature`, `X-Challenge-Id`, `X-Wallet-Address` — **no `Authorization: Bearer` header**
- Any request that includes a Bearer token returns `401 auth_mode_conflict` immediately (before Sui is queried)
- `tribe_id` is Sui-derived; no dev credentials required

---

## Feature Availability by Environment

| Feature | No backend | Local-only build | Dev-auth build + API |
|---------|-----------|-----------------|---------------------|
| Signal creation | ✅ | ✅ | ✅ |
| Local persistence (IndexedDB) | ✅ | ✅ | ✅ |
| Staleness tracking | ✅ | ✅ | ✅ |
| Dossier views | ✅ | ✅ | ✅ |
| Export / Import | ✅ | ✅ | ✅ |
| World API enrichment | ❌ | ✅ (if configured) | ✅ (if configured) |
| InGame wallet context | ❌ | ✅ (in-game browser) | ✅ (in-game browser) |
| Remote push button | ❌ | ❌ (URL not set) | ✅ |
| Remote saved badge | ❌ | ❌ | ✅ |
| Retry panel (sync_failed) | ❌ | ❌ | ✅ |
| Tribe-scoped remote push | ❌ | ❌ | ✅ Sui-derived tribeId (when `ENABLE_SUI_CHARACTER_RESOLUTION=true`) / ⚠️ Dev JWT tribeId (dev-auth mode) |
| Real wallet signing | ❌ | ❌ | ⚠️ Adapter ready; EVE provider required |
| Server-side character identity | ❌ | ❌ | ✅ Sui PlayerProfile resolution (when `ENABLE_SUI_CHARACTER_RESOLUTION=true`) |
| Wallet → character lookup (Sui) | ❌ | ❌ | ✅ `https://graphql.testnet.sui.io/graphql` — public, no auth |
| Wallet → character lookup (gateway) | ❌ | ❌ | ❌ Blockchain gateway externally firewalled; World API has no smartcharacter endpoint |
| CCP JWT character token | ❌ | ❌ | ❌ JWT issuer unavailable — `trusted_character_jwt` path blocked |
| Background sync | ❌ | ❌ | ❌ Not implemented |
| Remote pull | ❌ | ❌ | ❌ Not implemented |
| Scout cell scope | ❌ | ❌ | ❌ Locked |

---

## Health Check

When the API is running, check its status:

```
GET /health

{
  "status": "ok",
  "version": "0.0.1",
  "phase": "09L2",
  "db": "connected" | "not_connected",
  "writesEnabled": true | false,
  "identity": {
    "mode": "sui_player_profile" | "dev_character_jwt" | "none",
    "suiEnabled": true | false,
    "suiGraphqlUrl": "https://..." | null,
    "authDevMode": true | false
  },
  "requestId": "..."
}
```

Remote push requires `db: "connected"` and `writesEnabled: true`. Check `identity.mode` to confirm the active identity path. `suiEnabled: true` + `authDevMode: false` = production Sui mode. The preflight check in the web client queries this endpoint before every push attempt.

---

## Guardrails Reference

| Command | When to run | What it checks |
|---------|------------|----------------|
| `pnpm check:prod-auth` | Before any production build | `AUTH_DEV_MODE` and `VITE_REMOTE_DEV_AUTH` are unset |
| `pnpm check:bundle-clean` | After `pnpm build` | Main chunk has 0 dApp Kit refs |
| `pnpm check:docs` | Before any demo or release | Alpha docs have no stale phrases, required phrases present |
| `pnpm check:lines` | Any time | All source files under 400 lines |
| `pnpm check:release` | Full pre-release gate | Web/API typecheck, web/API/script tests, web build, then release guardrails |
| `pnpm check:world-env` | Before Stillness production release | Set `SIGNAL_VAULT_RELEASE_ENV=stillness`; requires Stillness tenant, World API env, and confirmed Stillness World API host |
| `node scripts/print-alpha-demo-status.mjs` | Before a demo | Current environment summary and demo path recommendation |
