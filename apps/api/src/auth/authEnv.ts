// Auth configuration. Read once at import; restart server to pick up changes.
//
// AUTH_DEV_MODE=true — decodes JWTs without signature verification and accepts
// wallet signatures without cryptographic proof. NEVER enable in production.
//
// JWT_SECRET — HS256 secret for test/dev JWTs (takes priority over JWKS when both set).
// JWT_JWKS_URL — JWKS endpoint for production RS256/ES256 JWT verification.
// JWT_ISSUER / JWT_AUDIENCE — validated claims when not in dev mode.
export const authEnv = {
  authDevMode: process.env['AUTH_DEV_MODE'] === 'true',
  jwtSecret: process.env['JWT_SECRET'] as string | undefined,
  jwtJwksUrl: process.env['JWT_JWKS_URL'] as string | undefined,
  jwtIssuer: process.env['JWT_ISSUER'] as string | undefined,
  jwtAudience: process.env['JWT_AUDIENCE'] as string | undefined,
} as const;
