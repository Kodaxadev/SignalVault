# Signal Vault — Alpha Documentation

Start here. One command before a demo, one command before a release.

```
pnpm demo:status       # check your environment, get Path A or Path B recommendation
pnpm check:release     # run all release guardrails before any deployment
```

---

## Default demo path: Path A — Local-only

No backend required. All local-first features work out of the box.

## Remote push: Path B — Dev-auth, manual-only

Requires API running + dev-auth env vars. See [06-demo-operator-checklist.md](06-demo-operator-checklist.md).  
Remote push is labeled "Alpha · Dev auth · Manual only" in the UI. That label is accurate.

---

## Index

| Doc | Purpose |
|-----|---------|
| [00-alpha-guide.md](00-alpha-guide.md) | Player-facing guide: data storage, backup, tribe scope, limitations |
| [01-alpha-release-readiness.md](01-alpha-release-readiness.md) | What works, what is local-only, what is dev-auth only, what is blocked |
| [02-demo-script.md](02-demo-script.md) | Step-by-step demo walkthrough (classify → signal → stale → export → push) |
| [03-known-limitations.md](03-known-limitations.md) | 13 named limitations with path-to-resolution |
| [04-risk-register.md](04-risk-register.md) | 11 risks with severity, mitigations, and action required |
| [05-player-facing-faq.md](05-player-facing-faq.md) | Plain-language FAQ for alpha players |
| [06-demo-operator-checklist.md](06-demo-operator-checklist.md) | Pre/during/post demo checklists, Path A vs Path B setup, escalation table |
| [07-demo-environment-matrix.md](07-demo-environment-matrix.md) | Every env var: safe/required/forbidden per context, feature availability matrix |

---

## Key constraints (do not lose these)

- No background sync until a trusted EVE character token issuer exists.
- `AUTH_DEV_MODE=true` and `VITE_REMOTE_DEV_AUTH=true` must never reach production.
- dApp Kit must stay isolated to the InGameRoute chunk (main bundle: 0 evefrontier refs).
- Remote push is manual, single-signal, and not a reliable backup.
- Scout cell scope is locked. Character identity is unverified in alpha.

See [docs/backend/16-character-token-contract.md](../backend/16-character-token-contract.md) for the auth trust gap.
