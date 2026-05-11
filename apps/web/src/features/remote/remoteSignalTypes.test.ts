import { describe, it, expect } from 'vitest';
import { signalToRemotePayload, isRemoteVisibility, type RemoteSignalVisibility } from './remoteSignalTypes';
import type { Signal } from '@/features/signals/signalTypes';

function makeSignal(overrides: Partial<Signal>): Signal {
  return {
    id: 'sig-1',
    title: 'Test',
    body: 'Body',
    signalType: 'field_note',
    confidence: 'observed',
    visibility: 'tribe',
    syncState: 'local_only',
    author: { kind: 'character', characterId: 'char-1', tribeId: 'tribe-1' },
    linkedEntities: [],
    createdInContext: { surface: 'external_app', viewerState: 'character_resolved' },
    tags: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('signalToRemotePayload', () => {
  it('returns null for local_private', () => {
    const signal = makeSignal({ visibility: 'local_private' });
    expect(signalToRemotePayload(signal)).toBeNull();
  });

  it('returns null for anonymous_local author', () => {
    const signal = makeSignal({ author: { kind: 'anonymous_local' } });
    expect(signalToRemotePayload(signal)).toBeNull();
  });

  it('returns payload for tribe visibility', () => {
    const signal = makeSignal({ visibility: 'tribe' });
    const payload = signalToRemotePayload(signal);
    expect(payload).not.toBeNull();
    expect(payload!.visibility).toBe('tribe');
    expect(payload!.signalType).toBe('field_note');
    expect(payload!.title).toBe('Test');
  });

  it('returns payload for officer visibility', () => {
    const signal = makeSignal({ visibility: 'officer' });
    const payload = signalToRemotePayload(signal);
    expect(payload!.visibility).toBe('officer');
  });

  it('returns payload for scout_cell visibility', () => {
    const signal = makeSignal({ visibility: 'scout_cell' });
    const payload = signalToRemotePayload(signal);
    expect(payload!.visibility).toBe('scout_cell');
  });

  it('returns payload for public visibility', () => {
    const signal = makeSignal({ visibility: 'public' });
    const payload = signalToRemotePayload(signal);
    expect(payload!.visibility).toBe('public');
  });

  it('returns payload for private visibility', () => {
    const signal = makeSignal({ visibility: 'private' });
    const payload = signalToRemotePayload(signal);
    expect(payload!.visibility).toBe('private');
  });

  it('preserves expiresAt when present', () => {
    const signal = makeSignal({ expiresAt: '2024-12-31T00:00:00Z' });
    const payload = signalToRemotePayload(signal);
    expect(payload!.expiresAt).toBe('2024-12-31T00:00:00Z');
  });

  it('omits expiresAt when undefined', () => {
    const signal = makeSignal({});
    const payload = signalToRemotePayload(signal);
    expect(payload!.expiresAt).toBeUndefined();
  });
});

describe('isRemoteVisibility', () => {
  it.each<RemoteSignalVisibility>(['tribe', 'officer', 'scout_cell', 'public', 'private'])(
    'returns true for %s',
    (visibility) => {
      expect(isRemoteVisibility(visibility)).toBe(true);
    },
  );

  it('returns false for local_private', () => {
    expect(isRemoteVisibility('local_private')).toBe(false);
  });

  it('returns false for arbitrary string', () => {
    expect(isRemoteVisibility('custom')).toBe(false);
  });
});
