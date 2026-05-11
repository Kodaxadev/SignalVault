import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { db } from '@/features/local/localDb';
import { addSignalsBatch, clearSignals, loadAllSignals } from '@/features/local/localSignalRepository';
import { getSignalsForEntity } from '@/features/dossiers/dossierSignals';
import type { Signal } from '@/features/signals/signalTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import { addClassificationsBatch, clearClassifications } from '@/features/local/localEntityClassificationRepository';

/**
 * Player flow test — proves the local-first MVP loop works:
 * classify object → log Signal → verify in dossier → reload → Signal persists.
 *
 * Does NOT render InGameRoute or depend on dApp Kit provider.
 * Tests the local product loop directly using Dexie + repository APIs.
 */

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  const id = overrides.id ?? `flow-signal-${Date.now()}`;
  return {
    id,
    title: 'Gate Passed',
    body: '',
    signalType: 'gate_recon',
    confidence: 'observed',
    visibility: 'tribe',
    syncState: 'local_only',
    author: { kind: 'anonymous_local' },
    linkedEntities: [{ entityId: 'sg:gate:1', type: 'smart_gate', label: 'Test Gate', resolutionConfidence: 'unknown' }],
    tags: ['passed'],
    createdInContext: { surface: 'external_app', viewerState: 'anonymous' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeClassification(overrides: Partial<EntityClassificationClaim> = {}): EntityClassificationClaim {
  return {
    id: overrides.id ?? `flow-classification-${Date.now()}`,
    entityKey: 'sg:gate:1',
    source: 'user_manual',
    claimedType: 'smart_gate',
    label: 'Test Gate',
    confidence: 'manual',
    priority: 1,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('player flow: local-first MVP loop', () => {
  beforeEach(async () => {
    await clearSignals(db);
    await clearClassifications(db);
  });

  afterEach(async () => {
    await clearSignals(db);
    await clearClassifications(db);
  });

  it('classify → log Signal → persists → reload hydration', async () => {
    // Step 1: Classify an unknown object as smart_gate
    const classification = makeClassification();
    await act(async () => {
      await addClassificationsBatch(db, [classification]);
    });

    // Verify classification is in DB
    const storedClassifications = await db.table('classifications').toArray();
    expect(storedClassifications.length).toBe(1);
    expect(storedClassifications[0].claim.entityKey).toBe('sg:gate:1');

    // Step 2: Log a Signal (simulate QuickSignalButtons "Passed" action)
    const signal = makeSignal({ linkedEntities: [{ entityId: 'sg:gate:1', type: 'smart_gate', label: 'Test Gate', resolutionConfidence: 'unknown' }] });
    await act(async () => {
      await addSignalsBatch(db, [signal]);
    });

    // Step 3: Verify Signal appears via repository query (simulates dossier loading)
    const allSignals = await loadAllSignals(db);
    const signalsForEntity = getSignalsForEntity(allSignals, 'sg:gate:1');
    expect(signalsForEntity.length).toBe(1);
    const firstSignal = signalsForEntity[0]!;
    expect(firstSignal.signalType).toBe('gate_recon');
    expect(firstSignal.tags).toContain('passed');

    // Step 4: Verify Signal persists in Dexie DB directly
    const persistedRecords = await db.table('signals').toArray();
    expect(persistedRecords.length).toBe(1);
    expect(persistedRecords[0]!.signal.id).toBe(signal.id);

    // Step 5: Unmount simulation (cleanup) and remount (re-query from DB)
    // This simulates a page reload — the SignalProvider loads from Dexie on mount
    const reloadedSignals = await loadAllSignals(db);
    expect(reloadedSignals.length).toBe(1);
    const reloadedSignal = reloadedSignals[0]!;
    expect(reloadedSignal.id).toBe(signal.id);
    expect(reloadedSignal.signalType).toBe('gate_recon');

    // Step 6: Verify staleness is computed for the persisted Signal
    const { evaluateSignalStaleness } = await import('@/features/staleness/evaluateSignalStaleness');
    const staleness = evaluateSignalStaleness(reloadedSignal);
    expect(staleness.level).toBe('fresh'); // Just created, within freshForMs window
  });

  it('multiple signals for same entity are retrieved together', async () => {
    const classification = makeClassification();
    await act(async () => {
      await addClassificationsBatch(db, [classification]);
      await addSignalsBatch(db, [
        makeSignal({ id: 'sig-1', title: 'Gate Passed', signalType: 'gate_recon', tags: ['passed'] }),
        makeSignal({ id: 'sig-2', title: 'Hostile Nearby', signalType: 'hostile_contact', tags: ['hostile'] }),
      ]);
    });

    const allSignals = await loadAllSignals(db);
    const signalsForEntity = getSignalsForEntity(allSignals, 'sg:gate:1');
    expect(signalsForEntity.length).toBe(2);
  });

  it('classification and signal survive reload cycle', async () => {
    // First "session"
    const classification = makeClassification({ entityKey: 'sg:gate:2' });
    const signal = makeSignal({
      id: 'survival-signal',
      linkedEntities: [{ entityId: 'sg:gate:2', type: 'smart_gate', label: 'Gate 2', resolutionConfidence: 'unknown' }],
    });
    await act(async () => {
      await addClassificationsBatch(db, [classification]);
      await addSignalsBatch(db, [signal]);
    });

    // Simulate reload
    const reloadedSignals = await loadAllSignals(db);

    // Verify signal survived
    const survived = reloadedSignals.find((s) => s.id === 'survival-signal');
    expect(survived).toBeDefined();
    expect(survived?.signalType).toBe('gate_recon');

    // Verify classification survived
    const storedClassifications = await db.table('classifications').toArray();
    const survivedClassification = storedClassifications.find((c) => c.claim.entityKey === 'sg:gate:2');
    expect(survivedClassification).toBeDefined();
  });
});
