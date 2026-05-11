# Browser Compatibility Requirements

## Status

Drafted from official EVE Frontier dApp/in-game browser constraints. Exact embedded browser engine/version is not currently documented in the official docs inspected, so Signal Vault must test compatibility empirically.

## Purpose

Signal Vault must work in:

1. EVE Frontier in-game browser
2. normal desktop browser
3. possibly constrained embedded browser contexts

The in-game surface must be treated as the most fragile target.

## Officially Confirmed Context

Official EVE Frontier docs confirm:

- players can interact with a Smart Assembly and open an in-game browser dApp page
- custom external dApps can be viewed in-game
- external custom dApps are independent from CCP's safe zone
- dApp Kit supports Smart Object data, wallet connection, auto-polling, and GraphQL-backed assembly data
- assembly context can be configured through `?tenant=...&itemId=...`
- EVE Vault is currently a Chrome extension/web app identity path for external dApps

## Unknowns

The inspected official docs do **not** specify:

- exact in-game browser engine
- exact browser version
- IndexedDB availability
- localStorage/sessionStorage behavior
- cookie persistence behavior
- extension injection availability
- popup behavior
- clipboard permission behavior
- file upload behavior
- CSP restrictions
- third-party cookie behavior
- iframe restrictions

Therefore, these must be tested during Phase 01 and Phase 02.

## Compatibility Strategy

### Tier 1: Required In-Game Features

The in-game page must support:

- static HTML/CSS/JS load
- route parsing
- query parameter parsing
- public dossier render
- quick action buttons
- local error fallback
- compact UI

### Tier 2: Strongly Desired

- cookies for app session
- localStorage or IndexedDB for local drafts
- fetch/XHR to backend
- CORS-compatible API calls
- responsive layout
- wallet connection if available

### Tier 3: Optional / Later

- file upload
- clipboard API
- drag/drop
- rich Markdown editor
- graph rendering
- service worker
- push notifications
- overlay integration

## Conservative Frontend Requirements

For in-game mode, avoid depending on:

- browser extensions
- popups
- clipboard permission
- drag/drop uploads
- service workers
- WebRTC
- advanced animations
- large graph canvases
- heavy editor frameworks
- third-party iframes
- cross-site cookies

## Required Smoke Tests

Create a `/compat` diagnostic route.

```txt
/compat
```

It should test and display:

- JavaScript enabled
- URLSearchParams
- fetch
- localStorage
- sessionStorage
- IndexedDB
- cookies
- CSS grid
- CSS flexbox
- viewport size
- pointer/click events
- keyboard input
- textarea input
- network reachability to API
- wallet provider detection
- dApp Kit connection state if available

## Diagnostic Result Shape

```ts
export type BrowserCompatReport = {
  userAgent?: string;
  viewport: {
    width: number;
    height: number;
    devicePixelRatio?: number;
  };
  features: {
    fetch: boolean;
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDb: boolean;
    cookies: boolean;
    cssGrid: boolean;
    cssFlex: boolean;
    clipboard: boolean;
    fileInput: boolean;
    walletProviderDetected: boolean;
  };
  network: {
    apiReachable: boolean;
    graphqlReachable?: boolean;
  };
  createdAt: string;
};
```

## Minimum Supported Browser Behavior

Signal Vault in-game mode is considered functional if:

- app loads
- query params are readable
- object dossier renders
- quick action creates local Signal
- local Signal survives page reload OR user can export/copy it
- public backend data can be fetched

If IndexedDB is unavailable:

- fallback to memory + explicit export/copy warning

If cookies are unavailable:

- access-code login cannot persist normally
- fall back to local-only or sessionStorage if available

If wallet provider unavailable:

- use external browser access-code flow

## CSS / Layout Rules

In-game mode should use:

- simple responsive layout
- CSS grid/flex only
- no complex container-query dependency unless tested
- high-contrast text
- large click targets
- no hover-only controls
- limited animations
- readable at small panel sizes

## Bundle Rules

In-game bundle should avoid:

- graph libraries
- full Markdown editor
- large UI kits
- map renderers
- image processing libraries
- unnecessary animation frameworks

Recommended initial target:

```txt
In-game JS bundle: keep as small as practical
External app bundle: can be larger
```

## Fallback UX

### If app loads but backend fails

Show:

```txt
LOCAL-ONLY MODE
Backend unavailable. Signals will be saved locally.
```

### If local storage fails

Show:

```txt
TEMPORARY MODE
This browser cannot persist local drafts. Export before closing.
```

### If wallet unavailable

Show:

```txt
WALLET UNAVAILABLE IN THIS BROWSER
Use external browser access-code login.
```

### If object context missing

Show:

```txt
OBJECT CONTEXT MISSING
No tenant/itemId/objectId found in URL.
```

## Phase Requirements

### Phase 01

- implement `/compat`
- test in normal Chrome
- test in EVE Frontier in-game browser if available
- record feature matrix

### Phase 02

- test access-code flow
- test session persistence
- test local draft persistence

### Phase 04

- test quick Signal capture in in-game browser
- test reload recovery
- test backend failure/local fallback

## Acceptance Criteria

- In-game object page does not depend on wallet extension.
- Public object page renders before auth.
- Local quick capture works or clearly degrades.
- Compatibility diagnostics are visible.
- Browser limitations are captured in a report.
- No blocking dependency on unverified browser APIs.

## Source Notes

This doc is based on EVE Frontier's official in-game dApp documentation, EVE Vault extension documentation, external browser connection documentation, and dApp Kit documentation. Exact embedded browser API support must be validated empirically because the official docs inspected do not publish a compatibility matrix.
