# Data Sources

Signal Vault has multiple data tiers.

## Tier 1: Manual Player Intel

This is the MVP source.

Includes:

- manual object labels
- manual gate reports
- manual market reports
- manual storage manifests
- manual route notes
- screenshots later
- local/private Signals

Manual intel is valid but must be labeled.

## Tier 2: EVE dApp Kit / Smart Object Context

Used for:

- object context
- wallet connection
- Smart Assembly data
- dApp URL/env object config
- possible sponsored transactions later

This is the preferred first integration layer.

## Tier 3: Sui GraphQL / On-Chain Reads

Used for:

- object type verification
- object existence
- owner/state lookup
- character resolver
- PlayerProfile lookup
- assembly resolver
- event lookup

## Tier 4: Custom Indexer

Used later for:

- event ingestion
- historical gate traversal
- deployment changes
- inventory update signals
- route reliability
- entity timelines
- faster dossier queries

## Tier 5: Optional Signal Bridge

Used later for:

- local game log watching
- current system detection
- route progress
- overlay hints
- hotkey capture

## Data Trust Levels

```txt
Manual: useful but subjective
Cached: previously known, may be stale
Indexed: system-derived from backend/indexer
On-chain verified: strongest entity/object basis
Conflicted: sources disagree
Unknown: unresolved
```

## Important Rule

Signal Vault must never pretend manual observations are API-confirmed or on-chain verified.
