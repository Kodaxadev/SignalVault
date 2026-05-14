# Desktop Packaging Readiness

**Status date:** 2026-05-14

**Phase:** 13B

**Goal:** Turn the Signal Vault desktop companion from a development shell into a Windows alpha artifact that can be launched and smoke-tested without making it part of the web/API release gate.

## Evidence

| Claim | Source |
|---|---|
| `Cargo.lock` records exact dependency information and supports deterministic builds across time and systems. | Cargo Book FAQ: https://doc.rust-lang.org/cargo/faq.html#why-have-cargolock-in-version-control |
| Cargo's guide says `Cargo.lock` contains exact dependency information and should generally be checked into version control when in doubt. | Cargo Book: https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html |
| Tauri Windows apps can be distributed as `.msi` installers with WiX or `-setup.exe` installers with NSIS. | Tauri Windows Installer docs: https://v2.tauri.app/distribute/windows-installer/ |
| Tauri supports `tauri build --no-bundle`, which builds the app without producing installer bundles. | Tauri Distribute docs: https://v2.tauri.app/distribute/ |
| Windows signing prevents SmartScreen trust warnings for browser-downloaded apps; unsigned apps can still run if the user accepts the warning. | Tauri Windows Code Signing docs: https://v2.tauri.app/distribute/sign/windows/ |
| Tauri config owns app name, version, bundle icons, and installer metadata. | Tauri Configuration docs: https://v2.tauri.app/reference/config/ |

## Decisions

| Decision | Result | Reason |
|---|---|---|
| Commit `apps/desktop/src-tauri/Cargo.lock`. | Implemented. | Signal Vault Companion is an application artifact, not a published Rust library, and the Cargo docs frame the lockfile as the dependency snapshot for deterministic builds. |
| Keep lockfiles outside the 400-line authored-source rule. | Implemented by current scope. | The line-limit checker scans authored web source; generated lockfiles are reproducibility artifacts, not human-authored modules. |
| Keep desktop packaging outside `pnpm check:release`. | Implemented. | Desktop is alpha packaging work; web/API release truthfulness should not depend on Windows GUI smoke tests yet. |
| Add `pnpm check:desktop-package`. | Implemented. | This creates an explicit desktop packaging gate without changing the main release gate. |
| Surface bridge port conflicts in the overlay. | Implemented. | A packaged app must explain why live bridge data is unavailable when `127.0.0.1:17777` is already occupied. |
| Continue using `tauri build --no-bundle` for 13B. | Implemented. | This produces a launchable release exe for alpha smoke testing while installer/signing work remains unresolved. |

## Current Artifact

Build command:

```powershell
pnpm build:desktop
```

Release exe:

```txt
apps/desktop/src-tauri/target/release/signal-vault-desktop.exe
```

Package smoke command:

```powershell
pnpm check:desktop-package
```

The smoke test launches the release exe, verifies the process stays alive long enough to serve the local bridge, checks `http://127.0.0.1:17777/state`, and then closes the process.

## Smoke Coverage

| Capability | Verification |
|---|---|
| Release exe launches | `pnpm check:desktop-package` |
| Bridge host starts | `pnpm check:desktop-package` expects HTTP `200` or `503` from `/state` |
| Port conflict is visible | Overlay shows `port conflict on 127.0.0.1:17777` |
| Tray remains configured | `pnpm check:desktop` tray script |
| Hotkey remains configured | `pnpm check:desktop` global shortcut script |
| Quick Note command remains local-only | `pnpm check:desktop` TypeScript and Rust tests |
| Set Current System command remains local-only | `pnpm check:desktop` TypeScript and Rust tests |
| Open Vault remains browser-only | `pnpm check:desktop` TypeScript and tray tests |

## Windows Install And Run

1. Build the alpha exe:

```powershell
pnpm build:desktop
```

2. Launch:

```powershell
apps\desktop\src-tauri\target\release\signal-vault-desktop.exe
```

3. Open Signal Vault web in the browser.

4. Paste the overlay pairing token into the web companion bridge token panel.

5. Confirm the overlay shows bridge state, then smoke-test:

- tray show/hide/toggle
- `Ctrl+Shift+Space` hotkey
- Open Vault
- Quick Note
- Set Current System
- bridge disconnected state after closing the web app

## Known Packaging Limits

- This is a release exe, not an installer.
- No `.msi` or NSIS setup artifact is claimed yet.
- The binary is unsigned.
- Windows SmartScreen or Defender may warn on downloaded unsigned binaries.
- No auto-update channel exists.
- No installer uninstall path exists.
- No production download page exists.

## Security Boundary

13B does not add:

- wallet signing
- EVE Vault impersonation
- dApp Kit provider emulation
- game memory reads
- process injection
- game input automation
- remote sync authority
- arbitrary bridge commands

The companion remains a local overlay and paired localhost bridge.
