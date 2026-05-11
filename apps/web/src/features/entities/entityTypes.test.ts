import { describe, it, expect } from 'vitest';
import { parseObjectContext, hasObjectContext } from '@/features/entities';

describe('parseObjectContext', () => {
  it('returns unknown context when no params provided', () => {
    const ctx = parseObjectContext('/ingame/object', new URLSearchParams());
    expect(ctx).toEqual({
      objectId: undefined,
      tenant: undefined,
      itemId: undefined,
      entityType: 'unknown',
      confidence: 'unknown',
    });
  });

  it('parses tenant and itemId from query params', () => {
    const params = new URLSearchParams('tenant=test&itemId=12345');
    const ctx = parseObjectContext('/ingame/object', params);
    expect(ctx.tenant).toBe('test');
    expect(ctx.itemId).toBe('12345');
    expect(ctx.confidence).toBe('unknown');
  });

  it('parses objectId from path param', () => {
    const ctx = parseObjectContext('/ingame/object/0xabc', new URLSearchParams());
    expect(ctx.objectId).toBe('0xabc');
  });

  it('parses combined path objectId with query tenant', () => {
    const params = new URLSearchParams('tenant=utopia');
    const ctx = parseObjectContext('/ingame/object/0xdef', params);
    expect(ctx.objectId).toBe('0xdef');
    expect(ctx.tenant).toBe('utopia');
  });

  it('parses type hint as url_hint confidence', () => {
    const params = new URLSearchParams('tenant=x&type=smart_gate');
    const ctx = parseObjectContext('/ingame/object', params);
    expect(ctx.entityType).toBe('smart_gate');
    expect(ctx.confidence).toBe('url_hint');
  });

  it('handles /ingame/object/:objectId?tenant= format', () => {
    const params = new URLSearchParams('tenant=test');
    const ctx = parseObjectContext('/ingame/object/0xabc', params);
    expect(ctx.objectId).toBe('0xabc');
    expect(ctx.tenant).toBe('test');
  });
});

describe('hasObjectContext', () => {
  it('returns false for empty context', () => {
    expect(hasObjectContext({
      objectId: undefined, tenant: undefined, itemId: undefined,
      entityType: 'unknown', confidence: 'unknown',
    })).toBe(false);
  });

  it('returns true when tenant is present', () => {
    expect(hasObjectContext({
      tenant: 'test', entityType: 'unknown', confidence: 'unknown',
    })).toBe(true);
  });

  it('returns true when objectId is present', () => {
    expect(hasObjectContext({
      objectId: '0xabc', entityType: 'unknown', confidence: 'unknown',
    })).toBe(true);
  });

  it('returns true when itemId is present', () => {
    expect(hasObjectContext({
      itemId: '123', entityType: 'unknown', confidence: 'unknown',
    })).toBe(true);
  });
});
