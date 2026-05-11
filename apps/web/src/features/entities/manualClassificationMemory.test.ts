import { describe, it, expect } from 'vitest';
import { createManualClassificationMemory } from './resolutionSources/resolveFromManualRegistry';
import { createClaim } from './entityClassificationTypes';

describe('manualClassificationMemory', () => {
  it('returns null for unknown key', () => {
    const memory = createManualClassificationMemory();
    expect(memory.get('unknown')).toBeNull();
  });

  it('stores and retrieves classification', () => {
    const memory = createManualClassificationMemory();
    const claim = createClaim('item:utopia:12345', 'smart_gate', 'user_manual', {}, 'Gate Alpha');
    memory.add('item:utopia:12345', claim);

    const result = memory.get('item:utopia:12345');
    expect(result).not.toBeNull();
    expect(result?.claims).toHaveLength(1);
    expect(result?.claims[0]?.claimedType).toBe('smart_gate');
  });

  it('lists all classifications', () => {
    const memory = createManualClassificationMemory();
    const claim1 = createClaim('item:utopia:12345', 'smart_gate', 'user_manual', {});
    const claim2 = createClaim('object:test:0xabc', 'market', 'user_manual', {});
    memory.add('item:utopia:12345', claim1);
    memory.add('object:test:0xabc', claim2);

    expect(memory.getAll().size).toBe(2);
  });

  it('appends multiple claims for same key', () => {
    const memory = createManualClassificationMemory();
    const claim1 = createClaim('item:utopia:12345', 'item', 'user_manual', {});
    const claim2 = createClaim('item:utopia:12345', 'smart_gate', 'user_manual', {});
    memory.add('item:utopia:12345', claim1);
    memory.add('item:utopia:12345', claim2);

    const result = memory.get('item:utopia:12345');
    expect(result?.claims).toHaveLength(2);
  });
});
