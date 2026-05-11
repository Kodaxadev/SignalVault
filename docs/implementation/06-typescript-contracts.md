# TypeScript Contracts

## Entity

```ts
export type EntityType =
  | "smart_gate"
  | "smart_storage_unit"
  | "smart_turret"
  | "network_node"
  | "character"
  | "tribe"
  | "system"
  | "route"
  | "market"
  | "item"
  | "unknown";

export type ResolutionConfidence =
  | "url_hint"
  | "manual"
  | "cached"
  | "indexed"
  | "onchain_verified"
  | "conflicted"
  | "unknown";

export type ResolvedEntity = {
  entityId: string;
  tenant?: string;
  itemId?: string;
  typeId?: string;
  objectId?: string;
  type: EntityType;
  label: string;
  confidence: ResolutionConfidence;
  sources: string[];
  raw?: unknown;
  updatedAt: string;
};
```

## Viewer

```ts
export type ViewerContext =
  | {
      state: "anonymous";
      source: "ingame_browser" | "external_browser";
      sessionId?: string;
      canWriteShared: false;
      canReadScopes: ["public"];
    }
  | {
      state: "wallet_connected";
      source: "eve_vault" | "sui_wallet";
      walletAddress: string;
      sessionId: string;
      canWriteShared: false;
      canReadScopes: ["public", "private"];
    }
  | {
      state: "character_resolved";
      source: "eve_vault" | "sui_wallet" | "access_code";
      walletAddress: string;
      characterId: string;
      characterObjectId?: string;
      characterName?: string;
      tribeId?: string;
      tribeName?: string;
      roles: VaultRole[];
      sessionId: string;
      canWriteShared: true;
      canReadScopes: SignalVisibility[];
    };
```

## Signal

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

export type SignalConfidence =
  | "unknown"
  | "rumor"
  | "observed"
  | "corroborated"
  | "verified"
  | "stale"
  | "contradicted";

export type SignalVisibility =
  | "local_private"
  | "private"
  | "tribe"
  | "officer"
  | "scout_cell"
  | "public";
```
