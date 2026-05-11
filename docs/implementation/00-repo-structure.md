# Repo Structure

Recommended monorepo-lite structure:

```txt
signal-vault/
  apps/
    web/
      src/
        app/
        features/
        lib/
      public/
      package.json

    api/
      src/
        routes/
        services/
        db/
      package.json

  packages/
    core/
      src/
        signals/
        entities/
        viewer/
        staleness/
        contradictions/
        permissions/

    frontier/
      src/
        dappKit/
        graphql/
        character/
        assembly/

    storage/
      src/
        dexie/
        sync/

  docs/
```

For the first implementation, it is acceptable to start with only `apps/web`, but the internal folders should mirror this modular split.

## No Monolith Rule

Do not put domain logic into `App.tsx`.

`App.tsx` should only compose providers and routes.
