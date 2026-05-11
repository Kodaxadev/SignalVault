import { describe, it, expect } from 'vitest';
import { getRemoteId, hasRemoteId, applyRemoteSaved, applyRemotePending, applyRemoteFailed } from './remoteSignalMapping';
import type { Signal } from '@/features/signals/signalTypes';

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: 'sig-1',
    title: 'Test',
    body: '',
    signalType: 'field_note',
    confidence: 'observed',
    visibility: 'public',
    syncState: 'local_only',
    author: { kind: 'character', characterId: 'char-1', tribeId: 'tribe-1' },
    linkedEntities: [],
    createdInContext: { surface: 'external_app', viewerState: 'character_resolved' },
    tags: [],
    createdAt: '2026-05-10T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z',
    ...overrides,
  };
}

describe('getRemoteId', () => {
  it('returns undefined when remote is not set', () => {
    expect(getRemoteId(makeSignal())).toBeUndefined();
  });

  it('returns remoteId when present', () => {
    const signal = makeSignal({ remote: { remoteId: 'uuid-abc' } });
    expect(getRemoteId(signal)).toBe('uuid-abc');
  });
});

describe('hasRemoteId', () => {
  it('returns false when no remote', () => {
    expect(hasRemoteId(makeSignal())).toBe(false);
  });

  it('returns false when remote has no remoteId', () => {
    const signal = makeSignal({ remote: { lastError: 'network error' } });
    expect(hasRemoteId(signal)).toBe(false);
  });

  it('returns true when remoteId is present', () => {
    const signal = makeSignal({ remote: { remoteId: 'uuid-abc' } });
    expect(hasRemoteId(signal)).toBe(true);
  });
});

describe('applyRemotePending', () => {
  it('sets syncState to remote_pending', () => {
    const result = applyRemotePending(makeSignal());
    expect(result.syncState).toBe('remote_pending');
  });

  it('sets lastAttemptAt', () => {
    const result = applyRemotePending(makeSignal());
    expect(result.remote?.lastAttemptAt).toBeTruthy();
  });

  it('preserves existing remote fields', () => {
    const signal = makeSignal({ remote: { remoteId: 'existing-id' } });
    const result = applyRemotePending(signal);
    expect(result.remote?.remoteId).toBe('existing-id');
  });

  it('does not mutate original signal', () => {
    const original = makeSignal();
    applyRemotePending(original);
    expect(original.syncState).toBe('local_only');
  });
});

describe('applyRemoteSaved', () => {
  it('sets syncState to remote_saved', () => {
    const result = applyRemoteSaved(makeSignal(), 'new-uuid');
    expect(result.syncState).toBe('remote_saved');
  });

  it('sets remoteId', () => {
    const result = applyRemoteSaved(makeSignal(), 'new-uuid');
    expect(result.remote?.remoteId).toBe('new-uuid');
  });

  it('clears lastError', () => {
    const signal = makeSignal({ remote: { lastError: 'prior error' } });
    const result = applyRemoteSaved(signal, 'new-uuid');
    expect(result.remote?.lastError).toBeUndefined();
  });

  it('does not mutate original signal', () => {
    const original = makeSignal();
    applyRemoteSaved(original, 'uuid');
    expect(original.syncState).toBe('local_only');
  });
});

describe('applyRemoteFailed', () => {
  it('sets syncState to sync_failed', () => {
    const result = applyRemoteFailed(makeSignal(), 'timeout');
    expect(result.syncState).toBe('sync_failed');
  });

  it('stores the error message', () => {
    const result = applyRemoteFailed(makeSignal(), 'Network error');
    expect(result.remote?.lastError).toBe('Network error');
  });

  it('sets lastAttemptAt', () => {
    const result = applyRemoteFailed(makeSignal(), 'err');
    expect(result.remote?.lastAttemptAt).toBeTruthy();
  });

  it('does not mutate original signal', () => {
    const original = makeSignal();
    applyRemoteFailed(original, 'err');
    expect(original.syncState).toBe('local_only');
  });
});
