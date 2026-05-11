# Shared Persistence Contract

## Purpose

Define what gets stored remotely, who can write/read it, what gets audited, and how local data becomes shared. This contract prevents dangerous mistakes when backend implementation begins.

## What Gets Stored Remotely

Signals with visibility: `tribe`, `officer`, `scout_cell`, `public`, `private`.

**Never sent remotely:**
- `local_private` signals (must change visibility first, then promote)
- Anonymous-authored signals
- Raw dApp Kit / World API payloads
- Raw `local_debug` objects
- `raw?: unknown` context fields

## Who Can Write

- `character_resolved` viewers with verified server-side identity
- Wallet-connected users for `private`/`public` signals
- Tribe scopes require verified tribe membership (server-side)
- Client-supplied author identity is **not** authoritative — server derives from JWT + wallet signature

## Who Can Read

- Server-side policy-evaluated per signal scope
- Cross-tribe reads denied at database level (RLS)
- `public` signals readable by all
- `private` signals readable only by author wallet
- `tribe`/`officer`/`scout_cell` require matching tribe identity + role verification

## What Gets Audited

All write events: create, update, delete, export, visibility-change — **including denied attempts**.

## Local-to-Remote Promotion

Explicit promotion flow:
1. `local_only` → `remote_pending` (optimistic) → `remote_saved` (confirmed)
2. Failed sync keeps local intact
3. `local_private` **cannot be promoted directly** — requires visibility change first, then target visibility's policy rules apply

## Key Principle

**Client-side permission checks are UX only. Server-side policy checks are authoritative.**

Every endpoint must recompute policy using verified server-side identity. The client's `ViewerContext` is never trusted for authorization decisions.

## Data Minimization

- No raw dApp Kit payloads sent remotely
- No raw World API payloads sent remotely
- No raw wallet/character adapter payloads sent remotely
- Remote `linkedEntities` store normalized snapshots only
