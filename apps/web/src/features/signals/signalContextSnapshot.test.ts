import { describe, it, expect } from 'vitest';
import { createEntitySnapshot } from './signalContextSnapshot';
import type { ResolvedEntity } from '@/features/entities';

describe('signalContextSnapshot', () => {
  it('resolved entity → linked entity array', () => {
    const entity: ResolvedEntity = {
      entityKey: 'item:utopia:12345',
      entityId: 'item:utopia:12345',
      type: 'smart_gate',
      label: 'Gate Alpha',
      confidence: 'manual',
      sources: ['user_manual'],
      sourceClaims: [],
      tenant: 'utopia',
      itemId: '12345',
      updatedAt: '2024-01-01T00:00:00Z',
    };
    const snapshot = createEntitySnapshot(entity);

    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]?.entityId).toBe('item:utopia:12345');
    expect(snapshot[0]?.type).toBe('smart_gate');
    expect(snapshot[0]?.label).toBe('Gate Alpha');
    expect(snapshot[0]?.tenant).toBe('utopia');
    expect(snapshot[0]?.itemId).toBe('12345');
    expect(snapshot[0]?.resolutionConfidence).toBe('manual');
  });

  it('unknown entity still valid', () => {
    const entity: ResolvedEntity = {
      entityKey: 'unknown',
      entityId: 'unknown',
      type: 'unknown',
      label: 'Unknown',
      confidence: 'unknown',
      sources: [],
      sourceClaims: [],
      updatedAt: '2024-01-01T00:00:00Z',
    };
    const snapshot = createEntitySnapshot(entity);

    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]?.entityId).toBe('unknown');
    expect(snapshot[0]?.type).toBe('unknown');
  });
});
