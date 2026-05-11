import type { StalenessLevel } from '@/features/staleness';
import type { SignalType } from '@/features/signals/signalTypes';

export type RouteWarningLevel = 'critical' | 'high' | 'medium' | 'info';

export interface RouteWarning {
  systemId: string;
  systemName?: string;
  level: RouteWarningLevel;
  signalType: SignalType;
  signalCount: number;
  latestSignalAt: string; // ISO
  stalenessLevel: StalenessLevel;
  isStale: boolean;
}
