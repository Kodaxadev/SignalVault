import type { SignalType } from '@/features/signals/signalTypes';

const minutes = (v: number) => v * 60 * 1000;
const hours = (v: number) => minutes(v * 60);
const days = (v: number) => hours(v * 24);

export type StalenessLevel = 'fresh' | 'aging' | 'stale' | 'critical';

export interface StalenessRule {
  freshForMs: number;
  agingAfterMs: number;
  staleAfterMs: number;
  criticalAfterMs: number;
}

export const STALENESS_RULES: Record<SignalType, StalenessRule> = {
  gate_recon: { freshForMs: hours(2), agingAfterMs: hours(6), staleAfterMs: hours(24), criticalAfterMs: hours(72) },
  access_denied: { freshForMs: hours(1), agingAfterMs: hours(4), staleAfterMs: hours(12), criticalAfterMs: hours(48) },
  storage_manifest: { freshForMs: hours(4), agingAfterMs: hours(12), staleAfterMs: hours(48), criticalAfterMs: days(7) },
  route_report: { freshForMs: hours(1), agingAfterMs: hours(3), staleAfterMs: hours(12), criticalAfterMs: hours(48) },
  market_report: { freshForMs: hours(2), agingAfterMs: hours(8), staleAfterMs: hours(24), criticalAfterMs: hours(72) },
  system_report: { freshForMs: hours(4), agingAfterMs: hours(12), staleAfterMs: hours(48), criticalAfterMs: days(7) },
  hostile_contact: { freshForMs: minutes(30), agingAfterMs: hours(2), staleAfterMs: hours(8), criticalAfterMs: hours(24) },
  permit_report: { freshForMs: hours(4), agingAfterMs: hours(12), staleAfterMs: hours(48), criticalAfterMs: days(7) },
  resource_report: { freshForMs: hours(6), agingAfterMs: hours(24), staleAfterMs: days(3), criticalAfterMs: days(14) },
  field_note: { freshForMs: hours(12), agingAfterMs: days(2), staleAfterMs: days(7), criticalAfterMs: days(30) },
  assembly_log: { freshForMs: hours(6), agingAfterMs: hours(24), staleAfterMs: days(3), criticalAfterMs: days(14) },
  after_action_report: { freshForMs: hours(12), agingAfterMs: days(2), staleAfterMs: days(7), criticalAfterMs: days(30) },
};
