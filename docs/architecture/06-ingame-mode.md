# In-Game Mode

## Purpose

In-Game Mode exists so players can use Signal Vault without constantly tabbing out.

It is not a full editor.

## UX Hierarchy

In-game pages must answer:

1. What am I looking at?
2. Is it safe/useful?
3. What changed recently?
4. What action can I log in one click?
5. Do I need the full external app?

## Routes

```txt
/ingame/object?tenant=&itemId=
/ingame/object/:objectId
/ingame/capture
/ingame/system/:systemName
/ingame/route/:routeId
```

## Layout

```txt
SIGNAL VAULT // OBJECT TYPE

Identity: Anonymous / Wallet / Character
Resolution: Unknown / Manual / Indexed / Verified
Risk: Green / Amber / Red / Black / Ghost

Recent Signals:
- ...
- ...

Actions:
[Quick Action] [Quick Action] [Quick Action]
```

## Gate In-Game View

```txt
SIGNAL VAULT // SMART GATE

Route Status: Amber
Access: Unknown / Open / Permit / Toll / Blocked
Last Verified: 38m ago

Recent Signals:
- Scout passed eastbound
- Jump failed westbound
- Hostile seen at exit

Actions:
[Passed] [Blocked] [Permit Required] [Hostile Nearby]
```

## Storage In-Game View

```txt
SIGNAL VAULT // STORAGE UNIT

Purpose: Fuel Cache
Access: Public / Tribe / Owner / Unknown
Manifest: Manual / API-confirmed / Stale
Last Check: 2d ago

Actions:
[Access Worked] [Access Denied] [Update Manifest] [Mark Empty]
```

## Market In-Game View

```txt
SIGNAL VAULT // MARKET WATCH

Status: Open / Closed / Unknown / Stale
Confidence: Observed
Last Report: Today

Actions:
[Market Open] [Market Closed] [Good Trade Point]
```

## Design Constraints

- Avoid heavy modals.
- Avoid full graph.
- Avoid large editor.
- Minimize text input.
- Use large enough click targets.
- Use compact but readable typography.
- Show identity and resolution state at all times.
