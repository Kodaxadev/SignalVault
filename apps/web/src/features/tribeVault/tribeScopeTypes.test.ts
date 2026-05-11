import { describe, it, expect } from 'vitest';
import { TRIBE_SCOPE_RANK, scopeRank, isNarrower } from './tribeScopeTypes';

describe('tribeScopeTypes', () => {
  it('defines correct rank ordering', () => {
    expect(TRIBE_SCOPE_RANK.tribe).toBe(10);
    expect(TRIBE_SCOPE_RANK.officer).toBe(20);
    expect(TRIBE_SCOPE_RANK.scout_cell).toBe(30);
  });

  it('scopeRank returns correct values', () => {
    expect(scopeRank('tribe')).toBe(10);
    expect(scopeRank('officer')).toBe(20);
    expect(scopeRank('scout_cell')).toBe(30);
  });

  it('isNarrower correctly compares scopes', () => {
    expect(isNarrower('officer', 'tribe')).toBe(true);
    expect(isNarrower('scout_cell', 'officer')).toBe(true);
    expect(isNarrower('scout_cell', 'tribe')).toBe(true);
    expect(isNarrower('tribe', 'officer')).toBe(false);
    expect(isNarrower('tribe', 'tribe')).toBe(false);
  });
});
