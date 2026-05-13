# Signal Vault Alpha Guide

> **Read this before using Signal Vault in alpha.**

## Current Status

Signal Vault is in **alpha** — a local-first intelligence layer for EVE Frontier. All your data stays in your browser by default. Remote push exists in alpha as a manual, dev-auth-only feature and is not a reliable backup.

**Tribe and officer visibility** exist as local concepts and are policy-gated. You can log tribe-scoped signals, but cross-device sharing of those signals requires the manual remote push path. **Scout cell scope is locked** — not available in this alpha.

**Remote sync is manual, single-signal, and dev-auth only.** It is not automatic. It is not background. It is not cross-device sync. If you see the "Alpha · Dev auth · Manual only" label on the push button, that accurately describes what it is.

## Data Storage

**All data is stored locally in this browser profile using IndexedDB.**

- Signals, classifications, and dossiers are saved to your browser's local storage
- Data is tied to the specific browser and profile you used to create it
- Opening the app on a different device or browser will show **no data**
- Using private/incognito mode may prevent data from persisting between sessions

## ⚠️ Data Loss Warning

**Clearing browser data, changing devices, or using private/incognito browsing may remove or hide your Signals. Export backups regularly.**

Common actions that will **permanently delete** your local data:
- Clearing browser cache/cookies/site data
- Using "Clear browsing data" in browser settings
- Switching to a different browser or device
- Using incognito/private browsing mode
- Browser profile reset or corruption

Remote push does **not** protect against browser data loss. A pushed signal's remote copy is on a development server with no persistence guarantees in alpha. The local copy is your primary copy.

## How to Backup Your Data

1. Open Signal Vault
2. Look for the **Export** section in the sidebar or settings
3. Click **Export** to download a JSON backup file
4. Save this file somewhere safe (cloud storage, USB drive, etc.)

The exported file contains all your Signals and classifications in a portable format.

## How to Restore from Backup

1. Open Signal Vault in the browser where you want to restore data
2. Look for the **Import** section
3. Select your previously exported `.json` backup file
4. Choose **Merge** (adds to existing data) or **Replace** (wipes current data first)
5. Confirm the import

Invalid or corrupted files will be rejected with a clear error message. Your existing data is preserved if an import fails.

## Supported Browsers

Signal Vault requires **IndexedDB** support. These browsers are known to work:

| Browser | Status |
|---------|--------|
| Chrome (latest) | Supported |
| Firefox (latest) | Supported |
| Edge (latest) | Supported |
| Safari (latest) | Supported |

Wallet connection uses the EVE Vault / dApp Kit path where a supported browser wallet provider is available. Current alpha use should assume normal desktop browser operation; Signal Vault must not depend on an in-game browser being present.

## Desktop Companion Alpha

Signal Vault also has a Windows desktop companion feasibility build for in-play visibility. It is an overlay and local bridge, not a wallet, dApp browser, or game-client integration.

The companion can show live local Signal Vault state, open the full browser app, capture local-only Quick Notes, and set the current system through the browser-owned local state path. Pairing uses a local token between the desktop app and your browser session.

Do not use the companion as an authority source. It does not sign wallet messages, emulate EVE Vault, read game memory, automate input, trigger remote sync, or replace the full browser app. See [`../operations/06-desktop-companion-alpha-readiness.md`](../operations/06-desktop-companion-alpha-readiness.md) for operator setup and troubleshooting.

## Tribe & Visibility

Signal Vault supports six visibility levels:

| Visibility | Available | Notes |
|------------|-----------|-------|
| Local private | ✅ | Browser-only, never pushed |
| Private | ✅ | Wallet-authenticated personal signals |
| Public | ✅ | World-readable if pushed |
| Tribe | ✅ | Tribe members (policy-gated) |
| Officer | ✅ | Officers within tribe (policy-gated) |
| Scout cell | ❌ Locked | Not available in this alpha |

Tribe and officer visibility are enforced by server-side policy when signals are pushed remotely. Local signals with tribe visibility are stored in your browser only.

## Remote Push (Dev Auth Alpha)

A manual remote push button exists on signal cards. When available, it shows:

```
Alpha · Dev auth · Manual only
[Push remote]
```

This means:
- **Alpha** — feature is experimental, may fail or change
- **Dev auth** — authentication uses developer credentials, not your real EVE identity
- **Manual only** — you click one signal at a time; there is no automatic sync

Your local Signal is always preserved if a push fails. The button will show a specific reason if push is blocked (no backend configured, wallet signing unavailable, character token not available, etc.).

Remote push is **not** a replacement for export/import backups.

## Known Limitations

- **No cross-device sync**: Data on one device does not automatically appear on another. Manual remote push exists for alpha but pull is not implemented.
- **Remote push is not a reliable backup**: The alpha backend has no persistence guarantees. Keep local exports.
- **Scout cell scope is locked**: Sub-tribe cell groups are not available in this alpha.
- **No character identity verification**: The alpha uses developer-supplied credentials; real EVE character identity is pending a trusted issuer from CCP.
- **No signal editing**: Correct a signal by creating a new one.
- **No multi-user support**: Each browser profile is isolated.
- **Route warnings are local-only**: Route warning cards derive from Signals in your browser only. They do not include intel from other players unless those signals have been imported or remote-pulled (pull not yet implemented).

## How to Report Bugs

If you encounter issues:

1. Visit the `/compat` page in the app (e.g., `https://your-app-url/compat`)
2. The page will run browser diagnostics and show your environment status
3. Copy the diagnostics report using the copy button
4. Include this report in your bug description

## What's Coming (Unscheduled)

- Remote pull / cross-device sync (blocked on trusted character token issuer from CCP)
- Background sync queue (blocked on same)
- Scout cell scope (cell identity model not yet designed)
- Signal editing
- Storage health warnings (quota usage, last export date)

---

*This is an alpha release. Expect changes, bugs, and data format updates. Always keep export backups.*
