import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from '../src/server';
import { _clearRateLimitStore } from '../src/middleware/rateLimit';

const originalAllowedOrigins = process.env.API_CORS_ORIGINS;
const originalRateMax = process.env.API_RATE_LIMIT_MAX;
const originalRateWindow = process.env.API_RATE_LIMIT_WINDOW_MS;

beforeEach(() => {
  _clearRateLimitStore();
  process.env.API_CORS_ORIGINS = 'https://vault.example,https://render.example';
  process.env.API_RATE_LIMIT_MAX = '2';
  process.env.API_RATE_LIMIT_WINDOW_MS = '60000';
});

afterEach(() => {
  _clearRateLimitStore();
  process.env.API_CORS_ORIGINS = originalAllowedOrigins;
  process.env.API_RATE_LIMIT_MAX = originalRateMax;
  process.env.API_RATE_LIMIT_WINDOW_MS = originalRateWindow;
});

describe('API CORS middleware', () => {
  it('echoes an allowed API origin', async () => {
    const res = await app.request('/api/v1/signals', {
      headers: { origin: 'https://vault.example' },
    });

    expect(res.headers.get('access-control-allow-origin')).toBe('https://vault.example');
  });

  it('does not allow an unlisted API origin', async () => {
    const res = await app.request('/api/v1/signals', {
      headers: { origin: 'https://evil.example' },
    });

    expect(res.headers.get('access-control-allow-origin')).not.toBe('https://evil.example');
  });

  it('allows signed auth headers on API preflight requests', async () => {
    const res = await app.request('/api/v1/signals', {
      method: 'OPTIONS',
      headers: {
        origin: 'https://render.example',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'x-wallet-signature,x-signature-message,x-challenge-id,x-wallet-address',
      },
    });

    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://render.example');
    expect(res.headers.get('access-control-allow-headers')).toContain('x-wallet-signature');
  });
});

describe('API rate limiting middleware', () => {
  it('returns 429 after the configured request budget is exhausted', async () => {
    const headers = { 'x-forwarded-for': '203.0.113.9' };

    expect((await app.request('/api/v1/signals', { headers })).status).toBe(200);
    expect((await app.request('/api/v1/signals', { headers })).status).toBe(200);

    const limited = await app.request('/api/v1/signals', { headers });
    const body = await limited.json() as Record<string, unknown>;

    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
    expect(body['code']).toBe('rate_limited');
  });
});
