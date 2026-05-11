# API Contracts

## Viewer

```txt
GET  /api/viewer
POST /api/viewer/access-code
POST /api/viewer/consume-code
POST /api/viewer/revoke
```

## Entities

```txt
GET  /api/entities/resolve?tenant=&itemId=&objectId=&hint=
POST /api/entities/manual-classification
GET  /api/entities/:id
GET  /api/entities/:id/signals
```

## Signals

```txt
GET    /api/signals
POST   /api/signals
PATCH  /api/signals/:id
DELETE /api/signals/:id
```

## Dossiers

```txt
GET /api/dossiers/object?tenant=&itemId=&objectId=
GET /api/dossiers/system/:systemName
GET /api/dossiers/route/:routeId
```

## Object Dossier Response

```ts
type ObjectDossierResponse = {
  viewer: ViewerContext;
  entity: ResolvedEntity;
  publicSignals: Signal[];
  privateSignals?: Signal[];
  tribeSignals?: Signal[];
  hiddenCounts: {
    private: number;
    tribe: number;
    officer: number;
    scout_cell: number;
  };
  quickActions: QuickSignalAction[];
  warnings: DossierWarning[];
};
```

## Error Policy

Return structured errors:

```ts
type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};
```

Avoid leaking secrets, raw tokens, or private auth state.
