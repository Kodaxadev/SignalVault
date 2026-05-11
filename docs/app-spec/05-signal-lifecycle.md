# Signal Lifecycle

## Purpose

Defines how a Signal moves through capture, storage, publication, update, staleness, contradiction, and deletion.

## Lifecycle States

1. Draft
2. Local Saved
3. Remote Saved
4. Published
5. Corroborated
6. Verified
7. Stale
8. Contradicted
9. Retracted / Soft Deleted
10. Archived

## Draft

Created when:

- user opens editor
- quick action creates prefilled Signal
- anonymous user captures local note
- backend unavailable

## Local Saved

Stored in Dexie/IndexedDB.

Used when:

- anonymous
- offline
- backend unavailable
- user chooses local-only

## Remote Saved

Stored in backend.

Requires:

- wallet or character context
- valid permissions

## Published

Visible according to scope:

- public
- tribe
- officer
- scout_cell

## Corroborated

Multiple compatible Signals support the same claim.

Example:

- two scouts report gate passed

## Verified

Stronger data source confirms claim.

Examples:

- indexer event
- on-chain object state
- operator verified note
- authorized role confirmation

## Stale

Signal is old enough that it should not be trusted without reconfirmation.

Stale does not mean deleted.

## Contradicted

Recent Signals disagree.

Example:

- gate passed
- gate blocked

## Retracted / Soft Deleted

Remote Signal removed from active view but retained for audit.

## Archived

Long-term historical record.

## Transition Rules

```txt
Draft → Local Saved
Draft → Remote Saved
Local Saved → Remote Saved
Remote Saved → Published
Published → Corroborated
Published → Verified
Published → Stale
Published → Contradicted
Any Remote → Soft Deleted
Any Local → Deleted
```

## Required Metadata

Every Signal must keep:

- author context
- entity snapshot
- viewer state at creation
- created surface
- visibility
- confidence
- timestamps
