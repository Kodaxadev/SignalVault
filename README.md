<div align="center">

# Signal Vault

**Your field intelligence layer for EVE Frontier.**

Know what you're looking at. Know what others have seen. Never fly blind.

[![Status](https://img.shields.io/badge/status-alpha-orange)]()
[![Tests](https://img.shields.io/badge/tests-921_passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Local First](https://img.shields.io/badge/data-local--first-purple)]()

</div>

---

Signal Vault turns your observations into structured intel — logged at the point of encounter, graded by confidence, tracked for freshness, and surfaced as dossiers when you need them. It works in your browser today, with a desktop companion overlay for in-play use.

Your data stays on your machine until you choose to share it. No accounts required. No background sync. No telemetry.

---

## What Can It Do?

When you encounter a gate, storage unit, system, or route, Signal Vault answers:

**What is this?** — Automatically identifies entities from multiple sources, with a confidence-ranked resolution pipeline.

**What do we know?** — Shows all intel collected on the entity: signals from you and your tribe, contradiction flags when reports disagree, and overall intel health.

**How fresh is it?** — Every signal type has a staleness threshold. Hostile contact reports expire in 24 hours. Field notes last for days. You always know how current your intel is.

**Who reported it?** — Every signal is wallet-bound. You see who reported what, and at what confidence level: *observed*, *inferred*, *rumor*, or *unverified*.

**What can I log right now?** — One-click quick actions pre-filled with your current in-game context. Get the intel recorded and get back to flying.

---

## Signal Types

### Movement & Access
- **Gate Recon** — Gate status, access conditions, activity
- **Route Report** — Route viability, hazards, travel time
- **Permit Report** — Access permissions, toll status
- **Access Denied** — Blocked entry, denial conditions

### Resources & Trade
- **Storage Manifest** — Contents, capacity, ownership
- **Market Report** — Prices, availability, trends
- **Resource Report** — Resource locations and yields

### Threat
- **Hostile Contact** — Enemy sightings, fleet composition, behavior
- **After Action Report** — Engagement outcomes, losses, lessons

### General
- **Field Note** — Freeform observations
- **System Report** — System-level conditions and activity
- **Assembly Log** — Assembly status and changes

---

## Dossiers

Every entity gets a dossier — a living intel file that aggregates all signals, shows a timeline of reports, flags contradictions, and pulls in official game data when available. Gates, storage units, markets, systems, routes, tribes, and unknown objects all have dedicated layouts.

---

## How It Works

**Browser app** — Open Signal Vault in any modern browser. Log signals, browse dossiers, export and import your data. No backend needed.

**Desktop companion** — A lightweight overlay that sits on top of EVE Frontier. Toggle it with `Ctrl+Shift+V`, log intel without leaving the game. Sits in your system tray when not in use.

**Smart Object context** — When opened from within EVE Frontier, Signal Vault automatically knows what you're looking at and pre-fills context for faster logging.

**Remote sync** *(optional, alpha)* — Push signals to a shared backend for tribe-level intel. Requires Sui wallet authentication — your identity is verified on-chain, no centralized accounts.

---

## Your Data, Your Rules

- Everything works offline and locally by default
- No accounts, no sign-ups, no tracking
- Remote sharing is always manual and opt-in
- Signals have visibility scopes: keep them private, share with your tribe, or make them public
- Tribe access is verified on-chain from Sui character data — no centralized auth server decides who's in your tribe

---

## Getting Started

### Browser (quickest)

```bash
git clone https://github.com/Kodaxadev/SignalVault.git
cd SignalVault
pnpm install
pnpm dev
```

Open `http://localhost:5173` and you're in. No backend, no config, no accounts.

### Desktop Companion

Requires [Rust toolchain](https://rustup.rs/) in addition to Node/pnpm.

```bash
pnpm --filter desktop tauri:dev
```

### Remote Sync (optional)

For tribe-level shared intel, you'll need Postgres and some environment config. See the [environment matrix](docs/alpha/07-demo-environment-matrix.md) for full setup.

**Prerequisites:** Node 24+, [pnpm](https://pnpm.io/) 9+, Rust toolchain (desktop only)

---

## Tech Stack

<details>
<summary>For the technically curious</summary>

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, React Router, TanStack Query, Tailwind CSS |
| Desktop | Tauri 2 (Rust + WebView2) |
| Local storage | Dexie (IndexedDB) |
| Validation | Zod |
| Backend | Hono, Postgres |
| Identity | Sui GraphQL (on-chain wallet verification) |
| EVE integration | `@evefrontier/dapp-kit` (in-game context only) |
| Monorepo | pnpm workspaces |
| Testing | Vitest + Testing Library (921 tests passing) |

### Architecture

```
Signal Vault
├── apps/web          Browser app — signals, dossiers, export/import
├── apps/desktop      Desktop companion overlay (Tauri 2)
└── apps/api          Shared backend for tribe sync (Hono + Postgres)
```

**Entity resolution** merges claims from multiple sources by priority — on-chain verification beats URL hints. The winning claim sets entity type and label.

**World API cache** keeps solar system, tribe, and game type data in IndexedDB with smart TTLs. If the network drops, you see stale data instead of a blank screen.

**Chunk isolation** ensures the EVE Frontier dApp Kit only loads when needed — the main app bundle stays clean and fast.

</details>

---

## Project Status

Signal Vault is in **internal alpha**. Local features are complete and stable. Remote sync works under Sui identity (dev-validated). Production wallet verification is unit-tested; live EVE Vault / zkLogin fixture validation is pending before public release.

See the [alpha release readiness doc](docs/alpha/01-alpha-release-readiness.md) for the full picture.

---

## Documentation

| Guide | For |
|---|---|
| [Alpha Player Guide](docs/alpha/00-alpha-guide.md) | New users — what works, what doesn't, how to back up |
| [Player FAQ](docs/alpha/05-player-facing-faq.md) | Common questions, answered plainly |
| [Known Limitations](docs/alpha/03-known-limitations.md) | What's missing and when it's coming |
| [Demo Checklist](docs/alpha/06-demo-operator-checklist.md) | Running a demo for others |
| [Environment Matrix](docs/alpha/07-demo-environment-matrix.md) | Full env var reference for all modes |
| [Frontier Static Data](docs/integration/frontier-static-game-data.md) | Game data integration guide |

---

## Trust & Privacy Commitments

These are unconditional — they don't change for demos, edge cases, or convenience:

- **No background sync.** You push intel manually. No queues, no automatic retry, no silent writes.
- **No dev-auth in production.** Development shortcuts are blocked from production builds by automated checks.
- **Game data doesn't guess identity.** The World API tells us what *type* of thing something is — never which specific smart gate or storage unit. Only the dApp Kit has that authority.
- **Audit trail, not audit theater.** Known dependency advisories are tracked openly, not suppressed.

---

## Contributing

Signal Vault is in early alpha. If you're interested in contributing, open an issue to discuss before submitting a PR.

```bash
pnpm test:run       # web tests
pnpm test:api       # api tests
pnpm check:release  # full release gate check
```

---

## License

MIT

---

<div align="center">

*Signal stale. Reconfirm before acting.*

</div>
