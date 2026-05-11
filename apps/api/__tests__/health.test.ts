import { describe, it, expect } from 'vitest';
import { app } from '../src/server';

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
  });

  it('returns status ok and correct phase', async () => {
    const res = await app.request('/health');
    const body = await res.json() as Record<string, unknown>;
    expect(body['status']).toBe('ok');
    expect(body['phase']).toBe('09L2');
    expect(body['db']).toBe('not_connected');
    expect(body['writesEnabled']).toBe(false);
  });

  it('returns identity block with mode, suiEnabled, authDevMode', async () => {
    const res = await app.request('/health');
    const body = await res.json() as Record<string, unknown>;
    const identity = body['identity'] as Record<string, unknown>;
    expect(typeof identity).toBe('object');
    // In test env: ENABLE_SUI_CHARACTER_RESOLUTION not set, AUTH_DEV_MODE=true
    expect(identity['suiEnabled']).toBe(false);
    expect(identity['suiGraphqlUrl']).toBeNull();
    expect(identity['authDevMode']).toBe(true);
    expect(identity['mode']).toBe('dev_character_jwt');
  });

  it('returns a requestId in body', async () => {
    const res = await app.request('/health');
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body['requestId']).toBe('string');
    expect((body['requestId'] as string).length).toBeGreaterThan(0);
  });

  it('echoes x-request-id from request header', async () => {
    const res = await app.request('/health', {
      headers: { 'x-request-id': 'test-echo-id' },
    });
    const body = await res.json() as Record<string, unknown>;
    expect(body['requestId']).toBe('test-echo-id');
  });

  it('echoes x-request-id in response header', async () => {
    const res = await app.request('/health', {
      headers: { 'x-request-id': 'header-echo' },
    });
    expect(res.headers.get('x-request-id')).toBe('header-echo');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await app.request('/unknown-route');
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(body['code']).toBe('not_found');
  });
});
