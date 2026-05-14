type EnvSource = Record<string, string | undefined>;

export type ApiEnvValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export function validateApiEnv(env: EnvSource = process.env): ApiEnvValidationResult {
  const errors: string[] = [];
  const isProduction = env['NODE_ENV'] === 'production';
  const writesEnabled = env['ENABLE_REMOTE_SIGNAL_WRITES'] === 'true';
  const productionWritesEnabled = isProduction && writesEnabled;

  if (isProduction && env['AUTH_DEV_MODE'] === 'true') {
    errors.push('AUTH_DEV_MODE must not be true in production.');
  }

  if (productionWritesEnabled) {
    requireValue(env, 'DATABASE_URL', errors, 'DATABASE_URL is required when production remote writes are enabled.');

    if (env['ENABLE_SUI_CHARACTER_RESOLUTION'] !== 'true') {
      errors.push('ENABLE_SUI_CHARACTER_RESOLUTION=true is required when production remote writes are enabled.');
    }

    requireValue(env, 'SUI_GRAPHQL_URL', errors, 'SUI_GRAPHQL_URL is required when production remote writes are enabled.');
    requireValue(env, 'API_CORS_ORIGINS', errors, 'API_CORS_ORIGINS is required when production remote writes are enabled.');
  }

  validateUrlValue(env['SUI_GRAPHQL_URL'], 'SUI_GRAPHQL_URL', errors);
  validateCorsOrigins(env['API_CORS_ORIGINS'], productionWritesEnabled, errors);

  return errors.length > 0 ? { ok: false, errors } : { ok: true };
}

function requireValue(
  env: EnvSource,
  key: string,
  errors: string[],
  message: string
): void {
  if (!env[key]?.trim()) errors.push(message);
}

function validateUrlValue(value: string | undefined, label: string, errors: string[]): void {
  if (!value?.trim()) return;
  try {
    new URL(value);
  } catch {
    errors.push(`${label} must be a valid URL.`);
  }
}

function validateCorsOrigins(
  value: string | undefined,
  productionWritesEnabled: boolean,
  errors: string[]
): void {
  if (!value?.trim()) return;

  for (const origin of value.split(',').map((item) => item.trim()).filter(Boolean)) {
    if (origin === '*') {
      if (productionWritesEnabled) {
        errors.push('API_CORS_ORIGINS must not contain * when production remote writes are enabled.');
      }
      continue;
    }

    try {
      new URL(origin);
    } catch {
      errors.push(`API_CORS_ORIGINS contains an invalid origin: ${origin}`);
    }
  }
}
