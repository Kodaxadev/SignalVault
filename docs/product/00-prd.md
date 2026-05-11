# Product Requirements Document: Signal Vault

## Product Name

**Signal Vault**

## Product Category

In-game-first intelligence, field-memory, and dossier dApp for **EVE Frontier**.

## Problem

EVE Frontier players will rely on scattered memory, Discord messages, spreadsheets, screenshots, external maps, and fragmented note-taking to track critical information:

- where storage is located
- which gates work
- which gates require permits or tolls
- which markets are open or closed
- which systems are dangerous
- which players or tribes are trusted or hostile
- which route was recently verified
- which intel is stale or contradicted

The existing note concept is not enough for a persistent, player-shaped universe where information can change, decay, and become strategically valuable.

## Core User Need

Players need to capture and consume actionable field knowledge **without constantly tabbing out of the game**.

## Product Thesis

Signal Vault turns notes into **Signals**: typed, entity-linked, confidence-aware field records attached to EVE Frontier objects and gameplay contexts.

A Signal can be attached to:

- Smart Gate
- Smart Storage Unit
- Smart Turret
- Network Node
- system
- route
- market
- character
- tribe
- wallet
- item
- event
- unknown object

## Primary Surfaces

### 1. In-Game Mode

Compact pages opened from EVE Frontier Smart Assembly dApp URLs.

Primary actions:

- view public object dossier
- connect or restore identity
- log quick Signal
- see warnings
- see confidence/staleness
- see unresolved/verified object status

### 2. External App Mode

Full browser interface for:

- editing Signals
- managing entity registry
- generating in-game access codes
- tribe vault administration
- search
- templates
- import/export
- audit views

### 3. Optional Later: Signal Bridge

Desktop helper for:

- current system detection
- route context
- quick hotkey capture
- optional overlay cards
- map handoff

## MVP Scope

Signal Vault v0.1 is **In-Game Object Notes**.

It must support:

- `/ingame/object?tenant=&itemId=`
- anonymous public dossier
- unknown object fallback
- manual object classification
- quick Signal capture
- local/private/public visibility
- viewer context
- in-game access-code fallback
- entity resolution confidence
- basic Signal list by object
- staleness badge
- JSON export/import or local backup

## Out of Scope for v0.1

- full graph view
- AI summarization
- intel marketplace
- direct map control
- direct game client UI injection
- complex smart contracts
- tribe governance
- automatic inventory truth claims
- fully automated route planner

## User Personas

### Solo Scout

Needs quick logs while exploring systems, gates, markets, and storage.

### Hauler

Needs route safety, market status, storage/fuel cache records, and warnings.

### Tribe Officer

Needs tribe-scoped knowledge, access control, route doctrine, and auditability.

### Builder / Operator

Needs object-specific dossiers for Smart Assemblies, gates, storage units, and infrastructure.

### Intelligence Player

Needs player/tribe dossiers, confidence states, contradictions, and sealed future intel.

## Core Jobs To Be Done

1. When I interact with a Smart Assembly, I want to see what my vault knows about it.
2. When a gate blocks me, I want to log that result in one click.
3. When a market is closed, I want to attach that fact to the system/market.
4. When I find storage, I want to remember where it is and who can access it.
5. When intel is old, I want the app to warn me before I trust it.
6. When reports disagree, I want the conflict surfaced instead of hidden.
7. When I am in-game, I want a compact interface, not a full productivity app.

## Success Criteria

Signal Vault succeeds if a player can:

- open an object dossier in-game
- understand whether the object is unresolved, manual, indexed, or verified
- capture a useful Signal in less than 10 seconds
- use the external app to organize and search Signals
- avoid acting on stale or contradicted intel
- preserve local notes even when identity is unavailable
