# System Overview

## High-Level Architecture

```txt
Signal Vault
├─ Web App
│  ├─ In-Game Mode
│  ├─ External Mode
│  └─ Operator/Admin Mode
│
├─ Core Domain Packages
│  ├─ Signal Engine
│  ├─ Viewer Context
│  ├─ Entity Resolution
│  ├─ Dossier Engine
│  ├─ Staleness Engine
│  ├─ Contradiction Engine
│  └─ Permission Engine
│
├─ Local Storage
│  ├─ Dexie / IndexedDB
│  ├─ Local drafts
│  ├─ Entity cache
│  └─ Pending sync queue
│
├─ Backend
│  ├─ Sessions
│  ├─ Access codes
│  ├─ Signal CRUD
│  ├─ Entity registry
│  ├─ Visibility checks
│  └─ Audit log
│
├─ EVE Frontier Integration
│  ├─ @evefrontier/dapp-kit
│  ├─ Smart Object context
│  ├─ EVE Vault / wallet connection
│  ├─ Sui GraphQL
│  ├─ Character resolver
│  └─ Assembly resolver
│
└─ Later Optional
   ├─ Custom indexer
   ├─ Signal Bridge
   ├─ EF-Map handoff
   └─ FrontierWarden trust integration
```

## Architecture Principle

Use a standard frontend shell for compatibility, but build custom domain modules for the unique EVE Frontier behavior.

## Standard Shell

- Vite
- React
- React Router
- TanStack Query
- Tailwind
- Dexie
- Zod

## Custom Domain

- ViewerContext
- EntityResolution
- SignalEngine
- DossierEngine
- StalenessEngine
- ContradictionEngine
- InGameShell

## Data Flow: In-Game Object Page

```txt
Player opens Smart Assembly dApp URL
  ↓
Signal Vault receives tenant/itemId/objectId
  ↓
Resolve viewer context
  ↓
Resolve entity context
  ↓
Load public dossier
  ↓
Load private/tribe signals if authorized
  ↓
Show compact object UI
  ↓
Player logs quick Signal
  ↓
Save local and/or remote based on identity/visibility
```

## Failure Philosophy

Signal Vault must degrade gracefully.

If identity fails:

- show public dossier
- allow local draft only
- show identity unresolved

If entity resolution fails:

- show unknown object dossier
- allow manual classification
- preserve object URL context

If backend fails:

- save local draft
- queue sync if authenticated
- clearly mark unsynced state
