# Signal Vault

**Field intelligence for EVE Frontier.**

Signal Vault is a field-first intel layer that turns observations into structured, entity-linked field Signals — logged at the point of encounter, graded by confidence, tracked for staleness, and surfaced as object dossiers when you need them.

It runs as a standalone browser tool today, with Smart Object context available through URL/object parameters and EVE Frontier dApp Kit paths where a supported provider exists. The in-play direction is a lightweight desktop companion overlay, not a replacement dApp browser. Everything is local-first: your data stays in your browser until you choose to relay it.

---

## What It Does

When you interact with a gate, storage unit, system, or route, Signal Vault answers:

- **What is this?** — entity classification from multiple sources (dApp Kit, World API, manual)
- **What do we know?** — aggregated Signals, intel health, contradiction flags
- **How fresh is it?** — per-type staleness thresholds (hostile contact goes stale in 24h; field notes last days)
- **Who reported it?** — wallet-bound authorship, confidence levels (observed / inferred / rumor / unverified)
- **What can I log right now?** — 12 signal types, quick-action buttons, in-game context pre-filled

### Signal Types

| Category | Types |
|---|---|
| Movement & Access | Gate Recon, Route Report, Permit Report, Access Denied |
| Resources & Trade | Storage Manifest, Market Report, Resource Report |
| Threat | Hostile Contact, After Action Report |
| General | Field Note, System Report, Assembly Log |

### Dossiers

Each entity has a dossier — aggregated intel panel with signal timeline, staleness summary, contradiction badges, and official World API enrichment. Gate, Storage, Market, System, Route, Tribe, Object, and Unknown types all have dedicated dossier layouts.

### Visibility & Scope

Signals are scoped: `local_private` / `private` / `public` / `tribe` / `officer`. Tribe-scoped signals route through the policy engine — membership verified server-side from on-chain Sui character data, no CCP JWT required.

---

## Architecture

```
Signal Vault
├── apps/web          React + Vite + Tailwind — local-first frontend
│   ├── Object shell  Smart Object context route for field dossiers
│   ├── Browser app   Standalone browser — signal log, dossiers, export/import
│   ├── Companion     Planned desktop overlay bridge for in-play intel
│   └── /compat       Browser diagnostics page
│
└── apps/api          Hono + Postgres — remote push backend
    ├── Auth          Sui wallet challenge/response + character resolution
    ├── Signals       Policy-gated write with audit log
    └── Identity      sui_player_profile → characterId + tribeId (on-chain)
```

**Local-first by default.** Every feature works without the backend. Remote push is manual, single-signal, and labeled alpha.

**Chunk isolation.** The EVE Frontier dApp Kit (`@evefrontier/dapp-kit`) loads only in the InGame route chunk. The main app bundle has zero dApp Kit references — verified on every build.

**Entity resolution pipeline.** Claims from multiple sources are merged by priority: `onchain_verified` (100) › `dappkit_current_object` (80) › `world_api` (75) › `user_manual` (30) › `url_hint` (10). The winning claim sets entity type and label.

**World API cache.** Solar system, tribe, and game type data is cached in IndexedDB (30-min TTL for systems and tribes; 24h for types). Dossier enrichment degrades to stale cache on network failure rather than going blank.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, React Router, TanStack Query, Tailwind CSS |
| Local storage | Dexie (IndexedDB) |
| Validation | Zod |
| Backend | Hono, Postgres, `pg` |
| Identity | Sui GraphQL — wallet → PlayerProfile → Character (on-chain) |
| EVE integration | `@evefrontier/dapp-kit` (InGame only) |
| Monorepo | pnpm workspaces |
| Testing | Vitest + Testing Library |

---

## Status

**Internal alpha.** Local-first features are complete. Remote sync is functional under Sui identity mode (dev-validated) and dev-auth mode. Production wallet signature verification is unit-tested for Sui personal messages; live EVE Vault / zkLogin fixture validation remains before public production.

| Gate | Result |
|---|---|
| TypeScript | 0 errors |
| Web tests | 658 passed |
| API tests | 228 passed / 5 skipped |
| Main bundle dApp Kit refs | 0 |
| All files | ≤ 400 lines |
| Dependency audit | 2 moderate dev-tool advisories tracked as follow-up |

---

## Getting Started

**Prerequisites:** Node >=24, pnpm 9+

```bash
# Install
pnpm install

# Web app (local-first, no backend needed)
pnpm dev

# API backend
pnpm dev:api

# Type check
pnpm --filter web tsc --noEmit
pnpm typecheck:api

# Tests
pnpm test:run      # web
pnpm test:api      # api

# Release gates (typecheck, tests, build, then release guardrails)
pnpm check:release
```

**World API** (optional enrichment — solar systems, tribes, types):

```bash
# apps/web/.env.local
VITE_WORLD_API_BASE_URL=https://world-api-stillness.live.tech.evefrontier.com
VITE_WORLD_API_ENV=stillness
```

**Remote push** (optional — requires backend + Postgres):

```bash
# apps/api/.env
DATABASE_URL=postgres://...
ENABLE_REMOTE_SIGNAL_WRITES=true
AUTH_DEV_MODE=true               # dev only — never production
```

See [`docs/alpha/07-demo-environment-matrix.md`](docs/alpha/07-demo-environment-matrix.md) for the full environment reference.

---

## Docs

| Document | What it covers |
|---|---|
| [`docs/alpha/01-alpha-release-readiness.md`](docs/alpha/01-alpha-release-readiness.md) | What is ready, what is not, what must not ship |
| [`docs/alpha/03-known-limitations.md`](docs/alpha/03-known-limitations.md) | Current limitations and paths to resolution |
| [`docs/alpha/05-player-facing-faq.md`](docs/alpha/05-player-facing-faq.md) | Player-facing questions, answered plainly |
| [`docs/alpha/06-demo-operator-checklist.md`](docs/alpha/06-demo-operator-checklist.md) | Pre-demo checklist, path A and B |
| [`docs/backend/16-character-token-contract.md`](docs/backend/16-character-token-contract.md) | Identity contract and Sui resolution status |
| [`docs/backend/18-production-identity-mode.md`](docs/backend/18-production-identity-mode.md) | Production Sui auth — no Bearer header, wallet-sig only |
| [`docs/backend/22-sui-identity-validation-results.md`](docs/backend/22-sui-identity-validation-results.md) | Validation run results (dev-validated 2026-05-11) |

---

## Hard Invariants

These are unconditional. They do not change for demos, edge cases, or convenience:

- **No background sync.** Manual push only. No queue, no automatic retry, no silent writes.
- **No dev-auth in production.** `AUTH_DEV_MODE=true` and `VITE_REMOTE_DEV_AUTH=true` are blocked by `pnpm check:prod-auth`.
- **Chunk isolation.** dApp Kit must not appear in the main bundle. Enforced by `check:bundle-clean`.
- **World API does not infer Smart Assembly identity.** Type data from the World API claims `item` only — never `smart_gate`, `smart_storage_unit`, `market`, or `smart_turret`. The dApp Kit is the authority for Smart Assembly classification.
- **Lint is not a release gate yet.** The current lint script is a placeholder until a real lint configuration is added.
- **Audit advisories are tracked, not hidden.** Current moderate Vite/esbuild dev-tool advisories require a separate dependency maintenance pass.

---

*Signal stale. Reconfirm before acting.*
