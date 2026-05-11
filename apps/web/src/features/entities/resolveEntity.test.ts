import { describe, it, expect } from 'vitest';
import { resolveEntity } from './resolveEntity';
import { createManualClassificationMemory } from './resolutionSources/resolveFromManualRegistry';
import { createClaim } from './entityClassificationTypes';

describe('resolveEntity', () => {
  it('returns unknown for missing context', () => {
    const result = resolveEntity({
      entityType: 'unknown',
      confidence: 'unknown',
    });
    expect(result.type).toBe('unknown');
    expect(result.confidence).toBe('unknown');
    expect(result.entityKey).toBe('unknown');
  });

  it('uses url_hint for tenant/itemId without type', () => {
    const result = resolveEntity({
      tenant: 'test',
      itemId: '1',
      entityType: 'unknown',
      confidence: 'url_hint',
    });
    expect(result.type).toBe('unknown');
    expect(result.confidence).toBe('url_hint');
    expect(result.sources).toContain('url_hint');
  });

  it('uses url_hint when type param provided', () => {
    const result = resolveEntity({
      tenant: 'utopia',
      itemId: '12345',
      entityType: 'smart_gate',
      confidence: 'url_hint',
    });
    expect(result.type).toBe('smart_gate');
    expect(result.sources).toContain('url_hint');
    // Mock registry also fires if it has a matching entry
    expect(result.sources.length).toBeGreaterThanOrEqual(1);
  });

  it('invalid type hint results in unknown', () => {
    const result = resolveEntity({
      tenant: 'test',
      itemId: '1',
      entityType: 'banana' as any,
      confidence: 'url_hint',
    });
    expect(result.type).toBe('unknown');
  });

  it('mock registry beats url_hint for known entry', () => {
    const result = resolveEntity({
      tenant: 'utopia',
      itemId: '12345',
      entityType: 'item',
      confidence: 'url_hint',
    });
    expect(result.type).toBe('smart_gate');
    expect(result.sources).toContain('mock_registry');
    expect(result.sources).toContain('url_hint');
  });

  it('manual classification overrides lower sources', () => {
    const manualMemory = createManualClassificationMemory();
    const claim = createClaim('item:utopia:77777', 'smart_turret', 'user_manual', {}, 'My Turret');
    manualMemory.add('item:utopia:77777', claim);

    const result = resolveEntity(
      {
        tenant: 'utopia',
        itemId: '77777',
        entityType: 'item',
        confidence: 'url_hint',
      },
      { manualMemory },
    );
    expect(result.type).toBe('smart_turret');
    expect(result.sources).toContain('user_manual');
  });
});
