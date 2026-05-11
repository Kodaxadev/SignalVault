# ADR-004: Entity Resolution

## Status

Accepted.

## Decision

Object ID and URL data are resolved through a ranked pipeline:

1. dApp Kit / Smart Object data
2. Sui GraphQL
3. custom indexer
4. maintainer registry
5. tribe registry
6. user manual classification
7. URL hint
8. unknown

## Rationale

URL params can be wrong or spoofed, while full on-chain inference may not be available in v0.1.

## Consequence

Manual classification is supported, but visibly labeled. Unknown object pages are valid.
