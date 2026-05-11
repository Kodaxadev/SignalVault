# Phase 10C / 09L.1 — Sui PlayerProfile Resolution Research

**Status:** CONFIRMED — on-chain resolution proven on Stillness (2026-05-11)  
**Environment:** Stillness (EVE Frontier testnet = public Sui testnet, chain `4c78adac`)  
**Date:** 2026-05-11  
**Author:** Signal Vault backend research

---

## Executive Summary

On-chain character identity resolution is **proven and working** on Stillness. A wallet address can be resolved to EVE character identity (`item_id`, `name`, `tribe_id`) using two public Sui GraphQL queries against the standard Sui testnet. No CCP-issued JWT, no blockchain gateway, no authentication required.

**Resolution path confirmed:**
```
wallet address
  → PlayerProfile (wallet-owned Move object)     [contains: character_id]
  → Character (shared Move object)               [contains: item_id, name, tribe_id]
```

**This unblocks Phase 09L and eliminates the `VITE_REMOTE_DEV_CHARACTER_JWT` dependency for production.**

---

## Confirmed Schema

### `PlayerProfile` (wallet-owned object)

**Type:** `<PACKAGE_ID>::character::PlayerProfile`  
**Owner:** The player's wallet address  
**Query:** `address(address: WALLET).objects` filtered by type  

| Field | Type | Value (example) |
|-------|------|-----------------|
| `id` | Sui address | object address |
| `character_id` | Sui address | address of the `Character` shared object |

> **Critical:** `character_id` is a **Sui object address**, not the EVE numeric character ID. It is a pointer to the `Character` shared object.

### `Character` (shared object)

**Type:** `<PACKAGE_ID>::character::Character`  
**Owner:** Shared (accessible to any query by address)  
**Query:** `object(address: CHARACTER_ID).asMoveObject.contents.json`  

| Field | Type | Value (example) | Notes |
|-------|------|-----------------|-------|
| `id` | Sui address | `0x3518e85...` | Same as Character object address |
| `key.item_id` | string | `"2112089652"` | **EVE numeric character ID** |
| `key.tenant` | string | `"stillness"` | Environment identifier |
| `tribe_id` | number | `1000167` | **EVE tribe membership** — direct numeric ID |
| `character_address` | Sui address | wallet address | Confirms wallet binding |
| `metadata.name` | string | `"Kivik"` | **Character display name** |
| `metadata.assembly_id` | Sui address | same as Character ID | Assembly linkage |
| `metadata.description` | string | `""` | Optional bio |
| `metadata.url` | string | `""` | Optional URL |
| `owner_cap_id` | Sui address | `0x8479c0...` | Admin capability object |

---

## Live Probe Results (2026-05-11)

Wallet: `0xabff3b1b9c793cf42f64864b80190fd836ac68391860c0d27491f3ef2fb4430f`

**PlayerProfile object:**
```json
{
  "id": "0x2a9d6b4980644abfa89a5191cc19f9e14bf4357316689a12317e706c5e09ba68",
  "character_id": "0x3518e8590b7d353c9cf29da9df6d02d8cbf31b2edbd1b8439afc4afd9992ae9a"
}
```

**Character object:**
```json
{
  "id": "0x3518e8590b7d353c9cf29da9df6d02d8cbf31b2edbd1b8439afc4afd9992ae9a",
  "key": { "item_id": "2112089652", "tenant": "stillness" },
  "tribe_id": 1000167,
  "character_address": "0xabff3b1b9c793cf42f64864b80190fd836ac68391860c0d27491f3ef2fb4430f",
  "metadata": {
    "assembly_id": "0x3518e8590b7d353c9cf29da9df6d02d8cbf31b2edbd1b8439afc4afd9992ae9a",
    "name": "Kivik",
    "description": "",
    "url": ""
  },
  "owner_cap_id": "0x8479c0279f0197fe29987074d514a54c8881adc1f0557a3b556689ad838c067f"
}
```

---

## Package ID Discovery

The `WORLD_PACKAGE_ID` in `contracts/world/Published.toml` (`testnet_stillness` entry) was **stale** — the package has been upgraded since publication. The live package ID found on-chain:

```
0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c
```

**Do not hardcode the package ID.** The backend resolver must detect it dynamically:
1. Query all objects owned by the wallet (`objects(first: 50)`)
2. Find the node whose `type.repr` includes `::character::PlayerProfile`
3. Extract the package ID as the prefix before the first `::`

This makes the resolver robust to future package upgrades.

---

## Infrastructure (Confirmed)

| Component | Value | Status |
|-----------|-------|--------|
| Sui GraphQL endpoint | `https://graphql.testnet.sui.io/graphql` | ✅ Confirmed reachable |
| Chain | Sui testnet (`4c78adac`) | ✅ Confirmed |
| Auth required | None | ✅ Confirmed — fully public |
| Server-side access | Yes | ✅ Confirmed — no CORS restriction |
| `PlayerProfile` exists | Yes | ✅ Confirmed |
| `Character` exists | Yes | ✅ Confirmed |
| `tribe_id` present | Yes — on `Character` | ✅ Confirmed |
| `name` present | Yes — `Character.metadata.name` | ✅ Confirmed |
| Package ID detection | Dynamic from type repr | ✅ Required |

---

## Resolution Architecture

The backend auth path, replacing `VITE_REMOTE_DEV_CHARACTER_JWT`:

1. Client signs a server-issued challenge with the connected Sui wallet (SIWS)
2. Server verifies the wallet signature against the challenge (Phase 09I — already implemented)
3. Server queries Sui GraphQL for `PlayerProfile` objects owned by the verified wallet address
4. Server extracts `character_id` from `PlayerProfile.json.character_id`
5. Server queries the `Character` object at that address
6. Server extracts `key.item_id`, `metadata.name`, `tribe_id`
7. Server evaluates tribe policy against `tribe_id`
8. Server writes the Signal with verified character attribution + audit log entry

---

## Identity Layer Map (Updated)

| Layer | Trust for backend | What it gives you |
|-------|------------------|-------------------|
| EVE Vault / dApp Kit (frontend) | **Low — client-controlled** | Wallet address for UX only |
| `assemblyOwner` via `useSmartObject()` | **Medium** | Smart object owner — NOT the connected pilot |
| On-chain `PlayerProfile` + `Character` | **High — server-verifiable** | `item_id`, `name`, `tribe_id`, wallet binding |

The `assemblyOwner` from dApp Kit identifies who owns the smart assembly in view, which may differ from the wallet currently connected. The `Character` object resolves the connected wallet directly.

---

## Tribe ID Resolution

`tribe_id: 1000167` is a numeric EVE tribe ID. The World API `/v2/tribes/{id}` can resolve it to a tribe name and other metadata. This is a second optional enrichment step — `tribe_id` alone is sufficient for tribe-scoped write policy enforcement.

---

## What This Unblocks

- `isProductionCharacterTokenAvailable()` can return `true` once this resolver is wired to the API
- `VITE_REMOTE_DEV_CHARACTER_JWT` can be removed from the auth path
- `AUTH_DEV_MODE` can be retired for the character identity portion
- Tribe-scoped remote writes become possible with verified `tribe_id`
- Background sync (previously blocked by the hard invariant) becomes unblocked

---

## Reference Implementation

See [`scripts/lookup-player-profile.mjs`](../../scripts/lookup-player-profile.mjs) for the working two-step resolver.

---

## Audit Trail

| Finding | Source | Confidence |
|---------|--------|------------|
| `PlayerProfile` is wallet-owned on Sui testnet | Live probe | **Confirmed** |
| `Character` is a shared object reachable by address | Live probe | **Confirmed** |
| `tribe_id` is on `Character`, not `PlayerProfile` | Live probe | **Confirmed** |
| `Character.key.item_id` is the EVE numeric character ID | Live probe | **Confirmed** |
| `Character.metadata.name` is the character display name | Live probe (`"Kivik"`) | **Confirmed** |
| `Character.character_address` matches the wallet | Live probe | **Confirmed** |
| Package ID must be detected dynamically | Live probe (Published.toml stale) | **Confirmed** |
| Sui GraphQL endpoint publicly accessible server-side | Live probe | **Confirmed** |
| No auth required for any query | Live probe | **Confirmed** |
| Blockchain gateway remains externally unreachable | Prior audit (09L.0) | **Confirmed** |
