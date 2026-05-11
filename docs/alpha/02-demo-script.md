# Signal Vault — Demo Script

**Audience:** Internal / trusted alpha players  
**Mode:** Local-first (no backend required for steps 1–7). Step 8 requires backend + dev credentials.  
**Duration:** ~15 minutes for steps 1–7; add 5 minutes for optional step 8.

---

## Setup

### Standalone (browser, no InGame)

Open the deployed web app URL. No wallet connection required for local-only mode. You will be in `anonymous` viewer state — limited to `local_private` visibility signals.

### InGame (preferred for full demo)

Open Signal Vault from inside the EVE Frontier in-game browser via a Smart Object context URL:

```
/ingame/object/:objectId
```

The app detects the InGame surface, connects to the EVE Frontier dApp Kit provider, and pulls:
- Wallet address (from `useFrontierWalletAdapter`)
- Smart Object context: objectId, type, name, tenant (from `useSmartObjectContextAdapter`)

Once the wallet connects, viewer state advances to `wallet_connected`. Tribe identity (for tribe-scoped features) requires character resolution — currently deferred.

---

## Step 1 — Classify the Object

When entering via a Smart Object URL, the app presents the object context panel. This identifies the smart object type (Smart Gate, Smart Storage, System, etc.) and allows the user to confirm or override the object classification.

Entity classification associates all future signals logged here with this entity key.

**What to show:** The object name + type badge. Demonstrate that changing context (different Smart Gate) produces a different entity key and a separate dossier.

---

## Step 2 — Log a Signal

Click **New Signal**. Fill in:

| Field | Demo value |
|-------|-----------|
| Type | `gate_recon` |
| Confidence | `observed` |
| Visibility | `private` (if wallet connected) or `local_private` |
| Body | "Gate is camped by two hostiles. Confirming capsuleer hulls." |

Save. The signal appears in the list with its type badge, confidence, visibility, and `local_only` sync badge.

**Key message:** This signal is stored in the browser's local database. Nothing left this device. The sync badge confirms local-only state.

**Also demo:** Create a second signal with `hostile_contact` type, `inferred` confidence. This will drive the staleness demo in step 3.

---

## Step 3 — Stale / Contradiction Demo

Wait is optional — use a signal with a past timestamp if available, or explain the threshold:

**Staleness thresholds (hostile_contact):**
- Fresh: 0–4 hours
- Aging: 4–8 hours
- Stale: 8–24 hours
- Critical: 24+ hours

Show the staleness label in the dossier intel panel. A `hostile_contact` from 25 hours ago will appear **critical**.

**Contradiction demo:** Create two `hostile_contact` signals for the same entity:
1. Confidence `observed` — "Gate clear, no contacts."
2. Confidence `observed` — "Gate camped, two hostiles."

Open the dossier. The intel health panel shows a contradiction warning — two observed signals disagree. This is a real signal quality alert, not cosmetic.

**Key message:** Signal Vault surfaces data quality issues rather than hiding them. Staleness and contradiction are first-class intel concepts.

---

## Step 4 — World API Context

Open a dossier for a solar system or smart gate entity. The dossier pulls enrichment data from the EVE Frontier World API:

- Solar system: name, security status, region
- Tribe: name, member count (if available from API)

The enrichment uses a read-only HTTP client with an 8-second timeout. If the World API is unavailable, the dossier falls back gracefully — entity label is used, no crash.

**Key message:** Signal Vault enriches local intel with live game data, but never blocks on it. Local-first means it degrades gracefully.

---

## Step 5 — Export

Click **Export Signals**. The browser downloads a JSON file:

```json
{
  "schemaVersion": 1,
  "app": "signal-vault",
  "exportedAt": "2026-05-11T...",
  "signals": [ ... ],
  "classifications": [ ... ]
}
```

This is the complete local database snapshot. It includes all signals and all entity classifications.

**Key message:** You own your data. Export produces a portable, human-readable JSON file you control.

---

## Step 6 — Import (Merge or Replace)

On a second browser (or after clearing local state), click **Import Signals** and select the exported file.

Two modes:

| Mode | Behavior |
|------|---------|
| Merge | Adds signals not already present; skips duplicates by ID |
| Replace | Wipes current local state and loads the file entirely |

The import reports: `{ imported: N, skipped: N, errors: N }`.

**Key message:** Local-first means you can move your data. Signal Vault does not lock it in.

---

## Step 7 — Tribe Scope (If Character Resolved)

If character resolution is available (requires `character_resolved` viewer state with tribeId), demonstrate tribe-scoped visibility:

Create a signal with `tribe` visibility. This signal:
- Is visible in the dossier to the creating character
- Is eligible for remote push only when tribe-scoped policy is satisfied server-side
- Is NOT visible to anonymous or wallet-only viewers

**Note:** Scout cell scope (`scout_cell`) is locked in alpha — the cell identity model is not yet implemented.

---

## Step 8 — Optional: Manual Remote Push (Requires Backend + Dev Credentials)

**Prerequisites:**
- Backend running with `ENABLE_REMOTE_SIGNAL_WRITES=true`
- Client `.env` with `VITE_REMOTE_DEV_AUTH=true` and dev credential variables set

On the signal card, the push button shows:

```
Alpha · Dev auth · Manual only
[Push remote]
```

Click **Push remote**. The flow:

1. Preflight: checks backend reachable, writes enabled, auth available, signal eligible
2. Signal marked `remote_pending`
3. POST to `/api/v1/signals` with auth headers
4. On success: signal marked `remote_saved` with remote ID badge (`Remote · abcdef12`)
5. On failure: signal marked `sync_failed` with "Push failed — your Signal is saved locally." message and retry button

**Key message:** Remote push is manual. One signal at a time. The local Signal is always preserved regardless of push outcome. The "Alpha · Dev auth" label is intentional — this is not production auth.

---

## Demo Reset

To reset to a clean state: open browser DevTools → Application → IndexedDB → `signal-vault` → delete database. Or use the Import (Replace) mode with an empty export file.

---

## What Not to Demo

| Avoid | Reason |
|-------|--------|
| Presenting remote sync as reliable storage | Dev-auth only; no persistence guarantees |
| Scout cell scope | Locked — will error or be unavailable |
| "Automatic sync" | Does not exist — manual only |
| Character identity as authoritative | Assemblyowner fallback, not verified character JWT |
| Background sync or sync queue | Not implemented; explicitly deferred |
