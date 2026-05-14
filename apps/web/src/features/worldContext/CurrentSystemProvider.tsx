import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CurrentSystem, CurrentSystemContextValue } from './currentSystemTypes';
import {
  loadCurrentSystem,
  saveCurrentSystem,
  saveCurrentSystemStrict,
  clearCurrentSystemMemory,
} from './currentSystemMemory';

const CurrentSystemContext = createContext<CurrentSystemContextValue>({
  currentSystem: null,
  setCurrentSystem: () => {},
  setCurrentSystemPersisted: async () => {},
  clearCurrentSystem: () => {},
});

export function CurrentSystemProvider({ children }: { children: ReactNode }) {
  const [currentSystem, setSystemState] = useState<CurrentSystem | null>(
    () => loadCurrentSystem()
  );

  const setCurrentSystem = useCallback((system: CurrentSystem) => {
    setSystemState(system);
    saveCurrentSystem(system);
  }, []);

  const setCurrentSystemPersisted = useCallback(async (system: CurrentSystem) => {
    saveCurrentSystemStrict(system);
    setSystemState(system);
  }, []);

  const clearCurrentSystem = useCallback(() => {
    setSystemState(null);
    clearCurrentSystemMemory();
  }, []);

  return (
    <CurrentSystemContext.Provider
      value={{ currentSystem, setCurrentSystem, setCurrentSystemPersisted, clearCurrentSystem }}
    >
      {children}
    </CurrentSystemContext.Provider>
  );
}

export function useCurrentSystem(): CurrentSystemContextValue {
  return useContext(CurrentSystemContext);
}
