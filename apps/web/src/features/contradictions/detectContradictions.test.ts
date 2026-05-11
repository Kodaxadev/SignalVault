import { describe, it, expect } from 'vitest';
import { detectContradictions } from './detectContradictions';
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

describe('detectContradictions', () => {
  const baseTime = new Date('2024-01-01T00:00:00Z').getTime();

  it('detects gate passed vs blocked', () => {
    const signals = [
      makeSignal({ id: 'passed', signalType: 'gate_recon', tags: ['passed'] }),
      makeSignal({ id: 'denied', signalType: 'access_denied' }),
    ];
    const contradictions = detectContradictions(signals, 'smart_gate', baseTime);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0]!.type).toBe('gate_passed_vs_blocked');
  });

  it('detects gate passed vs permit', () => {
    const signals = [
      makeSignal({ id: 'passed', signalType: 'gate_recon', tags: ['passed'] }),
      makeSignal({ id: 'permit', signalType: 'gate_recon', tags: ['permit'] }),
    ];
    const contradictions = detectContradictions(signals, 'smart_gate', baseTime);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0]!.type).toBe('gate_passed_vs_permit');
  });

  it('detects storage access worked vs denied', () => {
    const signals = [
      makeSignal({ id: 'worked', signalType: 'storage_manifest', tags: ['access_worked'] }),
      makeSignal({ id: 'denied', signalType: 'access_denied' }),
    ];
    const contradictions = detectContradictions(signals, 'smart_storage_unit', baseTime);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0]!.type).toBe('storage_access_worked_vs_denied');
  });

  it('detects storage empty vs manifest', () => {
    const signals = [
      makeSignal({ id: 'empty', signalType: 'storage_manifest', tags: ['empty'] }),
      makeSignal({ id: 'manifest', signalType: 'storage_manifest', tags: ['manifest'] }),
    ];
    const contradictions = detectContradictions(signals, 'smart_storage_unit', baseTime);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0]!.type).toBe('storage_empty_vs_manifest');
  });

  it('detects market open vs closed', () => {
    const signals = [
      makeSignal({ id: 'open', signalType: 'market_report', tags: ['open'] }),
      makeSignal({ id: 'closed', signalType: 'market_report', tags: ['closed'] }),
    ];
    const contradictions = detectContradictions(signals, 'market', baseTime);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0]!.type).toBe('market_open_vs_closed');
  });

  it('detects market open vs hostile', () => {
    const signals = [
      makeSignal({ id: 'open', signalType: 'market_report', tags: ['open'] }),
      makeSignal({ id: 'hostile', signalType: 'market_report', tags: ['hostile'] }),
    ];
    const contradictions = detectContradictions(signals, 'market', baseTime);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0]!.type).toBe('market_open_vs_hostile');
  });

  it('detects route safe vs unsafe', () => {
    const signals = [
      makeSignal({ id: 'safe', signalType: 'route_report', tags: ['safe'] }),
      makeSignal({ id: 'unsafe', signalType: 'route_report', tags: ['unsafe'] }),
    ];
    const contradictions = detectContradictions(signals, 'route', baseTime);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0]!.type).toBe('route_safe_vs_unsafe');
  });

  it('detects route blocked vs safe', () => {
    const signals = [
      makeSignal({ id: 'blocked', signalType: 'route_report', tags: ['blocked'] }),
      makeSignal({ id: 'safe', signalType: 'route_report', tags: ['safe'] }),
    ];
    const contradictions = detectContradictions(signals, 'route', baseTime);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0]!.type).toBe('route_blocked_vs_safe');
  });

  it('returns empty when no contradictions exist', () => {
    const signals = [
      makeSignal({ id: 'passed', signalType: 'gate_recon', tags: ['passed'] }),
      makeSignal({ id: 'safe', signalType: 'route_report', tags: ['safe'] }),
    ];
    const contradictions = detectContradictions(signals, 'smart_gate', baseTime);
    expect(contradictions.length).toBe(0);
  });

  it('respects contradiction window — old signals not compared', () => {
    const now = new Date('2024-01-10T00:00:00Z').getTime();
    const signals = [
      makeSignal({
        id: 'passed',
        signalType: 'gate_recon',
        tags: ['passed'],
        createdAt: new Date('2024-01-01T00:00:00Z').toISOString(), // 9 days old
      }),
      makeSignal({
        id: 'denied',
        signalType: 'access_denied',
        createdAt: new Date('2024-01-09T00:00:00Z').toISOString(), // 1 day old
      }),
    ];
    // smart_gate window is 72h, so passed signal is outside window
    const contradictions = detectContradictions(signals, 'smart_gate', now);
    expect(contradictions.length).toBe(0);
  });

  it('uses tags/signalType only, not title/body', () => {
    // Same signalType but different tags should not contradict
    const signals = [
      makeSignal({ id: 'a', signalType: 'gate_recon', tags: ['other_tag'], title: 'Gate Passed' }),
      makeSignal({ id: 'b', signalType: 'access_denied', title: 'All Clear' }),
    ];
    const contradictions = detectContradictions(signals, 'smart_gate', baseTime);
    // gate_recon without "passed" tag should not trigger gate_passed_vs_blocked
    expect(contradictions.length).toBe(0);
  });

  it('deterministic with now injection', () => {
    const signals = [
      makeSignal({ id: 'passed', signalType: 'gate_recon', tags: ['passed'] }),
      makeSignal({ id: 'denied', signalType: 'access_denied' }),
    ];
    const result1 = detectContradictions(signals, 'smart_gate', baseTime);
    const result2 = detectContradictions(signals, 'smart_gate', baseTime);
    expect(result1.length).toBe(result2.length);
  });
});
