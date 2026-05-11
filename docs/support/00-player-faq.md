# Signal Vault Player FAQ

## Identity and Login

### Why does Signal Vault say my identity is unresolved if I opened it from EVE Frontier?

Opening Signal Vault from inside EVE Frontier gives the app object/context information, not guaranteed player identity. Connect your wallet or use an in-game access code to identify yourself.

### Can I use Signal Vault without logging in?

Yes. You can view public dossiers and create local drafts. You cannot publish shared or tribe Signals until identity is resolved.

### How do I log in from the in-game browser?

Use the in-game access-code flow:

1. Open Signal Vault in your normal browser.
2. Connect wallet.
3. Generate a short-lived access code.
4. Enter that code in the in-game browser.
5. Your in-game session becomes linked.

## Objects and Dossiers

### Why does this object show as unresolved?

Signal Vault could not verify the object type yet. You can still log Signals, and if allowed, manually classify it.

### What does manual mean?

Manual means a player or tribe classified the object. It is useful but not verified by stronger data sources.

### What does verified mean?

Verified means Signal Vault resolved the object through a stronger source such as dApp Kit, GraphQL, indexer, or on-chain data.

## Signals

### What is a Signal?

A Signal is a typed field note attached to EVE Frontier context, such as a gate report, market report, storage manifest, route report, or hostile contact.

### How do I create a quick Signal?

Use the quick action buttons on an object page, such as:

- Passed
- Blocked
- Permit Required
- Access Denied
- Market Closed
- Hostile Nearby

### Can I edit or delete a Signal?

Yes. Signal CRUD is part of the core product design. Remote deletion and data-retention behavior should follow the privacy policy once finalized.

## Confidence and Staleness

### What does stale mean?

Stale means the information may be too old to trust without reconfirming.

### What does contradicted mean?

Contradicted means recent Signals disagree. For example, one report says a gate worked and another says it blocked access.

## Tribe Vault

### Can my tribe share Signals?

Yes, tribe vaults are planned after identity, object resolution, and Signal MVP foundations are working.

### Can officers have private Signals?

Yes. Officer and scout-cell visibility scopes are part of the permission model.

## Local Drafts

### What happens if I lose connection?

Signal Vault is designed to save local drafts/Signals first so you do not lose field observations.

### Where are anonymous notes stored?

Anonymous notes are stored locally first. They are not published to shared vaults unless you authenticate and choose to publish them.

## Map and In-Game Use

### Does Signal Vault replace the map?

No. Signal Vault complements map tools by tracking contextual memory, dossiers, Signals, confidence, and route/object warnings.

### Can it detect my current system?

Not in v0.1. A later Signal Bridge may detect current system from local context/logs if feasible.

## Security

### Can someone see tribe intel without logging in?

No. Tribe/officer/scout-cell Signals require resolved identity and permissions.

### Does Signal Vault store wallet private keys?

No. Signal Vault must never store private keys, seed phrases, or wallet secrets.
