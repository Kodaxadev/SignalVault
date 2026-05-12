# Signal Vault — Demo Operator Checklist

**Use this before every internal demo or alpha player session.**  
Run `node scripts/print-alpha-demo-status.mjs` first — it checks your environment automatically.

---

## Pre-Demo: Choose Your Path

### Path A — Local-Only Demo (no backend required)

Requires nothing beyond a working web build. Recommended for first demos, browser capability checks, and situations where backend setup is not guaranteed.

**What works:**
- Signal creation (all 12 types)
- Visibility selection (local_private, private, public, tribe, officer)
- Staleness indicators and dossier intel panels
- Export to JSON and import (merge/replace)
- World API enrichment with cross-session cache (if `VITE_WORLD_API_BASE_URL` is set; cached for 30min/24h after first successful fetch)
- Current system selector (set manual system context for out-of-game sessions; persists across sessions)
- Route warning cards (derived from local Signals linked to route systems)
- InGame smart object context (if opened in EVE Frontier in-game browser)

**What does not work:**
- Remote push button (shows "Remote push not configured")
- Remote ID badge on signals

**Required env vars:** None mandatory. Optionally set `VITE_WORLD_API_BASE_URL`.

---

### Path B — Remote Dev-Auth Demo (backend required)

For demoing the full push flow. Requires the API backend running with dev flags enabled.

**What works:** Everything in Path A, plus:
- Remote push button with "Alpha · Dev auth · Manual only" label
- Push flow: preflight → pending → remote_saved / sync_failed
- Retry panel on failure
- Remote ID badge on successfully pushed signals

**Required setup — web build:**
```
VITE_REMOTE_SYNC_URL=http://localhost:3001    # or deployed API URL
VITE_REMOTE_DEV_AUTH=true
VITE_REMOTE_DEV_CHARACTER_JWT=<dev-jwt>
VITE_REMOTE_DEV_WALLET_SIGNATURE=<dev-sig>
VITE_REMOTE_DEV_SIGNATURE_MESSAGE=signal-vault:dev   # optional, this is the default
```

**Required setup — API server:**
```
AUTH_DEV_MODE=true
DATABASE_URL=<postgres-connection-string>
ENABLE_REMOTE_SIGNAL_WRITES=true
PORT=3001
```

**CRITICAL: These flags must never be set in a production deployment.**  
`pnpm check:prod-auth` will block the build if either dev-auth flag is set.

---

## Checklist: Before Starting

Run `node scripts/print-alpha-demo-status.mjs` and confirm:

```
[ ] No AUTH_DEV_MODE=true in production
[ ] No VITE_REMOTE_DEV_AUTH=true in production
[ ] Main bundle is clean (0 dApp Kit refs in index-*.js)
[ ] Alpha docs pass consistency check
```

Then verify manually:

### Local-Only Path

```
[ ] Web build is current (run `pnpm build` if any source files changed)
[ ] App loads without console errors
[ ] /compat page shows all green diagnostics
[ ] IndexedDB is available (shown on /compat)
[ ] Can create a signal
[ ] Can view signal in dossier
[ ] Can export to JSON
[ ] Can import from JSON (merge mode)
[ ] World API enrichment loads (if configured)
```

### Remote Dev-Auth Path (additional)

```
[ ] API server running: curl http://localhost:3001/health returns { "status": "ok" }
[ ] writesEnabled: true in health response
[ ] VITE_REMOTE_SYNC_URL points to running API
[ ] VITE_REMOTE_DEV_AUTH=true in web build env
[ ] VITE_REMOTE_DEV_CHARACTER_JWT is set (non-empty)
[ ] VITE_REMOTE_DEV_WALLET_SIGNATURE is set (non-empty)
[ ] Push button visible with "Alpha · Dev auth · Manual only" label
[ ] Can push a signal to remote_saved state
[ ] Remote ID badge appears after push
[ ] Retry panel appears for sync_failed signals
```

---

## During Demo

### Things to say

- "Everything you see is stored in your browser. Nothing left your device."
- "The sync badge tells you the local state — local_only means it hasn't been pushed."
- "Remote push is one signal at a time. There is no automatic sync."
- "If this push fails, your signal stays here. Nothing is lost."
- "The 'Alpha · Dev auth' label is intentional — this is not production auth."
- "Scout cell scope is locked in alpha."

### Things not to say

- "Your data is safely backed up." (Remote is not a reliable backup)
- "Sync will keep your devices in sync." (No pull path exists)
- "Character identity is verified." (Dev mode, not real EVE auth)
- "This is production-ready." (It is not)

---

## Checklist: After Demo

```
[ ] Export any demo signals you want to keep (local data is ephemeral)
[ ] If Path B: confirm API logs look clean (no auth errors indicating broken config)
[ ] If recording session: confirm no dev credentials are visible in screen capture
[ ] Reset local state if handing off to next player (clear IndexedDB or use Import → Replace with empty file)
```

---

## Escalation: If Something Goes Wrong

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Push button says "not configured" | `VITE_REMOTE_SYNC_URL` missing from build | Rebuild with env var set |
| Push button says "character token not available" | `VITE_REMOTE_DEV_CHARACTER_JWT` not set | Set JWT and rebuild |
| Push returns 401 | `AUTH_DEV_MODE` not set on API, or JWT mismatch | Check API env, restart |
| Push returns 503 | `ENABLE_REMOTE_SIGNAL_WRITES=false` on API | Set to `true`, restart API |
| Push button says "EVE Frontier client not detected" | Not in InGame browser; using wallet signing path | Switch to dev auth path |
| App crashes on load | Zod env validation failed | Check browser console for schema error; verify `VITE_WORLD_API_ENV` is `stillness` or `utopia` |
| Dossier shows no enrichment | World API unavailable or `VITE_WORLD_API_BASE_URL` not set | Expected graceful fallback; demo continues |
| IndexedDB unavailable | Private/incognito mode or browser quota | Switch to normal mode; free storage |
