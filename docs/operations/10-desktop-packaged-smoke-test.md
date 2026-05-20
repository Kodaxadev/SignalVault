# Desktop Packaged Smoke Test

**Status date:** 2026-05-14

Use this checklist before sharing a Signal Vault Companion alpha exe.

## Preconditions

- Windows host.
- Node `>=24`.
- Rust and Tauri build prerequisites installed.
- Port `127.0.0.1:17777` is free before the packaged-smoke test.
- Signal Vault web app can be opened in a browser.

## Automated Smoke

Run:

```powershell
pnpm check:desktop-package
```

Expected result:

- Tauri release build completes.
- `apps/desktop/src-tauri/target/release/signal-vault-desktop.exe` exists.
- The exe launches.
- The bridge answers `GET http://127.0.0.1:17777/state` with `503` before web state is published, or `200` when state already exists.
- The smoke process closes the exe.

If the command fails because the port is already in use, close the existing companion or any process bound to `127.0.0.1:17777`, then rerun.

## Manual Smoke

1. Launch the release exe.
2. Confirm the overlay is compact, frameless, fixed-size at 420x560, and always on top.
3. Confirm the overlay shows `Bridge Host: running`.
4. Use the tray menu to hide and show the overlay.
5. Press `Ctrl+Shift+Space` to toggle the overlay.
6. For a hotkey-conflict smoke test, rebuild with `VITE_SIGNAL_VAULT_COMPANION_HOTKEY=F9` and confirm the overlay reports and registers `F9`.
7. Click Open Vault and confirm the browser opens the configured Signal Vault URL.
8. Open the browser app and enter the pairing token shown in the overlay.
9. Confirm current system, warnings, and latest Signals publish into the overlay.
10. Capture a Quick Note from the overlay and confirm the browser creates a local-only field note.
11. Set Current System from the overlay and confirm the browser updates local current-system state.
12. Restart the desktop app and confirm the pairing token persists.
13. Start a second process on `127.0.0.1:17777`, then launch the companion and confirm the overlay reports a port conflict.

## Defender And Signing Record

Current state:

- The 13B artifact is unsigned.
- No Microsoft Store submission is configured.
- No EV or OV code-signing certificate is configured.
- No SmartScreen reputation claim is made.
- No Windows Defender false-positive result has been observed during local smoke testing yet.

Record any future packaging run here:

| Date | Artifact | Source | Defender result | SmartScreen result | Notes |
|---|---|---|---|---|---|
| 2026-05-14 | `signal-vault-desktop.exe` | local build | Not observed | Not observed | Local smoke only; not downloaded through a browser. |

## Hard Stops

Do not mark a packaged desktop alpha as ready if any of these are true:

- bridge port conflict is invisible
- token pairing does not persist across restart
- Quick Note creates anything except local-only field notes
- Set Current System bypasses browser-side validation
- Open Vault tries to act as wallet or dApp authority
- the desktop app imports dApp Kit or EVE Vault code
- the desktop app reads game memory or process state
- `pnpm check:desktop` fails
- `pnpm check:release` fails
