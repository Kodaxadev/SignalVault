# Release Checklist

## Build

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test:run`
- [ ] `pnpm build`

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
