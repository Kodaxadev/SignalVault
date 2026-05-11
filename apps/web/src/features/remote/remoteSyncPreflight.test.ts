import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkRemoteSyncPreflight } from './remoteSyncPreflight';
import type { Signal } from '@/features/signals/signalTypes';
import type { ViewerContext } from '@/features/viewer/viewerTypes';
import type { RemoteCredentials } from './remoteAuthHeaders';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(writesEnabled: boolean, reachable = true) {
  if (!reachable) {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('unreachable')));
    return;
  }
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ status: 'ok', writesEnabled }),
  }));
}

function makeSignal(overrides: Partial<Signal>): Signal {
  return {
    id: 'sig-1',
    title: 'Test',
    body: 'Body',
    signalType: 'gate_recon',
    confidence: 'observed',
    visibility: 'public',
    syncState: 'local_only',
    author: { kind: 'character', characterId: 'char-1', tribeId: 'tribe-1' },
    linkedEntities: [],
    createdInContext: { surface: 'external_app', viewerState: 'character_resolved' },
    tags: [],
    createdAt: '2026-05-10T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z',
    ...overrides,
  };
}

const characterResolved: ViewerContext = {
  state: 'character_resolved',
  walletAddress: '0xabc',
  characterId: 'char-1',
  tribeId: 'tribe-1',
  roles: ['member'],
};

const validCreds: RemoteCredentials = {
  characterJwt: 'eyJ.payload.sig',
  walletSignature: 'wallet-sig',
  signatureMessage: 'signal-vault:abc',
};

const baseCtx = {
  signal: makeSignal({}),
  viewer: characterResolved,
  backendUrl: 'http://localhost:3000',
  credentials: validCreds,
};

describe('checkRemoteSyncPreflight', () => {
  it('blocks when backendUrl is undefined', async () => {
    const result = await checkRemoteSyncPreflight({ ...baseCtx, backendUrl: undefined });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('backend_not_configured');
  });

  it('blocks when backend is unreachable', async () => {
    mockFetch(false, false);
    const result = await checkRemoteSyncPreflight(baseCtx);
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('backend_unreachable');
  });

  it('blocks when backend reports writes disabled', async () => {
    mockFetch(false);
    const result = await checkRemoteSyncPreflight(baseCtx);
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('remote_writes_disabled');
  });

  it('blocks anonymous viewer', async () => {
    mockFetch(true);
    const result = await checkRemoteSyncPreflight({
      ...baseCtx,
      viewer: { state: 'anonymous', roles: [] },
    });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('viewer_not_authenticated');
  });

  it('blocks when auth headers unavailable (no credentials)', async () => {
    mockFetch(true);
    const result = await checkRemoteSyncPreflight({ ...baseCtx, credentials: undefined });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('auth_headers_unavailable');
  });

  it('blocks local_private signal', async () => {
    mockFetch(true);
    const result = await checkRemoteSyncPreflight({
      ...baseCtx,
      signal: makeSignal({ visibility: 'local_private' }),
    });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('signal_local_private');
  });

  it('blocks anonymous-authored signal', async () => {
    mockFetch(true);
    const result = await checkRemoteSyncPreflight({
      ...baseCtx,
      signal: makeSignal({ author: { kind: 'anonymous_local' } }),
    });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('anonymous_author');
  });

  it('blocks tribe-scoped signal when viewer has no tribeId', async () => {
    mockFetch(true);
    const noTribe: ViewerContext = {
      state: 'character_resolved',
      walletAddress: '0xabc',
      characterId: 'char-1',
      roles: [],
    };
    const result = await checkRemoteSyncPreflight({
      ...baseCtx,
      signal: makeSignal({ visibility: 'tribe' }),
      viewer: noTribe,
    });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('policy_denied');
  });

  it('returns ready when all checks pass', async () => {
    mockFetch(true);
    const result = await checkRemoteSyncPreflight(baseCtx);
    expect(result.status).toBe('ready');
  });

  it('returns ready for tribe-scoped signal when viewer has tribeId', async () => {
    mockFetch(true);
    const result = await checkRemoteSyncPreflight({
      ...baseCtx,
      signal: makeSignal({ visibility: 'tribe' }),
    });
    expect(result.status).toBe('ready');
  });

  it('returns ready when no credentials but signingAvailable is true', async () => {
    mockFetch(true);
    const result = await checkRemoteSyncPreflight({
      ...baseCtx,
      credentials: undefined,
      signingAvailable: true,
    });
    expect(result.status).toBe('ready');
  });

  it('blocks when no credentials and signingAvailable is false', async () => {
    mockFetch(true);
    const result = await checkRemoteSyncPreflight({
      ...baseCtx,
      credentials: undefined,
      signingAvailable: false,
    });
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') expect(result.reason).toBe('auth_headers_unavailable');
  });
});
