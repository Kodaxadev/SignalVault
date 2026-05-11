# Privacy and Data Ownership Policy

## Status

Draft required before Phase 00 coding.

## Purpose

This policy defines who owns Signal Vault data, who can read it, who can modify it, and what happens when identity, tribe membership, or object ownership changes.

This document directly informs:

- database schema
- permission engine
- API contracts
- audit log requirements
- deletion/export behavior
- tribe vault behavior
- local-first sync behavior

## Core Principle

Signal Vault stores **subjective player and tribe intelligence**, not universal truth.

A Signal belongs to the author or vault scope that created it. Visibility is controlled by the Signal's owner/scope and enforced through ViewerContext.

## Ownership Model

### Local Private Signals

`visibility = "local_private"`

Owned by:

- the local browser profile/device that created them

Stored:

- local IndexedDB / Dexie

Readable by:

- the same browser profile/device

Writable by:

- the same browser profile/device

Can be synced?

- only after the user authenticates and intentionally promotes or imports them

Deletion behavior:

- deleting local data removes it from the local browser only
- if never synced, the backend has no copy

### Private Signals

`visibility = "private"`

Owned by:

- the authenticated wallet/character that created them

Readable by:

- the owning wallet/character

Writable by:

- the owning wallet/character

Transferability:

- not transferable by default
- future account-linking or character-migration flow must be explicit

Deletion behavior:

- author can delete
- deletion should remove the Signal from active views
- audit record may remain if the Signal was ever shared or remote-saved

### Public Signals

`visibility = "public"`

Owned by:

- the original author

Readable by:

- everyone

Writable by:

- original author
- moderators/admins only if a moderation system exists
- object/tribe operators only if explicitly granted by policy

Deletion behavior:

- author may delete or retract
- audit log records creation/deletion
- public deletion does not guarantee old screenshots or external copies disappear

### Tribe Signals

`visibility = "tribe"`

Owned by:

- the tribe vault/policy domain, not solely the individual author

Authored by:

- a resolved character in that tribe

Readable by:

- current members of that tribe, subject to role/policy

Writable by:

- original author
- authorized tribe roles
- tribe operators/officers if granted by tribe policy

Deletion behavior:

- deletion requires original author or authorized tribe role
- audit log required
- if author leaves tribe, the Signal remains in the tribe vault unless policy says otherwise

### Officer Signals

`visibility = "officer"`

Owned by:

- tribe vault/policy domain

Readable by:

- resolved characters with officer role

Writable by:

- original author
- authorized officer/admin roles

Deletion behavior:

- audit log required

### Scout Cell Signals

`visibility = "scout_cell"`

Owned by:

- tribe vault/policy domain or specific scout cell scope

Readable by:

- resolved characters assigned to that scout cell

Writable by:

- original author
- scout-cell maintainers
- authorized officer/admin roles

Deletion behavior:

- audit log required

## Data Ownership Table

| Signal Type | Owner | Read Access | Write Access | Delete Access | Audit Required |
|---|---|---|---|---|---|
| local_private | local browser/device | local browser/device | local browser/device | local browser/device | No backend audit |
| private | wallet/character | owning wallet/character | owning wallet/character | owning wallet/character | Yes if remote |
| public | author | everyone | author/moderator | author/moderator | Yes |
| tribe | tribe vault | current authorized tribe members | author/authorized roles | author/authorized roles | Yes |
| officer | tribe vault | officer roles | officer roles | officer roles | Yes |
| scout_cell | tribe/cell scope | scout-cell roles | author/cell roles/officer | authorized roles | Yes |

## Tribe Membership Changes

### Player Joins a Tribe

When a character joins a tribe:

- they may gain access to tribe Signals after ViewerContext refresh
- access is not retroactive to private Signals owned by individual members
- role-scoped Signals require matching role assignment

### Player Leaves a Tribe

When a character leaves a tribe:

- access to that tribe's non-public Signals should be revoked after ViewerContext refresh
- previously authored tribe Signals remain in the tribe vault
- previously authored private Signals remain private to the author
- audit logs retain the historical author identity
- local cached copies must be invalidated or hidden where feasible

### Player Changes Tribe

Treat as:

1. leave old tribe
2. revoke old tribe access
3. join new tribe
4. grant new tribe access according to policy

### Tribe Disbands

Default policy:

- tribe Signals become locked/read-only to authorized former administrators if recoverable
- no automatic conversion to public
- future implementation may support export by authorized former operators

## Character / Wallet Changes

### Wallet Connected, Character Not Resolved

User can create private wallet-attributed Signals, but not tribe Signals.

### Character Resolved

User can create character-attributed Signals.

### Character Cannot Be Resolved Later

Existing remote Signals remain stored. New shared writes requiring character resolution should be blocked until resolution succeeds again.

### Wallet Migration

Not supported by default.

Future migration must require:

- proof of old wallet/session
- proof of new wallet/session
- explicit migration confirmation
- audit event

## Object Ownership vs Signal Ownership

Owning a Smart Assembly does **not** automatically grant ownership of all Signals attached to that object.

Object operators may control:

- public object note
- official operator announcement
- object-level metadata
- custom URL
- object classification if verified by ownership/capability

Object operators do not automatically control:

- private user Signals
- tribe Signals from another tribe
- scout-cell Signals
- player dossiers

## Subjective Trust Domains

Signal Vault does not define universal reputation.

A player or tribe may classify someone as hostile, trusted, unreliable, or safe within their own vault scope.

Example:

- Tribe A says Player X is hostile.
- Tribe B says Player X is trusted.

Both can be true within their respective policy domains.

## Deletion Policy

### Soft Delete

Remote Signals should use soft deletion initially.

Required fields:

```sql
deleted_at timestamptz
deleted_by_wallet text
deleted_by_character_id text
delete_reason text
```

Why:

- preserves auditability
- prevents accidental destructive loss
- supports moderation/recovery flows

### Hard Delete

Hard delete should be reserved for:

- local-only data deletion
- legal/privacy requests
- operator maintenance
- unrecoverable malformed data

Hard delete requires admin/operator path and should be logged when possible.

## Export Policy

Users should be able to export:

- local private Signals
- remote private Signals they own
- public Signals they authored
- tribe Signals only if tribe policy allows export

Tribe exports should require:

- authorized role
- audit event
- scope selection
- optional redaction of private author metadata

## API Enforcement Rules

All API writes must receive:

- ViewerContext
- requested visibility
- linked entity context
- author context

The server must enforce:

- anonymous cannot remote-publish
- wallet-only cannot create tribe/officer/scout-cell Signals
- character-resolved can create tribe Signals only for their current tribe
- role-scoped writes require matching role
- visibility changes require ownership/role check
- deletes require ownership/role check

## Schema Implications

Add or preserve the following fields.

### signals

```sql
owner_scope text not null default 'user',
owner_wallet text,
owner_character_id text,
owner_tribe_id text,
owner_cell_id text,

deleted_at timestamptz,
deleted_by_wallet text,
deleted_by_character_id text,
delete_reason text
```

### audit_log

Must include:

```sql
actor_wallet text,
actor_character_id text,
actor_tribe_id text,
action text,
target_type text,
target_id text,
metadata jsonb,
created_at timestamptz
```

## Permission Engine Requirements

The permission engine must answer:

- canReadSignal(viewer, signal)
- canCreateSignal(viewer, visibility)
- canUpdateSignal(viewer, signal)
- canDeleteSignal(viewer, signal)
- canChangeVisibility(viewer, signal, newVisibility)
- canExportSignal(viewer, signal)

## MVP Policy Decisions

For v0.1:

1. Local anonymous data is local-only.
2. Anonymous users cannot publish remote/shared Signals.
3. Private remote Signals are owned by wallet/character.
4. Tribe/officer/scout-cell Signals are blocked until tribe identity and roles exist.
5. Remote deletion is soft delete.
6. All shared writes are audited.
7. Object ownership does not override user/tribe Signal ownership.
8. Tribe Signals remain with the tribe if the author leaves.

## Open Questions

These should be finalized before Tribe Vault launch:

1. Can tribe officers edit another member's tribe Signal?
2. Can tribe admins export all tribe Signals?
3. How are scout cells created and managed?
4. What happens if tribe role data is stale?
5. Is there a moderation/admin override?
6. What retention period applies to deleted remote Signals?
