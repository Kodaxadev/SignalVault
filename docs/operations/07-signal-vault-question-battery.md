# Signal Vault Question Battery

**Status date:** 2026-05-14

**Purpose:** Stress-test Signal Vault from product, EVE Frontier, engineering, security, operations, and player-use angles. This is not a feature wishlist. It is a decision and risk engine: every question should either be answered by current evidence or produce a specific follow-up.

## Evidence Map

| ID | Evidence |
|---|---|
| E1 | EVE Frontier builder docs describe Smart Assemblies, dApps, programmable world contracts, and builder agency: https://docs.evefrontier.com/ |
| E2 | Official resources list current Stillness/Utopia World API hosts and EVE Vault release location: https://docs.evefrontier.com/tools/resources |
| E3 | EVE Vault is a Chrome extension/web wallet implementing Sui Wallet Standard and zkLogin flows: https://github.com/evefrontier/evevault |
| E4 | dApp Kit TypeDoc exposes provider context such as `EveFrontierProvider`, `useConnection`, and `SmartObjectContextType`: https://sui-docs.evefrontier.com/ |
| E5 | Stillness World API docs expose the browser-side lookup surface used for solar-system context: https://world-api-stillness.live.tech.evefrontier.com/docs/index.html |
| E6 | Local docs: alpha guide, readiness, risk register, production checklist, biomassing continuity, desktop readiness. |
| E7 | Tauri docs cover global shortcuts, tray support, opener, and app config paths used by the companion: https://v2.tauri.app/ |
| E8 | MDN documents browser `fetch`, secure loopback treatment, and `localStorage`: https://developer.mozilla.org/ |
| E9 | Atlas records referenced in production docs cover dApp Kit, EVE Vault, World API, and Sui signing evidence. |

## Triage Labels

| Label | Meaning |
|---|---|
| Answered | Current repo and evidence are enough for alpha decisions. |
| Gap | We know the question matters and current implementation/docs do not fully answer it. |
| Watch | Current answer is acceptable, but platform/API drift could change it. |
| Later | Valid idea, but not needed for current alpha or Phase 13A path. |

## Product And Player Jobs

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| What is the core player job? | Capture and read structured field intel at point of encounter. | E6 | Medium | Keep every new feature tied to faster capture, safer route decisions, or better memory. |
| Who is the first user: solo scout, hauler, officer, or builder? | Current UI serves scouts/haulers best; tribe/officer workflows exist but need remote hardening. | E6 | Medium | Add persona-specific smoke scenarios before broad polish. |
| What must be creatable in under 5 seconds? | Quick Signals, Quick Note, and current system context. | E6 | Low | Time the desktop and browser quick-capture flows with a real user. |
| What does a route user need before undocking or jumping? | Route warnings from local Signals, staleness, and contradictions. | E6 | Medium | Add "route readiness" checklist UX if route work continues. |
| What is Signal Vault not? | Not Notion, not an in-game browser replacement, not an automated game assistant. | E6 | Low | Keep this line in player docs and onboarding. |
| What would make the app feel noisy instead of useful? | Too many uncategorized notes, stale warnings without severity, and duplicated signals. | E6 | Medium | Add signal grouping and review queues later. |
| What is the minimum demo-safe story? | Local-first capture, dossier, staleness, route warning, export/import. | E6 | Low | Keep remote push optional in demos. |
| What is the first trust-breaking user surprise? | Losing IndexedDB data or assuming remote push is backup. | E6 | High | Add export reminders and storage health later. |

## EVE Frontier Fit

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| What Frontier surfaces are confirmed enough to build on? | EVE Vault, dApp Kit, World API, Smart Assemblies, Sui identity objects. | E1-E5 | Watch | Re-check docs before every release branch. |
| Which surfaces are enrichment only? | World API solar systems, tribes, and type data. | E2, E5, E6 | Medium | Never infer Smart Assembly type solely from World API. |
| Which surface is Smart Assembly authority? | dApp Kit/provider context and on-chain object data, not manual or World API hints. | E4, E6 | Medium | Keep bundle isolation and resolver priority tests. |
| Does Signal Vault depend on an in-game browser? | No. Current direction is browser-first plus desktop companion. | E6 | Low | Revisit only if EVE Frontier ships and documents a working browser. |
| Can a desktop webview replace EVE Vault? | No. Wallet authority belongs to EVE Vault/supported wallet providers. | E3, E4, E6 | High | Keep hard no on EVE Vault impersonation. |
| Can Signal Vault become a Smart Assembly dApp? | Yes for object-context surfaces where official dApp paths support it. | E1, E4 | Watch | Validate exact current assembly launch behavior before investing. |
| What if EVE Frontier changes tenant/package IDs? | Release env guard catches some config drift, but docs/Atlas must be refreshed. | E2, E6, E9 | Medium | Add a scheduled evidence refresh before public release. |
| What Frontier capability is still most uncertain? | Live EVE Vault/zkLogin signing fixture validation and character lifecycle semantics. | E3, E6 | High | Treat as production blockers, not alpha blockers. |

## Identity And Auth

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| What proves wallet ownership? | Sui personal-message challenge verification on backend. | E3, E6, E9 | Medium | Validate with live EVE Vault/zkLogin fixtures. |
| What proves current character identity? | Backend Sui PlayerProfile/Character resolution at request time. | E6, E9 | Medium | Keep server-side resolution as authority for remote writes. |
| Is wallet equal to character forever? | No. Biomassing risk means identity must be snapshotted at write time. | E6 | High | Confirm EVE Frontier deletion/recreation semantics officially. |
| What identity fields must remote records keep? | walletAddress, characterId, characterName, tribeId, identitySource, resolvedAt. | E6 | Low | Consider `authorIdentityStatus` later. |
| What happens when character resolution fails? | Production should fail closed for privileged writes; alpha has explicit fallback modes. | E6 | High | Keep dev-auth visually labeled and blocked in production. |
| Can client dApp Kit identity be trusted for server writes? | No. Client context is UX only; backend resolves identity. | E4, E6 | High | Keep this in code comments/docs near auth boundaries. |
| How are replayed auth challenges prevented? | Challenge persistence exists; production still needs deployed DB role validation. | E6 | Medium | Add integration tests against deployed Postgres role. |
| What auth path should desktop companion use? | None. It should never become wallet or remote-write authority. | E6, E7, E8 | High | Keep desktop commands local-only unless a new signed model is designed. |

## Signals And Notes

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| Are 12 Signal types enough for alpha? | Yes for core intel categories. | E6 | Low | Watch user behavior for repeated "other" notes. |
| Which type catches unstructured observations? | `field_note`, often local-only/unverified. | E6 | Low | Add better templates only if notes become repetitive. |
| Which Signals should affect route warnings? | Hostile/contact/access/route/gate style Signals. | E6 | Medium | Audit warning mappings after real play sessions. |
| Which Signals should never auto-sync? | Local private notes and desktop Quick Notes. | E6 | High | Keep syncState and visibility forced for companion commands. |
| Can a Signal be edited? | Not in current alpha. Corrections are new Signals or deletion. | E6 | Medium | Decide between edit history and supersession before production. |
| How do contradictions resolve? | Current system flags them; user must verify. | E6 | Medium | Add resolution workflow later for tribe/officer use. |
| Should notes support attachments/screenshots? | Spec exists, but implementation is later. | E6 | Medium | Define storage/privacy before adding binary data. |
| What metadata is missing for better field memory? | Source device/surface, review status, supersession, and export age. | E6 | Medium | Add only after storage health and editing decisions. |

## Permissions And Visibility

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| What can anonymous users do? | Local-first creation and reading in their browser. | E6 | Low | Ensure anonymous UX stays clear and non-scary. |
| What needs wallet verification? | Remote private/public writes and identity-bound actions. | E6 | High | Keep preflight errors specific. |
| What needs tribe identity? | Tribe/officer remote writes and reads. | E6 | High | Verify RLS with production DB role. |
| Is scout cell available? | No, locked for alpha. | E6 | Low | Do not expose partial controls. |
| Can local tribe visibility mislead users? | Yes, because local tribe-labeled Signals are not shared automatically. | E6 | Medium | Keep local-vs-remote badges obvious. |
| Should remote public reads exist? | Possible, but moderation and abuse workflows are not done. | E6 | High | Do not market public intel network until moderation exists. |
| Can deleted/changed tribe membership affect old writes? | Old audit/signal identity snapshots remain historical. | E6 | Medium | Add current/historical identity UI later. |
| What is the dangerous permission shortcut? | Trusting client role, URL hints, or desktop commands for remote write authority. | E4, E6 | High | Maintain server-side policy as only remote authority. |

## Desktop Companion

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| What is the companion for? | Visibility, quick capture, current-system handoff, and Open Vault. | E6, E7 | Low | Keep it focused on in-play utility. |
| What should stay in the browser? | Wallet signing, dApp Kit context, remote sync, import/export, full editing. | E3, E4, E6 | High | Do not add browser-owned authority to desktop. |
| Is the bridge command channel safe enough? | Acceptable for local-only commands after pairing token hardening. | E6, E8 | Medium | Add rate limits before more commands. |
| What command is next if any? | Possibly route context or review flag, not remote push. | E6 | Medium | Design before implementing. |
| What command should not be added? | Remote sync, wallet signing, game input, process/memory interaction. | E3, E6 | High | Keep hard no list in docs and tests. |
| What breaks if the browser is closed? | Overlay can show stale/disconnected state; commands remain pending. | E6 | Medium | Add clearer pending/disconnected UX later. |
| What blocks desktop distribution? | Cargo.lock policy, installer/signing, icon, URL config, visual QA, port conflict UX. | E6, E7 | Medium | Make this Phase 13B or packaging task. |
| What if another local process knows the token? | It could publish or poll local companion data. Current impact is local-only. | E6, E8 | Medium | Rotate token and rate-limit commands before broader distribution. |

## Data, Storage, And Sync

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| Where is source-of-truth local data? | Browser IndexedDB, not desktop storage. | E6 | High | Desktop must not read/write IndexedDB directly. |
| What is the backup path? | Export/import JSON. | E6 | High | Add backup reminders and last-export display. |
| What happens if IndexedDB is cleared? | Local data is lost unless exported. | E6 | High | Keep alpha warning prominent. |
| What remote sync exists now? | Manual single-signal push; no pull/background sync. | E6 | High | Keep no-background-sync invariant. |
| What would make remote sync production-safe? | RLS validation, moderation, observability, retention, rollback, live wallet validation. | E6 | High | Track in production readiness checklist. |
| Does desktop Quick Note sync remotely? | No. Browser forces local_private/local_only. | E6 | Low | Keep tests for forced visibility/sync state. |
| Does setting current system write remote state? | No. It writes browser-owned local current-system state. | E6 | Low | Keep current-system separate from identity. |
| What schema drift is likely? | Signal schema, World API response shape, dApp Kit context shape. | E4, E5, E6 | Medium | Add migration/version strategy before production. |

## World API, Atlas, And Evidence

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| Which World API host is live/current? | Stillness is listed as live, Utopia as sandbox. | E2 | Watch | Re-check resources before release. |
| Which World API data do we consume? | Solar systems, tribes, game types, POD-related evidence in docs. | E5, E6, E9 | Medium | Keep client schemas narrow and fallback safe. |
| Does World API resolve wallet to character? | No public World API smartcharacter endpoint is documented in current local audit. | E6 | High | Ask CCP/devrel or monitor docs. |
| Is Atlas authoritative? | Useful evidence index, but official docs/repos outrank it. | E6, E9 | Medium | Keep Atlas records as supporting evidence, not sole truth. |
| Should Atlas be queried in app runtime? | No. It is a development evidence corpus, not product dependency. | E6 | Low | Keep Atlas out of runtime code. |
| What needs live evidence refresh? | dApp Kit version, EVE Vault signing, World API hosts/schema, in-game browser status. | E1-E5 | High | Add release evidence-refresh checklist. |
| Can World API downtime blank dossiers? | No, cache/stale fallback exists for supported data. | E6 | Medium | Add visible "stale official data" where missing. |
| Can World API claim Smart Assembly type? | No. It is enrichment, not Smart Assembly authority. | E4-E6 | High | Keep resolver priority and docs aligned. |

## UI And UX

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| Does the UI match in-play pressure? | Browser app improved; overlay is compact but needs visual QA over gameplay-like backgrounds. | E6 | Medium | Run screenshot/visual verification for desktop overlay. |
| Is "local" versus "remote" obvious? | Current docs and badges exist; real-user comprehension unproven. | E6 | Medium | Add usability check with new player. |
| Are stale and contradictory states readable? | Implemented in dossiers; route warnings degrade stale severity. | E6 | Medium | Test with dense signal lists. |
| Does current system feel trustworthy? | Manual/world_api source exists; desktop can set it locally. | E5, E6 | Medium | Show source and timestamp consistently. |
| Is pairing understandable? | Operator docs exist; user-facing flow may still be clunky. | E6 | Medium | Add copy-to-clipboard and clearer web pairing status later. |
| Does the app overuse game-like UI? | Design direction borrows terminal language without pretending to be official UI. | E6 | Low | Keep readability over mimicry. |
| What UI could cause a dangerous action? | Any control that appears to push/sync remotely from desktop. | E6 | High | Avoid remote command buttons in companion. |
| What needs accessibility review? | Dense terminal styling, small overlay controls, keyboard focus, status colors. | E6 | Medium | Add a11y pass before public alpha. |

## Architecture And Code Quality

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| Is dApp Kit isolated? | Yes, release gate checks main bundle has 0 dApp Kit refs. | E4, E6 | Medium | Keep `check:bundle-clean` in release gate. |
| Are files under audit limit? | Current release gate enforces 400-line limit. | E6 | Low | Split before adding features. |
| Is lint real? | No, lint is non-authoritative. | E6 | Medium | Add real lint/static analysis or remove claims. |
| Are tests broad enough? | Good unit coverage; gaps remain for deployed DB/RLS and visual desktop behavior. | E6 | Medium | Add integration/e2e where risk is highest. |
| Is release gate truthful? | Yes for web/API; desktop has separate feasibility gate. | E6 | Low | Do not merge desktop into release gate until packaged. |
| Are dependencies safe? | Known dev-tool advisories remain follow-up. | E6 | Medium | Schedule dependency maintenance. |
| What local bridge code is most sensitive? | Token validation, command queue, ACK semantics, and endpoint allowlist. | E6 | Medium | Add fuzz/abuse tests before new commands. |
| What backend code is most sensitive? | Auth verification, policy checks, RLS session context, audit persistence. | E6 | High | Add deployed-role integration tests. |

## Operations And Production

| Question | Current Answer | Evidence | Risk | Follow-up |
|---|---|---|---|---|
| What blocks public production? | RLS verification, live EVE Vault signing, dependency advisories, observability, moderation, runbooks. | E6 | High | Continue production readiness checklist. |
| What blocks desktop public sharing? | Installer/signing, Cargo.lock decision, port conflict UX, visual QA, production URL config. | E6, E7 | Medium | Start packaging readiness phase. |
| What should CI run? | `pnpm check:release`, bundle clean, line limits, prod-auth, world-env, and later desktop gate. | E6 | Medium | Add CI workflow if not already external. |
| What needs monitoring? | Auth failures, challenge failures, policy denials, DB errors, World API failures, bundle guard status. | E6 | High | Add structured logs/metrics. |
| What incident paths exist? | Not enough. Rollback and compromised env var runbooks are still gaps. | E6 | High | Write incident runbooks. |
| What privacy commitments are missing? | Player-facing retention/deletion contract for remote data. | E6 | High | Draft privacy/data retention policy before public release. |
| What docs can go stale fastest? | EVE docs links, World API hosts/schema, dApp Kit version, EVE Vault signing behavior. | E1-E5 | High | Add dated evidence refresh checklist. |
| What should not be demoed as solved? | Production remote sync, in-game browser support, desktop packaging, scout cells, automatic sync. | E6 | High | Keep demo checklist strict. |

## Highest-Value Follow-Ups

1. Verify Postgres RLS under the deployed application role.
2. Validate live EVE Vault / zkLogin personal-message signing fixtures.
3. Add desktop visual QA and packaging readiness for Phase 13B.
4. Add a release evidence-refresh checklist for EVE Frontier docs, World API, dApp Kit, and EVE Vault.
5. Add player-facing privacy/data-retention policy for remote Signals.
6. Add storage health and export reminder UX.
7. Add real lint/static analysis or remove the non-authoritative `pnpm lint` surface.
8. Add observability and incident runbooks before public production.
