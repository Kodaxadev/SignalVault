import type { Signal } from '@/features/signals/signalTypes';
import { STALENESS_RULES, type StalenessLevel, type StalenessRule } from './stalenessRules';

export interface StalenessResult {
  level: StalenessLevel;
  ageMs: number;
  staleAfterMs: number;
  isStale: boolean;
  isCritical: boolean;
}

function signalAge(signal: Signal, now: number): number {
  const created = new Date(signal.createdAt).getTime();
  const updated = new Date(signal.updatedAt).getTime();
  return now - Math.max(created, updated);
}

function evaluateLevel(ageMs: number, rule: StalenessRule): StalenessLevel {
  if (ageMs >= rule.criticalAfterMs) return 'critical';
  if (ageMs >= rule.staleAfterMs) return 'stale';
  if (ageMs >= rule.agingAfterMs) return 'aging';
  return 'fresh';
}

export function evaluateSignalStaleness(signal: Signal, now?: number): StalenessResult {
  const currentTime = now ?? Date.now();
  const ageMs = signalAge(signal, currentTime);
  const rule = STALENESS_RULES[signal.signalType];
  const level = evaluateLevel(ageMs, rule);

  return {
    level,
    ageMs,
    staleAfterMs: rule.staleAfterMs,
    isStale: level === 'stale' || level === 'critical',
    isCritical: level === 'critical',
  };
}
