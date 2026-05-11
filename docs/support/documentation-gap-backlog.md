# Documentation Gap Backlog

This backlog is derived from the 10K user question simulation.

## Highest Priority

### 1. Privacy and Data Ownership Policy

Needed answers:

- Who owns private Signals?
- Who owns tribe Signals?
- What happens when a member leaves a tribe?
- Can users delete/export their data?
- Can operators see private data?

### 2. In-Game Auth Troubleshooting

Needed answers:

- access code fails
- session expired
- wallet unavailable in in-game browser
- character cannot resolve
- tribe not detected

### 3. Browser Compatibility Guide

Needed answers:

- what if in-game browser does not render
- what CSS/browser features are required
- what fallback external flow exists
- what to do if cookies/session fail

### 4. Object Classification / Dispute Workflow

Needed answers:

- how to correct wrong classification
- who can override manual classification
- how conflicts are reviewed
- how verified data promotes manual records

### 5. Tribe Membership Change Policy

Needed answers:

- what happens when player changes tribe
- what happens to old tribe Signals
- whether access is revoked
- how audit logs work

## Medium Priority

### 6. Local Draft Recovery Guide

Needed answers:

- where drafts are stored
- how to export
- how to recover after browser reset
- what happens after failed sync

### 7. Attachments and Screenshots Spec

Needed answers:

- are screenshots supported
- where are attachments stored
- max size
- visibility rules
- privacy implications

### 8. Smart Assembly Custom URL Operator Guide

Needed answers:

- exact setup steps
- required tenant/itemId/objectId URL format
- how to test
- how to roll back

## Recommendation

Do not ship a public alpha until at least items 1–4 have draft documentation.


## Gap Closure Update

The following docs have now been drafted:

- `support/01-ingame-auth-troubleshooting.md`
- `support/02-browser-compatibility-requirements.md`
- `policy/02-attachments-and-screenshots-spec.md`

Remaining unresolved parts are implementation/testing-dependent:

- exact EVE Frontier in-game browser feature matrix
- exact wallet availability behavior inside the in-game browser
- exact object custom URL setup screenshots
- final attachment storage provider and moderation process, if attachments are promoted later
