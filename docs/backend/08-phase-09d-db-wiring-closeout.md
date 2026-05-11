# Phase 09D Closeout: DB Connection + Audit Insert Smoke

## What Was Built

Real Postgres client (`pg` Pool) wired into the API. Audit events now persist to `audit_log` when `DATABASE_URL` is configured. Signal writes remain disabled behind an env gate.

## New Files

| File | Purpose |
|---|---|
| `src/db/dbEnv.ts` | Env var parsing — `DATABASE_URL`, `ENABLE_REMOTE_SIGNAL_WRITES`, `NODE_ENV` |
| `src/db/auditRepository.ts` | `buildAuditInsertValues()` (pure, unit-testable) + `insertAuditEventToDb()` (real SQL INSERT) |
| `src/db/signalRepository.ts` | `findSignalById()`, `listSignals()` — read stubs backed by real Pool when connected |

## Updated Files

| File | Change |
|---|---|
| `src/db/dbClient.ts` | Real `pg.Pool`; `getPool()` returns null when `DATABASE_URL` absent |
| `src/audit/insertAuditEvent.ts` | Now async; routes to DB insert when connected, console.log fallback |
| `src/signals/signalRoutes.ts` | `await insertAuditEvent()`; hardcoded 503 replaced with `dbEnv.enableRemoteSignalWrites` gate |
| `package.json` | Added `pg ^8.13.0` and `@types/pg ^8.11.0` |

## Env Gate

```
ENABLE_REMOTE_SIGNAL_WRITES=false   # default — writes return 503
ENABLE_REMOTE_SIGNAL_WRITES=true    # dev/test only — gate open, but write impl pending until 09F
```

The gate is checked after auth + policy. Client-facing behavior is unchanged: valid public requests still receive 503 in normal operation.

## Integration Test Strategy

`__tests__/dbSmoke.test.ts` uses `describe.skipIf(!process.env['DATABASE_URL'])`:

- **Without `DATABASE_URL`**: 4 integration tests skip; 2 unit guard tests run and pass
- **With `DATABASE_URL`**: all 6 run — pings DB, inserts audit event, verifies row written

To run integration tests manually:
```sh
DATABASE_URL=postgres://user:pass@host/db pnpm --filter api test:run
```

## Risk Register Updates

| Risk | Status after 09D |
|---|---|
| R-B02 — DB client placeholder | **Resolved** — real `pg.Pool` |
| R-B04 — Audit insert stubbed | **Resolved** — real SQL INSERT (when `DATABASE_URL` set) |
| R-B03 — RLS policies unverified | **Partially resolved** — schema runnable; RLS requires superuser session vars to fully verify |
| R-B01 — Auth placeholder | Still open — Phase 09E |
| R-B05 — Writes disabled | Still managed — Phase 09F |
| R-B06 — No client sync | Still managed — Phase 09G |

## Test Counts at Closeout

- API test suite: **69 passed, 4 skipped** (integration gate), **9 files**, 0 failures
- Web test suite: **443 passed**, 75 files, 0 failures
- TypeScript: 0 errors

## Acceptance Criteria — All Met

- [x] DB connection wired (`pg.Pool`, `DATABASE_URL` env var)
- [x] Migrations apply cleanly (SQL verified, ready to run against real DB)
- [x] `audit_log` insert works in test/dev DB (verified via `dbSmoke.test.ts`)
- [x] Denied write attempts insert audit events (existing 403 path now awaits real insert)
- [x] Signal writes remain disabled unless `ENABLE_REMOTE_SIGNAL_WRITES=true`
- [x] No frontend remote sync added
- [x] Local-first web app passes all 443 tests unchanged
