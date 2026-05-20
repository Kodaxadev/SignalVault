# Desktop Companion Alpha Readiness

Phase 13A proves the Windows desktop companion can support in-play Signal Vault use without becoming a wallet, dApp browser, or game-client integration layer.

## Current Scope

The companion is an alpha feasibility artifact. It can:

- show a compact always-on-top Signal Vault overlay
- toggle visibility with `Ctrl+Shift+Space`
- allow operator testing of another hotkey through `VITE_SIGNAL_VAULT_COMPANION_HOTKEY`
- expose tray actions for show, hide, toggle, Open Vault, and quit
- host a localhost bridge on `127.0.0.1:17777`
- receive read-only browser state
- display optional current-system static site context from the paired browser
- queue `quick_note` and `set_current_system` commands
- open the configured Signal Vault web URL in the system browser

The companion does not:

- sign wallet messages
- store wallet private keys
- impersonate EVE Vault
- emulate the dApp Kit provider
- read EVE Frontier memory
- inspect or control the game process
- automate keyboard or mouse input
- trigger remote sync

## Pairing Flow

1. Start the desktop companion.
2. Copy the pairing token shown in the overlay.
3. Open Signal Vault in the browser.
4. Paste the token into the companion bridge pairing field.
5. Leave the browser app open so it can publish state and poll pending commands.

The token is local trust glue only. The desktop copy is persisted in the Tauri app config directory. The browser copy is stored in origin-local `localStorage`. It is not a wallet secret, auth token, or remote-sync credential.

## Bridge Contract

The bridge binds to loopback only:

```txt
127.0.0.1:17777
```

Supported endpoints:

| Endpoint | Direction | Purpose |
|---|---|---|
| `POST /state` | Browser to desktop | Publish normalized read-only Signal Vault state |
| `GET /state` | Desktop diagnostics | Read latest accepted state |
| `GET /commands/pending` | Browser from desktop | Poll queued local commands |
| `POST /commands/:id/ack` | Browser to desktop | Acknowledge a command after local save succeeds |

All paired endpoints require:

```txt
X-Signal-Vault-Bridge-Token: <local pairing token>
```

The current command types are deliberately narrow:

```txt
quick_note
set_current_system
```

Optional read-only state includes current-system static site context when the
browser has loaded the compact Frontier static index. This field is display-only
and does not create commands, route warnings, remote sync, or game-data authority.

## Command Ownership

The desktop queues requests. The browser owns local persistence.

Quick Note:

- desktop trims and queues note text
- browser creates a `field_note`
- browser forces `visibility: local_private`
- browser forces `syncState: local_only`
- browser ACKs only after IndexedDB save succeeds

Set Current System:

- desktop trims and queues the input
- browser validates the input
- numeric input attempts World API solar-system lookup
- failed lookup or text input falls back to manual local state
- browser ACKs only after the current-system write succeeds

## Troubleshooting

| Symptom | Likely Cause | Operator Action |
|---|---|---|
| Overlay says bridge disconnected | Browser is closed, token missing, or state publishing is disabled | Open Signal Vault, pair the token, and keep the page open |
| Browser cannot publish state | Desktop app is not running or port `17777` is unavailable | Start the companion; close any process using the same port |
| Token rejected | Browser token does not match the desktop token | Copy the current desktop token into the web app again |
| Quick Note stays pending | Browser local save failed or browser is not polling | Open the browser app and check local storage availability |
| Set Current System stores a number as manual | World API lookup failed or was unavailable | Confirm network/World API status; manual fallback is expected |
| Hotkey unavailable | OS-level shortcut registration failed or conflicts | Use tray/window controls, then test another accelerator with `VITE_SIGNAL_VAULT_COMPANION_HOTKEY` |
| Open Vault opens the wrong URL | URL env config points to dev or stale host | Set `VITE_SIGNAL_VAULT_WEB_URL` and `SIGNAL_VAULT_WEB_URL` for the intended target |

## Packaging Notes

Phase 13B adds first-pass packaging readiness. See:

- `docs/operations/09-desktop-packaging-readiness.md`
- `docs/operations/10-desktop-packaged-smoke-test.md`

Before sharing desktop builds outside development, finish or explicitly disclose:

- Windows installer or signed executable packaging
- production URL configuration
- visual overlay QA against desktop and gameplay-like resolutions
- in-app hotkey settings UI for players who need to avoid helper overlays such as EF Helper
- SmartScreen and Defender behavior for browser-downloaded unsigned artifacts

## Evidence

- EVE Frontier builder docs frame Frontier as a programmable builder ecosystem with dApps and Smart Assemblies: https://docs.evefrontier.com/
- EF Helper documents a Frontier desktop companion with an in-game overlay and configurable hotkey precedent: https://ef-map.com/blog/ef-helper-desktop-companion-guide
- dApp Kit `SmartObjectContextType` is provider context, not something the companion should emulate: https://sui-docs.evefrontier.com/interfaces/SmartObjectContextType.html
- Tauri documents global shortcuts, tray support, opener, and desktop app configuration used by the companion: https://v2.tauri.app/plugin/global-shortcut/ / https://v2.tauri.app/learn/system-tray/ / https://v2.tauri.app/plugin/opener/
- MDN documents browser `fetch()` and origin-local `localStorage`, matching the browser-publishes-state and token-storage model: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API / https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- EVE Frontier Stillness World API docs provide the browser-side lookup surface used for current-system resolution: https://world-api-stillness.live.tech.evefrontier.com/docs/index.html
