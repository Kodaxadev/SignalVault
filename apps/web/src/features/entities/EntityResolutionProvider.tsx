import { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import type { EntityType } from '@/features/entities';
import { createClaim } from '@/features/entities/entityClassificationTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';
import { createManualClassificationMemory } from '@/features/entities/resolutionSources/resolveFromManualRegistry';
import type { ManualClassificationMemory } from '@/features/entities/resolutionSources/resolveFromManualRegistry';
import { db } from '@/features/local/localDb';
import { loadAllClassifications, addClassification as dbAddClassification } from '@/features/local/localEntityClassificationRepository';
import { setLocalDbStatus } from '@/features/local/localDbStatus';

interface EntityResolutionActions {
  classify: (input: {
    entityKey: string;
    type: EntityType;
    label?: string;
    claimedBy?: { walletAddress?: string; characterId?: string; tribeId?: string };
  }) => EntityClassificationClaim;
  getClaims: (entityKey: string) => EntityClassificationClaim[];
  getMemory: () => ManualClassificationMemory;
}

const EntityResolutionContext = createContext<EntityResolutionActions>({
  classify: () => {
    throw new Error('EntityResolutionProvider not mounted');
  },
  getClaims: () => [],
  getMemory: () => {
    throw new Error('EntityResolutionProvider not mounted');
  },
});

export function useEntityResolution() {
  return useContext(EntityResolutionContext);
}

export function EntityResolutionProvider({ children }: { children: React.ReactNode }) {
  const memoryRef = useRef(createManualClassificationMemory());

  // Load from Dexie on mount (non-blocking)
  useEffect(() => {
    loadAllClassifications(db)
      .then((claims) => {
        for (const c of claims) {
          memoryRef.current.add(c.entityKey, c);
        }
        setLocalDbStatus('ready');
      })
      .catch(() => {
        setLocalDbStatus('unavailable');
      });
  }, []);

  const classify = useCallback((input: {
    entityKey: string;
    type: EntityType;
    label?: string;
    claimedBy?: { walletAddress?: string; characterId?: string; tribeId?: string };
  }): EntityClassificationClaim => {
    const claim = createClaim(
      input.entityKey,
      input.type,
      'user_manual',
      undefined,
      input.label,
    );
    if (input.claimedBy) {
      claim.claimedBy = input.claimedBy;
    }
    memoryRef.current.add(input.entityKey, claim);
    // Write-through to Dexie
    dbAddClassification(db, claim).catch(() => {
      setLocalDbStatus('degraded');
    });
    return claim;
  }, []);

  const getClaims = useCallback((entityKey: string): EntityClassificationClaim[] => {
    const entry = memoryRef.current.get(entityKey);
    return entry?.claims ?? [];
  }, []);

  const getMemory = useCallback((): ManualClassificationMemory => {
    return memoryRef.current;
  }, []);

  return (
    <EntityResolutionContext.Provider value={{ classify, getClaims, getMemory }}>
      {children}
    </EntityResolutionContext.Provider>
  );
}
