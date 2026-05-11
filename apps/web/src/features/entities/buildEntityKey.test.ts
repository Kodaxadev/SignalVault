import { describe, it, expect } from 'vitest';
import { buildEntityKey } from './buildEntityKey';

describe('buildEntityKey', () => {
  it('creates object key with objectId', () => {
    const key = buildEntityKey({ tenant: 'test', objectId: '0xabc' });
    expect(key).toBe('object:test:0xabc');
  });

  it('creates item key with itemId', () => {
    const key = buildEntityKey({ tenant: 'utopia', itemId: '12345' });
    expect(key).toBe('item:utopia:12345');
  });

  it('prefers objectId over itemId when both present', () => {
    const key = buildEntityKey({ tenant: 'test', objectId: '0xabc', itemId: '123' });
    expect(key).toBe('object:test:0xabc');
  });

  it('returns unknown key when no identifiers', () => {
    const key = buildEntityKey({ tenant: 'test' });
    expect(key).toBe('unknown');
  });

  it('returns unknown key when no context at all', () => {
    const key = buildEntityKey({});
    expect(key).toBe('unknown');
  });
});
