# Frontier Static Game Data

**Status date:** 2026-05-19

**Phase:** 14A-14B

**Goal:** Convert allowed alpha-stage client-mined Frontier data into compact site-intel enrichment for Signal Vault without treating it as identity, ownership, or Smart Assembly authority.

## Source Files

Local source files used for the first audit:

```txt
C:\Users\Justi\Downloads\ecosystem.json
C:\Users\Justi\Downloads\landscape.json
```

These files are intentionally not committed. The raw landscape file is large, and its permission model is alpha-stage and policy-sensitive.

## Provenance

Current provenance statement:

```txt
Source: user-provided EVE Frontier alpha client-mined data
Permission: user reports Jotunn stated in official Discord that alpha-stage data mining is currently acceptable
Stability: temporary; developers may tighten client-exposed data later
Public-doc verification: not independently confirmed in official public docs
```

Treat this as sanctioned alpha-context data, not a permanent public API contract.

## Local Audit

The first local audit found:

```txt
ecosystems: 15
systems: 23,991
asteroid belt groups: 43,731
trojan groups: 43,650
site placements: 122,951
missing ecosystem refs: 0
raw landscape size: 53.41 MB
estimated compact index: 5.68 MB JSON / 0.35 MB gzip
```

This makes the data useful for static site intelligence, but too large and too raw to ship directly in the web bundle.

## Generated Index

Build command:

```powershell
pnpm build:frontier-static-index -- --ecosystem C:\Users\Justi\Downloads\ecosystem.json --landscape C:\Users\Justi\Downloads\landscape.json
```

Default output:

```txt
data/frontier/derived/frontier-static-index.json
```

The generated index contains:

- schema version
- generation timestamp
- source/provenance metadata
- ecosystem summaries
- per-system site counts
- belt/trojan group counts
- danger-tagged group counts
- ecosystem IDs present per system
- tags present per system
- aggregate tag/ecosystem usage stats

It intentionally excludes raw coordinates, planet IDs, and per-site placement details in the first slice.

## Phase 14B Consumer

System dossiers now consume the compact index through an optional static asset:

```txt
/frontier-static-index.json
```

The browser app does not import the generated JSON into the JavaScript bundle.
If the asset is absent, malformed, or not deployed, the system dossier shows a
safe unavailable state and continues to render World API and local Signal data.

The system dossier panel displays only compact planning context:

- static site count
- belt group count
- trojan group count
- danger-tagged group count
- ecosystem names
- normalized static tags

This is intentionally a read-only display surface. It does not change current
system selection, remote sync, permissions, identity, or backend write behavior.

## Phase 14C Route Context

Route warnings now attach compact static site context when a warning already
exists for a system on the route. Static data does not create route warnings by
itself.

The route warning card may show:

- static site count
- belt group count
- trojan group count
- danger-tagged group count
- top normalized static tags

This preserves the warning source boundary:

```txt
local Signal = warning source
Frontier static index = advisory planning context
```

The UI labels this as static alpha game-data enrichment, not live system state.
Future route scoring work must keep that distinction explicit.

## Phase 14D Desktop Overlay Context

The browser companion publisher now includes optional current-system static
intel in the existing read-only desktop bridge state:

```txt
currentSystemStaticIntel
```

The desktop overlay displays the compact current-system site/danger summary
when the browser has the optional static index asset available. No new command
endpoint is added, and the desktop app still does not read the generated index
directly.

This preserves the bridge authority boundary:

```txt
browser app owns local/static Signal Vault state
desktop companion displays paired read-only state
desktop companion does not become game-data authority
```

## Authority Boundary

Allowed uses:

- system dossier enrichment
- route planning context
- static site expectation
- desktop overlay hints
- local-first field planning

Forbidden uses:

- wallet or character identity
- tribe membership
- ownership proof
- Smart Assembly authority
- remote write permission
- claims that a live system state must match the static index

Signal Vault must present this data as static alpha game-data enrichment, not live official World API state.

## Product Fit

Official EVE Frontier docs frame Frontier as a builder/dApp ecosystem and document both external dApp connection and assembly-launched in-game dApp surfaces. The in-game surface is tied to Smart Assembly interaction, not a general browser players can open anywhere.

That means the current product split remains correct:

```txt
browser app = full Signal Vault workspace
desktop companion = general in-play overlay and quick capture
assembly-launched dApp = contextual object dossier when available
static game data = system/site planning enrichment
```

## Evidence

| Claim | Evidence |
|---|---|
| Frontier is a builder/dApp ecosystem with programmable Smart Assemblies and on-chain entities. | EVE Frontier builder docs: https://docs.evefrontier.com/ |
| Current official resources list World API hosts and EVE Vault release location. | Resources: https://docs.evefrontier.com/tools/resources |
| External dApps use EVE Vault and `tenant` / `itemId` URL context. | External browser docs: https://docs.evefrontier.com/dapps/connecting-from-an-external-browser |
| In-game dApp access is assembly-launched, not a full general browser surface. | In-game docs: https://docs.evefrontier.com/dapps/connecting-in-game |
| EVE has precedent for static data exports as a third-party developer concept, but EVE Online SDE does not prove Frontier mined-data policy. | EVE static data docs: https://developers.eveonline.com/docs/services/static-data/ |

## Next Slices

1. **Future - Static Index Deployment Workflow**
   Decide whether release builds copy the compact generated index into the web static asset root.
