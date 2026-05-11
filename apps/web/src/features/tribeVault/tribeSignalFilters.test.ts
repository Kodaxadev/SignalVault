import { describe, it, expect } from 'vitest';
import type { ViewerContext } from '@/features/viewer';
import type { Signal } from '@/features/signals/signalTypes';
import { filterSignalsByTribeScope, getTribeScopedSignals } from './tribeSignalFilters';

const characterViewer = (tribeId?: string, roles: string[] = []): ViewerContext => ({
  state: 'character_resolved',
  walletAddress: '0xwallet',
  characterId: 'char-1',
  characterName: 'Test',
  tribeId,
  roles,
});

const makeSignal = (visibility: string, tribeId?: string): Signal =>
  ({
    id: `signal-${visibility}`,
    title: 'Test',
    body: '',
    signalType: 'field_note',
    confidence: 'observed',
    visibility: visibility as Signal['visibility'],
    syncState: 'local_only',
    author: { kind: 'character', tribeId },
    linkedEntities: [],
    createdInContext: { surface: 'ingame_object', viewerState: 'character_resolved' },
    tags: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }) as Signal;

describe('tribeSignalFilters', () => {
  it('filterSignalsByTribeScope returns signals from same tribe', () => {
    const signals = [
      makeSignal('tribe', 'tribe-a'),
      makeSignal('tribe', 'tribe-b'),
    ];
    const viewer = characterViewer('tribe-a');
    const result = filterSignalsByTribeScope(signals, viewer, 'tribe');
    expect(result).toHaveLength(1);
    expect(result[0]!.author.tribeId).toBe('tribe-a');
  });

  it('filterSignalsByTribeScope returns empty for viewer without tribe', () => {
    const signals = [makeSignal('tribe', 'tribe-a')];
    const viewer = characterViewer();
    const result = filterSignalsByTribeScope(signals, viewer, 'tribe');
    expect(result).toHaveLength(0);
  });

  it('getTribeScopedSignals includes only tribe scope signals', () => {
    const signals = [
      makeSignal('tribe', 'tribe-a'),
      makeSignal('private', 'tribe-a'),
      makeSignal('public', undefined),
      makeSignal('officer', 'tribe-a'),
    ];
    const viewer = characterViewer('tribe-a');
    const result = getTribeScopedSignals(signals, viewer);
    expect(result).toHaveLength(1);
    expect(result[0]!.visibility).toBe('tribe');
  });

  it('getTribeScopedSignals excludes cross-tribe signals', () => {
    const signals = [
      makeSignal('tribe', 'tribe-a'),
      makeSignal('tribe', 'tribe-b'),
    ];
    const viewer = characterViewer('tribe-a');
    const result = getTribeScopedSignals(signals, viewer);
    expect(result).toHaveLength(1);
    expect(result[0]!.author.tribeId).toBe('tribe-a');
  });

  it('getTribeScopedSignals excludes signals without tribe author', () => {
    const signals = [
      makeSignal('tribe', undefined),
      makeSignal('tribe', 'tribe-a'),
    ];
    const viewer = characterViewer('tribe-a');
    const result = getTribeScopedSignals(signals, viewer);
    expect(result).toHaveLength(1);
  });
});
