import type { Signal } from '@/features/signals/signalTypes';

export type ContradictionSeverity = 'warning' | 'critical';

export type ContradictionType =
  | 'gate_passed_vs_blocked'
  | 'gate_passed_vs_permit'
  | 'storage_access_worked_vs_denied'
  | 'storage_empty_vs_manifest'
  | 'market_open_vs_closed'
  | 'market_open_vs_hostile'
  | 'route_safe_vs_unsafe'
  | 'route_blocked_vs_safe';

export interface Contradiction {
  type: ContradictionType;
  severity: ContradictionSeverity;
  signalA: Signal;
  signalB: Signal;
  description: string;
}
