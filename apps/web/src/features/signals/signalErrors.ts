import type { SignalVisibility } from '@/features/signals/signalTypes';

export class PermissionDeniedError extends Error {
  constructor(
    public readonly requestedVisibility: SignalVisibility,
    public readonly viewerState: string,
    message?: string,
  ) {
    super(message ?? `Cannot create signal with visibility "${requestedVisibility}" for viewer state "${viewerState}"`);
    this.name = 'PermissionDeniedError';
  }
}
