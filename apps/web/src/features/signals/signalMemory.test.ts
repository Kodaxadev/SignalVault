import { describe, it, expect } from 'vitest';
import { createSignalMemory } from './signalMemory';
import type { Signal } from './signalTypes';

const makeSignal = (entityId: string, id: string): Signal => ({
  id,
  title: 'Test',
  body: '',
  signalType: 'field_note',
  confidence: 'observed',
  visibility: 'local_private',
  syncState: 'local_only',
  author: { kind: 'anonymous_local' },
  linkedEntities: [{ entityId, type: 'unknown', label: 'Test', resolutionConfidence: 'unknown' }],
  createdInContext: { surface: 'ingame_object', viewerState: 'anonymous' },
  tags: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
});

describe('signalMemory', () => {
  it('add and get by key', () => {
    const memory = createSignalMemory();
    const signal = makeSignal('item:utopia:12345', 's1');
    memory.add(signal);

    const results = memory.getByEntityKey('item:utopia:12345');
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('s1');
  });

  it('get all signals', () => {
    const memory = createSignalMemory();
    memory.add(makeSignal('item:utopia:12345', 's1'));
    memory.add(makeSignal('item:utopia:99999', 's2'));

    expect(memory.getAll()).toHaveLength(2);
  });

  it('returns empty for unknown key', () => {
    const memory = createSignalMemory();
    expect(memory.getByEntityKey('nonexistent')).toEqual([]);
  });

  it('appends multiple signals for same entity', () => {
    const memory = createSignalMemory();
    memory.add(makeSignal('item:utopia:12345', 's1'));
    memory.add(makeSignal('item:utopia:12345', 's2'));

    const results = memory.getByEntityKey('item:utopia:12345');
    expect(results).toHaveLength(2);
  });

  it('update replaces signal in-place by id', () => {
    const memory = createSignalMemory();
    const original = makeSignal('item:utopia:12345', 's1');
    memory.add(original);

    const updated = { ...original, syncState: 'remote_saved' as const };
    memory.update(updated);

    const results = memory.getByEntityKey('item:utopia:12345');
    expect(results).toHaveLength(1);
    expect(results[0]?.syncState).toBe('remote_saved');
  });

  it('update does nothing for unknown signal id', () => {
    const memory = createSignalMemory();
    memory.add(makeSignal('item:utopia:12345', 's1'));

    const ghost = { ...makeSignal('item:utopia:12345', 'unknown-id'), syncState: 'remote_saved' as const };
    memory.update(ghost);

    // Original signal unchanged
    expect(memory.getByEntityKey('item:utopia:12345')[0]?.syncState).toBe('local_only');
  });
});
