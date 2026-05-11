# Auth Header Contract

## Current State (Phase 09L.2)

Auth credentials are supplied via **HTTP headers**. The request body carries the signal payload only — no auth fields.

The required headers differ by identity mode. **Production Sui mode does not use `Authorization: Bearer`** — sending one causes an immediate `401 auth_mode_conflict`. Wallet signature headers are sufficient.

### Production Sui Mode Headers (ENABLE_SUI_CHARACTER_RESOLUTION=true, AUTH_DEV_MODE=false)

```
X-Wallet-Signature: <walletSignature>
X-Challenge-Id: <challengeId>
X-Wallet-Address: <walletAddress>
```

| Header | Required | Purpose |
|---|---|---|
| `Authorization` | **Must be absent** | Bearer JWT is **rejected** in production Sui mode → `401 auth_mode_conflict` |
| `X-Wallet-Signature` | Yes | Wallet signature bytes (hex or base64) |
| `X-Challenge-Id` | Yes (production) | Server-issued challenge ID from `POST /api/v1/auth/challenge` |
| `X-Wallet-Address` | Yes (production) | Client wallet address — verified against challenge binding |

If `X-Wallet-Signature` is absent, the server returns `401 auth_missing`.

### Dev / JWT Mode Headers (AUTH_DEV_MODE=true, Sui disabled or fallback)

```
Authorization: Bearer <characterJwt>
X-Wallet-Signature: <walletSignature>
X-Signature-Message: <signedMessage>
X-Wallet-Address: <walletAddress>
```

| Header | Required | Purpose |
|---|---|---|
| `Authorization` | Yes (JWT path) | `Bearer <characterJwt>` — character identity token |
| `X-Wallet-Signature` | Yes | Wallet signature bytes (hex or base64) |
| `X-Signature-Message` | Recommended | The exact message the wallet signed (static path) |
| `X-Wallet-Address` | No | Client-supplied wallet address — used only as a dev-mode hint |

If `X-Wallet-Signature` is absent, the server returns `401 auth_missing`.

### Request Body (signal payload only)

```json
{
  "signal": {
    "visibility": "public",
    "signalType": "gate_recon",
    "confidence": "high",
    "title": "...",
    "body": "...",
    "linkedEntities": [],
    "createdAt": "2026-05-10T12:00:00.000Z"
  }
}
```

## Server-Side Identity Rules

These rules hold regardless of transport:

1. **Wallet address is derived from the signature** — never from a client-supplied field. `X-Wallet-Address` is used as the challenge binding anchor in production Sui mode.
2. **In production Sui mode, character ID and tribe ID come from on-chain Sui data** — not from a JWT. The `Authorization: Bearer` header is explicitly blocked.
3. **In dev/JWT mode, character ID and tribe ID come from the verified JWT** — never from the request body.
4. **`AUTH_DEV_MODE=true` bypasses cryptographic verification** — not permitted in production.
5. **Production Sui mode + Bearer token = immediate rejection** — `auth_mode_conflict` (401) is returned before Sui is ever queried. This surfaces misconfiguration fast.

## History

| Phase | Transport |
|---|---|
| 09E | Auth in request body (`auth.walletSignature`, `auth.characterJwt`) |
| 09G | **Auth in HTTP headers (current)** |

Body auth was accepted in 09E–09F as a documented temporary state while the client sync layer was being designed. It was removed in 09G when the client preflight layer introduced `remoteAuthHeaders.ts`.

## Challenge Flow (Implemented — Phase 09L.2)

Replay protection via a server-issued challenge is implemented and required in production Sui mode:

```
POST /api/v1/auth/challenge
Body: { "walletAddress": "<walletAddress>" }
→ { "challengeId": "<uuid>", "message": "<signedMessage>", "expiresAt": "<ISO8601>" }
```

The client signs `message` with the Sui wallet. The resulting signature plus the `challengeId` and `walletAddress` are sent as headers (`X-Wallet-Signature`, `X-Challenge-Id`, `X-Wallet-Address`). The server consumes the challenge atomically (one-time use) before verifying the signature.

The static `X-Signature-Message` path (no challenge) remains for dev-mode compatibility when `AUTH_DEV_MODE=true`.

## Signature Verification Status

| Step | Status |
|---|---|
| JWT decoding (dev mode) | Done — `jose.decodeJwt` without signature check |
| JWT verification (production) | Done — `jose.jwtVerify` with `JWT_SECRET` or `JWT_JWKS_URL` |
| Wallet sig structural check (dev) | Done — length validation + hint passthrough |
| Challenge issuance + one-time consumption | Done — `POST /api/v1/auth/challenge`, `challengeStore.ts` |
| Wallet sig crypto recovery (production) | Pending — requires EVE dApp Kit signature format confirmation |
| Production Sui mode: auth_mode_conflict guard | Done — Bearer token rejected before Sui query |

## Production Configuration

| Env Var | Package | Purpose |
|---|---|---|
| `ENABLE_SUI_CHARACTER_RESOLUTION` | `apps/api` | Activates Sui identity path. When `true` + `AUTH_DEV_MODE=false`: Bearer token rejected, Sui-only mode |
| `SUI_GRAPHQL_URL` | `apps/api` | Sui GraphQL endpoint. Defaults to Stillness testnet. |
| `AUTH_DEV_MODE` | `apps/api` | Bypasses all signature verification — never in production. Must be `false` in Sui mode. |
| `JWT_SECRET` | `apps/api` | HS256 secret for dev/test JWTs — not used when Sui identity is active |
| `JWT_JWKS_URL` | `apps/api` | JWKS endpoint for RS256/ES256 production tokens — blocked pending EVE/CCP issuer |
| `JWT_ISSUER` | `apps/api` | Expected `iss` claim (validated) |
| `JWT_AUDIENCE` | `apps/api` | Expected `aud` claim (validated) |
| `VITE_REMOTE_SYNC_URL` | `apps/web` | Backend URL for remote sync preflight and push |
| `VITE_REMOTE_DEV_AUTH` | `apps/web` | Enables mock credentials in `buildRemoteAuthHeaders` for local testing — dev auth is not production auth |
