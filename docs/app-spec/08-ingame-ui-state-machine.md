# In-Game UI State Machine

## Purpose

Defines the UI state transitions for the in-game object page.

## Top-Level States

```txt
Boot
LoadingContext
AnonymousPublic
IdentityPrompt
ObjectUnresolved
ObjectResolved
QuickCapture
LocalOnlyMode
SyncPending
ErrorRecoverable
```

## State: Boot

Entry:

- route opened

Actions:

- parse URL
- initialize app shell

Next:

- LoadingContext

## State: LoadingContext

Actions:

- resolve viewer
- resolve entity
- load public dossier

Next:

- AnonymousPublic
- ObjectUnresolved
- ObjectResolved
- ErrorRecoverable

## State: AnonymousPublic

Shows:

- public dossier
- identity unresolved banner
- connect/access-code options
- local-only quick capture if allowed

Transitions:

- connect identity → IdentityPrompt
- consume code → ObjectResolved with viewer
- quick action → LocalOnlyMode or QuickCapture

## State: IdentityPrompt

Shows:

- connect wallet
- enter access code
- continue anonymous

Transitions:

- valid code → ObjectResolved
- cancel → AnonymousPublic

## State: ObjectUnresolved

Shows:

- unknown object page
- object ID / tenant / itemId
- classify object
- log field Signal

Transitions:

- classify → ObjectResolved or ManualResolved
- quick Signal → QuickCapture

## State: ObjectResolved

Shows:

- gate/storage/etc dossier
- quick actions
- recent Signals
- warnings
- confidence/staleness

Transitions:

- quick action → QuickCapture
- edit/open full → external app
- resolver conflict → ObjectResolved with warning

## State: QuickCapture

Shows:

- prefilled action
- optional note
- visibility selector if authenticated

Transitions:

- save remote → ObjectResolved
- save local → SyncPending/LocalOnlyMode
- cancel → previous

## State: LocalOnlyMode

Shows:

- local save confirmation
- unsynced badge
- login prompt if publishing desired

## State: SyncPending

Shows:

- pending sync badge
- retry/export options

## State: ErrorRecoverable

Shows:

- error message
- retry
- continue local-only
- export local data

## Required UI Indicators

Always show:

- viewer state
- entity resolution confidence
- sync/local state
