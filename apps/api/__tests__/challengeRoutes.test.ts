import { describe, it, expect, beforeEach } from 'vitest';
import { app } from '../src/server';
import { _clearChallengeStore } from '../src/auth/challengeStore';

beforeEach(() => {
  _clearChallengeStore();
});

function post(body: unknown) {
  return app.request('/api/v1/auth/challenge', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/auth/challenge', () => {
  it('returns 200 with challengeId, message, expiresAt', async () => {
    const res = await post({ walletAddress: '0xabc' });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body['challengeId']).toBe('string');
    expect(typeof body['message']).toBe('string');
    expect(typeof body['expiresAt']).toBe('string');
  });

  it('message contains the challengeId', async () => {
    const res = await post({ walletAddress: '0xabc' });
    const body = await res.json() as Record<string, string>;
    expect(body['message']).toContain(body['challengeId']);
  });

  it('expiresAt is in the future', async () => {
    const res = await post({ walletAddress: '0xabc' });
    const body = await res.json() as Record<string, string>;
    expect(new Date(body['expiresAt'] as string).getTime()).toBeGreaterThan(Date.now());
  });

  it('issues unique challengeIds per request', async () => {
    const r1 = await post({ walletAddress: '0xabc' });
    const r2 = await post({ walletAddress: '0xabc' });
    const b1 = await r1.json() as Record<string, string>;
    const b2 = await r2.json() as Record<string, string>;
    expect(b1['challengeId']).not.toBe(b2['challengeId']);
  });

  it('returns 400 when walletAddress is missing', async () => {
    const res = await post({});
    expect(res.status).toBe(400);
  });

  it('returns 400 when walletAddress is empty string', async () => {
    const res = await post({ walletAddress: '' });
    expect(res.status).toBe(400);
  });

  it('returns a requestId in the response headers', async () => {
    const res = await post({ walletAddress: '0xabc' });
    expect(res.headers.get('x-request-id') ?? res.headers.get('X-Request-Id')).toBeTruthy();
  });
});
