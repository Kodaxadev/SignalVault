# In-Game Interaction Flow Catalog

## Purpose

This document defines the actual moment-to-moment in-game flows Signal Vault must support.

---

# Flow 1: Player Opens Signal Vault From Smart Assembly

## Trigger

Player interacts with a Smart Assembly in EVE Frontier and opens the linked dApp URL.

## Inputs

- tenant
- itemId or objectId
- optional URL hint
- existing session cookie if any

## Steps

1. Load InGameShell.
2. Parse object context.
3. Resolve ViewerContext.
4. Resolve entity.
5. Load public dossier.
6. Load private/tribe Signals if permitted.
7. Render object-specific dossier or UnknownObjectDossier.

## Output

Player sees:

- object type/confidence
- identity state
- recent Signals
- warnings
- quick actions

## Failure States

- no identity → public only
- unresolved object → unknown dossier
- backend unavailable → local-only mode
- resolver error → manual fallback

---

# Flow 2: Player Logs Gate Passage

## Trigger

Player uses or attempts to use a Smart Gate.

## Quick Actions

- Passed
- Blocked
- Permit Required
- Toll Suspected
- Hostile Nearby

## Steps

1. Player clicks quick action.
2. App creates Signal draft.
3. Signal links to current gate object.
4. Signal stores ViewerContext snapshot.
5. Signal stores entity-resolution snapshot.
6. If authenticated and visibility allows, save remote.
7. Else save local.

## Output

Gate dossier updates recent Signals.

## Generated Signal Example

```json
{
  "signalType": "gate_recon",
  "confidence": "observed",
  "tags": ["gate", "passed"],
  "linkedEntities": ["current_gate"],
  "createdInContext": {
    "surface": "ingame_object"
  }
}
```

---

# Flow 3: Player Encounters Blocked Gate

## Trigger

Gate blocks jump or requires permit/toll.

## Player Action

Click:

```txt
[Blocked] or [Permit Required]
```

## App Behavior

- creates access_denied or permit_report
- increases gate/route risk
- may mark route amber/red
- may trigger contradiction if recent successful reports exist

## Result

Other users see:

```txt
Recent failed passage. Re-scout before hauling.
```

---

# Flow 4: Player Finds Storage

## Trigger

Player interacts with a storage unit.

## Quick Actions

- Access Worked
- Access Denied
- Update Manifest
- Mark Empty
- Mark Stale

## App Behavior

- links Signal to storage object
- optionally links to system/route
- records purpose/access/manifest state
- labels manifest as manual unless verified

## Result

Storage dossier becomes useful for future retrieval/logistics.

---

# Flow 5: Player Checks Market

## Trigger

Player visits market/trade location.

## Quick Actions

- Market Open
- Market Closed
- Poor Liquidity
- Good Trade Point
- Hostile Trade Hub

## App Behavior

- creates market_report
- links to system/market entity
- updates system dossier
- route dossier can show market stop status

## Result

Haulers avoid dead/closed markets.

---

# Flow 6: Player Enters System

## Trigger

Manual selection in v0.1, Signal Bridge later.

## Player Action

Open system dossier or select current system.

## App Behavior

Shows:

- known gates
- storage
- market status
- recent hostile contacts
- route links
- stale/contradicted warnings

## Result

Player can decide whether to stay, travel, dock, scout, or avoid.

---

# Flow 7: Player Creates Route Report

## Trigger

Player scouts or travels a route.

## Player Action

Create route Signal or mark route safe/unsafe/stale.

## App Behavior

- links route to systems/gates
- aggregates gate risk
- surfaces stale hops
- warns about contradicted gate reports

## Result

Route becomes an operational object.

---

# Flow 8: Player Uses External App To Generate Access Code

## Trigger

In-game browser has no wallet session.

## Steps

1. Open external Signal Vault.
2. Connect wallet.
3. Resolve character if possible.
4. Generate code.
5. Enter code in in-game browser.
6. In-game session links to wallet/character.

## Result

Player can write private/tribe Signals from in-game browser.

---

# Flow 9: Player Reports Wrong Object Classification

## Trigger

Object says Smart Gate but player believes it is Storage Unit.

## Steps

1. Click Report Classification.
2. Choose proposed type.
3. Add reason/evidence.
4. Submit dispute.
5. Entity displays disputed/conflicted state if appropriate.

## Result

Resolver/admin/verified data can correct classification.

---

# Flow 10: Tribe Officer Reviews Route Risk

## Trigger

Officer opens external app.

## Steps

1. Open route dossier.
2. Filter tribe Signals.
3. Review stale/contradicted reports.
4. Assign re-scout task manually or create Signal.
5. Mark route status.

## Result

Tribe avoids using bad routes.

---

# Flow 11: Operator Publishes Object Notice

## Trigger

Owner/operator manages a Smart Assembly.

## Steps

1. Claim operator role later.
2. Open object operator page.
3. Publish public object note.
4. Set purpose/access guidance.
5. Link FrontierWarden policy later.

## Result

Players opening object page see official operator context plus subjective Signals.

---

# Flow 12: Offline / Backend Failure Capture

## Trigger

Network/backend unavailable.

## Steps

1. Player clicks quick action.
2. App stores local draft in Dexie.
3. UI shows unsynced state.
4. Later sync retries.
5. User can export local data.

## Result

No field observation is lost.
