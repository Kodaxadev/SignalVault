# Backend Architecture

## Backend Goals

The backend exists to support:

- sessions
- in-game access codes
- remote Signal persistence
- entity registry
- shared visibility
- audit log
- tribe vaults later

The backend should not become a large server-side app in v0.1.

## Options

### Option A: Supabase

Pros:

- fast setup
- Postgres
- auth/RLS possible
- realtime later
- good for simple CRUD

Cons:

- RLS can get complex
- pool/session mode issues must be managed
- custom EVE wallet auth still needs careful design

### Option B: Thin API + Postgres

Possible stacks:

- Hono
- Fastify
- Express only if necessary

Pros:

- explicit session/access-code control
- easier custom wallet/auth logic
- easier audit hooks

Cons:

- more infrastructure
- must manage DB pooling carefully

## Recommended v0.1

Use either:

1. Supabase Postgres + minimal serverless functions, or
2. Thin Hono/Fastify API + Postgres.

Do not build a heavy Next.js-style backend for v0.1.

## Backend Responsibilities

```txt
GET  /api/viewer
POST /api/viewer/access-code
POST /api/viewer/consume-code
POST /api/viewer/revoke

GET  /api/entities/resolve
POST /api/entities/manual-classification
GET  /api/entities/:id
GET  /api/entities/:id/signals

GET  /api/signals
POST /api/signals
PATCH /api/signals/:id
DELETE /api/signals/:id

GET  /api/dossiers/object
GET  /api/dossiers/system/:systemName
GET  /api/dossiers/route/:routeId
```

## Session Model

Sessions are Signal Vault application sessions.

A wallet connection does not automatically imply a Signal Vault session unless the backend has verified and stored it.

## In-Game Access Code

External browser:

```txt
connect wallet → resolve character → generate one-time code
```

In-game browser:

```txt
enter code → bind current browser session → expire/revoke code
```

## Audit Policy

Every shared or tribe-scoped write should create an audit log entry.

Audit events:

- Signal created
- Signal updated
- Signal deleted
- manual entity classified
- access code generated
- access code consumed
- session revoked
- visibility changed
