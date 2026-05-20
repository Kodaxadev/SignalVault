# Deployed RLS Verification

**Status date:** 2026-05-14

**Phase:** 09P

**Goal:** Prove Signal Vault database policy behavior under the same deployed Postgres application role/pool behavior used by the API before making a public production remote-write claim.

## Evidence

| Claim | Source |
|---|---|
| PostgreSQL row security restricts which rows can be selected, inserted, updated, or deleted once RLS is enabled. | PostgreSQL Row Security Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html |
| If RLS is enabled and no applicable policy permits an action, PostgreSQL uses default-deny behavior. | PostgreSQL Row Security Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html |
| `CREATE POLICY` supports command-specific policies and `WITH CHECK` controls rows created by `INSERT` or `UPDATE`. | PostgreSQL `CREATE POLICY`: https://www.postgresql.org/docs/current/sql-createpolicy.html |
| Multiple permissive policies are combined with `OR`, so broad all-command policies can accidentally widen behavior. | PostgreSQL Row Security Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html |

## Implemented In This Pass

- Added migration `005_harden_signal_rls.sql`.
- Replaced broad `signals` all-command write policy with command-specific read/insert/update/delete policies.
- Required inserted `author_tribe_id` to match `app.current_tribe_id` when present.
- Required tribe/officer/scout-cell writes to include both current character and current tribe context.
- Preserved public reads without requiring tribe context.
- Added new-row constraints requiring `identity_resolved_at` on character-resolved Signal rows.
- Added new-row audit constraints requiring `identity_source` and `identity_resolved_at` when `actor_character_id` is present.
- Updated API migration readiness to require `005_harden_signal_rls`.
- Extended migration readiness to check required RLS policies and identity constraints, not just tables and columns.
- Added `pnpm verify:rls` deployed-role probe.

## Verification Command

Set a deployed app-role connection string:

```powershell
$env:SIGNAL_VAULT_RLS_DATABASE_URL="<postgres app role connection string>"
pnpm verify:rls
```

For hosts such as Nhost where a password may be awkward to encode safely in a
URI, the verifier also accepts component env vars:

```powershell
$env:SIGNAL_VAULT_RLS_DATABASE_HOST="hloexrimoebmcivaespe.db.us-west-2.nhost.run"
$env:SIGNAL_VAULT_RLS_DATABASE_PORT="5432"
$env:SIGNAL_VAULT_RLS_DATABASE_NAME="hloexrimoebmcivaespe"
$env:SIGNAL_VAULT_RLS_DATABASE_USER="postgres"
$env:SIGNAL_VAULT_RLS_DATABASE_PASSWORD=Read-Host "Nhost database password"
$env:SIGNAL_VAULT_RLS_DATABASE_SSLMODE="verify-full"
pnpm verify:rls
```

The probe uses one transaction and rolls back at the end. It inserts unique probe rows and verifies:

- `signals` and `audit_log` have row-level security enabled
- required `signals` and `audit_log` policies are installed
- required identity snapshot constraints are installed
- same-tribe read succeeds
- cross-tribe read returns zero rows
- forged `author_tribe_id` insert is denied
- missing `identity_resolved_at` insert is denied for character-resolved rows
- audit insert without `identity_source` is denied when actor character is present
- audit insert with identity snapshot succeeds

## Current Status

Harness status: implemented.

Schema preflight status: implemented. The verifier now fails before behavioral probes if migration `005_harden_signal_rls` has not installed required RLS policies, row-security enablement, or identity snapshot constraints.

Live deployed-role result: **not run in this environment** because no `SIGNAL_VAULT_RLS_DATABASE_URL`, `DATABASE_URL`, or component `SIGNAL_VAULT_RLS_DATABASE_*` env vars are configured.

This means the production checklist can move from "no harness" to "harness ready, live credential needed", but the P0 item remains open until the command passes against the deployed app role.

## Health Readiness

`/health` now reports schema readiness against:

- required tables
- required columns
- required `signals` / `audit_log` RLS policies
- required identity snapshot constraints

This catches a database that has migrations through `004` but has not applied the Phase 09P RLS hardening in migration `005`.

## Hard Boundaries

This pass does not claim:

- production remote writes are public-ready
- service-role boundaries are fully audited
- existing deployed databases have migration `005` applied
- RLS protects against compromise of the app-role database credential itself

If an actor has the app-role database password and direct SQL access, session settings such as `app.current_tribe_id` are not a cryptographic identity source. Signal Vault still relies on the API to derive and set request-time identity from verified auth before database writes.
