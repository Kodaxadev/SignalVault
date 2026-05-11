# Phase 09I — Real Wallet Signing Boundary — Closeout

## Summary

Phase 09I adds a real challenge/signature boundary to the remote push path. The dev-auth shortcut remains available behind an explicit flag. The key upgrade: the backend now issues one-time challenges, and the wallet signing adapter (in the InGame chunk only) can sign those challenges for authenticated push requests.

Still no queue. Still no background sync. Still manual, single-Signal push only.

---

## What Was Built

### Backend

| File | Purpose |
|------|---------|
| `auth/challengeTypes.ts` | `Challenge`, `ChallengeRequest`, `ChallengeResponse`, `ChallengeConsumeResult` types |
| `auth/challengeStore.ts` | In-memory Map store: `createChallenge`, `consumeChallenge`, `_clearChallengeStore` |
| `auth/challengeRoutes.ts` | `POST /api/v1/auth/challenge` — issues one-time challenges |
| `auth/verifyChallengeSignature.ts` | Explicit abstraction for challenge-based signature verification (delegates to `verifyWalletSignature` in dev mode; production crypto pending) |
| `auth/resolveServerViewerContext.ts` | Added `challengeId?` to `AuthInputs` |
| `auth/parseAuthHeaders.ts` | Added `X-Challenge-Id` extraction |
| `auth/verifyAuth.ts` | Challenge path: `consumeChallenge` → `verifyChallengeSignature` → inject message → existing resolution |
| `server.ts` | Mounted `challengeRoutes` at `/api/v1/auth/challenge` |
| `health/healthHandler.ts` | Phase bumped to `'09I'` |

### Web

| File | Purpose |
|------|---------|
| `frontier/dappKit/walletSigningTypes.ts` | `WalletSigningSnapshot` type (available/unavailable) |
| `frontier/dappKit/useWalletSigningAdapter.ts` | dApp Kit hook, normalized signing API; signing_not_supported when no sign function detected |
| `remote/WalletSigningContext.tsx` | React context (no dApp Kit import); default = unavailable; InGameShell provides real snapshot |
| `remote/remoteChallengeClient.ts` | `requestChallenge(backendUrl, walletAddress)` — POST challenge endpoint |
| `remote/remoteWalletSigning.ts` | `signRemoteChallenge` — orchestrates challenge request + wallet signing |
| `remote/remoteSignedAuthHeaders.ts` | `buildSignedAuthHeaders` — headers for challenge-based push (X-Challenge-Id instead of X-Signature-Message) |
| `remote/remoteSignalPush.ts` | **Simplified** — now `(signal, backendUrl, headers)`, caller builds headers |
| `remote/remoteSyncPreflight.ts` | Added `signingAvailable?` to context; auth check passes if dev credentials OR signing available |
| `remote/components/RemoteSyncButton.tsx` | Handles both paths: dev auth (priority) and wallet signing; shows blocked message when neither available |
| `app/InGameShell.tsx` | Calls `useWalletSigningAdapter()`, provides snapshot via `WalletSigningProvider` |

---

## Challenge Flow

```
POST /api/v1/auth/challenge
  { walletAddress }
← { challengeId, message, expiresAt }

[Wallet signs challenge.message]

POST /api/v1/signals
  Headers:
    Authorization: Bearer <characterJwt>
    X-Wallet-Address: <walletAddress>
    X-Wallet-Signature: <signature of challenge.message>
    X-Challenge-Id: <challengeId>

Server:
  consumeChallenge(challengeId, walletAddress)
    → not_found / already_used / expired / wallet_mismatch → 401
  verifyChallengeSignature(challenge.message, signature, walletAddress)
    → signature_malformed / signature_invalid → 401
  resolveServerViewerContext (existing JWT + wallet path)
  → auth.ok → write signal
```

---

## Challenge Rules Enforced

| Rule | Implementation |
|------|---------------|
| 5-minute TTL | `expiresAt = Date.now() + 5 * 60 * 1000` |
| One-time use | `challenge.usedAt` set on first consumption; second call → `already_used` |
| Wallet binding | Address stored on creation; mismatch → `wallet_mismatch` (case-insensitive) |
| Expired | `Date.now() > expiresAt.getTime()` → `expired`, entry deleted |
| Unknown ID | `store.get` miss → `not_found` |

---

## Chunk Isolation Maintained

| Chunk | evefrontier refs | dApp Kit |
|-------|-----------------|----------|
| `index-*.js` (main) | 0 | None |
| `InGameRoute-*.js` | 2 | `useWalletSigningAdapter`, `useFrontierWalletAdapter`, `useFrontierCharacterAdapter` |

`WalletSigningContext.tsx` has **no** dApp Kit import — it holds only the React context. `useWalletSigningAdapter` stays in `frontier/dappKit`.

---

## Known Limitations (Deferred)

| Item | Status |
|------|--------|
| Cryptographic wallet signature recovery (Sui Ed25519/secp256k1) | Deferred — pending EVE dApp Kit scheme confirmation |
| Real character JWT issuance | Deferred — `VITE_REMOTE_DEV_CHARACTER_JWT` still required for signed pushes |
| Challenge store persistence | In-memory only — challenges lost on server restart |
| Challenge cleanup / eviction of expired entries | Lazy (deleted on failed consume); no background sweep |

---

## Test Coverage

| Suite | Before 09I | After 09I | Delta |
|-------|-----------|----------|-------|
| API (`apps/api`) | 118 / 5 skip | 146 / 5 skip | +28 |
| Web (`apps/web`) | 526 | 554 | +28 |
| TypeScript errors | 0 | 0 | — |

New API test files:
- `challengeStore.test.ts` — 8 tests
- `challengeRoutes.test.ts` — 7 tests
- `verifyChallengeSignature.test.ts` — 4 tests
- `verifyAuth.test.ts` — +5 tests (challenge path)
- `parseAuthHeaders.test.ts` — +1 test (X-Challenge-Id)

New/updated web test files:
- `useWalletSigningAdapter.test.tsx` — 8 tests
- `WalletSigningContext.test.tsx` — 3 tests
- `remoteChallengeClient.test.ts` — 5 tests
- `remoteWalletSigning.test.ts` — 5 tests
- `remoteSignedAuthHeaders.test.ts` — 5 tests
- `remoteSyncPreflight.test.ts` — +2 tests (signingAvailable)
- `remoteSignalPush.test.ts` — rewritten for new signature (7 tests)
- `RemoteSyncButton.test.tsx` — +1 test (signing path visible, blocked message)

---

## Acceptance Criteria

- [x] Challenge endpoint exists
- [x] Challenge includes wallet address binding
- [x] Challenge expires (5 minutes)
- [x] Reused challenge is rejected (`already_used`)
- [x] Expired challenge is rejected (`expired`)
- [x] Wallet signing adapter exists and never throws outside provider
- [x] Signing adapter remains isolated to InGameRoute chunk
- [x] Signed auth headers can be built from challenge + wallet signature
- [x] Manual push can use signed headers
- [x] Dev auth remains explicit and gated behind `VITE_REMOTE_DEV_AUTH`
- [x] If signing unavailable (and no dev auth), remote push is blocked with clear reason
- [x] No background sync or queue added
- [x] No remote pull/merge added
- [x] Local Signal preserved on failed signing or failed push
- [x] API tests: 146 passed / 5 skipped
- [x] Web tests: 554 passed
- [x] TypeScript: 0 errors
- [x] Build: success
- [x] check:lines: all files under 400 lines
- [x] Main chunk: 0 evefrontier refs
