export const WORLD_API_HOSTS = {
  stillness: 'world-api-stillness.live.tech.evefrontier.com',
  utopia: 'world-api-utopia.uat.pub.evefrontier.com',
};

const VALID_ENVS = new Set(['stillness', 'utopia']);

export function validateWorldApiEnv(env = process.env) {
  const errors = [];
  const releaseEnv = env.SIGNAL_VAULT_RELEASE_ENV;
  const worldApiEnv = env.VITE_WORLD_API_ENV ?? 'utopia';
  const tenant = env.VITE_DEFAULT_TENANT ?? 'utopia';
  const baseUrl = env.VITE_WORLD_API_BASE_URL;

  validateEnvName('SIGNAL_VAULT_RELEASE_ENV', releaseEnv, false, errors);
  validateEnvName('VITE_WORLD_API_ENV', worldApiEnv, true, errors);
  validateEnvName('VITE_DEFAULT_TENANT', tenant, true, errors);

  if (baseUrl) {
    validateBaseUrl(baseUrl, worldApiEnv, errors);
  }

  if (releaseEnv === 'stillness') {
    requireMatch('VITE_WORLD_API_ENV', worldApiEnv, 'stillness', errors);
    requireMatch('VITE_DEFAULT_TENANT', tenant, 'stillness', errors);
    if (!baseUrl) {
      errors.push('VITE_WORLD_API_BASE_URL is required for Stillness release builds.');
    }
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true };
}

function validateEnvName(label, value, required, errors) {
  if (!value) {
    if (required) errors.push(`${label} is required.`);
    return;
  }

  if (!VALID_ENVS.has(value)) {
    errors.push(`${label} must be stillness or utopia.`);
  }
}

function validateBaseUrl(baseUrl, worldApiEnv, errors) {
  let host;
  try {
    host = new URL(baseUrl).host;
  } catch {
    errors.push('VITE_WORLD_API_BASE_URL must be a valid URL.');
    return;
  }

  const expectedHost = WORLD_API_HOSTS[worldApiEnv];
  if (expectedHost && host !== expectedHost) {
    errors.push(
      `VITE_WORLD_API_BASE_URL host must match ${worldApiEnv}: expected ${expectedHost}, got ${host}.`
    );
  }
}

function requireMatch(label, actual, expected, errors) {
  if (actual !== expected) {
    errors.push(`${label} must be ${expected} for Stillness release builds.`);
  }
}
