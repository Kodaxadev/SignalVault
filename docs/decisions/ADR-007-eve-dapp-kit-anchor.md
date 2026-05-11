# ADR-007: EVE dApp Kit as Compatibility Anchor

## Status

Accepted.

## Decision

Use `@evefrontier/dapp-kit` as the primary EVE Frontier integration boundary.

## Rationale

It provides EVE-specific React hooks, wallet connection, Smart Object context, GraphQL helpers, sponsored transaction hooks, and URL/env object configuration.

## Consequence

Do not casually mix Mysten packages outside the dApp Kit peer range. Inspect and pin dependency versions according to the kit's requirements.
