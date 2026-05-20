# Deployment

## Recommended v0.1

Frontend:

- Vercel static deployment
- or Netlify/static host
- or Cloudflare Pages

Backend:

- Railway thin API and Railway Postgres

See [`12-railway-backend-deployment.md`](./12-railway-backend-deployment.md)
for the current backend deployment path.

## Deployment Requirements

- HTTPS required
- stable public URL for Smart Assembly custom dApp links
- in-game route must work from direct URL
- object route must not require SSR
- sessions must use secure cookies where possible

## Smoke Test URLs

```txt
/ingame/object?tenant=utopia&itemId=test
/ingame/object/0xtest
/app
/app/access-code
```

## Pre-Deployment Checklist

- typecheck passes
- tests pass
- build passes
- env vars configured
- in-game route loads without auth
- unknown object fallback works
- no service keys in frontend bundle
