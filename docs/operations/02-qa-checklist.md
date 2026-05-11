# QA Checklist

## In-Game Object Page

- [ ] Loads with tenant/itemId.
- [ ] Loads with objectId.
- [ ] Handles missing params.
- [ ] Shows unknown object state.
- [ ] Shows viewer state.
- [ ] Shows resolution confidence.
- [ ] Quick actions visible.
- [ ] Public dossier visible without auth.

## Viewer Context

- [ ] Anonymous viewer works.
- [ ] Anonymous shared write blocked.
- [ ] Wallet viewer works.
- [ ] Character-resolved viewer works.
- [ ] Access code generated.
- [ ] Access code consumed.
- [ ] Access code expires.
- [ ] Session revoked.

## Entity Resolution

- [ ] URL hint marked as hint.
- [ ] Manual classification works.
- [ ] Manual classification visibly marked.
- [ ] Conflict state possible.
- [ ] Entity can be upgraded later.

## Signals

- [ ] Signal created.
- [ ] Signal edited.
- [ ] Signal deleted.
- [ ] Signal linked to entity.
- [ ] Signal stores context snapshot.
- [ ] Visibility works.
- [ ] Staleness works.
- [ ] Local storage persists.
