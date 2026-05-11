# User Journey Scenarios

## Scenario 1: New Player Finds Closed Market

1. Player checks market.
2. Market appears closed.
3. Player opens Signal Vault.
4. Selects or creates system/market context.
5. Clicks `Market Closed`.
6. Signal saved locally or private.
7. System dossier now warns about closed market.

## Scenario 2: Scout Tests Gate

1. Scout opens gate object page.
2. Identity unresolved but public dossier loads.
3. Scout enters access code.
4. Viewer becomes character resolved.
5. Scout attempts jump.
6. Clicks `Passed` or `Blocked`.
7. Gate dossier updates.
8. Route risk recalculates.

## Scenario 3: Hauler Checks Route

1. Hauler opens route dossier.
2. Sees stale gate report.
3. Sees market stop marked closed.
4. Avoids route or asks scout to reconfirm.
5. Creates route note: `Re-scout needed`.

## Scenario 4: Tribe Shares Storage Cache

1. Tribe member finds storage.
2. Opens storage dossier.
3. Clicks `Access Worked`.
4. Adds purpose: Fuel Cache.
5. Publishes to tribe scope.
6. Tribe route/system dossiers now show fuel cache.

## Scenario 5: Conflicting Gate Reports

1. Scout A reports gate passed.
2. Scout B reports gate blocked.
3. Signal Vault detects contradiction.
4. Gate and route show contested state.
5. Officer requests re-scout.
6. New verified/observed report resolves risk.

## Scenario 6: Object Is Unknown

1. Player opens object URL.
2. Resolver cannot identify type.
3. UI shows Unknown Object Dossier.
4. Player manually classifies as Smart Storage Unit.
5. Classification displays Manual.
6. Later indexed data confirms or corrects.

## Scenario 7: Player Leaves Tribe

1. Player had authored tribe Signals.
2. Character tribe changes.
3. Old tribe access revoked.
4. Authored tribe Signals remain in old tribe vault.
5. Private Signals remain with player.
6. Audit history remains.

## Scenario 8: Backend Fails Mid-Session

1. Player clicks quick action.
2. Backend unavailable.
3. Signal saved locally.
4. UI shows unsynced state.
5. Player continues playing.
6. Sync occurs later or user exports local backup.

## Scenario 9: Operator Publishes Gate Notice

1. Gate operator opens external app.
2. Claims operator control in future phase.
3. Publishes public object note:
   - toll rule
   - permit info
   - route warning
4. Players opening gate dossier see operator notice plus subjective Signals.

## Scenario 10: Intel Analyst Reviews Stale Signals

1. Analyst opens stale Signal register.
2. Filters by route/gate.
3. Identifies critical stale route.
4. Assigns or creates re-scout Signal.
5. Route returns to green/amber/red after new reports.
