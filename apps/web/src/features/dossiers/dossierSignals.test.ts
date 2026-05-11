import { describe, it, expect } from 'vitest';
import {
  getSignalsForEntity,
  getRecentSignals,
  countSignalsByType,
  getLatestSignal,
  hasSignalOfType,
  hasSignalTag,
} from './dossierSignals';
import type { Signal } from '@/features/signals/signalTypes';

const makeSignal = (entityId: string, type: Signal['signalType'], tags: string[] = [], createdAt: string): Signal => ({
  id: `s-${entityId}-${type}`,
  title: type,
  body: '',
  signalType: type,
  confidence: 'observed',
  visibility: 'local_private',
  syncState: 'local_only',
  author: { kind: 'anonymous_local' },
  linkedEntities: [{ entityId, type: 'smart_gate', label: 'Test', resolutionConfidence: 'unknown' }],
  createdInContext: { surface: 'ingame_object', viewerState: 'anonymous' },
  tags,
  createdAt,
  updatedAt: createdAt,
});

describe('dossierSignals', () => {
  const signals: Signal[] = [
    makeSignal('item:a:1', 'gate_recon', [], '2024-01-01T00:00:00Z'),
    makeSignal('item:a:1', 'access_denied', [], '2024-01-02T00:00:00Z'),
    makeSignal('item:b:2', 'market_report', [], '2024-01-01T00:00:00Z'),
  ];

  it('filter by entityKey', () => {
    const result = getSignalsForEntity(signals, 'item:a:1');
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.linkedEntities[0]?.entityId === 'item:a:1')).toBe(true);
  });

  it('get recent with limit', () => {
    const result = getRecentSignals(signals, 2);
    expect(result).toHaveLength(2);
    // Most recent first
    expect(result[0]?.signalType).toBe('access_denied');
  });

  it('count by type', () => {
    const counts = countSignalsByType(signals);
    expect(counts.gate_recon).toBe(1);
    expect(counts.access_denied).toBe(1);
    expect(counts.market_report).toBe(1);
  });

  it('hasSignalOfType true/false', () => {
    expect(hasSignalOfType(signals, 'gate_recon')).toBe(true);
    expect(hasSignalOfType(signals, 'market_report')).toBe(true);
    expect(hasSignalOfType(signals, 'hostile_contact')).toBe(false);
  });

  it('hasSignalTag true/false', () => {
    const taggedSignals = [makeSignal('item:a:1', 'gate_recon', ['blocked', 'hostile'], '2024-01-01T00:00:00Z')];
    expect(hasSignalTag(taggedSignals, 'blocked')).toBe(true);
    expect(hasSignalTag(taggedSignals, 'nonexistent')).toBe(false);
  });

  it('getLatestSignal returns most recent', () => {
    const result = getLatestSignal(signals);
    expect(result?.signalType).toBe('access_denied');
  });
});
