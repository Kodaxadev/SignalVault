/**
 * CI guardrail: fails if dev-auth environment flags are present.
 *
 * Run before the production build. Exits 1 if either flag is set,
 * so the build never proceeds with insecure auth configuration.
 *
 * Checks:
 *   AUTH_DEV_MODE !== 'true'       (backend: disables real signature verification)
 *   VITE_REMOTE_DEV_AUTH !== 'true' (frontend: enables static-credential shortcut)
 */

let failed = false;

if (process.env.AUTH_DEV_MODE === 'true') {
  console.error(
    '❌ AUTH_DEV_MODE=true is set. This disables real wallet signature verification and must never be used in production.'
  );
  failed = true;
}

if (process.env.VITE_REMOTE_DEV_AUTH === 'true') {
  console.error(
    '❌ VITE_REMOTE_DEV_AUTH=true is set. This enables the dev-auth shortcut and must never be used in production.'
  );
  failed = true;
}

if (failed) {
  console.error('\nProduction build blocked. Unset dev-auth flags before deploying.');
  process.exit(1);
}

console.log('✅ No dev-auth flags set. Auth configuration is safe for production build.');
