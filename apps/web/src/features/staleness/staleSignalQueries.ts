import type { Signal } from '@/features/signals/signalTypes';
import { evaluateSignalStaleness } from './evaluateSignalStaleness';
import type { StalenessResult } from './evaluateSignalStaleness';

export interface StalenessSummary {
  total: number;
  fresh: number;
  aging: number;
  stale: number;
  critical: number;
}

export function getStalenessSummary(signals: Signal[], now?: number): StalenessSummary {
  const summary: StalenessSummary = { total: signals.length, fresh: 0, aging: 0, stale: 0, critical: 0 };
  for (const s of signals) {
    const result = evaluateSignalStaleness(s, now);
    switch (result.level) {
      case 'fresh': summary.fresh++; break;
      case 'aging': summary.aging++; break;
      case 'stale': summary.stale++; break;
      case 'critical': summary.critical++; break;
    }
  }
  return summary;
}

export function getStaleSignals(signals: Signal[], now?: number): Signal[] {
  return signals.filter((s) => evaluateSignalStaleness(s, now).isStale);
}

export function getFreshSignals(signals: Signal[], now?: number): Signal[] {
  return signals.filter((s) => evaluateSignalStaleness(s, now).level === 'fresh');
}

export function getStalenessMap(signals: Signal[], now?: number): Map<string, StalenessResult> {
  const map = new Map<string, StalenessResult>();
  for (const s of signals) {
    map.set(s.id, evaluateSignalStaleness(s, now));
  }
  return map;
}
