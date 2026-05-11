# Ability and Permission Matrix

## Purpose

Defines what each viewer type can do.

| Ability | Anonymous | Wallet Connected | Character Resolved | Tribe Member | Officer | Operator |
|---|---:|---:|---:|---:|---:|---:|
| View public dossier | Yes | Yes | Yes | Yes | Yes | Yes |
| Create local draft | Yes | Yes | Yes | Yes | Yes | Yes |
| Create private remote Signal | No | Yes | Yes | Yes | Yes | Yes |
| Create public remote Signal | No | Yes | Yes | Yes | Yes | Yes |
| Create tribe Signal | No | No | If tribe resolved | Yes | Yes | If member |
| Create officer Signal | No | No | No | No | Yes | If officer |
| Create scout-cell Signal | No | No | If scout role | If scout role | Yes | If authorized |
| Manual classify object | Local only or no | Yes | Yes | Yes | Yes | Yes |
| Submit classification dispute | No or local only | Yes | Yes | Yes | Yes | Yes |
| Resolve dispute | No | No | No | No | If authorized | If authorized |
| Publish operator object note | No | No | No | No | If authorized | Yes |
| Generate access code | No | Yes | Yes | Yes | Yes | Yes |
| Export private Signals | No | Yes | Yes | Yes | Yes | Yes |
| Export tribe Signals | No | No | No | If policy allows | Yes | If authorized |
| Delete own private Signal | No | Yes | Yes | Yes | Yes | Yes |
| Delete tribe Signal | No | No | No | If author/policy | Yes | If authorized |

## Ability Rules

### Anonymous

Can only act locally.

### Wallet Connected

Can own private/public remote data but cannot claim tribe scopes.

### Character Resolved

Can create character-attributed Signals.

### Tribe Member

Can read/write tribe Signals according to tribe policy.

### Officer

Can access officer-scoped data and resolve some tribe-level issues.

### Operator

Can manage object-facing operator notes only after object/operator capability is proven.

## Important Constraint

Object operator control does not override private or tribe Signal ownership.

Example:

A gate owner cannot read a scout-cell Signal attached to that gate unless the scout-cell policy grants access.
