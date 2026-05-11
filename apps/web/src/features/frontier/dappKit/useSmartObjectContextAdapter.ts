import { useSmartObject } from '@evefrontier/dapp-kit';
import type { SmartObjectContextSnapshot } from './smartObjectTypes';
import { extractSmartObjectId, extractSmartObjectType, extractSmartObjectName } from './smartObjectExtractors';

export function useSmartObjectContextAdapter(): SmartObjectContextSnapshot {
  try {
    const { assembly, loading, error, tenant } = useSmartObject();
    if (loading) return { status: 'loading', available: false };
    if (error) return { status: 'unavailable', available: false, reason: 'unknown', error };
    if (!assembly) return { status: 'unavailable', available: false, reason: 'no_assembly' };
    return {
      status: 'available',
      available: true,
      tenant,
      objectId: extractSmartObjectId(assembly),
      assemblyType: extractSmartObjectType(assembly),
      assemblyName: extractSmartObjectName(assembly),
      raw: assembly,
    };
  } catch {
    return { status: 'unavailable', available: false, reason: 'provider_missing' };
  }
}
