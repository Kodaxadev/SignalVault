import { describe, it, expect, vi, afterEach } from 'vitest';
import { pushSignalToRemote } from './remoteSignalPush';
import type { Signal } from '@/features/signals/signalTypes';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: 'sig-1',
    title: 'Test Signal',
    body: 'Some body',
    signalType: 'gate_recon',
    confidence: 'observed',
    visibility: 'public',
    syncState: 'remote_pending',
    author: { kind: 'character', characterId: 'char-1', tribeId: 'tribe-1' },
    linkedEntities: [{ entityId: 'item:utopia:12345', label: 'Test Gate', type: 'smart_gate', resolutionConfidence: 'cached' }],
    createdInContext: { surface: 'ingame_object', viewerState: 'character_resolved' },
    tags: [],
    createdAt: '2026-05-10T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z',
    ...overrides,
  };
}

const validHeaders = {
  Authorization: 'Bearer eyJ.pay.sig',
  'X-Wallet-Signature': 'wallet-sig',
  'X-Challenge-Id': 'uuid-challenge-1',
  'X-Wallet-Address': '0xabc',
};

describe('pushSignalToRemote', () => {
  it('returns ok with remoteId on 201 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ signalId: 'remote-uuid-1', requestId: 'req-1' }),
    }));

    const result = await pushSignalToRemote(makeSignal(), 'http://localhost:3000', validHeaders);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.remoteId).toBe('remote-uuid-1');
  });

  it('returns ok=false for local_private signal (no remote payload)', async () => {
    const result = await pushSignalToRemote(
      makeSignal({ visibility: 'local_private' }),
      'http://localhost:3000',
      validHeaders
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/payload/i);
  });

  it('returns ok=false on HTTP error response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    }));

    const result = await pushSignalToRemote(makeSignal(), 'http://localhost:3000', validHeaders);
    expect(result.ok).toBe(false);
  });

  it('returns ok=false on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

    const result = await pushSignalToRemote(makeSignal(), 'http://localhost:3000', validHeaders);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('Connection refused');
  });

  it('sends provided headers in the request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ signalId: 'uuid-1', requestId: 'req-1' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await pushSignalToRemote(makeSignal(), 'http://localhost:3000', validHeaders);

    const callOptions = ((fetchMock.mock.calls[0] as unknown[])[1]) as { headers: Record<string, string> };
    expect(callOptions.headers['Authorization']).toBe('Bearer eyJ.pay.sig');
    expect(callOptions.headers['X-Challenge-Id']).toBe('uuid-challenge-1');
  });

  it('sends signal payload in request body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ signalId: 'uuid-1', requestId: 'req-1' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await pushSignalToRemote(makeSignal(), 'http://localhost:3000', validHeaders);

    const callOptions = ((fetchMock.mock.calls[0] as unknown[])[1]) as { body: string };
    const body = JSON.parse(callOptions.body) as { signal: unknown };
    expect(body.signal).toBeDefined();
  });
});
