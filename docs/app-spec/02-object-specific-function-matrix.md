# Object-Specific Function Matrix

## Purpose

This matrix defines what Signal Vault should do for each major in-game object/context.

| Object / Context | View | Capture | Actions | Signals | MVP |
|---|---|---|---|---|---|
| Unknown Object | Unknown dossier | Field note | classify, connect identity, log local Signal | field_note | Yes |
| Smart Gate | Gate dossier | gate recon | passed, blocked, permit, toll, hostile | gate_recon, permit_report, access_denied, hostile_contact | Yes |
| Smart Storage Unit | Storage dossier | storage note | access worked, denied, manifest, empty | storage_manifest, access_denied | Yes |
| Smart Turret | Turret dossier | defense note | active, inactive, hostile zone, owner note | assembly_log, hostile_contact | Later |
| Network Node | Node dossier | network note | online, offline, owner note, dependency note | assembly_log | Later |
| Market | Market dossier | market report | open, closed, liquidity, trade note | market_report, trade_report | Yes/manual |
| System | System dossier | system report | hostile, resource, storage, market, route note | system_report, resource_report | Yes |
| Route | Route dossier | route report | safe, unsafe, stale, blocked hop | route_report, gate_recon | Yes |
| Character | Character dossier | encounter note | standing, trade reliability, hostile contact | player_dossier, hostile_contact | Later |
| Tribe | Tribe dossier | diplomacy note | standing, policy note, activity report | tribe_dossier | Later |
| Item | Item note | item note | price, storage, source, use | field_note, market_report | Later |
| Transaction/Event | Event note | evidence note | link/corroborate Signal | assembly_log, gate_recon | Later |

## Smart Gate

### Required MVP

- show type/confidence
- show recent gate Signals
- quick actions:
  - Passed
  - Blocked
  - Permit Required
  - Hostile Nearby
- staleness badge
- contradiction badge

### Later

- last successful event
- last failed event
- permit metadata
- owner/operator rules
- FrontierWarden policy link

## Smart Storage Unit

### Required MVP

- show type/confidence
- show recent storage Signals
- quick actions:
  - Access Worked
  - Access Denied
  - Update Manifest
  - Mark Empty
- manual manifest status
- staleness badge

### Later

- API-confirmed inventory context if allowed
- vending/trade behavior
- owner/operator rules

## Market

### Required MVP

- manual market reports
- open/closed status
- good/poor liquidity
- link to system/route

### Later

- price history
- custom currency context
- trade route suggestions

## Route

### Required MVP

- route manual creation
- linked gates/systems
- route risk
- stale linked Signals
- blocked hop list

### Later

- map handoff
- route planner integration
- Signal Bridge current-route tracking

## System

### Required MVP

- system dossier
- linked storage/gates/markets/routes
- recent warnings

### Later

- current system auto-detection
- map integration
- region clustering

## Character / Tribe

### Required MVP

Not required for v0.1.

### Later

- subjective standing
- encounter history
- source reliability
- diplomacy notes
- role-based visibility
