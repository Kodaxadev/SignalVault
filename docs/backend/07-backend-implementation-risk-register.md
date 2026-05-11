# Backend Implementation Risk Register

Tracks open risks in the backend layer as of Phase 09C. Update each entry when the risk is resolved.

## R-B01 — Auth is Placeholder Only

**Severity:** High  
**Status:** Open (Phase 09C)  
**Resolved by:** Phase 09E

`verifyAuth` checks presence and minimum length of credentials only. It does not:
- Decode or verify the character JWT signature
- Recover the wallet address from the wallet signature
- Verify JWT expiry

**Risk:** A request with any non-empty strings passes auth. Policy checks run, but actor identity is fabricated.

**Mitigation until resolved:** Writes are disabled (503). No real data at risk. Guard rail is in place; trust is not yet established.

---

## R-B02 — DB Client is Placeholder Only

**Severity:** High  
**Status:** Open (Phase 09C)  
**Resolved by:** Phase 09D

`db.isConnected` is always `false`. `db.ping()` always returns `false`. No Postgres connection exists.

**Risk:** Backend cannot read or write signals. Migrations are written but unrun against any real DB.

**Mitigation until resolved:** All writes return 503. No data loss risk. Smoke tests gated on real DB in Phase 09D.

---

## R-B03 — RLS Policies Unverified

**Severity:** High  
**Status:** Open (Phase 09C)  
**Resolved by:** Phase 09D

Migration SQL includes RLS policies for `signals` and `audit_log`, but they have never been applied to a live database and have not been tested.

**Risk:** Policy logic could be incorrect — cross-tribe reads could be permitted, or writes could be denied unexpectedly.

**Mitigation until resolved:** No DB connection; RLS cannot be exercised. Verify in Phase 09D via DB smoke tests.

---

## R-B04 — Audit Insert is Stubbed

**Severity:** Medium  
**Status:** Open (Phase 09C)  
**Resolved by:** Phase 09D

`insertAuditEvent` logs to `console.log` only. Denied write attempts do produce an audit event in memory, but nothing is persisted to `audit_log`.

**Risk:** Denial events are lost on process exit. No audit trail exists in Phase 09C.

**Mitigation until resolved:** Writes are disabled, so there are no successful write events to audit. Denial events are observable in server logs.

---

## R-B05 — Writes Intentionally Disabled

**Severity:** Low (by design)  
**Status:** Managed  
**Resolved by:** Phase 09F (dev-only env gate)

POST /api/v1/signals returns 503 regardless of policy outcome. PATCH and DELETE also return 503. This is intentional for Phase 09C.

**Risk:** None until writes are enabled. Track that enabling writes requires R-B01, R-B02, R-B03, and R-B04 to all be resolved first.

**Gate condition:** `ENABLE_REMOTE_SIGNAL_WRITES=true` env flag, restricted to dev/test environments only. Must not be exposed to frontend.

---

## R-B06 — Client Has No Remote Sync Path

**Severity:** Low (by design)  
**Status:** Managed  
**Resolved by:** Phase 09G

`apps/web` contains type contracts in `features/remote/` but no fetch calls, no sync hooks, and no connection to the backend API.

**Risk:** None. Local-first behavior is the product fallback. Remote persistence must earn trust before client sync is enabled.

**Gate condition:** All prior risks resolved before Phase 09G adds any client-side sync.

---

## Resolution Order

| Phase | Risks Addressed |
|---|---|
| 09D | R-B02 (DB connection), R-B03 (RLS verification), R-B04 (audit insert) |
| 09E | R-B01 (real JWT + wallet signature verification) |
| 09F | R-B05 (controlled write in dev via env flag) |
| 09G | R-B06 (client remote sync preflight) |
