# Signal Vault Companion

Phase 13A desktop overlay feasibility starts here.

This app is a native shell proof for a future Windows companion overlay. The current window is compact, frameless, fixed-size, always-on-top, can be toggled with `Ctrl+Shift+Space`, and has tray controls for show, hide, toggle, and quit. It is a viewer surface only:

- no wallet signing
- no EVE Vault impersonation
- no dApp Kit provider emulation
- no game memory reads
- no input automation
- no process injection

The desktop companion hosts `http://127.0.0.1:17777/state` for the Phase 13A bridge. The browser app publishes normalized read-only Signal Vault state with `POST /state`; the overlay reads the latest accepted state with `GET /state`. The bridge rejects missing pairing tokens, malformed state, wrong app IDs, wrong schema versions, non-JSON posts, and non-`/state` routes.

The companion generates a local pairing token on first run, persists it in the app config directory, and displays it in the overlay. The web app stores the player's pasted bridge token in browser `localStorage` and sends it as `X-Signal-Vault-Bridge-Token`.

This bridge is not a command channel. It accepts local UI state only and carries no wallet data, auth secrets, remote sync tokens, dApp Kit provider context, game process data, or quick-note writes.

## Commands

- `pnpm dev:desktop` starts the Tauri development shell.
- `pnpm typecheck:desktop` checks the desktop TypeScript surface.
- `pnpm build:desktop` builds the Tauri shell without bundling an installer.
- `pnpm check:desktop` runs the desktop feasibility check.

The generated Rust `Cargo.lock` is intentionally ignored during Phase 13A so the feasibility scaffold keeps the repository's human-auditable file-size rule. Revisit that if the companion becomes a release artifact.
