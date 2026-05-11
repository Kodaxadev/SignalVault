# Object Classification and Dispute Workflow

## Status

Draft required before Phase 00 coding.

## Purpose

This policy defines how Signal Vault classifies EVE Frontier objects, how manual classifications work, how verified data upgrades records, and what happens when sources disagree.

This affects:

- entity database schema
- entity resolver behavior
- UI confidence badges
- operator/admin workflows
- audit log
- dispute handling
- future indexer/on-chain integration

## Core Principle

Object classification is a **confidence-ranked claim**, not a blind assignment.

Signal Vault must distinguish:

- unknown
- URL hinted
- manually classified
- cached
- indexed
- on-chain verified
- conflicted

## Entity Types

```ts
export type EntityType =
  | "smart_gate"
  | "smart_storage_unit"
  | "smart_turret"
  | "network_node"
  | "character"
  | "tribe"
  | "system"
  | "route"
  | "market"
  | "item"
  | "unknown";
```

## Resolution Confidence

```ts
export type ResolutionConfidence =
  | "url_hint"
  | "manual"
  | "cached"
  | "indexed"
  | "onchain_verified"
  | "conflicted"
  | "unknown";
```

## Source Priority

Highest to lowest:

```txt
1. onchain_verified
2. indexed
3. dappkit_current_object
4. maintainer_registry
5. owner_claim_verified
6. tribe_registry
7. user_manual
8. url_hint
9. unknown
```

## Classification Sources

### URL Hint

Example:

```txt
/ingame/object/0xabc?type=smart_gate
```

Use:

- UI skeleton
- initial route context
- fallback display

Do not use:

- final classification
- permission decisions
- verified badges

### User Manual Classification

A user marks object as a gate/storage/turret/etc.

Use:

- immediate MVP usability
- local/tribe working knowledge
- object dossier grouping

Display:

```txt
Resolution: Manual
```

### Tribe Registry Classification

A tribe classifies an object within its own vault.

Use:

- tribe operational memory
- internal route/storage planning

Display:

```txt
Resolution: Tribe registry
```

### Maintainer Registry Classification

Signal Vault maintainer or trusted admin classifies object globally.

Use:

- alpha/beta reliability
- moderation
- correction of common objects

Display:

```txt
Resolution: Maintainer registry
```

### Owner Claim Verified

A user proves control over the object/operator capability and classifies object metadata.

Use:

- operator public object notes
- custom object page management
- official operator label

Display:

```txt
Resolution: Owner verified
```

### Indexed / On-Chain Verified

Resolver confirms object type via dApp Kit, GraphQL, indexer, or on-chain data.

Display:

```txt
Resolution: Verified
```

## Entity Classification Record

```ts
export type EntityClassificationClaim = {
  id: string;
  entityId: string;
  claimedType: EntityType;
  label?: string;
  source:
    | "url_hint"
    | "user_manual"
    | "tribe_registry"
    | "maintainer_registry"
    | "owner_claim_verified"
    | "dappkit_current_object"
    | "indexed"
    | "onchain_verified";
  claimedByWallet?: string;
  claimedByCharacterId?: string;
  claimedByTribeId?: string;
  evidence?: {
    objectId?: string;
    itemId?: string;
    tenant?: string;
    transactionDigest?: string;
    resolverRunId?: string;
    notes?: string;
    raw?: unknown;
  };
  confidence: ResolutionConfidence;
  createdAt: string;
  supersededAt?: string;
};
```

## Database Implications

### entities

```sql
alter table entities add column if not exists active_claim_id uuid;
alter table entities add column if not exists classification_status text not null default 'unknown';
alter table entities add column if not exists classification_confidence text not null default 'unknown';
```

### entity_classification_claims

```sql
create table entity_classification_claims (
  id uuid primary key,
  entity_id uuid not null references entities(id) on delete cascade,
  claimed_type text not null,
  label text,
  source text not null,

  claimed_by_wallet text,
  claimed_by_character_id text,
  claimed_by_tribe_id text,

  evidence jsonb not null default '{}',
  confidence text not null,

  created_at timestamptz not null default now(),
  superseded_at timestamptz
);
```

### entity_disputes

```sql
create table entity_disputes (
  id uuid primary key,
  entity_id uuid not null references entities(id) on delete cascade,
  opened_by_wallet text,
  opened_by_character_id text,
  opened_by_tribe_id text,

  disputed_claim_id uuid,
  proposed_type text,
  reason text not null,

  status text not null default 'open',
  resolution text,
  resolved_by_wallet text,
  resolved_at timestamptz,

  created_at timestamptz not null default now()
);
```

## Resolver Merge Rules

### Rule 1: Higher-priority source wins

If an on-chain verified source says `smart_gate` and a manual source says `smart_storage_unit`, active type becomes `smart_gate`.

### Rule 2: Do not delete lower-priority claims

Keep historical claims for audit/debugging.

### Rule 3: Same-priority conflict becomes conflicted

If two same-priority sources disagree, mark entity as:

```txt
classification_confidence = conflicted
```

### Rule 4: Manual classification can be promoted

A manual classification can later become indexed or verified.

### Rule 5: Verification does not rewrite Signal history

Old Signals preserve the resolution snapshot they were created with.

## Dispute Workflow

### Step 1: User Reports Wrong Classification

User action:

```txt
Report Classification
```

Required fields:

- entity
- current classification
- proposed classification
- reason
- optional evidence

### Step 2: Dispute Record Created

Status:

```txt
open
```

### Step 3: Entity Marked as Disputed

UI displays:

```txt
Classification disputed
```

### Step 4: Resolver/Admin/Owner Evidence Reviewed

Possible outcomes:

- accept proposed classification
- reject dispute
- mark conflicted
- wait for verified/indexed data
- escalate to maintainer

### Step 5: Resolution Applied

Entity claim is updated, superseded, or marked conflicted.

Audit event created.

## UI Requirements

Every object dossier must display:

- entity type
- classification confidence
- source label
- dispute status if any

Examples:

```txt
Type: Smart Gate
Resolution: Manual
```

```txt
Type: Smart Storage Unit
Resolution: Verified
```

```txt
Type: Conflicted
Warning: Sources disagree. Recheck before relying on this dossier.
```

## Permissions

### Who can classify?

v0.1:

- authenticated wallet/character can submit manual classification
- anonymous can create local-only classification/draft if allowed

Later:

- tribe role can create tribe registry classification
- object owner/operator can create owner-verified classification
- maintainer/admin can create maintainer registry classification
- indexer/on-chain resolver can create verified classification

### Who can dispute?

- any authenticated user who can view the object dossier
- tribe roles for tribe registry classifications
- maintainers/admins for global registry

## MVP Policy Decisions

For v0.1:

1. Unknown object pages are valid.
2. Manual classification is allowed.
3. Manual classification is visibly labeled.
4. URL hints are never treated as verified.
5. Classification claims should be stored as claims, not only overwritten entity fields.
6. If same-rank claims conflict, mark conflicted.
7. If verified/indexed data exists, it supersedes manual classification.
8. Signal history preserves original entity snapshot.

## Open Questions

Resolve before public alpha:

1. Can anonymous users submit local-only classification?
2. Who moderates disputes?
3. Can tribe classifications differ from global classification?
4. Can object owners override maintainer registry?
5. How much raw resolver evidence should users see?
6. Should disputed entities block public quick actions?
