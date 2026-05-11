export type CurrentSystemSource = 'world_api' | 'manual';

export interface CurrentSystem {
  systemId: string;
  systemName: string;
  source: CurrentSystemSource;
  setAt: string; // ISO timestamp
}

export interface CurrentSystemContextValue {
  currentSystem: CurrentSystem | null;
  setCurrentSystem: (system: CurrentSystem) => void;
  clearCurrentSystem: () => void;
}
