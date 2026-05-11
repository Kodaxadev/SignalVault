# Routes

## In-Game Routes

```txt
/ingame/object?tenant=:tenant&itemId=:itemId
/ingame/object/:objectId?tenant=:tenant
/ingame/capture?tenant=:tenant&itemId=:itemId
/ingame/system/:systemName
/ingame/route/:routeId
```

## External Routes

```txt
/app
/app/signals
/app/entities/:entityId
/app/entities/:entityId/signals
/app/routes/:routeId
/app/vaults/:vaultId
/app/access-code
/app/settings/integrations
```

## Operator Routes

```txt
/app/operator/entities
/app/operator/object-registry
/app/operator/visibility-policies
/app/operator/audit-log
```

## Route Loading Rules

- In-game routes must render with partial data.
- Object route must support unknown entity.
- External route can load heavier editor/search bundles.
- Admin routes require resolved viewer context and role checks.
