# Signal Vault Action Register

**Status date:** 2026-05-14

**Purpose:** Convert the question battery into an execution queue. This register tracks the highest-value follow-ups, why they matter, what evidence supports them, and what proof closes each action.

## Priority Key

| Priority | Meaning |
|---|---|
| P0 | Blocks any public production claim or remote-write trust claim. |
| P1 | Important for alpha/demo usefulness, operational confidence, or near-term distribution. |
| P2 | Valuable hardening that should not distract from P0/P1 work. |

## Register

| Priority | Action | Why | Evidence | Close Proof |
|---|---|---|---|---|
| P0 | Verify Postgres RLS under deployed app role | Remote reads/writes depend on DB policy actually holding outside unit tests. | `docs/operations/05-production-readiness-checklist.md` | Deployed-role integration tests prove cross-tribe reads/writes are denied and expected same-tribe access succeeds. |
| P0 | Validate live EVE Vault / zkLogin signing fixture | Production auth is implemented structurally but still needs real wallet fixture validation. | EVE Vault repo, dApp Kit docs, `docs/backend/22-sui-identity-validation-results.md` | A captured live EVE Vault personal-message signature verifies against the expected Sui address in the API verifier. |
| P1 | Desktop packaging readiness | Phase 13A is useful but not yet distributable as a player-facing artifact. | `docs/operations/06-desktop-companion-alpha-readiness.md` | Packaged Windows build launches, tray/hotkey/bridge work, install/run docs exist, and packaging gaps are documented. |
| P1 | Evidence-refresh checklist | EVE Frontier docs, World API hosts, EVE Vault, and dApp Kit are moving targets. | `docs/operations/07-signal-vault-question-battery.md` | A dated checklist verifies official docs/repos/Atlas evidence before release branches. |
| P1 | Privacy/data-retention policy | Public remote Signals need clear disclosure before players trust shared storage. | `docs/alpha/00-alpha-guide.md`, `docs/operations/05-production-readiness-checklist.md` | Player-facing policy states what stays local, what can leave device, retention, deletion, and audit behavior. |
| P2 | Storage health/export reminder UX | The first major player trust failure is likely local browser data loss. | Alpha guide and question battery | UI shows storage health/export age and nudges export without implying remote backup. |
| P2 | Real lint/static analysis | `pnpm lint` is not authoritative, so release gate lacks lint/static analysis coverage. | Production checklist | Lint is configured, CI-safe, and either added to release gate or docs stop mentioning it as meaningful. |
| P2 | Observability/incident runbooks | Production backend exposure needs operator visibility and response paths. | Production checklist and risk register | Runbooks cover rollback, env compromise, DB migration failure, auth failures, and World API dependency failures. |

## Current P0 Work

| Priority | Action | Status | Next Proof |
|---|---|---|---|
| P0 | Verify Postgres RLS under deployed app role | Harness, schema preflight, and RLS hardening migration implemented; live deployed-role run still pending. | Set `SIGNAL_VAULT_RLS_DATABASE_URL` or component `SIGNAL_VAULT_RLS_DATABASE_*` vars, apply migration `005_harden_signal_rls.sql`, then run `pnpm verify:rls`. |

## Recommended Next Phase

**Pick:** Phase 13B — Desktop Packaging Readiness.

Reason: the remote production path still depends on P0 backend evidence, but the desktop companion is already a tangible alpha differentiator. Packaging readiness is the shortest path from implemented functionality to a useful, testable player artifact.

### Phase 13B Scope

- decide Rust `Cargo.lock` commit policy for the desktop app
- verify packaged executable launch on Windows
- document Windows install/run flow
- test tray, hotkey, bridge state, Quick Note, Set Current System, and Open Vault in a packaged build
- handle `127.0.0.1:17777` port conflict UX
- add icon and app metadata
- record Windows Defender / unsigned binary behavior
- keep desktop release separate from `pnpm check:release` until packaging is mature

### Phase 13B Close Proof

- `pnpm check:desktop` passes
- packaged build launches on Windows
- operator guide documents install/run/troubleshooting
- bridge remains paired and local-only
- no wallet signing, dApp Kit import, game memory access, process injection, input automation, or remote sync authority is added

## Best Backend Alternative

**Alternative:** Phase 09P — Deployed RLS Verification.

Reason: this is the best P0 backend acceptance task before any public remote write claim.

### Phase 09P Scope

- app role cannot read cross-tribe scoped Signals
- app role cannot write forged `tribeId`
- app role cannot bypass identity snapshot/audit requirements
- denied writes are audited where policy requires it
- service-role boundaries and migration assumptions are documented
- tests run against the same role/pool behavior intended for deployment

### Phase 09P Close Proof

- deployed-role integration tests pass
- failure cases prove denial, not accidental absence of data
- audit expectations are explicit and verified
- production checklist marks RLS deployed-role verification complete

## Decision

Proceed with Phase 13B first for alpha/demo value, then Phase 09P before making any public production remote-write claim.

## Phase 13B Implementation Note

Phase 13B now has first-pass packaging readiness artifacts:

- `docs/operations/09-desktop-packaging-readiness.md`
- `docs/operations/10-desktop-packaged-smoke-test.md`
- `pnpm check:desktop-package`

The remaining desktop distribution gap is installer/signing maturity, not the local release-exe smoke path.
