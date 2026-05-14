import { describe, expect, it } from 'vitest';
import { validateApiEnv } from '../src/env/validateApiEnv';

describe('validateApiEnv', () => {
  it('allows the default local test environment', () => {
    expect(validateApiEnv({ AUTH_DEV_MODE: 'true' })).toEqual({ ok: true });
  });

  it('rejects AUTH_DEV_MODE in production', () => {
    const result = validateApiEnv({
      NODE_ENV: 'production',
      AUTH_DEV_MODE: 'true',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('AUTH_DEV_MODE must not be true in production.');
    }
  });

  it('requires database and Sui identity settings when production writes are enabled', () => {
    const result = validateApiEnv({
      NODE_ENV: 'production',
      ENABLE_REMOTE_SIGNAL_WRITES: 'true',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual([
        'DATABASE_URL is required when production remote writes are enabled.',
        'ENABLE_SUI_CHARACTER_RESOLUTION=true is required when production remote writes are enabled.',
        'SUI_GRAPHQL_URL is required when production remote writes are enabled.',
        'API_CORS_ORIGINS is required when production remote writes are enabled.',
      ]);
    }
  });

  it('rejects wildcard CORS origins when production writes are enabled', () => {
    const result = validateApiEnv({
      NODE_ENV: 'production',
      ENABLE_REMOTE_SIGNAL_WRITES: 'true',
      ENABLE_SUI_CHARACTER_RESOLUTION: 'true',
      DATABASE_URL: 'postgres://example',
      SUI_GRAPHQL_URL: 'https://graphql.testnet.sui.io/graphql',
      API_CORS_ORIGINS: '*',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('API_CORS_ORIGINS must not contain * when production remote writes are enabled.');
    }
  });

  it('accepts explicit production remote-write configuration', () => {
    const result = validateApiEnv({
      NODE_ENV: 'production',
      AUTH_DEV_MODE: 'false',
      ENABLE_REMOTE_SIGNAL_WRITES: 'true',
      ENABLE_SUI_CHARACTER_RESOLUTION: 'true',
      DATABASE_URL: 'postgres://example',
      SUI_GRAPHQL_URL: 'https://graphql.testnet.sui.io/graphql',
      API_CORS_ORIGINS: 'https://signal-vault.example',
    });

    expect(result).toEqual({ ok: true });
  });

  it('rejects invalid URL-shaped env values', () => {
    const result = validateApiEnv({
      NODE_ENV: 'production',
      ENABLE_REMOTE_SIGNAL_WRITES: 'true',
      ENABLE_SUI_CHARACTER_RESOLUTION: 'true',
      DATABASE_URL: 'postgres://example',
      SUI_GRAPHQL_URL: 'not a url',
      API_CORS_ORIGINS: 'https://signal-vault.example,not a url',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('SUI_GRAPHQL_URL must be a valid URL.');
      expect(result.errors).toContain('API_CORS_ORIGINS contains an invalid origin: not a url');
    }
  });
});
