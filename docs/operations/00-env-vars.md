# Environment Variables

## Web

```txt
VITE_APP_ENV=development
VITE_API_BASE_URL=
VITE_SIGNAL_VAULT_PUBLIC_URL=
VITE_EVE_TENANT_DEFAULT=utopia
VITE_OBJECT_ID=
VITE_DEBUG_SIGNAL_VAULT=false
```

## EVE / Sui

Exact names should be aligned with `@evefrontier/dapp-kit` documentation and peer setup.

```txt
VITE_SUI_NETWORK=
VITE_EVE_WORLD_PACKAGE_ID=
VITE_EVE_GRAPHQL_URL=
```

## Backend

```txt
DATABASE_URL=
SESSION_SECRET=
ACCESS_CODE_SECRET=
ENABLE_REMOTE_SIGNAL_WRITES=false
AUTH_DEV_MODE=false
ENABLE_SUI_CHARACTER_RESOLUTION=false
SUI_GRAPHQL_URL=
SIGNAL_VAULT_ALLOWED_ORIGINS=
```

Railway Postgres can provide `DATABASE_URL` directly. See
[`12-railway-backend-deployment.md`](./12-railway-backend-deployment.md).

## Policy

- Never commit secrets.
- Vite env vars are public to browser if prefixed `VITE_`.
- Do not put service role keys in frontend.
- Validate env with Zod at startup.
