import type { Signal } from '@/features/signals/signalTypes';

export function createSignalMemory() {
  const store = new Map<string, Signal[]>();

  return {
    add(signal: Signal) {
      const entityKey = signal.linkedEntities[0]?.entityId;
      if (!entityKey) return;
      const existing = store.get(entityKey) ?? [];
      existing.push(signal);
      store.set(entityKey, existing);
    },
    getByEntityKey(entityKey: string): Signal[] {
      return store.get(entityKey) ?? [];
    },
    update(signal: Signal) {
      const entityKey = signal.linkedEntities[0]?.entityId;
      if (!entityKey) return;
      const bucket = store.get(entityKey);
      if (!bucket) return;
      const idx = bucket.findIndex((s) => s.id === signal.id);
      if (idx === -1) return;
      bucket[idx] = signal;
      store.set(entityKey, bucket);
    },
    getAll(): Signal[] {
      return Array.from(store.values()).flat();
    },
  };
}
