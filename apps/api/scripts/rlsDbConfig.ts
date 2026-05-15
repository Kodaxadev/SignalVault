import type { PoolConfig } from 'pg';

type Env = Record<string, string | undefined>;

type RlsPoolSource = 'connection_string' | 'components';

type RlsPoolConfig = {
  config: PoolConfig;
  source: RlsPoolSource;
};

const URL_ENV_NAMES = ['SIGNAL_VAULT_RLS_DATABASE_URL', 'DATABASE_URL'] as const;

const COMPONENT_ENV = {
  host: 'SIGNAL_VAULT_RLS_DATABASE_HOST',
  port: 'SIGNAL_VAULT_RLS_DATABASE_PORT',
  database: 'SIGNAL_VAULT_RLS_DATABASE_NAME',
  user: 'SIGNAL_VAULT_RLS_DATABASE_USER',
  password: 'SIGNAL_VAULT_RLS_DATABASE_PASSWORD',
  sslmode: 'SIGNAL_VAULT_RLS_DATABASE_SSLMODE',
} as const;

export function buildRlsPoolConfig(env: Env = process.env): RlsPoolConfig {
  const databaseUrl = firstConfigured(env, URL_ENV_NAMES);
  if (databaseUrl) {
    validateConnectionUrl(databaseUrl);
    return {
      config: { connectionString: databaseUrl },
      source: 'connection_string',
    };
  }

  const missing = requiredComponentKeys(env);
  if (missing.length > 0) {
    throw new Error(
      `Set ${URL_ENV_NAMES.join(' or ')}, or set component env vars: ${missing.join(', ')}.`
    );
  }

  const port = parsePort(env[COMPONENT_ENV.port]!);

  return {
    config: {
      host: env[COMPONENT_ENV.host]!,
      port,
      database: env[COMPONENT_ENV.database]!,
      user: env[COMPONENT_ENV.user]!,
      password: env[COMPONENT_ENV.password]!,
      ssl: sslConfig(env[COMPONENT_ENV.sslmode]),
    },
    source: 'components',
  };
}

function firstConfigured(env: Env, names: readonly string[]): string | undefined {
  return names.map((name) => env[name]?.trim()).find(Boolean);
}

function validateConnectionUrl(raw: string): void {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('RLS database URL is not a valid URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('RLS database URL must use postgres:// or postgresql://.');
  }

  if (!parsed.username) {
    throw new Error('RLS database URL is missing a username.');
  }

  if (!parsed.password) {
    throw new Error(
      'RLS database URL is missing a password. Use component env vars if the password is hard to encode.'
    );
  }

  try {
    decodeURIComponent(parsed.password);
  } catch {
    throw new Error('RLS database URL password contains invalid percent encoding.');
  }
}

function requiredComponentKeys(env: Env): string[] {
  return [
    COMPONENT_ENV.host,
    COMPONENT_ENV.port,
    COMPONENT_ENV.database,
    COMPONENT_ENV.user,
    COMPONENT_ENV.password,
  ].filter((name) => !env[name]?.trim());
}

function parsePort(raw: string): number {
  const port = Number.parseInt(raw, 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`${COMPONENT_ENV.port} must be a valid TCP port.`);
  }
  return port;
}

function sslConfig(sslmode: string | undefined): PoolConfig['ssl'] {
  if (sslmode === 'disable') {
    return false;
  }

  return { rejectUnauthorized: true };
}
