import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { SignJWT } from 'jose';
import { app } from '../src/server';
import { MIN_SIGNATURE_LENGTH } from '../src/auth/walletSignatureTypes';

vi.mock('../src/db/signalRepository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/db/signalRepository')>();
  return {
    ...actual,
    listSignals: vi.fn(actual.listSignals),
    findSignalById: vi.fn(actual.findSignalById),
  };
});

import { listSignals, findSignalById } from '../src/db/signalRepository';

const mockListSignals = vi.mocked(listSignals);
const mockFindSignalById = vi.mocked(findSignalById);

// AUTH_DEV_MODE=true is set globally in vitest.config.ts
// Auth is now supplied via HTTP headers, not request body.

const TEST_SECRET = new TextEncoder().encode('test-secret-for-unit-tests-only');
const VALID_SIG = 'a'.repeat(MIN_SIGNATURE_LENGTH + 10);

async function makeJwt(claims: Record<string, unknown> = {}) {
  return new SignJWT({ sub: 'char-123', ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(TEST_SECRET);
}

const signalBase = {
  visibility: 'public',
  signalType: 'gate_recon',
  confidence: 'high',
  title: 'Gate Alpha open',
  body: 'Confirmed passable at 14:32.',
  linkedEntities: [],
  createdAt: '2026-05-10T12:00:00.000Z',
};

let validJwt: string;
let validAuthHeaders: Record<string, string>;

beforeAll(async () => {
  validJwt = await makeJwt();
  validAuthHeaders = {
    authorization: `Bearer ${validJwt}`,
    'x-wallet-signature': VALID_SIG,
    'x-signature-message': 'signal-vault:test-message',
  };
});

beforeEach(() => {
  mockListSignals.mockReset();
  mockFindSignalById.mockReset();
});

function post(body: unknown, extraHeaders: Record<string, string> = {}) {
  return app.request('/api/v1/signals', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  });
}

describe('GET /api/v1/signals', () => {
  it('returns 200 with empty signals array', async () => {
    mockListSignals.mockResolvedValue([]);

    const res = await app.request('/api/v1/signals');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['signals'])).toBe(true);
    expect((body['signals'] as unknown[]).length).toBe(0);
    expect(mockListSignals).toHaveBeenCalledWith({ characterId: null, tribeId: null });
  });

  it('returns signals from the repository', async () => {
    mockListSignals.mockResolvedValue([{
      id: 'sig-1',
      author_character_id: 'char-1',
      author_character_name: 'Kivik',
      author_wallet_address: '0xabc',
      author_tribe_id: null,
      identity_resolved_at: '2026-05-12T16:00:00.000Z',
      visibility: 'public',
      signal_type: 'gate_recon',
      confidence: 'high',
      title: 'Gate Alpha open',
      body: 'Confirmed passable.',
      linked_entities: [],
      created_at: '2026-05-10T12:00:00.000Z',
      updated_at: '2026-05-10T12:00:00.000Z',
      expires_at: null,
    }]);

    const res = await app.request('/api/v1/signals');
    const body = await res.json() as Record<string, unknown>;
    const signals = body['signals'] as Array<Record<string, unknown>>;

    expect(res.status).toBe(200);
    expect(signals[0]?.['id']).toBe('sig-1');
    expect(signals[0]?.['authorCharacterName']).toBe('Kivik');
    expect(signals[0]?.['signalType']).toBe('gate_recon');
  });
});

describe('GET /api/v1/signals/:id', () => {
  it('returns 404 when the repository has no matching signal', async () => {
    mockFindSignalById.mockResolvedValue(null);

    const res = await app.request('/api/v1/signals/any-id');
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(body['code']).toBe('signal_not_found');
    expect(mockFindSignalById).toHaveBeenCalledWith('any-id', { characterId: null, tribeId: null });
  });

  it('returns one signal from the repository', async () => {
    mockFindSignalById.mockResolvedValue({
      id: 'sig-1',
      author_character_id: 'char-1',
      author_character_name: 'Kivik',
      author_wallet_address: '0xabc',
      author_tribe_id: null,
      identity_resolved_at: '2026-05-12T16:00:00.000Z',
      visibility: 'public',
      signal_type: 'gate_recon',
      confidence: 'high',
      title: 'Gate Alpha open',
      body: 'Confirmed passable.',
      linked_entities: [],
      created_at: '2026-05-10T12:00:00.000Z',
      updated_at: '2026-05-10T12:00:00.000Z',
      expires_at: null,
    });

    const res = await app.request('/api/v1/signals/sig-1');
    const body = await res.json() as Record<string, unknown>;
    const signal = body['signal'] as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(signal['id']).toBe('sig-1');
    expect(signal['authorCharacterName']).toBe('Kivik');
    expect(signal['signalType']).toBe('gate_recon');
  });
});

describe('POST /api/v1/signals', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await app.request('/api/v1/signals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json{{{',
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body['code']).toBe('validation_failed');
  });

  it('returns 400 on schema validation failure (missing title)', async () => {
    const bad = { signal: { ...signalBase } };
    // @ts-expect-error intentional bad input
    delete bad.signal.title;
    const res = await post(bad, validAuthHeaders);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body['code']).toBe('validation_failed');
  });

  it('returns 401 when auth headers are absent', async () => {
    const res = await post({ signal: signalBase });
    expect(res.status).toBe(401);
  });

  it('returns 401 when wallet signature is too short', async () => {
    const res = await post({ signal: signalBase }, {
      authorization: `Bearer ${validJwt}`,
      'x-wallet-signature': 'short',
      'x-signature-message': 'signal-vault:test',
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 when Authorization JWT is not a valid JWT', async () => {
    const res = await post({ signal: signalBase }, {
      authorization: 'Bearer not-a-jwt',
      'x-wallet-signature': VALID_SIG,
      'x-signature-message': 'signal-vault:test',
    });
    expect(res.status).toBe(401);
  });

  it('returns 403 on policy denial (tribe write — no tribe_id in JWT)', async () => {
    const res = await post(
      { signal: { ...signalBase, visibility: 'tribe' } },
      validAuthHeaders
    );
    expect(res.status).toBe(403);
    const body = await res.json() as Record<string, unknown>;
    expect(body['code']).toBe('tribe_identity_missing');
  });

  it('returns 503 for a valid public request (writes not enabled)', async () => {
    const res = await post({ signal: signalBase }, validAuthHeaders);
    expect(res.status).toBe(503);
    const body = await res.json() as Record<string, unknown>;
    expect(body['code']).toBe('server_error');
  });

  it('propagates requestId from header in error response', async () => {
    const res = await app.request('/api/v1/signals', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-request-id': 'trace-abc' },
      body: 'bad-json',
    });
    const body = await res.json() as Record<string, unknown>;
    expect(body['requestId']).toBe('trace-abc');
  });
});

describe('PATCH /api/v1/signals/:id', () => {
  it('returns 503 (writes not enabled)', async () => {
    const res = await app.request('/api/v1/signals/sig-1', { method: 'PATCH' });
    expect(res.status).toBe(503);
  });
});

describe('DELETE /api/v1/signals/:id', () => {
  it('returns 503 (writes not enabled)', async () => {
    const res = await app.request('/api/v1/signals/sig-1', { method: 'DELETE' });
    expect(res.status).toBe(503);
  });
});
