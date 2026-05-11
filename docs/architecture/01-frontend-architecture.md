# Frontend Architecture

## Framework Decision

Use **Vite + React** as the frontend shell because the EVE Frontier dApp Kit is React-oriented and because the in-game dApp surface is best served as static assets.

Do not build this as a generic React dashboard.

## Modes

### In-Game Mode

Routes:

```txt
/ingame/object?tenant=&itemId=
/ingame/object/:objectId
/ingame/capture
/ingame/system/:systemName
/ingame/route/:routeId
```

Characteristics:

- compact
- fast
- minimal editor
- one-click capture
- high readability
- no heavy graph
- no unnecessary admin tools

### External Mode

Routes:

```txt
/app
/app/signals
/app/entities/:entityId
/app/access-code
/app/operator/entities
```

Characteristics:

- full editor
- search
- entity registry
- access-code generation
- imports/exports
- admin operations
- future graph views

## Frontend Module Layout

```txt
src/
  app/
    routes.tsx
    AppShell.tsx
    InGameShell.tsx
    ExternalShell.tsx

  features/
    viewer/
    entities/
    signals/
    dossiers/
    frontier/
    staleness/
    contradictions/

  lib/
    ids.ts
    time.ts
    schema.ts
    errors.ts
```

## Frontend State Split

### TanStack Query

Use for:

- viewer session fetch
- object dossier fetch
- entity resolution
- Signal lists
- backend writes
- dApp Kit / GraphQL-derived remote state

### Zustand

Use for:

- local UI state
- open panels
- compact/expanded state
- current draft
- current quick-action state

### Dexie

Use for:

- local drafts
- anonymous local Signals
- pending sync queue
- local entity cache
- import/export staging

## Rendering Policy

- Object pages render with partial data.
- Unknown object states are valid UI states.
- Loading states should not block the full screen unless absolutely necessary.
- In-game mode should never require graph/editor bundle loading.

## Bundle Policy

Avoid v0.1 dependencies that inflate bundle size without solving MVP problems.

Do not add initially:

- graph libraries
- rich block editors
- map renderers
- heavy animation libraries
- complex component suites
