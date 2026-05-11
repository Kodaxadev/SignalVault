# ADR-005: Local-First Capture

## Status

Accepted.

## Decision

Signal Vault will support local-first draft capture using IndexedDB/Dexie.

## Rationale

In-game browser auth, network, or backend may fail. Players should not lose field observations.

## Consequence

Local/private Signals may exist before wallet login. Shared publishing requires authentication.
