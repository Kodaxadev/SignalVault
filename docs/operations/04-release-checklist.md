# Release Checklist

## Build

- [ ] `pnpm check:release`
- [ ] For Stillness production, run `SIGNAL_VAULT_RELEASE_ENV=stillness pnpm check:world-env`
- [ ] `pnpm typecheck`
- [ ] `pnpm typecheck:api`
- [ ] `pnpm test:run`
- [ ] `pnpm test:api`
- [ ] `pnpm build`
- [ ] `pnpm check:prod-auth`
- [ ] `pnpm check:bundle-clean`
- [ ] `pnpm check:docs`
- [ ] `pnpm check:lines`

`pnpm lint` is not a release gate yet. The current web lint script is a placeholder until a real lint configuration is added.

## Security

- [ ] no secrets in frontend bundle
- [ ] sessions secure
- [ ] access codes expire
- [ ] anonymous shared writes blocked
- [ ] visibility checks tested

## Product

- [ ] in-game object page works
- [ ] unknown object fallback works
- [ ] quick Signal capture works
- [ ] local storage works
- [ ] viewer badge works
- [ ] entity confidence displayed

## Documentation

- [ ] phase doc updated
- [ ] ADR updated if decision changed
- [ ] API contract updated
- [ ] data model updated
- [ ] QA checklist completed
