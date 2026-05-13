# Phase 13A: Desktop Overlay Feasibility

## Goal

Prove Signal Vault can provide in-play utility through a lightweight Windows overlay without touching wallet authority, game memory, or the EVE client process.

## Status

13A.0 through 13A.6 are implemented across `apps/desktop` and `apps/web`: the companion has a standalone Tauri shell, a compact always-on-top frameless window contract, a `Ctrl+Shift+Space` global hotkey toggle, tray controls for show/hide/toggle/quit, a read-only bridge state contract/client, a desktop-owned localhost bridge host, and local pairing-token hardening for browser publishing. The browser app still owns Signal Vault local state and publishes normalized read-only state to the companion. Future in-game/dApp browser support is deferred until EVE Frontier ships and documents a current working browser surface.

## Build

- `apps/desktop/` Tauri shell
- always-on-top overlay window
- tray/menu
- global hotkey show/hide
- localhost bridge host/client
- settings file
- compact current-system panel
- top route warnings
- latest local Signals
- stale/critical alerts
- contradiction count
- Open Vault, Quick Note, and Hide controls

## Acceptance Criteria

- Launches on Windows.
- Shows always-on-top overlay.
- Hotkey toggles visibility.
- Displays current system and route warnings from local Signal Vault state.
- Opens full Signal Vault in browser.
- Imports no dApp Kit code.
- Performs no wallet signing.
- Does not emulate EVE Vault.
- Does not read game memory, automate input, or inject into the game process.
- Works without backend.
- Works without dApp Kit.
- Browser app release checks remain green.
- Desktop feasibility checks are explicit through `pnpm check:desktop` and are not part of the web/API release gate until the native app matures.

## First Implementation Slices

- 13A.0: Tauri shell proof. Complete.
- 13A.1: Always-on-top overlay window with static content. Complete.
- 13A.2: Global hotkey show/hide. Complete.
- 13A.3: Tray controls. Complete.
- 13A.4: Read-only bridge state contract and desktop client. Complete.
- 13A.5: Bridge host / live web state serving. Complete.
- 13A.6: Bridge pairing token / local trust hardening. Complete.
- 13A.7: Quick-capture write bridge.

## Authority Rule

The desktop app is a viewer/bridge, not an authority.

- Authority remains EVE Vault / dApp Kit for wallet context.
- Authority remains backend Sui PlayerProfile resolution for server identity.
- Authority remains browser IndexedDB/export/import for local-first data.
- Overlay provides visibility, convenience, quick capture, and in-play ergonomics.

## Bridge Transport

The desktop companion owns the localhost listener because normal browser apps can make HTTP requests but do not act as arbitrary local HTTP servers. The browser publishes state with `POST http://127.0.0.1:17777/state`; the desktop overlay reads the latest accepted snapshot with `GET http://127.0.0.1:17777/state`.

13A.5 and 13A.6 keep this transport intentionally narrow:

- binds only to `127.0.0.1:17777`
- accepts only `/state`
- accepts only JSON `POST` state matching `app: "signal-vault"` and `schemaVersion: 1`
- requires `X-Signal-Vault-Bridge-Token` for `POST /state`
- generates and persists the pairing token in the desktop app config directory
- stores the browser copy of the token in the web app's origin-local `localStorage`
- rejects malformed state without updating the stored snapshot
- carries no wallet data, auth secrets, remote sync tokens, dApp Kit context, game process data, or commands
- leaves Open Vault, Quick Note, and other write flows to later slices

## Evidence

- `docs/superpowers/specs/2026-05-12-desktop-overlay-companion-design.md`
- `docs/superpowers/specs/2026-05-12-ingame-terminal-ui-design.md`
- `README.md`
- Tauri v2 global shortcuts: https://v2.tauri.app/plugin/global-shortcut/
- Tauri v2 tray support: https://v2.tauri.app/learn/system-tray/
- Tauri v2 window API includes always-on-top behavior: https://v2.tauri.app/reference/javascript/api/namespacewindow/
- MDN Fetch API documents browser-side request behavior, which supports browser-to-localhost publishing but not browser-owned server hosting: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- MDN secure-context guidance treats loopback resources such as `http://127.0.0.1` as locally delivered / potentially trustworthy, which supports an HTTPS-hosted web app publishing to a loopback companion bridge: https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts
- Tauri path docs define `appConfigDir()` as the app-specific config directory derived from the bundle identifier, matching where the desktop pairing token belongs: https://v2.tauri.app/reference/javascript/api/namespacepath/
- MDN localStorage documents origin-local browser storage that persists across sessions, matching the web-side copy of the bridge token: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
