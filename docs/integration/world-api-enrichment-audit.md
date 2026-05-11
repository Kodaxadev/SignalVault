# World API Enrichment Audit — Phase 10A

**Date**: 2026-05-10
**Status**: Confirmed

## Environment Configuration

| Environment | Base URL | Status |
|---|---|---|
| Utopia (sandbox) | `https://world-api-utopia.uat.pub.evefrontier.com` | Confirmed |
| Stillness (live) | `https://world-api-stillness.live.tech.evefrontier.com` | Confirmed via Atlas |

## Confirmed Endpoint Paths

All endpoints verified against live Utopia API and Atlas corpus records.

### Solar Systems
- `GET /v2/solarsystems` — list solar systems (paginated, metadata.total=24502)
- `GET /v2/solarsystems/{id}` — solar system detail

**Response shape (list):**
```json
{
  "data": [
    { "id": 30000001, "name": "A 2560", "constellationId": 20000001, "regionId": 10000001, "location": { "x": ..., "y": ..., "z": ... } }
  ],
  "metadata": { "total": 24502, "limit": 100, "offset": 0 }
}
```

**Response shape (detail):**
```json
{
  "id": 30000001,
  "name": "A 2560",
  "constellationId": 20000001,
  "regionId": 10000001,
  "location": { "x": ..., "y": ..., "z": ... },
  "gateLinks": []
}
```

### Tribes
- `GET /v2/tribes` — list tribes (metadata.total=23)
- `GET /v2/tribes/{id}` — tribe detail

**Response shape (list):**
```json
{
  "data": [
    { "id": 1000044, "name": "NPC Corp 1000044", "nameShort": "SAK", "description": "", "taxRate": 0, "tribeUrl": "" }
  ],
  "metadata": { "total": 23, "limit": 100, "offset": 0 }
}
```

### Types
- `GET /v2/types` — list game types (paginated, metadata.total=392+)
- `GET /v2/types/{id}` — type detail

**Response shape (list):**
```json
{
  "data": [
    { "id": 72244, "name": "Feral Data", "description": "", "mass": 0.1, "radius": 1, "volume": 0.1, "portionSize": 1, "groupName": "Rogue Drone Analysis Data", "groupId": 0, "categoryName": "Commodity", "categoryId": 17, "iconUrl": "" }
  ],
  "metadata": { "total": 392, "limit": 100, "offset": 0 }
}
```

## Implemented in 10A

- Solar systems list/detail fetch + Zod extraction
- Tribes list/detail fetch + Zod extraction
- Types list/detail fetch + Zod extraction
- `gateLinks` captured for topology context

## Deferred

- Ships (`/v2/ships/{id}`) — ship fitting enrichment
- POD verify (`POST /v2/pod/verify`) — authenticated, evidence semantics
- Character jumps (`GET /v2/characters/me/jumps`) — authenticated
- Prices/markets — not in scope
- Constellations/regions — may be useful later

## Authority Model

World API data is **enrichment only** — it does not replace entity resolution or manual Signals.
- Official data contextualizes: "what does the world say this system/type/tribe is?"
- Manual Signals answer: "what did players observe?"
- Both appear side-by-side in dossiers

## Priority Ordering (future 10B)

`world_api` EntityResolutionSource reserved at priority 75 (below dappkit_current_object at 80, above user_manual at 30). Not implemented in 10A.

## Failure Degradation

World API loading failure must never hide:
- Local Signals
- Manual classifications
- SignalList
- Quick actions
- Dossier warnings
