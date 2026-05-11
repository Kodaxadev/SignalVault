# Database Schema

## Sessions

```sql
create table vault_sessions (
  id uuid primary key,
  wallet_address text,
  character_id text,
  tribe_id text,
  source text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
```

## Access Codes

```sql
create table ingame_access_codes (
  id uuid primary key,
  code_hash text not null,
  wallet_address text not null,
  character_id text,
  tribe_id text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
```

## Entities

```sql
create table entities (
  id uuid primary key,
  tenant text,
  item_id text,
  type_id text,
  object_id text,
  entity_type text not null,
  label text not null,
  resolution_confidence text not null,
  sources jsonb not null default '[]',
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index entities_object_id_idx
on entities (tenant, object_id)
where object_id is not null;

create unique index entities_item_id_idx
on entities (tenant, item_id)
where item_id is not null;
```

## Signals

```sql
create table signals (
  id uuid primary key,
  title text not null,
  body text not null default '',
  signal_type text not null,
  confidence text not null,
  visibility text not null,

  author_kind text not null,
  author_wallet text,
  author_character_id text,
  author_tribe_id text,

  created_context jsonb not null default '{}',
  tags text[] not null default '{}',

  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Signal Entities

```sql
create table signal_entities (
  signal_id uuid not null references signals(id) on delete cascade,
  entity_id uuid not null references entities(id) on delete cascade,
  entity_snapshot jsonb not null,
  primary key (signal_id, entity_id)
);
```

## Audit Log

```sql
create table audit_log (
  id uuid primary key,
  actor_session_id uuid,
  actor_wallet text,
  actor_character_id text,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```


## Policy Addendum

The privacy/data ownership and object-classification policies add these expected fields/tables before implementation hardens.

### Signal ownership and soft deletion

```sql
alter table signals add column if not exists owner_scope text not null default 'user';
alter table signals add column if not exists owner_wallet text;
alter table signals add column if not exists owner_character_id text;
alter table signals add column if not exists owner_tribe_id text;
alter table signals add column if not exists owner_cell_id text;

alter table signals add column if not exists deleted_at timestamptz;
alter table signals add column if not exists deleted_by_wallet text;
alter table signals add column if not exists deleted_by_character_id text;
alter table signals add column if not exists delete_reason text;
```

### Entity classification claims

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

### Entity disputes

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
