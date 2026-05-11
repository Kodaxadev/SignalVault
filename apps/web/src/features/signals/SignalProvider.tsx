import { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import type { Signal } from '@/features/signals/signalTypes';
import { createSignalMemory } from '@/features/signals/signalMemory';
import { db } from '@/features/local/localDb';
import {
  loadAllSignals,
  addSignal as dbAddSignal,
  updateSignal as dbUpdateSignal,
} from '@/features/local/localSignalRepository';
import { setLocalDbStatus } from '@/features/local/localDbStatus';

interface SignalContextValue {
  addSignal: (signal: Signal) => void;
  updateSignal: (signal: Signal) => void;
  getSignals: (entityKey: string) => Signal[];
  getAllSignals: () => Signal[];
}

const SignalContext = createContext<SignalContextValue>({
  addSignal: () => {},
  updateSignal: () => {},
  getSignals: () => [],
  getAllSignals: () => [],
});

export function useSignalContext() {
  return useContext(SignalContext);
}

export function SignalProvider({ children }: { children: React.ReactNode }) {
  const memoryRef = useRef(createSignalMemory());
  const [, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  // Load from Dexie on mount (non-blocking)
  useEffect(() => {
    loadAllSignals(db)
      .then((signals) => {
        for (const s of signals) {
          memoryRef.current.add(s);
        }
        bump();
        setLocalDbStatus('ready');
      })
      .catch(() => {
        setLocalDbStatus('unavailable');
      });
  }, [bump]);

  const addSignal = useCallback((signal: Signal) => {
    memoryRef.current.add(signal);
    bump();
    // Write-through to Dexie
    dbAddSignal(db, signal).catch(() => {
      setLocalDbStatus('degraded');
    });
  }, [bump]);

  const updateSignal = useCallback((signal: Signal) => {
    memoryRef.current.update(signal);
    bump();
    // Write-through to Dexie
    dbUpdateSignal(db, signal).catch(() => {
      setLocalDbStatus('degraded');
    });
  }, [bump]);

  const getSignals = useCallback((entityKey: string): Signal[] => {
    return memoryRef.current.getByEntityKey(entityKey);
  }, []);

  const getAllSignals = useCallback((): Signal[] => {
    return memoryRef.current.getAll();
  }, []);

  return (
    <SignalContext.Provider value={{ addSignal, updateSignal, getSignals, getAllSignals }}>
      {children}
    </SignalContext.Provider>
  );
}
