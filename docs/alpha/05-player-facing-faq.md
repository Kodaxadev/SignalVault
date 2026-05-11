# Signal Vault — Player FAQ (Alpha)

Answers to questions alpha players are likely to ask. Written for players, not developers.

---

## General

**What is Signal Vault?**

Signal Vault is an intel logging tool for EVE Frontier. You create Signals — structured observations tagged to in-game objects like Smart Gates, Storage Assemblies, and Solar Systems. Signals track what you've seen, when you saw it, how confident you are, and who it's for.

**Is this an official EVE Frontier tool?**

No. Signal Vault is an independent project. It uses the EVE Frontier dApp Kit and World API but is not made or supported by CCP Games.

**Does Signal Vault access my game account?**

Signal Vault reads your wallet address and connected smart object context through the EVE Frontier in-game browser. It does not access your game account, credentials, passwords, or any data beyond what the in-game provider makes available.

**What data does Signal Vault store?**

All data is stored in your browser's local database (IndexedDB). Nothing is sent anywhere without your explicit action. The optional remote push feature is manual — you click a button per signal.

---

## Local Data & Storage

**Where are my signals stored?**

In your browser, in a local database called `signal-vault`. This is browser-specific and device-specific. Your signals in Chrome are not the same as your signals in Firefox. Your signals on your desktop are not on your laptop unless you transfer them.

**What happens if I clear my browser data?**

Your signals are deleted permanently from that browser. Signal Vault cannot recover them from the server — there is no automatic backup. Export your signals regularly if you care about keeping them.

**How do I back up my signals?**

Use the Export button. This downloads a JSON file containing all your signals and entity classifications. You can import this file on any device or browser.

**Can I use Signal Vault on multiple devices?**

Yes, but your data does not sync automatically. You need to export on one device and import on the other, or use the manual remote push to send signals to the backend and — in a future version — pull them on the other device. Right now, pull is not available.

**Can I use Signal Vault in a private/incognito window?**

Yes, but data stored in a private window does not persist when you close it. Do not use private mode if you want to keep your signals.

---

## Signals

**What types of signals can I create?**

Signal Vault supports 12 signal types:

- Field Note, Gate Recon, Storage Manifest, Route Report
- Market Report, System Report, Assembly Log
- Hostile Contact, Permit Report, Access Denied
- Resource Report, After Action Report

**What is confidence?**

Confidence indicates how certain you are about the information:

- **Observed** — you saw it directly
- **Inferred** — you drew a conclusion from what you saw
- **Rumor** — you heard it from someone else
- **Unverified** — you don't know

Confidence affects how the intel health panel in dossiers displays your signal relative to others.

**What is visibility?**

Visibility controls who can see a signal if it is pushed remotely:

- **Local private** — stays in your browser only, never pushed
- **Private** — your personal signals (wallet-authenticated)
- **Public** — anyone can read
- **Tribe** — members of your tribe only
- **Officer** — officers within your tribe only
- **Scout cell** — not available in alpha

Note: visibility only matters for remote sync. Local-only signals are always private by definition.

**Can I edit a signal after creating it?**

Not in the current alpha. You can create a new signal that supersedes the old one, or delete the incorrect signal and start over.

**What happens when a signal gets stale?**

Signal Vault tracks how old each signal is and compares it to the expected freshness for that signal type. For example, a hostile contact that is more than 24 hours old is marked **critical** — the information may no longer be reliable.

Staleness thresholds vary by type. A field note stays fresh for several days; a hostile contact becomes critical in 24 hours.

Stale signals are not deleted. They are flagged so you know to verify them.

**What is a contradiction?**

When two signals of the same type for the same entity have conflicting `observed` confidence — for example, "gate clear" and "gate camped" both marked as observed — Signal Vault flags this in the dossier intel panel as a contradiction. You need to verify which is current.

---

## Remote Sync

**What is remote sync?**

Remote sync lets you push a signal from your local browser to a shared backend server. Once pushed, the signal has a remote ID and the sync badge shows `Remote · [ID]`.

**Is remote sync available in alpha?**

Remote sync is available in alpha in **manual, dev-auth mode only**. It is not production-ready. See below.

**What does "Alpha · Manual only" or "Alpha · Dev auth · Manual only" mean on the push button?**

- **Alpha**: this feature is under development and may change or fail
- **Dev auth** (if shown): authentication uses developer-supplied credentials, not real EVE identity verification. This label only appears in dev-auth mode.
- **Manual only**: you push one signal at a time by clicking a button — there is no automatic or background sync

**What happens to my local signal if the push fails?**

Nothing. Your signal stays in your browser's local database with a `sync_failed` status. You can retry from the signal card. Remote sync failure never deletes or corrupts your local data.

**Can I pull signals from the remote backend?**

Not in the current alpha. Remote pull is not implemented. Signals you push to the server are not yet accessible on a second device via pull.

**Why does the push button say "character token not available"?**

This message appears when the server is not configured to resolve character identity. Signal Vault uses your wallet address to look up your EVE character on-chain — this requires the server to have `ENABLE_SUI_CHARACTER_RESOLUTION` enabled and a valid Sui GraphQL endpoint configured. If you see this message, the server is running without that configuration. Contact the server operator. It is not a bug in the client.

**Why does the push button say "Open in the EVE Frontier in-game browser to push Signals"?**

Wallet signing only works inside the EVE Frontier in-game browser, where the dApp Kit provider can sign challenge messages with your wallet. It is not available in standalone browser mode.

**Is my data safe on the remote backend?**

In alpha: treat remote-pushed data as temporary and potentially lossy. The backend is a development server. Do not rely on remote-pushed signals as your only copy. Keep your local copy and export regularly.

---

## Dossiers

**What is a dossier?**

A dossier is a view of all signals associated with a specific in-game entity — a Smart Gate, Smart Storage Assembly, Solar System, etc. It shows the signal timeline, staleness summary, and an intel health panel that highlights contradictions and stale data.

**How do I open a dossier?**

When you are viewing a signal associated with an entity, click the entity link or navigate to the dossier view. Dossiers are also accessible via the InGame smart object context.

**Why does a dossier show entity data I didn't enter?**

Signal Vault fetches enrichment data from the EVE Frontier World API — solar system names, tribe information, and game type data. This is read-only and does not modify your signals.

**Does Signal Vault remember World API data between sessions?**

Yes. World API enrichment data is cached locally so it does not need to be re-fetched every time. Solar system and tribe data is cached for 30 minutes; game type data is cached for 24 hours. If the World API is unavailable, Signal Vault will show whatever cached data it has (marked "stale") rather than showing nothing. The status badge on dossiers shows whether data came from a live fetch, the local cache, or is unavailable.

---

## Tribe & Permissions

**Can I share signals with my tribe?**

Yes, using `tribe` or `officer` visibility — but only via the remote push path, which is currently dev-auth only. Local-first signals with tribe visibility exist only in your browser.

**Why can't I select "scout cell" visibility?**

Scout cell scope is not available in alpha. The cell identity model required for sub-tribe groups has not been implemented.

**Does Signal Vault enforce tribe permissions?**

Yes. Tribe-scoped signals can only be pushed by a character with a verified tribe identity. The server resolves your tribe membership from your wallet address via on-chain Sui data — no separate credentials are needed. The server looks up your EVE character and reads your tribe ID from the blockchain.

---

## Technical

**What browsers work?**

Any modern browser with IndexedDB support. Chrome, Firefox, Edge, and Safari should all work. The in-game browser (required for wallet connection and smart object context) is the primary target.

**What is the current system selector?**

If you are using Signal Vault outside the EVE Frontier in-game browser (for example, in a standalone browser window), you can manually set which solar system you are in using the system selector in the header. Enter a numeric system ID and Signal Vault will confirm the name via the World API. Any text entry is stored as-is if it cannot be confirmed. Your selection persists across sessions.

**What are route warning cards?**

When viewing a Route dossier, Signal Vault shows warning cards derived from Signals you have logged for systems along that route. Hostile contact Signals produce critical warnings; access denied produces high; route reports produce medium; gate recon produces info. Signals that are critically stale are downgraded one level automatically. This is a local-only view — it reflects only Signals in your browser, not remote-synced intel from other players.

**Does Signal Vault work offline?**

For local-first features: yes. Creating signals, viewing dossiers, and using staleness tracking all work without internet access. Export and import work offline. Remote push requires network access. World API enrichment requires network access for the first load, but subsequent sessions use the local cache — so dossiers can show cached system, tribe, and type data even if the World API is temporarily unreachable.

**Does Signal Vault store any data on a server by default?**

No. All data is local by default. Nothing is sent to a server unless you explicitly click the remote push button. There is no telemetry, no analytics, no background data collection.
