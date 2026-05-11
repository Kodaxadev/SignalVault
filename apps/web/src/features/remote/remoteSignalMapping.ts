import type { Signal } from '@/features/signals/signalTypes';

export function getRemoteId(signal: Signal): string | undefined {
  return signal.remote?.remoteId;
}

export function hasRemoteId(signal: Signal): boolean {
  return Boolean(signal.remote?.remoteId);
}

export function applyRemoteSaved(signal: Signal, remoteId: string): Signal {
  return {
    ...signal,
    syncState: 'remote_saved',
    remote: {
      ...signal.remote,
      remoteId,
      lastAttemptAt: new Date().toISOString(),
      lastError: undefined,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function applyRemotePending(signal: Signal): Signal {
  return {
    ...signal,
    syncState: 'remote_pending',
    remote: {
      ...signal.remote,
      lastAttemptAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function applyRemoteFailed(signal: Signal, error: string): Signal {
  return {
    ...signal,
    syncState: 'sync_failed',
    remote: {
      ...signal.remote,
      lastAttemptAt: new Date().toISOString(),
      lastError: error,
    },
    updatedAt: new Date().toISOString(),
  };
}
