# ADR-003: Viewer Context

## Status

Accepted.

## Decision

Opening Signal Vault from an EVE Frontier Smart Assembly proves context, not identity.

Signal Vault will model viewer state explicitly as:

- anonymous
- wallet_connected
- character_resolved

## Rationale

The in-game browser may not pass wallet identity or session tokens automatically.

## Consequence

All shared writes require resolved ViewerContext.

Anonymous users can view public dossiers and create local drafts only.
