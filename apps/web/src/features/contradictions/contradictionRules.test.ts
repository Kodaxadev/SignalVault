import { describe, it, expect } from 'vitest';
import { getContradictionsForEntity, summarizeContradictions, hasSignalType, hasTag } from './contradictionRules';
import type { Signal } from '@/features/signals/signalTypes';

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  const createdAt = overrides.createdAt ?? new Date('2024-01-01T00:00:00Z').toISOString();
  const updatedAt = overrides.updatedAt ?? createdAt;
  return {
    id: `sig-${Math.random()}`,
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

describe('contradictionRules', () => {
  const baseTime = new Date('2024-01-01T00:00:00Z').getTime();

  describe('getContradictionsForEntity', () => {
    it('filters by entityKey (caller should pass entity-local signals)', () => {
      const entityASignals = [
        makeSignal({ id: 'a-passed', signalType: 'gate_recon', tags: ['passed'], linkedEntities: [{ entityId: 'entity-a', label: 'A', type: 'smart_gate', resolutionConfidence: 'unknown' }] }),
        makeSignal({ id: 'a-denied', signalType: 'access_denied', linkedEntities: [{ entityId: 'entity-a', label: 'A', type: 'smart_gate', resolutionConfidence: 'unknown' }] }),
      ];
      const entityBSignals = [
        makeSignal({ id: 'b-passed', signalType: 'gate_recon', tags: ['passed'], linkedEntities: [{ entityId: 'entity-b', label: 'B', type: 'smart_gate', resolutionConfidence: 'unknown' }] }),
        makeSignal({ id: 'b-denied', signalType: 'access_denied', linkedEntities: [{ entityId: 'entity-b', label: 'B', type: 'smart_gate', resolutionConfidence: 'unknown' }] }),
      ];

      // Caller is responsible for filtering signals by entityKey
      const contradictionsA = getContradictionsForEntity(entityASignals, 'entity-a', 'smart_gate', baseTime);
      const contradictionsB = getContradictionsForEntity(entityBSignals, 'entity-b', 'smart_gate', baseTime);

      expect(contradictionsA.length).toBe(1);
      expect(contradictionsB.length).toBe(1);
    });

    it('accepts now parameter for deterministic testing', () => {
      const signals = [
        makeSignal({ id: 'passed', signalType: 'gate_recon', tags: ['passed'] }),
        makeSignal({ id: 'denied', signalType: 'access_denied' }),
      ];
      const result = getContradictionsForEntity(signals, 'test', 'smart_gate', baseTime);
      expect(result.length).toBe(1);
    });
  });

  describe('summarizeContradictions', () => {
    it('returns correct counts', () => {
      const contradictions = [
        { type: 'gate_passed_vs_blocked' as const, severity: 'critical' as const, signalA: makeSignal({ id: 'a' }), signalB: makeSignal({ id: 'b' }), description: 'test' },
        { type: 'route_safe_vs_unsafe' as const, severity: 'warning' as const, signalA: makeSignal({ id: 'c' }), signalB: makeSignal({ id: 'd' }), description: 'test' },
        { type: 'market_open_vs_closed' as const, severity: 'warning' as const, signalA: makeSignal({ id: 'e' }), signalB: makeSignal({ id: 'f' }), description: 'test' },
      ];
      const summary = summarizeContradictions(contradictions);
      expect(summary.total).toBe(3);
      expect(summary.critical).toBe(1);
      expect(summary.warnings).toBe(2);
    });

    it('handles empty array', () => {
      const summary = summarizeContradictions([]);
      expect(summary.total).toBe(0);
      expect(summary.critical).toBe(0);
      expect(summary.warnings).toBe(0);
    });
  });

  describe('hasSignalType helper', () => {
    it('filters signals by type', () => {
      const signals = [
        makeSignal({ id: 'a', signalType: 'gate_recon' }),
        makeSignal({ id: 'b', signalType: 'access_denied' }),
        makeSignal({ id: 'c', signalType: 'gate_recon' }),
      ];
      const result = hasSignalType(signals, 'gate_recon');
      expect(result.length).toBe(2);
      expect(result.map((s) => s.id)).toContain('a');
      expect(result.map((s) => s.id)).toContain('c');
    });
  });

  describe('hasTag helper', () => {
    it('filters signals by tag', () => {
      const signals = [
        makeSignal({ id: 'a', tags: ['passed', 'other'] }),
        makeSignal({ id: 'b', tags: ['blocked'] }),
        makeSignal({ id: 'c', tags: ['passed'] }),
      ];
      const result = hasTag(signals, 'passed');
      expect(result.length).toBe(2);
      expect(result.map((s) => s.id)).toContain('a');
      expect(result.map((s) => s.id)).toContain('c');
    });
  });
});
