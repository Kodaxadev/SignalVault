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
