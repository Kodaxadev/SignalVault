# Complete App Function Inventory

## Purpose

This document defines every major function Signal Vault should support, grouped by player need and in-game context.

Signal Vault is not a passive note app. It is an in-game-first field intelligence system.

## Function Groups

1. Identity and Session Functions
2. Object Context Functions
3. Signal Capture Functions
4. Dossier Functions
5. Gate Functions
6. Storage Functions
7. Market Functions
8. Route Functions
9. System Functions
10. Character and Tribe Intel Functions
11. Search and Recall Functions
12. Staleness and Confidence Functions
13. Contradiction Functions
14. Tribe Vault Functions
15. Operator Functions
16. Map and Bridge Functions
17. Import/Export Functions
18. Admin/Moderation Functions

---

# 1. Identity and Session Functions

## View Public Dossier as Anonymous

Allows a player to open Signal Vault from in-game and see public object information without logging in.

Required because opening a dApp URL proves context, not identity.

## Connect Wallet / EVE Vault

Allows player to connect wallet in external browser or in-game browser if supported.

## Generate In-Game Access Code

External browser creates one-time code for in-game browser session linking.

## Consume In-Game Access Code

In-game browser uses access code to restore wallet/character session.

## Resolve Character

Maps wallet to EVE Frontier character when possible.

## Resolve Tribe

Maps character to current tribe when possible.

## Revoke Session

Allows user to revoke in-game/browser sessions.

## Viewer Badge

Always shows:

- Anonymous
- Wallet connected
- Character resolved
- Tribe resolved
- Role status if known

---

# 2. Object Context Functions

## Open Object Dossier

Entry point:

```txt
/ingame/object?tenant=&itemId=
/ingame/object/:objectId
```

## Resolve Object

Attempts to classify object as:

- Smart Gate
- Smart Storage Unit
- Smart Turret
- Network Node
- Character
- Tribe
- Market
- Route
- System
- Unknown

## Manual Classify Object

Allows authenticated user to classify unresolved object.

## Show Classification Confidence

Always displays:

- Unknown
- URL hint
- Manual
- Cached
- Indexed
- On-chain verified
- Conflicted

## Report Classification Issue

User can flag incorrect object type.

## Promote Classification

Verified/indexed data upgrades object confidence.

---

# 3. Signal Capture Functions

## Quick Signal Capture

One-click buttons create typed Signals.

## Custom Signal Capture

Player enters title/body/type/confidence/visibility.

## Attach Signal to Current Object

Automatically links Signal to current dossier entity.

## Attach Signal to Multiple Entities

External app can link one Signal to system + gate + route + market, etc.

## Save Local Draft

Anonymous or offline capture persists locally.

## Publish Signal

Authenticated user publishes to remote private/public/tribe scope.

## Edit Signal

Author or authorized role edits Signal.

## Delete / Retract Signal

Soft deletion for remote Signals; local deletion for local-only drafts.

## Change Visibility

Allowed only if permission engine allows.

---

# 4. Dossier Functions

## Object Dossier

Aggregates Signals by object.

## Gate Dossier

Specialized view for gate access/risk/route.

## Storage Dossier

Specialized view for storage access/manifest/purpose.

## Market Dossier

Specialized view for market status/trade usefulness.

## Route Dossier

Aggregates gates, systems, risk, stale reports.

## System Dossier

Aggregates all local Signals for a system.

## Character Dossier

Subjective trust and encounter record for a character.

## Tribe Dossier

Subjective trust, diplomacy, operator, and encounter record for a tribe.

## Unknown Dossier

Safe fallback for unresolved objects.

---

# 5. Gate Functions

## Log Gate Passed

Creates a gate_recon Signal with status `passed`.

## Log Gate Blocked

Creates a gate_recon/access_denied Signal with status `blocked`.

## Log Permit Required

Creates permit_report Signal.

## Log Toll Suspected

Creates gate_recon or permit_report Signal with toll tag.

## Log Hostile at Exit

Creates hostile_contact linked to gate and route.

## Log Direction

Optional:

- eastbound
- westbound
- origin → destination
- unknown

## Mark Gate Risk

Values:

- Green
- Amber
- Red
- Black
- Ghost

## Show Last Successful Passage

From manual Signals or later event data.

## Show Last Failed Passage

From manual Signals or later event data.

## Show Permit/Access Notes

Displays user/tribe/operator notes.

## Link Gate to Route

Associates gate with route dossier.

---

# 6. Storage Functions

## Log Access Worked

Creates storage access Signal.

## Log Access Denied

Creates access_denied Signal.

## Update Manual Manifest

Records observed contents or purpose.

## Mark Manifest Stale

Flags storage contents as needing recheck.

## Mark Empty

Records storage believed empty.

## Mark Purpose

Examples:

- fuel cache
- ammo cache
- public vending
- tribe hangar
- trade hub
- emergency cache
- unknown

## Mark Access Scope

Examples:

- public
- private
- tribe
- officer
- unknown
- denied

## Show Manifest Confidence

Manual / stale / verified later / contradicted.

## Link Storage to System and Route

Makes storage visible in route/system dossiers.

---

# 7. Market Functions

## Log Market Open

Creates market_report.

## Log Market Closed

Creates market_report.

## Log Poor Liquidity

Trade usefulness Signal.

## Log Good Trade Point

Trade usefulness Signal.

## Log Hostile Trade Hub

Combines market_report and hostile/risk context.

## Add Price Note

Manual note for price/availability.

## Add Currency Note

Tracks local/custom currency context if relevant.

## Mark Market Stale

Requires recheck.

## Link Market to System/Route

Used by haulers and traders.

---

# 8. Route Functions

## Create Route

Manual route object with systems/gates.

## Attach Gate to Route

Adds gate dossier relation.

## Attach System to Route

Adds system relation.

## Mark Route Safe

Creates route_report.

## Mark Route Unsafe

Creates route_report.

## Mark Route Stale

Flags recon needed.

## Log Blocked Hop

Links blocked gate/system to route.

## Show Route Risk

Computed from linked Signals:

- Green
- Amber
- Red
- Black
- Ghost

## Show Stale Hops

Lists linked gate/system Signals that are stale.

## Route Re-Scout Prompt

Generates prompt if key intel is stale/contradicted.

---

# 9. System Functions

## Create / View System Dossier

System-level memory.

## Log System Visit

Records player was there.

## Log Hostile System

Creates system_report/hostile_contact.

## Log Resource Found

Creates resource_report.

## Log Storage Found

Creates storage link.

## Log Market Status

Creates market_report linked to system.

## Show Known Gates

Aggregates gates linked to system.

## Show Known Storage

Aggregates storage linked to system.

## Show Known Markets

Aggregates market reports.

## Show Recent Warnings

Shows hostile, blocked, stale, contradicted Signals.

---

# 10. Character and Tribe Intel Functions

## Create Character Dossier

Subjective notes about a player/character.

## Set Standing

Subjective:

- trusted
- friendly
- neutral
- suspicious
- hostile
- kill-on-sight
- unknown

## Log Encounter

Creates encounter Signal.

## Log Trade Reliability

Useful for market/trade trust.

## Link Character to Tribe

Manual or resolved.

## Create Tribe Dossier

Subjective tribe-level record.

## Log Diplomacy Note

Diplomatic context.

## Log Hostile Tribe Activity

Links tribe to system/route/gate.

## Mark Source Reliability

Tracks whether reports from this character/tribe tend to be reliable.

---

# 11. Search and Recall Functions

## Search Signals

By title/body/tags/entity/type.

## Filter by Signal Type

Gate, storage, route, market, hostile, etc.

## Filter by Confidence

Unknown, observed, verified, stale, contradicted.

## Filter by Visibility

Private, public, tribe, officer, scout-cell.

## Filter by Entity

Object/system/route/character/tribe.

## Recent Signals

Fast list for in-game recall.

## Stale Signals

List needing recheck.

## Contradicted Signals

List requiring scout review.

---

# 12. Staleness and Confidence Functions

## Evaluate Staleness

Applies per-type staleness windows.

## Show Staleness Badge

Visible everywhere.

## Reconfirm Signal

Creates new corroborating Signal or updates confidence.

## Mark Signal Verified

Only if allowed by source/role/evidence.

## Mark Signal Corroborated

Multiple matching reports.

## Mark Signal Contradicted

Conflicting reports.

## Do Not Auto-Delete Stale Intel

Stale intel is degraded, not erased.

---

# 13. Contradiction Functions

## Detect Gate Conflict

Example:

- passed vs blocked

## Detect Market Conflict

Example:

- open vs closed

## Detect Storage Conflict

Example:

- accessible vs denied
- contains fuel vs empty

## Detect Route Conflict

Example:

- safe vs unsafe

## Surface Conflict

Shows:

```txt
Recent reports disagree. Re-scout before acting.
```

## Resolve Conflict

Possible paths:

- new verified report
- officer review
- source reliability
- indexed/on-chain evidence
- manual dismissal

---

# 14. Tribe Vault Functions

## Create Tribe Signal

Character-resolved tribe member can publish to tribe vault.

## Officer Signal

Officer-only scope.

## Scout Cell Signal

Scout-cell-only scope.

## Tribe Search

Search within tribe vault.

## Tribe Object Dossier

Shows tribe-specific Signals.

## Tribe Route Register

Shared route intel.

## Tribe Storage Register

Shared storage intel.

## Tribe Market Register

Shared market intel.

## Tribe Audit Log

Records shared writes and sensitive changes.

## Tribe Export

Future feature governed by data ownership policy.

---

# 15. Operator Functions

## Operator Object Page

Owner/operator can publish public object note.

## Set Object Purpose

Examples:

- public gate
- private gate
- toll gate
- fuel cache
- market storage
- quest terminal

## Publish Access Rules

Human-readable rules.

## Publish Warning

Object-level public warning.

## Link to FrontierWarden Policy

Future.

## Claim Operator Role

Requires proof/capability later.

## Set Custom dApp URL

Future integration with Smart Assembly configuration.

---

# 16. Map and Bridge Functions

## Copy System

Copies system label.

## Copy Route

Copies route text.

## Open External Map

Handoff to map tool if URL patterns exist.

## Show Route Watch Card

Compact route risk display.

## Current System Selector

Manual v0.1 fallback.

## Signal Bridge Current System

Future local helper reads game context/logs.

## Overlay Warning

Future optional overlay card.

---

# 17. Import / Export Functions

## Export Local Signals

JSON export.

## Import Signals

JSON import with validation.

## Export Private Vault

Authenticated export.

## Export Tribe Vault

Future, role-gated.

## Import Manual Registry

For entity mapping.

## Export Entity Registry

For operators/maintainers.

---

# 18. Admin / Moderation Functions

## Review Classification Dispute

Resolve object classification issues.

## Supersede Classification Claim

Higher confidence source replaces active claim.

## View Audit Log

Shared writes and sensitive actions.

## Soft Delete Remote Signal

Moderation or author deletion.

## Restore Soft Deleted Signal

If allowed.

## Manage Known Bad Data

Mark malicious or incorrect reports.

---

# MVP Function Cut

## v0.1 Must Include

- anonymous public dossier
- viewer badge
- in-game access-code placeholder/flow
- unknown object page
- manual classify object
- quick Signal capture
- Signal list by object
- local/private/public visibility
- local draft storage
- staleness badge
- confidence badge

## v0.1 Should Not Include

- graph view
- AI summaries
- full route planner
- direct map control
- smart contract writes
- intel marketplace
- deep tribe management
