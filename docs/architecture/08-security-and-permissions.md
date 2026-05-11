# Security and Permissions

## Core Security Rules

1. Opening a dApp URL is not authentication.
2. URL params are not trusted.
3. Anonymous users cannot publish shared/tribe Signals.
4. All shared writes require ViewerContext.
5. All role-gated reads go through permission checks.
6. Manual entity classification is labeled.
7. Access codes are short-lived and one-time use.
8. Sessions can be revoked.
9. Every shared write is audited.
10. Do not store private keys or wallet secrets.

## Visibility Scopes

```ts
export type SignalVisibility =
  | "local_private"
  | "private"
  | "tribe"
  | "officer"
  | "scout_cell"
  | "public";
```

## Permission Logic

```ts
export function canReadSignal(viewer: ViewerContext, signal: Signal): boolean {
  if (signal.visibility === "public") return true;

  if (viewer.state === "anonymous") {
    return signal.visibility === "local_private" &&
      signal.author.kind === "anonymous_local";
  }

  if (signal.visibility === "private") {
    return signal.author.kind !== "anonymous_local" &&
      signal.author.walletAddress === viewer.walletAddress;
  }

  if (viewer.state !== "character_resolved") return false;

  if (signal.visibility === "tribe") {
    return signal.author.kind === "character" &&
      signal.author.tribeId === viewer.tribeId;
  }

  if (signal.visibility === "officer") {
    return viewer.roles.includes("officer");
  }

  if (signal.visibility === "scout_cell") {
    return viewer.roles.includes("scout");
  }

  return false;
}
```

## Audit Events

Audit:

- create Signal
- update Signal
- delete Signal
- change visibility
- classify entity
- generate access code
- consume access code
- revoke session
- role/permission change

## Data Safety

Do not store:

- wallet private keys
- seed phrases
- raw authentication secrets
- sensitive cookies in localStorage
- unencrypted long-lived access codes

Use secure HTTP-only cookies for sessions where possible.
