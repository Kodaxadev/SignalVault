import { describe, it, expect } from 'vitest';
import { evaluateSignalStaleness } from './evaluateSignalStaleness';
import type { Signal } from '@/features/signals/signalTypes';

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  const createdAt = overrides.createdAt ?? new Date('2024-01-01T00:00:00Z').toISOString();
  const updatedAt = overrides.updatedAt ?? createdAt;
  return {
    id: 'test-signal',
    title: 'Test Signal',
    body: '',
    signalType: 'gate_recon',
    confidence: 'observed',
    visibility: 'tribe',
    syncState: 'local_only',
    author: { kind: 'anonymous_local' },
    linkedEntities: [],
    tags: [],
    createdInContext: { surface: 'external_app', viewerState: 'unknown' },
    createdAt,
    updatedAt,
    ...overrides,
  };
}

describe('evaluateSignalStaleness', () => {
  const gateReconFreshMs = 2 * 60 * 60 * 1000; // 2 hours

  it('returns fresh when signal is within freshForMs window', () => {
    const now = new Date('2024-01-01T01:00:00Z').getTime(); // 1 hour after creation
    const signal = makeSignal({ signalType: 'gate_recon' });
    const result = evaluateSignalStaleness(signal, now);
    expect(result.level).toBe('fresh');
    expect(result.isStale).toBe(false);
    expect(result.isCritical).toBe(false);
    expect(result.ageMs).toBe(gateReconFreshMs / 2);
  });

  it('returns aging when signal is past freshForMs but before staleAfterMs', () => {
    const now = new Date('2024-01-01T10:00:00Z').getTime(); // 10 hours after creation
    const signal = makeSignal({ signalType: 'gate_recon' });
    const result = evaluateSignalStaleness(signal, now);
    expect(result.level).toBe('aging'); // 10h > 6h aging, < 24h stale
    expect(result.isStale).toBe(false);
    expect(result.isCritical).toBe(false);
  });

  it('returns stale when signal is past staleAfterMs but before criticalAfterMs', () => {
    const now = new Date('2024-01-02T00:00:00Z').getTime(); // 24 hours after creation
    const signal = makeSignal({ signalType: 'gate_recon' });
    const result = evaluateSignalStaleness(signal, now);
    expect(result.level).toBe('stale');
    expect(result.isStale).toBe(true);
    expect(result.isCritical).toBe(false);
  });

  it('returns critical when signal is past criticalAfterMs', () => {
    const now = new Date('2024-01-04T00:00:00Z').getTime(); // 72 hours after creation
    const signal = makeSignal({ signalType: 'gate_recon' });
    const result = evaluateSignalStaleness(signal, now);
    expect(result.level).toBe('critical');
    expect(result.isStale).toBe(true);
    expect(result.isCritical).toBe(true);
  });

  it('uses updatedAt when later than createdAt', () => {
    const signal = makeSignal({
      signalType: 'gate_recon',
      createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
      updatedAt: new Date('2024-01-01T02:00:00Z').toISOString(),
    });
    const now = new Date('2024-01-01T03:00:00Z').getTime(); // 1 hour after updatedAt
    const result = evaluateSignalStaleness(signal, now);
    expect(result.level).toBe('fresh');
    expect(result.ageMs).toBe(1 * 60 * 60 * 1000);
  });

  it('does NOT mutate the signal', () => {
    const signal = makeSignal({ signalType: 'gate_recon' });
    const original = JSON.parse(JSON.stringify(signal));
    const now = new Date('2024-01-04T00:00:00Z').getTime();
    evaluateSignalStaleness(signal, now);
    expect(signal).toEqual(original);
  });

  it('defaults to now when now is not provided', () => {
    const signal = makeSignal({
      signalType: 'gate_recon',
      createdAt: new Date(Date.now() - 1000).toISOString(), // 1 second ago
    });
    const result = evaluateSignalStaleness(signal);
    expect(result.level).toBe('fresh');
    expect(result.ageMs).toBeLessThan(5000);
  });

  it('handles hostile_contact with short windows', () => {
    const signal = makeSignal({ signalType: 'hostile_contact' });
    const now = new Date('2024-01-01T10:00:00Z').getTime(); // 10 hours after creation
    const result = evaluateSignalStaleness(signal, now);
    expect(result.level).toBe('stale'); // 10h > 30m fresh, > 2h aging, > 8h stale, < 24h critical
  });

  it('handles field_note with long windows', () => {
    const signal = makeSignal({ signalType: 'field_note' });
    const now = new Date('2024-01-03T00:00:00Z').getTime(); // 2 days after creation
    const result = evaluateSignalStaleness(signal, now);
    expect(result.level).toBe('aging'); // 2d = 48h = aging threshold
  });
});
