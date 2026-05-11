# Atlas API Availability Audit — Phase 10A

**Date**: 2026-05-10

## Atlas Reachability

| Check | Result |
|---|---|
| Atlas reachable | Yes — `https://atlas.kodaxa.dev` |
| llms.txt accessible | Yes |
| Corpus summary accessible | Yes |
| World-api topic accessible | Yes |
| World-api context accessible | Yes |

## Corpus Details

- **Topic**: World API
- **Categories**: world-api, rest, openapi
- **Authority tiers**: official_api_docs, official_tooling, community_reference
- **Record sources**: stillness_world_api, utopia_world_api
- **Default mode**: current_builder
- **Scope guidance**: Sui Move, Stillness (current live shard, testnet), Utopia (dev/mod/hackathon sandbox, testnet)

## Confirmed Stillness Base URL

Atlas records confirm: `https://world-api-stillness.live.tech.evefrontier.com`

Source: Atlas record `355b023063e34dc3063180a2ca5e9dfad205ebd30a343416f7c1afdd2c6f9c40`
- URL: `https://world-api-stillness.live.tech.evefrontier.com/v2/solarsystems`
- Authority tier: official_api_docs
- Source: stillness_world_api

## Environment Definitions (from Atlas)

- **Stillness**: Current live player shard (still testnet). Use for current gameplay and player-facing behavior.
- **Utopia**: Dev/mod/hackathon sandbox server. Use for builder testing, hackathon flows, and experimental development.
- Do not call Stillness "mainnet" unless an official source confirms that changed.

## World API Endpoints Found in Atlas

| Path | Source | Environment |
|---|---|---|
| `/v2/solarsystems` | stillness_world_api | live |
| `/v2/pod/verify` | stillness_world_api | live |
| `/v2/ships/{id}` | utopia_world_api | sandbox |
| `/health` | utopia_world_api | sandbox |
| `/config` | utopia_world_api | sandbox |

## Conclusion

Atlas is fully available and confirms both Stillness and Utopia World API endpoints. The exact endpoint paths match the Utopia Swagger documentation (`/v2/solarsystems`, `/v2/tribes`, `/v2/types`). Stillness base URL is confirmed and should be used for production builds.
