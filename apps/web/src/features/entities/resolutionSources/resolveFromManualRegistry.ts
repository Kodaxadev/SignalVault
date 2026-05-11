import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';

export function resolveFromManualRegistry(
  entityKey: string,
  store: ManualClassificationMemory,
): EntityClassificationClaim[] {
  const entry = store.get(entityKey);
  if (!entry) return [];
  return entry.claims;
}

export interface ManualClassificationMemory {
  get: (entityKey: string) => { entityKey: string; claims: EntityClassificationClaim[] } | null;
  getAll: () => Map<string, { entityKey: string; claims: EntityClassificationClaim[] }>;
}

export function createManualClassificationMemory(): ManualClassificationMemory & {
  add: (entityKey: string, claim: EntityClassificationClaim) => void;
} {
  const store = new Map<string, { entityKey: string; claims: EntityClassificationClaim[] }>();

  return {
    get(entityKey) {
      return store.get(entityKey) ?? null;
    },
    getAll() {
      return store;
    },
    add(entityKey, claim) {
      const existing = store.get(entityKey);
      if (existing) {
        existing.claims.push(claim);
      } else {
        store.set(entityKey, { entityKey, claims: [claim] });
      }
    },
  };
}
