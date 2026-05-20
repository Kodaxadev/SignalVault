# Railway Backend Deployment

## Decision

Use Railway for the Signal Vault API and Postgres backend. Keep the web app on
the existing static host path unless there is a separate reason to consolidate.

Evidence:

- Railway documents pnpm monorepo detection and service-level build/start
  commands for JavaScript monorepos:
  <https://docs.railway.com/guides/monorepo>
- Railway documents custom start commands for deployment services:
  <https://docs.railway.com/guides/start-command>
- Railway Postgres exposes `DATABASE_URL`, which matches the API and RLS
  verifier contract:
  <https://docs.railway.com/guides/postgresql>

## API Service

Create a Railway service from the repo and configure it for the API package.

Recommended commands:

```txt
Build Command: pnpm --filter api typecheck
Start Command: pnpm --filter api start
```

The API reads Railway's `PORT` variable automatically. If `PORT` is absent, it
falls back to local port `3001`.

## Postgres

Add Railway Postgres to the same project and expose the database connection as:

```txt
DATABASE_URL=<Railway Postgres connection string>
```

For RLS verification, either reuse `DATABASE_URL` locally or set the dedicated
verification variable:

```txt
SIGNAL_VAULT_RLS_DATABASE_URL=<Railway Postgres connection string>
```

Do not commit either value.

## Required API Variables

Production remote writes are still gated. Configure these only when validating
the remote-write path:

```txt
DATABASE_URL=
ENABLE_REMOTE_SIGNAL_WRITES=true
AUTH_DEV_MODE=false
ENABLE_SUI_CHARACTER_RESOLUTION=true
SUI_GRAPHQL_URL=
SIGNAL_VAULT_ALLOWED_ORIGINS=
```

`SIGNAL_VAULT_ALLOWED_ORIGINS` must name the deployed web origin. Do not use a
wildcard for production remote writes.

## RLS Proof

Before making any public production remote-write claim:

1. Apply all API migrations through `005_harden_signal_rls.sql`.
2. Set `SIGNAL_VAULT_RLS_DATABASE_URL` locally to the Railway Postgres URL.
3. Run:

```powershell
pnpm verify:rls
```

Passing `check:release` is not a substitute for this live deployed-role probe.

## CLI Token Policy

Railway CLI authentication can use `RAILWAY_TOKEN` or `RAILWAY_API_TOKEN`.
Keep those in the local shell or CI secret store only. Never place them in
`.env`, docs, screenshots, or committed config.

Reference: <https://docs.railway.com/cli/login>
