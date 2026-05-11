# Security Review Checklist

## Authorization

- [ ] No `local_private` signals sent to backend
- [ ] **Client-side permission checks are UX only — server-side policy is authoritative**
- [ ] Author identity (character_id, tribe_id) derived server-side from verified auth, not client-supplied
- [ ] Tribe identity verified server-side (RLS policies)
- [ ] Cross-tribe reads denied at database level (RLS)
- [ ] Officer/role verification server-side for policy-driven write/delete

## Data Integrity

- [ ] Audit log immutable (append-only table)
- [ ] Rate limiting on write endpoints
- [ ] Signal body size limits
- [ ] Visibility enum validated server-side

## Data Minimization

- [ ] **No raw dApp Kit, World API, wallet, or character adapter payloads sent remotely**
- [ ] Remote linkedEntities store normalized snapshots only

## Authentication

- [ ] Wallet signature verification
- [ ] Character JWT expiration enforced

## Error Handling

- [ ] Typed error codes used (no stack traces in responses)
- [ ] No PII leaked in error responses
