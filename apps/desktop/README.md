# Signal Vault Companion

Phase 13A desktop overlay feasibility starts here.

Operator guide: [`../../docs/operations/06-desktop-companion-alpha-readiness.md`](../../docs/operations/06-desktop-companion-alpha-readiness.md)

Packaging guide: [`../../docs/operations/09-desktop-packaging-readiness.md`](../../docs/operations/09-desktop-packaging-readiness.md)

This app is a native shell proof for a future Windows companion overlay. The current window is compact, frameless, fixed-size, always-on-top, can be toggled with `Ctrl+Shift+Space`, and has tray controls for show, hide, toggle, Open Vault, quick note capture, current-system capture, and quit. It is a companion surface only:

- no wallet signing
- no EVE Vault impersonation
- no dApp Kit provider emulation
- no game memory reads
- no input automation
- no process injection

The desktop companion hosts `http://127.0.0.1:17777/state` for the Phase 13A bridge. The browser app publishes normalized read-only Signal Vault state with `POST /state`; the overlay reads the latest accepted state with `GET /state`. The bridge rejects missing pairing tokens, malformed state, wrong app IDs, wrong schema versions, non-JSON posts, and unknown routes.

The companion generates a local pairing token on first run, persists it in the app config directory, and displays it in the overlay. The web app stores the player's pasted bridge token in browser `localStorage` and sends it as `X-Signal-Vault-Bridge-Token`.

Quick Note and Set Current System use the paired bridge command queue. The overlay queues only `quick_note` and `set_current_system` commands locally; the browser polls `GET /commands/pending`, owns validation/persistence, and ACKs `POST /commands/:id/ack` only after the local write resolves. Quick Note creates a `local_private` / `local_only` field note in IndexedDB. Set Current System tries browser-side World API resolution for numeric input and falls back to manual local state. The command channel carries no wallet data, auth secrets, remote sync tokens, dApp Kit provider context, game process data, command execution, or remote-sync authority.

Open Vault uses the Tauri opener plugin to open the configured Signal Vault web URL in the system browser. The default is `http://localhost:5173/app`; set `VITE_SIGNAL_VAULT_WEB_URL` for the overlay button and `SIGNAL_VAULT_WEB_URL` for the native tray action when a packaged or hosted URL is ready.

## Commands

- `pnpm dev:desktop` starts the Tauri development shell.
- `pnpm typecheck:desktop` checks the desktop TypeScript surface.
- `pnpm build:desktop` builds the Tauri shell without bundling an installer.
- `pnpm check:desktop` runs the desktop feasibility check.
- `pnpm check:desktop-package` builds the desktop app and smoke-tests the release exe.

The Rust `Cargo.lock` is committed for the desktop application so alpha builds use the same dependency snapshot. The line-limit check remains scoped to authored web source and does not scan generated lockfiles.
