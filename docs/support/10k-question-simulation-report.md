# Signal Vault 10K User Question Simulation

## Purpose

This report stress-tests whether the current Signal Vault documentation pack can answer likely user, operator, and developer questions.

This is not 10,000 unique handcrafted questions. It is a simulated support distribution of **10,000 likely user questions** generated from persona-weighted question archetypes.

## Simulated Personas

| Persona | Simulated Count |
|---|---:|
| Tribe Officer | 1146 |
| New Player | 1783 |
| Hauler | 1286 |
| Tribe Member | 1400 |
| Developer / Maintainer | 688 |
| Solo Scout | 1663 |
| Intel Analyst | 799 |
| Builder / Operator | 1235 |

## Coverage Summary

| Coverage | Count | Percent |
|---|---:|---:|
| Documented Answer | 7594 | 75.9% |
| Partial Answer | 2002 | 20.0% |
| Gap / Not Documented | 404 | 4.0% |

## Category Distribution

| Category | Count |
|---|---:|
| Dossiers | 1353 |
| Signals | 1211 |
| Security | 857 |
| Object Resolution | 815 |
| Identity/Auth | 719 |
| Smart Assemblies | 636 |
| Staleness | 628 |
| Tribe Vault | 614 |
| Backend | 579 |
| Map/Bridge | 564 |
| Developer | 491 |
| Support | 480 |
| Contradictions | 441 |
| Privacy | 379 |
| Release | 124 |
| Local First | 109 |

## Interpretation

The current docs are strong for:

- identity/auth principles
- in-game object page behavior
- object/entity resolution rules
- Signal model
- visibility scopes
- quick capture
- staleness/contradiction concepts
- architecture decisions
- implementation guardrails
- release/testing checklists

The current docs are weaker for:

- end-user troubleshooting
- privacy/data ownership policies
- tribe membership changes
- browser compatibility fallback
- attachment/screenshot support
- classification dispute workflows
- exact live EVE dApp configuration steps after implementation testing

## Highest-Impact Partial/Gapped Questions

| Rank | Sim Count | Coverage | Question | Needed Action |
|---:|---:|---|---|---|
| 1 | 254 | partial | Can owners set Signal Vault as a custom URL? | Need step-by-step operator guide after testing. |
| 2 | 248 | partial | Can my tribe share Signals? | Need final role model and integration implementation. |
| 3 | 236 | partial | Can Signal Vault interact with the in-game map? | Need research/prototype against actual map APIs/tooling. |
| 4 | 214 | partial | Can stale Signals be deleted automatically? | Need retention policy decision. |
| 5 | 197 | partial | Can I delete my Signals? | Need privacy/deletion policy doc. |
| 6 | 183 | partial | Can it detect my current system? | Need desktop bridge design. |
| 7 | 182 | gap | Who owns tribe data? | Create data ownership policy. |
| 8 | 177 | partial | Can every tribe define its own trust rules? | Need detailed FrontierWarden mapping doc. |
| 9 | 120 | partial | Can Signal Vault infer gate/storage/turret type from chain data? | Need exact resolver queries from implementation/testing. |
| 10 | 115 | partial | Does Signal Vault know my EVE character automatically? | Need exact implementation once EVE dApp Kit wiring is tested. |
| 11 | 82 | partial | What if access code login fails? | Need support troubleshooting doc. |
| 12 | 77 | partial | Can I make a Signal public later? | Need Signal visibility lifecycle doc. |
| 13 | 71 | gap | What happens if my tribe changes? | Need tribe membership change policy. |
| 14 | 62 | gap | What if the in-game browser cannot render the app? | Need in-game browser compatibility/support doc. |
| 15 | 51 | partial | How do I report wrong object classification? | Need classification dispute workflow. |
| 16 | 49 | gap | Can I attach screenshots/files? | Need attachment policy/storage spec. |
| 17 | 48 | partial | How do I recover lost local drafts? | Need recovery guide. |
| 18 | 40 | gap | Can I transfer private notes to another character? | Need account/character transfer policy. |

## Support Readiness Verdict

### Do we have documented answers?

**Mostly yes for product/development direction. Partially for player-facing support.**

The current docs are ready to guide development. They are not yet complete as a public help center.

### Recommended Next Docs

Create these next:

1. `support/00-player-faq.md`
2. `support/01-ingame-auth-troubleshooting.md`
3. `support/02-object-classification-help.md`
4. `support/03-local-draft-recovery.md`
5. `support/04-privacy-data-ownership.md`
6. `support/05-tribe-membership-and-permissions.md`
7. `support/06-browser-compatibility.md`
8. `support/07-attachments-and-screenshots.md`

## Product Decision

Before building more features, write player-facing answers for the questions marked `gap` or high-frequency `partial`.

This will prevent the app from being technically correct but confusing to actual players.
