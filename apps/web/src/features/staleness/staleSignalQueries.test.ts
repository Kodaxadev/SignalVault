import { describe, it, expect } from 'vitest';
import { getStalenessSummary, getStaleSignals, getFreshSignals } from './staleSignalQueries';
import type { Signal } from '@/features/signals/signalTypes';

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  const createdAt = overrides.createdAt ?? new Date('2024-01-01T00:00:00Z').toISOString();
  const updatedAt = overrides.updatedAt ?? createdAt;
  return {
    id: `signal-${Math.random()}`,
    title: 'Test',
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

describe('staleness queries', () => {
  const baseTime = new Date('2024-01-01T00:00:00Z').getTime();

  describe('getStalenessSummary', () => {
    it('returns correct counts for mixed signals', () => {
      // gate_recon: fresh=2h, aging=6h, stale=24h, critical=72h
      const signals = [
        makeSignal({ id: 'fresh', createdAt: new Date(baseTime - 1 * 60 * 60 * 1000).toISOString() }), // 1h old (fresh)
        makeSignal({ id: 'aging', createdAt: new Date(baseTime - 10 * 60 * 60 * 1000).toISOString() }), // 10h old (aging)
        makeSignal({ id: 'stale', createdAt: new Date(baseTime - 30 * 60 * 60 * 1000).toISOString() }), // 30h old (stale)
        makeSignal({ id: 'critical', createdAt: new Date(baseTime - 80 * 60 * 60 * 1000).toISOString() }), // 80h old (critical)
      ];
      const summary = getStalenessSummary(signals, baseTime);
      expect(summary.total).toBe(4);
      expect(summary.fresh).toBe(1);
      expect(summary.aging).toBe(1);
      expect(summary.stale).toBe(1);
      expect(summary.critical).toBe(1);
    });

    it('returns zeros for empty array', () => {
      const summary = getStalenessSummary([], baseTime);
      expect(summary.total).toBe(0);
      expect(summary.fresh).toBe(0);
      expect(summary.aging).toBe(0);
      expect(summary.stale).toBe(0);
      expect(summary.critical).toBe(0);
    });
  });

  describe('getStaleSignals', () => {
    it('returns only stale and critical signals', () => {
      // gate_recon: fresh=2h, aging=6h, stale=24h, critical=72h
      const signals = [
        makeSignal({ id: 'fresh', createdAt: new Date(baseTime - 1 * 60 * 60 * 1000).toISOString() }), // 1h (fresh)
        makeSignal({ id: 'stale', createdAt: new Date(baseTime - 30 * 60 * 60 * 1000).toISOString() }), // 30h (stale)
        makeSignal({ id: 'critical', createdAt: new Date(baseTime - 80 * 60 * 60 * 1000).toISOString() }), // 80h (critical)
      ];
      const stale = getStaleSignals(signals, baseTime);
      expect(stale.length).toBe(2);
      expect(stale.map((s) => s.id)).toContain('stale');
      expect(stale.map((s) => s.id)).toContain('critical');
    });
  });

  describe('getFreshSignals', () => {
    it('returns only fresh signals', () => {
      // gate_recon: fresh=2h, aging=6h, stale=24h, critical=72h
      const signals = [
        makeSignal({ id: 'fresh', createdAt: new Date(baseTime - 1 * 60 * 60 * 1000).toISOString() }), // 1h (fresh)
        makeSignal({ id: 'aging', createdAt: new Date(baseTime - 10 * 60 * 60 * 1000).toISOString() }), // 10h (aging)
        makeSignal({ id: 'stale', createdAt: new Date(baseTime - 30 * 60 * 60 * 1000).toISOString() }), // 30h (stale)
      ];
      const fresh = getFreshSignals(signals, baseTime);
      expect(fresh.length).toBe(1);
      expect(fresh[0]).toBeDefined();
      expect(fresh[0]!.id).toBe('fresh');
    });
  });
});
