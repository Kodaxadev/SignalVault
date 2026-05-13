# Phase 13A: Desktop Overlay Feasibility

## Goal

Prove Signal Vault can provide in-play utility through a lightweight Windows overlay without touching wallet authority, game memory, or the EVE client process.

## Status

13A.0 implementation started with a standalone Tauri shell proof in `apps/desktop`. The repo still treats the browser app and object-context route as the current shippable surfaces. Phase 13A is the next in-play compromise, while future in-game/dApp browser support is deferred until EVE Frontier ships and documents a current working browser surface.

## Build

- `apps/desktop/` Tauri shell
- always-on-top overlay window
- tray/menu
- global hotkey show/hide
- localhost bridge client
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

- 13A.0: Tauri shell proof.
- 13A.1: Always-on-top overlay window with static content.
- 13A.2: Global hotkey show/hide.
- 13A.3: Static mock warning data.
- 13A.4: Bridge to live Signal Vault state.

## Authority Rule

The desktop app is a viewer/bridge, not an authority.

- Authority remains EVE Vault / dApp Kit for wallet context.
- Authority remains backend Sui PlayerProfile resolution for server identity.
- Authority remains browser IndexedDB/export/import for local-first data.
- Overlay provides visibility, convenience, quick capture, and in-play ergonomics.

## Evidence

- `docs/superpowers/specs/2026-05-12-desktop-overlay-companion-design.md`
- `docs/superpowers/specs/2026-05-12-ingame-terminal-ui-design.md`
- `README.md`
- Tauri v2 global shortcuts: https://v2.tauri.app/plugin/global-shortcut/
- Tauri v2 tray support: https://v2.tauri.app/learn/system-tray/
- Tauri v2 window API includes always-on-top behavior: https://v2.tauri.app/reference/javascript/api/namespacewindow/
