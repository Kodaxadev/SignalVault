import type { Signal, SignalType } from '@/features/signals/signalTypes';
import { evaluateSignalStaleness } from '@/features/staleness';
import type { StalenessLevel } from '@/features/staleness';
import type { RouteWarning, RouteWarningLevel } from './routeWarningTypes';

const WARNING_SIGNAL_TYPES: SignalType[] = [
  'hostile_contact',
  'access_denied',
  'route_report',
  'gate_recon',
];

function baseLevel(signalType: SignalType): RouteWarningLevel {
  switch (signalType) {
    case 'hostile_contact': return 'critical';
    case 'access_denied': return 'high';
    case 'route_report': return 'medium';
    case 'gate_recon': return 'info';
    default: return 'info';
  }
}

function applyStalenessMod(base: RouteWarningLevel, staleness: StalenessLevel): RouteWarningLevel {
  if (staleness !== 'critical') return base;
  const levels: RouteWarningLevel[] = ['critical', 'high', 'medium', 'info'];
  const idx = levels.indexOf(base);
  return levels[Math.min(idx + 1, levels.length - 1)] ?? 'info';
}

function matchesSystem(signal: Signal, systemIds: string[]): string | undefined {
  for (const entity of signal.linkedEntities) {
    if (systemIds.includes(entity.entityId)) return entity.entityId;
    if (entity.itemId && systemIds.includes(entity.itemId)) return entity.itemId;
  }
  return undefined;
}

export function deriveRouteWarnings(
  allSignals: Signal[],
  systemIds: string[],
  systemNames?: Map<string, string>
): RouteWarning[] {
  if (systemIds.length === 0) return [];

  // Group warning-type signals by systemId:signalType
  const groups = new Map<string, Signal[]>();

  for (const signal of allSignals) {
    if (!WARNING_SIGNAL_TYPES.includes(signal.signalType)) continue;
    const matchedId = matchesSystem(signal, systemIds);
    if (!matchedId) continue;
    const key = `${matchedId}:${signal.signalType}`;
    const existing = groups.get(key) ?? [];
    groups.set(key, [...existing, signal]);
  }

  const warnings: RouteWarning[] = [];
  const now = Date.now();

  for (const [key, signals] of groups) {
    const colonIdx = key.indexOf(':');
    const systemId = key.slice(0, colonIdx);
    const signalType = key.slice(colonIdx + 1) as SignalType;

    // Most recent signal drives the staleness level
    const sorted = [...signals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latest = sorted[0];
    if (!latest) continue;

    const staleResult = evaluateSignalStaleness(latest, now);
    const level = applyStalenessMod(baseLevel(signalType), staleResult.level);

    warnings.push({
      systemId,
      systemName: systemNames?.get(systemId),
      level,
      signalType,
      signalCount: signals.length,
      latestSignalAt: latest.createdAt,
      stalenessLevel: staleResult.level,
      isStale: staleResult.isStale,
    });
  }

  const levelOrder: RouteWarningLevel[] = ['critical', 'high', 'medium', 'info'];
  return warnings.sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));
}
