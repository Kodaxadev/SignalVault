# Signal Vault Companion

Phase 13A desktop overlay feasibility starts here.

This app is a native shell proof for a future Windows companion overlay. The current window is compact, frameless, fixed-size, and always-on-top. It is a viewer surface only:

- no wallet signing
- no EVE Vault impersonation
- no dApp Kit provider emulation
- no game memory reads
- no input automation
- no process injection

## Commands

- `pnpm dev:desktop` starts the Tauri development shell.
- `pnpm typecheck:desktop` checks the desktop TypeScript surface.
- `pnpm build:desktop` builds the Tauri shell without bundling an installer.
- `pnpm check:desktop` runs the desktop feasibility check.

The generated Rust `Cargo.lock` is intentionally ignored during Phase 13A so the feasibility scaffold keeps the repository's human-auditable file-size rule. Revisit that if the companion becomes a release artifact.
