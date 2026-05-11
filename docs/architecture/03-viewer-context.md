# Viewer Context

## Core Rule

Opening Signal Vault from EVE Frontier proves **context**, not identity.

The in-game browser is treated as anonymous until Signal Vault establishes a valid viewer session.

## Viewer States

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
      canReadScopes: SignalScope[];
    };
```

## Anonymous Viewer

Can:

- view public dossier
- view public Signals
- create local drafts
- classify object locally if allowed by product mode

Cannot:

- publish shared Signals
- view private Signals
- view tribe Signals
- claim character identity
- write officer/scout-cell Signals

## Wallet Connected Viewer

Can:

- create private Signals
- save to remote private vault
- generate in-game access code
- request character resolution

Cannot:

- assume tribe identity until character resolution succeeds

## Character Resolved Viewer

Can:

- create character-attributed Signals
- access tribe-scoped Signals if role permits
- publish shared/tribe Signals
- view role-gated data

## In-Game Access Code Flow

```txt
External Browser:
  Connect EVE Vault
  Resolve wallet/character
  Generate access code

In-Game Browser:
  Enter access code
  Backend validates code
  Session cookie issued
  ViewerContext becomes wallet_connected or character_resolved
```

## Acceptance Criteria

- Anonymous public dossier works.
- Anonymous viewer cannot publish shared Signals.
- Access code expires quickly.
- Access code is one-time use.
- Session can be revoked.
- Every write path receives ViewerContext.
- UI shows current identity state.
