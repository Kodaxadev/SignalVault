# Entity Resolution

## Core Rule

Object URLs provide hints, not truth.

Signal Vault must resolve object identity through a ranked pipeline and display confidence.

## Entity Types

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
```

## Resolution Confidence

```ts
export type ResolutionConfidence =
  | "url_hint"
  | "manual"
  | "cached"
  | "indexed"
  | "onchain_verified"
  | "conflicted"
  | "unknown";
```

## Resolved Entity

```ts
export type ResolvedEntity = {
  entityId: string;
  tenant?: string;
  itemId?: string;
  typeId?: string;
  objectId?: string;
  type: EntityType;
  label: string;
  confidence: ResolutionConfidence;
  sources: EntityResolutionSource[];
  raw?: unknown;
  updatedAt: string;
};
```

## Source Priority

```txt
1. dApp Kit / current Smart Object data
2. Sui GraphQL / on-chain object type
3. Custom indexer
4. Maintainer registry
5. Tribe registry
6. User manual classification
7. URL hint
8. Unknown
```

## Resolver Pipeline

```txt
Input:
  tenant
  itemId
  objectId
  hintedType

Resolution Steps:
  resolveFromDappKit
  resolveFromGraphql
  resolveFromIndexer
  resolveFromManualRegistry
  resolveFromUrlHint

Output:
  merged ResolvedEntity
```

## Unknown Object Behavior

Unknown object is valid.

UI should show:

```txt
SIGNAL VAULT // OBJECT DOSSIER

Type: Unresolved
Resolution: Unknown
Object: 0x...
Tenant: utopia

Actions:
[Connect Identity] [Classify Object] [Log Field Signal]
```

## Manual Classification

Manual classification should be allowed in v0.1.

It must display:

```txt
Resolution: Manual
Warning: Not on-chain verified
```

## Conflict Behavior

If sources disagree, do not silently overwrite.

Set:

```txt
confidence = "conflicted"
```

Then display a warning.

## Acceptance Criteria

- Object route works with only tenant/itemId.
- Object route works with only objectId.
- URL type param is never treated as verified.
- Unknown object renders safely.
- Manual classification can be promoted later.
- Conflicting classifications are surfaced.
