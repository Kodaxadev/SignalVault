export type CompanionBridgeWarningLevel = 'critical' | 'warning' | 'info';

export interface CompanionBridgeState {
  app: 'signal-vault';
  schemaVersion: 1;
  generatedAt: string;
  currentSystem?: CompanionBridgeSystem;
  warnings: CompanionBridgeWarning[];
  latestSignals: CompanionBridgeSignal[];
}

export interface CompanionBridgeSystem {
  id?: string;
  name: string;
  source: 'world_api' | 'manual';
}

export interface CompanionBridgeWarning {
  id: string;
  level: CompanionBridgeWarningLevel;
  title: string;
  detail: string;
  systemName?: string;
  updatedAt?: string;
}

export interface CompanionBridgeSignal {
  id: string;
  title: string;
  type: string;
  confidence: string;
  visibility: string;
  createdAt: string;
}
