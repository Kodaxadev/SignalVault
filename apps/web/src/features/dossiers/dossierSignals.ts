import type { Signal, SignalType } from '@/features/signals/signalTypes';

export function getSignalsForEntity(signals: Signal[], entityKey: string): Signal[] {
  return signals.filter((s) =>
    s.linkedEntities.some((e) => e.entityId === entityKey),
  );
}

export function getRecentSignals(signals: Signal[], limit: number): Signal[] {
  return [...signals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function countSignalsByType(signals: Signal[]): Record<SignalType, number> {
  const counts: Record<SignalType, number> = {
    field_note: 0, gate_recon: 0, storage_manifest: 0, route_report: 0,
    market_report: 0, system_report: 0, assembly_log: 0, hostile_contact: 0,
    permit_report: 0, access_denied: 0, resource_report: 0, after_action_report: 0,
  };
  for (const signal of signals) {
    counts[signal.signalType] = (counts[signal.signalType] ?? 0) + 1;
  }
  return counts;
}

export function getLatestSignal(signals: Signal[]): Signal | undefined {
  if (signals.length === 0) return undefined;
  return [...signals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

export function hasSignalOfType(signals: Signal[], type: SignalType): boolean {
  return signals.some((s) => s.signalType === type);
}

export function hasSignalTag(signals: Signal[], tag: string): boolean {
  return signals.some((s) => s.tags.includes(tag));
}
