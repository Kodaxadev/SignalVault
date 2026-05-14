import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateWorldApiEnv } from './world-api-env-policy.mjs';

describe('validateWorldApiEnv', () => {
  it('allows the default sandbox configuration', () => {
    assert.deepEqual(validateWorldApiEnv({}), { ok: true });
  });

  it('allows an explicit Utopia sandbox release', () => {
    assert.deepEqual(validateWorldApiEnv({
      SIGNAL_VAULT_RELEASE_ENV: 'utopia',
      VITE_WORLD_API_ENV: 'utopia',
      VITE_DEFAULT_TENANT: 'utopia',
      VITE_WORLD_API_BASE_URL: 'https://world-api-utopia.uat.pub.evefrontier.com',
    }), { ok: true });
  });

  it('requires Stillness env, tenant, and base URL for Stillness release builds', () => {
    const result = validateWorldApiEnv({
      SIGNAL_VAULT_RELEASE_ENV: 'stillness',
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.errors, [
      'VITE_WORLD_API_ENV must be stillness for Stillness release builds.',
      'VITE_DEFAULT_TENANT must be stillness for Stillness release builds.',
      'VITE_WORLD_API_BASE_URL is required for Stillness release builds.',
    ]);
  });

  it('rejects Utopia World API host in a Stillness build', () => {
    const result = validateWorldApiEnv({
      SIGNAL_VAULT_RELEASE_ENV: 'stillness',
      VITE_WORLD_API_ENV: 'stillness',
      VITE_DEFAULT_TENANT: 'stillness',
      VITE_WORLD_API_BASE_URL: 'https://world-api-utopia.uat.pub.evefrontier.com',
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.errors, [
      'VITE_WORLD_API_BASE_URL host must match stillness: expected world-api-stillness.live.tech.evefrontier.com, got world-api-utopia.uat.pub.evefrontier.com.',
    ]);
  });

  it('accepts explicit Stillness release configuration', () => {
    assert.deepEqual(validateWorldApiEnv({
      SIGNAL_VAULT_RELEASE_ENV: 'stillness',
      VITE_WORLD_API_ENV: 'stillness',
      VITE_DEFAULT_TENANT: 'stillness',
      VITE_WORLD_API_BASE_URL: 'https://world-api-stillness.live.tech.evefrontier.com',
    }), { ok: true });
  });

  it('rejects invalid environment names and URLs', () => {
    const result = validateWorldApiEnv({
      SIGNAL_VAULT_RELEASE_ENV: 'prod',
      VITE_WORLD_API_ENV: 'chaos',
      VITE_DEFAULT_TENANT: 'chaos',
      VITE_WORLD_API_BASE_URL: 'not a url',
    });

    assert.equal(result.ok, false);
    assert.deepEqual(result.errors, [
      'SIGNAL_VAULT_RELEASE_ENV must be stillness or utopia.',
      'VITE_WORLD_API_ENV must be stillness or utopia.',
      'VITE_DEFAULT_TENANT must be stillness or utopia.',
      'VITE_WORLD_API_BASE_URL must be a valid URL.',
    ]);
  });
});
