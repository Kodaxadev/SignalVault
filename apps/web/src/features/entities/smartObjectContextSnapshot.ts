/**
 * Snapshot of Smart Object context from dApp Kit, adapted for entity resolution.
 * This type is duplicated here so resolveEntity.ts doesn't import from frontier/.
 * frontier/dappKit/smartObjectTypes.ts is the source of truth.
 */
export type SmartObjectContextSnapshot =
  | { status: 'loading'; available: false }
  | {
      status: 'unavailable';
      available: false;
      reason?: 'not_connected' | 'no_assembly' | 'provider_missing' | 'unknown';
      error?: string;
    }
  | {
      status: 'available';
      available: true;
      tenant?: string;
      objectId?: string;
      assemblyType?: string;
      assemblyName?: string;
      raw?: unknown;
    };
