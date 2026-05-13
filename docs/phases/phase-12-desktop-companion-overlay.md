# Phase 12: Desktop Companion Overlay

## Goal

Replace the current in-play assumption with a Windows desktop companion overlay path that works without an EVE Frontier in-game browser.

## Status

Design closed; implementation not started. The repo now treats the browser app and object-context route as the current shippable surfaces. The overlay is the next in-play compromise, while future in-game/dApp browser support is deferred until EVE Frontier ships and documents a current working browser surface.

## Build

- Tauri-first Windows companion feasibility spike
- always-on-top overlay
- hotkey show/hide
- compact current-system panel
- latest Signals panel
- route warning panel
- stale/contradiction alert panel
- open full Signal Vault in default browser
- local-only bridge contract

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

## Evidence

- `docs/superpowers/specs/2026-05-12-desktop-overlay-companion-design.md`
- `docs/superpowers/specs/2026-05-12-ingame-terminal-ui-design.md`
- `README.md`
