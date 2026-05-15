import { describe, expect, it } from 'vitest';
import { buildRlsPoolConfig } from '../scripts/rlsDbConfig';

describe('buildRlsPoolConfig', () => {
  it('uses a validated connection string when provided', () => {
    const result = buildRlsPoolConfig({
      SIGNAL_VAULT_RLS_DATABASE_URL:
        'postgres://postgres:secret@example.test:5432/signal_vault?sslmode=verify-full',
    });

    expect(result.source).toBe('connection_string');
    expect(result.config).toEqual({
      connectionString:
        'postgres://postgres:secret@example.test:5432/signal_vault?sslmode=verify-full',
    });
  });

  it('rejects a connection string without a password before pg SCRAM auth', () => {
    expect(() =>
      buildRlsPoolConfig({
        SIGNAL_VAULT_RLS_DATABASE_URL: 'postgres://postgres@example.test:5432/signal_vault',
      })
    ).toThrow('missing a password');
  });

  it('supports component env vars to avoid URL password encoding', () => {
    const result = buildRlsPoolConfig({
      SIGNAL_VAULT_RLS_DATABASE_HOST: 'example.test',
      SIGNAL_VAULT_RLS_DATABASE_PORT: '5432',
      SIGNAL_VAULT_RLS_DATABASE_NAME: 'signal_vault',
      SIGNAL_VAULT_RLS_DATABASE_USER: 'postgres',
      SIGNAL_VAULT_RLS_DATABASE_PASSWORD: 'pa:ss@word/with?chars',
      SIGNAL_VAULT_RLS_DATABASE_SSLMODE: 'verify-full',
    });

    expect(result.source).toBe('components');
    expect(result.config).toEqual({
      host: 'example.test',
      port: 5432,
      database: 'signal_vault',
      user: 'postgres',
      password: 'pa:ss@word/with?chars',
      ssl: { rejectUnauthorized: true },
    });
  });

  it('requires all component env vars when no connection string is set', () => {
    expect(() => buildRlsPoolConfig({})).toThrow(
      'SIGNAL_VAULT_RLS_DATABASE_HOST'
    );
  });

  it('allows sslmode=disable for local-only verifier probes', () => {
    const result = buildRlsPoolConfig({
      SIGNAL_VAULT_RLS_DATABASE_HOST: 'localhost',
      SIGNAL_VAULT_RLS_DATABASE_PORT: '5432',
      SIGNAL_VAULT_RLS_DATABASE_NAME: 'signal_vault',
      SIGNAL_VAULT_RLS_DATABASE_USER: 'postgres',
      SIGNAL_VAULT_RLS_DATABASE_PASSWORD: 'secret',
      SIGNAL_VAULT_RLS_DATABASE_SSLMODE: 'disable',
    });

    expect(result.config.ssl).toBe(false);
  });
});
