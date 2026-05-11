import type { Signal } from '@/features/signals/signalTypes';
import type { EntityType } from '@/features/entities';
import type { Contradiction } from './contradictionTypes';
import { detectContradictions } from './detectContradictions';

export function getContradictionsForEntity(
  signals: Signal[],
  _entityKey: string,
  entityType: EntityType,
  now?: number,
): Contradiction[] {
  // entityKey is accepted for API consistency but detection is already entity-local
  // The caller should pass only signals belonging to this entity
  return detectContradictions(signals, entityType, now);
}

export function summarizeContradictions(contradictions: Contradiction[]): {
  total: number;
  critical: number;
  warnings: number;
} {
  return {
    total: contradictions.length,
    critical: contradictions.filter((c) => c.severity === 'critical').length,
    warnings: contradictions.filter((c) => c.severity === 'warning').length,
  };
}

export function hasSignalType(signals: Signal[], type: Signal['signalType']): Signal[] {
  return signals.filter((s) => s.signalType === type);
}

export function hasTag(signals: Signal[], tag: string): Signal[] {
  return signals.filter((s) => s.tags.includes(tag));
}
