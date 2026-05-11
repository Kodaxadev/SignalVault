# Signal Domain Model

## Signal

A Signal is a typed field record attached to game context.

```ts
export type SignalType =
  | "field_note"
  | "gate_recon"
  | "storage_manifest"
  | "route_report"
  | "market_report"
  | "system_report"
  | "assembly_log"
  | "hostile_contact"
  | "permit_report"
  | "access_denied"
  | "resource_report"
  | "after_action_report";
```

## Confidence

```ts
export type SignalConfidence =
  | "unknown"
  | "rumor"
  | "observed"
  | "corroborated"
  | "verified"
  | "stale"
  | "contradicted";
```

## Visibility

```ts
export type SignalVisibility =
  | "local_private"
  | "private"
  | "tribe"
  | "officer"
  | "scout_cell"
  | "public";
```

## Author

```ts
export type SignalAuthor =
  | { kind: "anonymous_local" }
  | { kind: "wallet"; walletAddress: string }
  | {
      kind: "character";
      walletAddress: string;
      characterId: string;
      characterName?: string;
      tribeId?: string;
    };
```

## Signal Record

```ts
export type Signal = {
  id: string;
  title: string;
  body: string;
  signalType: SignalType;
  confidence: SignalConfidence;
  visibility: SignalVisibility;
  author: SignalAuthor;

  linkedEntities: {
    entityId: string;
    type: EntityType;
    label: string;
    tenant?: string;
    itemId?: string;
    objectId?: string;
    resolutionConfidence: ResolutionConfidence;
  }[];

  createdInContext: {
    surface: "ingame_object" | "ingame_capture" | "external_app";
    tenant?: string;
    itemId?: string;
    objectId?: string;
    viewerState: ViewerContext["state"];
  };

  tags: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
};
```

## Design Rule

A Signal stores the entity-resolution confidence at creation time.

If later data upgrades an entity from manual to verified, the old Signal still preserves what was known when it was created.

## Quick Signal Actions

Gate:

- Passed
- Blocked
- Permit Required
- Toll Suspected
- Hostile Nearby

Storage:

- Access Worked
- Access Denied
- Update Manifest
- Mark Empty
- Mark Stale

Market:

- Market Open
- Market Closed
- Poor Liquidity
- Good Trade Point
- Hostile Trade Hub

Route:

- Route Safe
- Route Unsafe
- Re-scout Needed
- Stale Route
- Blocked Hop
