import { describe, it, expect } from 'vitest';
import { STALENESS_RULES } from '@/features/staleness/stalenessRules';

describe('stalenessRules', () => {
  it('all rules have valid windows (fresh < aging < stale < critical)', () => {
    for (const [, rule] of Object.entries(STALENESS_RULES)) {
      expect(rule.freshForMs).toBeGreaterThan(0);
      expect(rule.agingAfterMs).toBeGreaterThan(rule.freshForMs);
      expect(rule.staleAfterMs).toBeGreaterThan(rule.agingAfterMs);
      expect(rule.criticalAfterMs).toBeGreaterThan(rule.staleAfterMs);
    }
  });

  it('has rules for all SignalTypes', () => {
    expect(Object.keys(STALENESS_RULES)).toHaveLength(12);
  });

  it('hostile_contact has the shortest fresh window', () => {
    const hostile = STALENESS_RULES.hostile_contact;
    for (const [type, rule] of Object.entries(STALENESS_RULES)) {
      if (type === 'hostile_contact') continue;
      expect(hostile.freshForMs).toBeLessThanOrEqual(rule.freshForMs);
    }
  });
});
