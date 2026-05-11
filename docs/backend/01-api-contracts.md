# API Contracts

## REST Endpoints

```
POST   /api/v1/signals              — Create remote signal
GET    /api/v1/signals              — List signals (scope-filtered)
GET    /api/v1/signals/:id          — Get single signal
PATCH  /api/v1/signals/:id          — Update signal (policy-driven)
DELETE /api/v1/signals/:id          — Delete signal (policy-driven)
POST   /api/v1/signals/:id/export   — Export signal
```

## Authentication

All endpoints require:
- **Wallet signature** — proves wallet ownership
- **Character JWT** — proves character identity (server derives author from this)

Server derives author identity from verified auth, **not from client-supplied fields**.

## POST /api/v1/signals

**Request:**
```json
{
  "signal": {
    "visibility": "tribe" | "officer" | "scout_cell" | "public" | "private",
    "signalType": "string",
    "confidence": "string",
    "title": "string",
    "body": "string",
    "linkedEntities": [],
    "createdAt": "ISO8601",
    "expiresAt": "ISO8601?"
  },
  "auth": {
    "walletSignature": "string",
    "characterJwt": "string"
  }
}
```

**Policy checks (server-side authoritative):**
- `public` — minimal checks
- `private` — requires wallet match
- `tribe` — requires verified tribe membership
- `officer` — requires verified officer role
- `scout_cell` — requires verified cell identity (locked in 09A)

**Response 201:**
```json
{
  "signal": { /* RemoteSignal */ },
  "auditEvent": { /* AuditEvent */ }
}
```

## GET /api/v1/signals

**Request query:**
- `tribeId` (optional) — filter by tribe
- `visibility` (optional, comma-separated) — filter by scope
- `entityKey` (optional) — filter by entity
- `limit` (optional, default 50)
- `cursor` (optional, pagination)

**Policy checks:**
- Cross-tribe reads denied at database level
- Scope filtering applied per signal visibility

**Response 200:**
```json
{
  "signals": [ /* RemoteSignal[] */ ],
  "nextCursor": "string?"
}
```

## GET /api/v1/signals/:id

**Policy checks:**
- Same as list, scoped to single signal
- Returns 404 if not found or access denied

**Response 200:**
```json
{
  "signal": { /* RemoteSignal */ }
}
```

## PATCH /api/v1/signals/:id

**Request:**
```json
{
  "updates": {
    "title": "string?",
    "body": "string?",
    "confidence": "string?",
    "visibility": "string?"
  },
  "auth": {
    "walletSignature": "string",
    "characterJwt": "string"
  }
}
```

**Policy-driven authorization:**
Allowed if any of:
- Original author and policy permits
- Authorized tribe role permits
- Future moderation/admin policy permits

Not hardcoded to officer-only.

**Response 200:**
```json
{
  "signal": { /* RemoteSignal */ },
  "auditEvent": { /* AuditEvent */ }
}
```

## DELETE /api/v1/signals/:id

**Request:**
```json
{
  "auth": {
    "walletSignature": "string",
    "characterJwt": "string"
  }
}
```

**Policy-driven authorization:** Same as PATCH.

**Response 200:**
```json
{
  "auditEvent": { /* AuditEvent */ }
}
```

## POST /api/v1/signals/:id/export

**Request:**
```json
{
  "format": "json" | "csv",
  "auth": {
    "walletSignature": "string",
    "characterJwt": "string"
  }
}
```

**Response 200:**
```json
{
  "exportUrl": "string",
  "auditEvent": { /* AuditEvent */ }
}
```

## Error Response

```json
{
  "code": "auth_missing" | "wallet_signature_invalid" | "character_token_invalid" | "tribe_identity_missing" | "tribe_mismatch" | "scope_not_allowed" | "signal_not_found" | "visibility_not_allowed" | "rate_limited" | "validation_failed" | "server_error",
  "message": "string",
  "requestId": "string?"
}
```
