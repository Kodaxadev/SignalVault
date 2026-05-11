import { describe, it, expect } from 'vitest';
import { checkSignalEligibility } from './remoteEligibility';
import type { Signal } from '@/features/signals/signalTypes';

function makeSignal(overrides: Partial<Signal>): Signal {
  return {
    id: 'sig-1',
    title: 'Test signal',
    body: 'Test body',
    signalType: 'gate_recon',
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

describe('checkSignalEligibility', () => {
  it('returns eligible for a public character-authored signal', () => {
    const result = checkSignalEligibility(makeSignal({}));
    expect(result.eligible).toBe(true);
  });

  it('blocks local_private visibility', () => {
    const result = checkSignalEligibility(makeSignal({ visibility: 'local_private' }));
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.reason).toBe('signal_local_private');
  });

  it('blocks anonymous_local author kind', () => {
    const result = checkSignalEligibility(
      makeSignal({ author: { kind: 'anonymous_local' } })
    );
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.reason).toBe('anonymous_author');
  });

  it('returns eligible for tribe visibility', () => {
    const result = checkSignalEligibility(makeSignal({ visibility: 'tribe' }));
    expect(result.eligible).toBe(true);
  });

  it('returns eligible for officer visibility', () => {
    const result = checkSignalEligibility(makeSignal({ visibility: 'officer' }));
    expect(result.eligible).toBe(true);
  });

  it('returns eligible for private visibility', () => {
    const result = checkSignalEligibility(makeSignal({ visibility: 'private' }));
    expect(result.eligible).toBe(true);
  });

  it('blocks local_private before checking author kind', () => {
    const result = checkSignalEligibility(
      makeSignal({ visibility: 'local_private', author: { kind: 'anonymous_local' } })
    );
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.reason).toBe('signal_local_private');
  });
});
