import { describe, expect, it, vi } from 'vitest';
import type { CompanionBridgeState } from './companionBridgeTypes';
import {
  companionBridgePublishUrl,
  publishCompanionBridgeState,
} from './publishCompanionBridgeState';

const state: CompanionBridgeState = {
  app: 'signal-vault',
  schemaVersion: 1,
  generatedAt: '2026-05-12T12:00:00.000Z',
  warnings: [],
  latestSignals: [],
};

describe('publishCompanionBridgeState', () => {
  it('posts normalized state to the desktop companion bridge', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });

    const result = await publishCompanionBridgeState(state, {
      fetcher,
      token: 'paired-token',
    });

    expect(result).toEqual({ status: 'published' });
    expect(fetcher).toHaveBeenCalledWith(companionBridgePublishUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-signal-vault-bridge-token': 'paired-token',
      },
      body: JSON.stringify(state),
    });
  });

  it('reports disconnected when the companion bridge is absent', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('offline'));

    const result = await publishCompanionBridgeState(state, { fetcher });

    expect(result).toEqual({ status: 'disconnected' });
  });

  it('does not throw when the companion rejects malformed state', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false });

    const result = await publishCompanionBridgeState(state, { fetcher });

    expect(result).toEqual({ status: 'rejected' });
  });
});
