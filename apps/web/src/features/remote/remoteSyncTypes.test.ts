import { describe, it, expect } from 'vitest';
import { PROMOTION_RULES } from './remoteSyncTypes';

describe('PROMOTION_RULES', () => {
  it('local_private cannot be promoted directly', () => {
    const rule = PROMOTION_RULES['local_private'];
    expect(rule.promotableDirectly).toBe(false);
    expect(rule.requiresVisibilityChange).toBe(true);
    expect(rule.requiresPolicyCheck).toBe(true);
  });

  it('private requires explicit user action', () => {
    const rule = PROMOTION_RULES['private'];
    expect(rule.promotableDirectly).toBe(true);
    expect(rule.requiresVisibilityChange).toBe(false);
    expect(rule.requiresPolicyCheck).toBe(false);
  });

  it('tribe requires policy check', () => {
    const rule = PROMOTION_RULES['tribe'];
    expect(rule.promotableDirectly).toBe(true);
    expect(rule.requiresVisibilityChange).toBe(false);
    expect(rule.requiresPolicyCheck).toBe(true);
  });

  it('officer requires policy check', () => {
    const rule = PROMOTION_RULES['officer'];
    expect(rule.promotableDirectly).toBe(true);
    expect(rule.requiresVisibilityChange).toBe(false);
    expect(rule.requiresPolicyCheck).toBe(true);
  });

  it('scout_cell requires policy check', () => {
    const rule = PROMOTION_RULES['scout_cell'];
    expect(rule.promotableDirectly).toBe(true);
    expect(rule.requiresVisibilityChange).toBe(false);
    expect(rule.requiresPolicyCheck).toBe(true);
  });

  it('public requires no checks', () => {
    const rule = PROMOTION_RULES['public'];
    expect(rule.promotableDirectly).toBe(true);
    expect(rule.requiresVisibilityChange).toBe(false);
    expect(rule.requiresPolicyCheck).toBe(false);
  });

  it('covers all SignalVisibility variants', () => {
    const visibilities = ['local_private', 'private', 'tribe', 'officer', 'scout_cell', 'public'];
    expect(Object.keys(PROMOTION_RULES)).toEqual(expect.arrayContaining(visibilities));
  });
});
