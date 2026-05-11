# Phase 09C Closeout: Backend Skeleton

## What Was Built

Hono API skeleton in `apps/api/` — full guard pipeline with writes intentionally disabled.

## Pipeline Verification

| Scenario | HTTP Status | Behavior |
|---|---|---|
| Invalid JSON body | 400 | `validation_failed` |
| Schema validation failure | 400 | `validation_failed` |
| Missing or short auth credentials | 401 | `auth_missing` / `wallet_signature_invalid` / `character_token_invalid` |
| Policy denial (e.g. tribe write without tribeId) | 403 | policy reason code + audit stub fires |
| Valid request, policy passes | 503 | `server_error` — writes not enabled |
| PATCH / DELETE | 503 | writes not enabled |

## What Is NOT Enabled

- No DB connection — `db.isConnected` is `false`
- No audit inserts to Postgres — `insertAuditEvent` logs to console only
- No remote Signal writes — POST returns 503 after passing all guards
- No client remote sync — `apps/web` is unchanged
- RLS policies written but unverified against a live DB

## Test Counts at Closeout

- API test suite: **52 tests, 6 files, 0 failures**
- Web test suite: **443 tests, 75 files, 0 failures**

## Auth Status

`verifyAuth` is a stub: checks presence and minimum length of `walletSignature` and `characterJwt`. Does not perform real JWT decode or wallet signature recovery. Phase 09E hardens this.

## File Inventory

```
apps/api/
  migrations/001_initial_schema.sql
  src/
    appEnv.ts
    index.ts
    server.ts
    auth/authTypes.ts
    auth/verifyAuth.ts
    audit/auditTypes.ts
    audit/insertAuditEvent.ts
    db/dbClient.ts
    health/healthHandler.ts
    middleware/errorHandler.ts
    middleware/requestId.ts
    policy/checkPolicy.ts
    policy/policyTypes.ts
    signals/signalRoutes.ts
    signals/signalValidation.ts
  __tests__/
    checkPolicy.test.ts
    health.test.ts
    insertAuditEvent.test.ts
    signalRoutes.test.ts
    signalValidation.test.ts
    verifyAuth.test.ts
```

## Acceptance Criteria — All Met

- [x] Backend project scaffold exists
- [x] Database schema/migration for signals and audit_log exists
- [x] Health endpoint works
- [x] Request validation exists for CreateRemoteSignalPayload
- [x] Server-side policy check function exists
- [x] Audit event shape exists and fires on denial
- [x] Denied write attempts produce audit event
- [x] No Signal creation endpoint enabled without policy check
- [x] No client remote sync added
- [x] Local-first web app still passes all tests
- [x] TypeScript: 0 errors, all files under 400 lines
