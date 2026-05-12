# In-Game Terminal UI Design

## Evidence

- User screenshot `C:/Users/Justi/Downloads/Network Node UI 2025.09.24 - 08.08.33.92.png` shows current EVE Frontier node terminal language: dense dark panels, thin borders, monospace labels, hard module headers, grid/telemetry content, and orange primary action/status accents.
- Official EVE Frontier builder docs describe Smart Assemblies as programmable infrastructure players can design, automate, and operate: https://docs.evefrontier.com/
- Official Network Node docs describe Network Nodes as base power sources with fuel, energy, and connected assembly state, matching the terminal screenshot's operational telemetry context: https://docs.evefrontier.com/smart-assemblies/network-node
- Official dApp kit docs describe URL assembly context via `tenant` and `itemId`, and Smart Object Data for assembly data: https://docs.evefrontier.com/tools/dapp-kit
- Official resources docs list Stillness as the live World API environment and Utopia as sandbox: https://docs.evefrontier.com/tools/resources
- Official "Connecting In-Game" docs currently mention an in-game browser flow, but the user reports no current/planned in-game browser in their observed client. Treat that as unresolved product-surface evidence and avoid hard-coding UI copy that depends on the browser existing: https://docs.evefrontier.com/dapps/connecting-in-game
- Current repo docs track that Signal Vault is a local-first intel tool with optional remote push, not a confirmed built-in game browser surface.

## Direction

Use a **Signal Vault intel console** style: borrow the node terminal visual language without fully mimicking the game UI. The goal is atmosphere plus readability. Signal Vault should feel like a frontier intelligence terminal beside EVE Frontier systems, while remaining clear enough for quick signal capture.

## First Slice

- Add reusable in-game terminal primitives for framed modules, header bars, orange status strips, and compact metadata rows.
- Re-skin the in-game shell header, identity/readiness state, object context, quick actions, and signal list with those primitives.
- Use near-black panels, gray borders, orange action/status accents, uppercase module titles, and monospace numeric/identity data.
- Remove or soften copy that implies a known in-game browser. Use "object context" and "companion terminal" language instead.

## Non-Goals

- Do not redesign every dossier type in this pass.
- Do not add fake game controls or decorative complexity that obscures state.
- Do not change signal data, permissions, auth, or remote sync behavior.
- Do not make Signal Vault copy depend on an official in-game browser existing; use object-context/companion-terminal wording until current client behavior is confirmed.

## Verification

- Existing component tests should pass with updated labels/classes.
- `pnpm check:release` remains the final gate.
- Run the web app locally and inspect the in-game route in-browser at desktop and narrow widths for text overflow, hierarchy, and readability.
