# Desktop Overlay Companion Design

## Evidence

- Official EVE Frontier builder docs frame Frontier as a builder/dApp ecosystem where Smart Assemblies and related game objects can be extended by builders: https://docs.evefrontier.com/
- Official dApp Kit docs make EVE Vault wallet connection and Smart Object data first-class dApp concerns, with `EveFrontierProvider`, `useConnection`, `useSmartObject`, and URL context via `tenant` and `itemId`: https://docs.evefrontier.com/tools/dapp-kit
- The dApp Kit TypeDoc shows `SmartObjectContextType` exposes `tenant`, `assembly`, `assemblyOwner`, `loading`, `error`, and `refetch`; this is provider context, not something a random desktop webview should fake: https://sui-docs.evefrontier.com/interfaces/SmartObjectContextType.html
- EVE Vault is a Chrome extension / web browser wallet for Sui using zkLogin and the Sui Wallet Standard, so wallet signing authority belongs to EVE Vault / supported wallet providers: https://github.com/evefrontier/evevault
- EF-Map documents EF Helper as a desktop companion for in-game overlay, visited-system sync, and follow mode, proving a Frontier-specific desktop companion precedent exists: https://ef-map.com/features
- EF-Map's helper bridge article describes a native Windows helper with a localhost HTTP server and overlay integration, which is the closest current precedent for a local bridge pattern: https://ef-map.com/blog/helper-bridge-desktop-integration
- Tauri v2 documents official global shortcuts, system tray support, and always-on-top window behavior, which covers the first feasibility risks for hotkey, tray, and overlay window behavior: https://v2.tauri.app/plugin/global-shortcut/ / https://v2.tauri.app/learn/system-tray/ / https://v2.tauri.app/reference/javascript/api/namespacewindow/
- The user reports no current or planned in-game browser in the observed EVE Frontier client. Signal Vault should treat any official browser/dApp surface as future adaptation work only after it ships and is verified.

## Product Decision

Signal Vault should target a **desktop overlay companion** for in-play use. The overlay is a companion surface for local-first intel, not a dApp browser replacement and not a wallet authority.

If EVE Frontier later ships a current, documented, and verified in-game/dApp browser, Signal Vault can add an adapter layer for that surface at that time. Until then, all wording and architecture should avoid assuming it exists.

## Phase 13A Scope

- Lightweight Windows desktop companion.
- Always-on-top overlay.
- Hotkey show/hide with `Ctrl+Shift+Space` as the default accelerator.
- Tray controls for show, hide, toggle, and quit.
- Compact current-system panel.
- Latest local Signals.
- Route warnings.
- Stale and contradiction alerts.
- Open full Signal Vault in the user's browser.
- Clipboard import/export bridge.
- Optional localhost bridge between Signal Vault web state and the overlay.

## First Implementation Slices

- 13A.0: Tauri shell proof. Complete.
- 13A.1: Always-on-top transparent window. Complete.
- 13A.2: Hotkey show/hide. Complete.
- 13A.3: Tray controls. Complete.
- 13A.4: Bridge to live Signal Vault state.

## Explicit Non-Goals

- No wallet signing.
- No EVE Vault impersonation.
- No private-key storage.
- No game memory reading.
- No game input automation.
- No process injection in the first feasibility slice.
- No fake dApp provider.
- No remote sync changes.

## Architecture Direction

Prefer Tauri first for a small Windows companion footprint. Use Electron only if Tauri blocks required overlay behavior after a prototype proves the limitation.

The bridge should be local-only:

```txt
Signal Vault web app / local state
<-> localhost bridge
<-> desktop overlay
```

Candidate local endpoints:

```txt
GET  http://127.0.0.1:17777/status
GET  http://127.0.0.1:17777/current-system
GET  http://127.0.0.1:17777/warnings
POST http://127.0.0.1:17777/quick-note
POST http://127.0.0.1:17777/current-system
```

## Acceptance Criteria

- Launches on Windows.
- Shows an always-on-top overlay.
- Hotkey toggles visibility.
- Displays current system and route warnings.
- Opens the full Signal Vault web app in the default browser.
- Does not import dApp Kit.
- Does not sign wallet messages.
- Does not emulate EVE Vault.
- Does not read game memory or automate game input.
- Works with Path A local-only Signal Vault.
- Browser app release checks remain green.

## Decision Log

Tauri-first is preferred because the v1 overlay is local UI plus a localhost bridge, not a Chromium-extension wallet surface. That keeps the companion small and reduces temptation to turn it into an unofficial dApp browser. Electron remains a fallback only if overlay/window APIs are materially better for this specific use case.
