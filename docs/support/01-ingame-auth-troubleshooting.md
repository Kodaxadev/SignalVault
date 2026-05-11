# In-Game Auth Troubleshooting Guide

## Status

Drafted from official EVE Frontier / EVE Vault / dApp Kit constraints.

## Why This Exists

Signal Vault must work when opened from the EVE Frontier in-game browser, but opening the dApp from a Smart Assembly does **not** automatically prove who the viewer is.

Signal Vault therefore supports three identity states:

1. Anonymous
2. Wallet connected
3. Character resolved

## Official Constraints

EVE Frontier docs state that:

- a Smart Assembly can open an in-game browser dApp page when a player interacts with the Assembly
- the Base dApp shows public owner/state information for Smart Assemblies
- custom external dApps are independent from CCP's safe zone
- EVE Vault is the official wallet/identity layer for dApps
- external dApps use EVE Vault / Sui Wallet Standard connection
- dApp Kit supports wallet connection and Smart Object data
- assembly context uses `tenant` and `itemId` URL parameters

## Signal Vault Rule

Opening Signal Vault from in-game proves **object context**, not **player identity**.

Therefore:

```txt
In-game object URL ≠ authenticated player
```

## Expected Auth States

### Anonymous

Shown when:

- no Signal Vault session exists
- wallet connection is unavailable
- access code has not been entered
- session expired
- character resolution failed

Allowed:

- view public dossier
- create local-only drafts
- see object context
- see manual/verified object status

Blocked:

- publish private remote Signals
- publish tribe Signals
- view tribe/officer/scout-cell Signals

### Wallet Connected

Shown when:

- EVE Vault/Sui wallet connection succeeded
- wallet address is known
- character is not yet resolved

Allowed:

- create private remote Signals
- create public Signals if policy allows
- generate in-game access code
- request character resolution

Blocked:

- tribe/officer/scout-cell writes until character/tribe is resolved

### Character Resolved

Shown when:

- wallet maps to EVE Frontier character
- character/tribe info is available

Allowed:

- character-attributed Signals
- tribe Signals if tribe membership is resolved
- role-scoped Signals if role data exists

## Recommended Login Flow

### External Browser Flow

Use this when the in-game browser cannot connect to EVE Vault directly.

```txt
1. Open Signal Vault externally.
2. Connect EVE Vault.
3. Resolve wallet/character if possible.
4. Generate short-lived in-game access code.
5. Return to in-game browser.
6. Enter code.
7. Signal Vault links the in-game session.
```

### In-Game Browser Flow

Use this when wallet connection works in the in-game browser.

```txt
1. Open Signal Vault from Smart Assembly.
2. Click Connect Identity.
3. Approve wallet connection if EVE Vault is available.
4. Signal Vault resolves wallet.
5. Signal Vault attempts character resolution.
```

## Common Problems

### Problem: Signal Vault says "Identity Unresolved"

Likely causes:

- no wallet/session in this browser
- in-game browser cannot access EVE Vault extension
- access code not entered
- access code expired
- session cookie missing/blocked
- character resolver failed

User answer:

> Your object page loaded, but Signal Vault cannot prove who you are yet. Use Connect Identity or generate an in-game access code from the external app.

Implementation response:

- show public dossier
- show identity unresolved banner
- show access-code panel
- allow local-only draft capture

### Problem: Access Code Expired

Expected behavior:

- code expires quickly for security
- user must generate a new code externally

Implementation response:

- reject code
- display "Code expired. Generate a new one."
- do not create session

### Problem: Access Code Already Used

Expected behavior:

- access codes are one-time use

Implementation response:

- reject code
- display "Code already used. Generate a new one."
- do not create session

### Problem: Wallet Connected but Character Not Resolved

Likely causes:

- character data unavailable
- wrong tenant/server
- graph/indexer unavailable
- PlayerProfile not found
- wallet not linked to a character yet

User answer:

> Signal Vault knows your wallet but has not resolved your EVE Frontier character yet. You can create private wallet Signals, but tribe Signals require character resolution.

Implementation response:

- set ViewerContext to `wallet_connected`
- allow private Signals
- block tribe/officer/scout-cell writes
- provide retry button

### Problem: Wrong Tenant

Symptoms:

- wallet works but character/object is missing
- object route does not resolve
- itemId looks valid but no assembly loads

Implementation response:

- display current tenant
- provide tenant mismatch warning
- support `?tenant=utopia&itemId=...`
- never silently switch tenant

### Problem: Wallet Popup Does Not Appear

Likely causes:

- in-game browser cannot use extension
- EVE Vault locked
- EVE Vault not installed
- browser extension permissions unavailable
- user is inside iframe/embed context

User answer:

> Use the external browser flow and generate an in-game access code.

Implementation response:

- do not block public dossier
- show fallback access-code login
- save quick Signals locally

### Problem: Session Worked Yesterday But Not Today

Likely causes:

- session expired
- access revoked
- wallet unlock/signing expired
- zkLogin epoch/signing boundary requires unlock again
- browser storage cleared

Implementation response:

- show identity unresolved
- keep local data
- prompt reconnect/access-code flow

## Error Codes

Recommended API/user-facing error codes:

```txt
AUTH_ANONYMOUS
AUTH_CODE_EXPIRED
AUTH_CODE_CONSUMED
AUTH_CODE_INVALID
AUTH_SESSION_EXPIRED
AUTH_SESSION_REVOKED
AUTH_WALLET_UNAVAILABLE
AUTH_CHARACTER_NOT_FOUND
AUTH_TENANT_MISMATCH
AUTH_ROLE_UNRESOLVED
```

## UI Requirements

Always show:

- current identity state
- current tenant
- whether user is local-only
- whether Signal writes will sync remotely
- blocked reason for shared writes

Example:

```txt
IDENTITY UNRESOLVED
Public dossier only. Local drafts enabled.
[Connect Identity] [Enter Access Code]
```

Example:

```txt
WALLET CONNECTED
Character unresolved. Private Signals enabled. Tribe Signals blocked.
[Retry Character Resolve]
```

Example:

```txt
CHARACTER RESOLVED
Tribe: Clonebank 86
Scopes: private, public, tribe
```

## Developer Acceptance Criteria

- Anonymous in-game session never crashes.
- Public dossier loads before auth.
- Access-code fallback works without wallet extension in in-game browser.
- Expired/consumed/invalid codes are distinct errors.
- Wallet-only users cannot write tribe Signals.
- Character resolution failure does not remove private access.
- Tenant mismatch is visible.
- All auth failures degrade to local-only capture, not data loss.

## Source Notes

This doc is based on official EVE Frontier docs for in-game dApp opening, custom dApps, EVE Vault identity, the browser extension, external dApp connection, and dApp Kit wallet/object hooks.
