# Biomassing and Identity Continuity

**Status date:** 2026-05-12

## Why This Matters

In EVE Online support language, a deleted character may be "biomassed" from the character selection screen. Signal Vault treats that as evidence for a broader EVE/EVE Frontier dapp risk: wallet ownership and character identity are related, but they are not safe to model as permanently identical. See CCP's EVE Online support article, [Deleting a character](https://support.eveonline.com/hc/en-us/articles/203465591-Deleting-a-character).

EVE Frontier-specific deletion/recreation semantics still need official confirmation. Until then, the backend must use the stricter rule:

```txt
wallet address proves wallet ownership
Character.key.item_id proves current EVE character identity
Character.tribe_id proves current tribe context
```

## Backend Rule

Every remote write records the identity resolved at request time. A future request from the same wallet must resolve identity again and may produce a different character snapshot.

Signal Vault persists this snapshot in remote signals and audit logs:

```txt
walletAddress
characterId
characterName
tribeId
identitySource
identityResolvedAt
```

The active Sui path is:

```txt
verified wallet
-> PlayerProfile
-> Character object
-> Character.key.item_id
-> Character.metadata.name
-> Character.tribe_id
```

## Historical Authorship Policy

If a previously saved signal was authored by a character that later no longer resolves:

- Do not delete the signal automatically.
- Do not reassign the signal to a newly resolved character automatically.
- Keep the old author snapshot as historical identity.
- Surface unresolved/historical identity in future reader UI if needed.

This prevents a biomassed or replaced character from silently inheriting authorship, permissions, or audit history created by a previous character identity.
