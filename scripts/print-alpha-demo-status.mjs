/**
 * Prints a pre-demo environment status summary.
 *
 * Reads:
 *   - process.env for API-side vars (AUTH_DEV_MODE, DATABASE_URL, etc.)
 *   - apps/web/.env.local or apps/web/.env for VITE_* vars (if files exist)
 *   - apps/web/dist/assets/index-*.js for bundle isolation check
 *
 * Does NOT exit 1 on warnings — this is a status reporter, not a blocker.
 * Use `pnpm check:release` for hard enforcement.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// ─── helpers ────────────────────────────────────────────────────────────────

function ok(label, value = '') {
  const val = value ? ` (${value})` : '';
  console.log(`  ✅  ${label}${val}`);
}

function warn(label, detail = '') {
  const d = detail ? ` — ${detail}` : '';
  console.log(`  ⚠️   ${label}${d}`);
}

function missing(label, detail = '') {
  const d = detail ? ` — ${detail}` : '';
  console.log(`  ·    ${label} not set${d}`);
}

function danger(label, detail = '') {
  const d = detail ? ` — ${detail}` : '';
  console.log(`  ❌  ${label}${d}`);
}

function section(title) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 52 - title.length))}`);
}

// ─── parse a .env file (key=value, ignores comments) ────────────────────────

async function parseEnvFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const result = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      result[key] = value;
    }
    return result;
  } catch {
    return null;
  }
}

// ─── load VITE_* vars from web env files ────────────────────────────────────

const WEB_DIR = join(ROOT, 'apps', 'web');

let webEnv = await parseEnvFile(join(WEB_DIR, '.env.local'));
let webEnvSource = '.env.local';

if (!webEnv) {
  webEnv = await parseEnvFile(join(WEB_DIR, '.env'));
  webEnvSource = '.env';
}

// ─── check bundle ────────────────────────────────────────────────────────────

const DIST_DIR = join(ROOT, 'apps', 'web', 'dist', 'assets');

let bundleStatus = 'no_build';
let mainChunkName = null;

try {
  const files = await readdir(DIST_DIR);
  const mainChunks = files.filter((f) => /^index-.*\.js$/.test(f));
  if (mainChunks.length > 0) {
    mainChunkName = mainChunks[0];
    const content = await readFile(join(DIST_DIR, mainChunkName), 'utf8');
    const count = (content.match(/evefrontier/g) ?? []).length;
    bundleStatus = count === 0 ? 'clean' : `dirty:${count}`;
  }
} catch {
  bundleStatus = 'no_build';
}

// ─── determine demo path ─────────────────────────────────────────────────────

const apiDevMode = process.env['AUTH_DEV_MODE'] === 'true';
const remoteUrl = webEnv?.['VITE_REMOTE_SYNC_URL'];
const devAuth = webEnv?.['VITE_REMOTE_DEV_AUTH'] === 'true';
const devJwt = webEnv?.['VITE_REMOTE_DEV_CHARACTER_JWT'];
const devSig = webEnv?.['VITE_REMOTE_DEV_WALLET_SIGNATURE'];

const remoteReady = Boolean(remoteUrl && devAuth && devJwt && devSig && apiDevMode);
const localReady = bundleStatus === 'clean' || bundleStatus === 'no_build';

// ─── print ───────────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║       Signal Vault — Alpha Demo Status               ║');
console.log('╚══════════════════════════════════════════════════════╝');

// ── API env ──────────────────────────────────────────────────────────────────

section('Backend (API) — process.env');

const authDevMode = process.env['AUTH_DEV_MODE'];
if (authDevMode === 'true') {
  warn('AUTH_DEV_MODE=true', 'dev mode active — required for remote dev-auth demo');
} else if (!authDevMode) {
  missing('AUTH_DEV_MODE', 'production-safe (dev-auth push will fail)');
} else {
  ok('AUTH_DEV_MODE', authDevMode);
}

const dbUrl = process.env['DATABASE_URL'];
if (dbUrl) {
  const masked = dbUrl.replace(/:\/\/[^@]+@/, '://<credentials>@');
  ok('DATABASE_URL', masked);
} else {
  missing('DATABASE_URL', 'remote push will fail (db not connected)');
}

const writesEnabled = process.env['ENABLE_REMOTE_SIGNAL_WRITES'];
if (writesEnabled === 'true') {
  ok('ENABLE_REMOTE_SIGNAL_WRITES=true', 'writes open');
} else {
  missing('ENABLE_REMOTE_SIGNAL_WRITES', 'defaults to false — remote push returns 503');
}

const port = process.env['PORT'] ?? '3001 (default)';
ok('PORT', port);

// ── Web env ──────────────────────────────────────────────────────────────────

section(`Frontend (Web) — ${webEnv ? `apps/web/${webEnvSource}` : 'no env file found'}`);

if (!webEnv) {
  warn('No .env.local or .env found in apps/web/', 'VITE_* vars may be baked into existing build or not set');
} else {
  const syncUrl = webEnv['VITE_REMOTE_SYNC_URL'];
  if (syncUrl) {
    ok('VITE_REMOTE_SYNC_URL', syncUrl);
  } else {
    missing('VITE_REMOTE_SYNC_URL', 'remote push button will not appear');
  }

  const remoteDevAuth = webEnv['VITE_REMOTE_DEV_AUTH'];
  if (remoteDevAuth === 'true') {
    warn('VITE_REMOTE_DEV_AUTH=true', 'dev-auth enabled — remote push active');
  } else {
    missing('VITE_REMOTE_DEV_AUTH', 'wallet signing path only (requires InGame provider)');
  }

  if (webEnv['VITE_REMOTE_DEV_CHARACTER_JWT']) {
    ok('VITE_REMOTE_DEV_CHARACTER_JWT', 'set');
  } else {
    missing('VITE_REMOTE_DEV_CHARACTER_JWT', 'required for dev-auth push');
  }

  if (webEnv['VITE_REMOTE_DEV_WALLET_SIGNATURE']) {
    ok('VITE_REMOTE_DEV_WALLET_SIGNATURE', 'set');
  } else {
    missing('VITE_REMOTE_DEV_WALLET_SIGNATURE', 'required for dev-auth push');
  }

  const worldApiUrl = webEnv['VITE_WORLD_API_BASE_URL'];
  if (worldApiUrl) {
    ok('VITE_WORLD_API_BASE_URL', worldApiUrl);
  } else {
    missing('VITE_WORLD_API_BASE_URL', 'World API enrichment disabled');
  }

  const worldApiEnv = webEnv['VITE_WORLD_API_ENV'] ?? 'utopia (default)';
  ok('VITE_WORLD_API_ENV', worldApiEnv);
}

// ── Bundle ───────────────────────────────────────────────────────────────────

section('Build artifact');

if (bundleStatus === 'no_build') {
  warn('No build found', 'run `pnpm build` before demo (local-only mode still works without build)');
} else if (bundleStatus === 'clean') {
  ok(`${mainChunkName}`, '0 dApp Kit refs — chunk isolation intact');
} else {
  const count = bundleStatus.split(':')[1];
  danger(`${mainChunkName}`, `${count} dApp Kit ref(s) in main bundle — isolation broken, run check:bundle-clean`);
}

// ── Guardrails ────────────────────────────────────────────────────────────────

section('Guardrail summary');

const prodAuthSafe = authDevMode !== 'true' && webEnv?.['VITE_REMOTE_DEV_AUTH'] !== 'true';
if (prodAuthSafe) {
  ok('No dev-auth flags in production env');
} else {
  warn('Dev-auth flags are SET', 'correct for dev demo; run check:prod-auth before any production build');
}

if (bundleStatus === 'clean') {
  ok('Bundle isolation clean');
} else if (bundleStatus === 'no_build') {
  warn('Bundle not built yet');
} else {
  danger('Bundle isolation FAILED');
}

// ── Demo path recommendation ──────────────────────────────────────────────────

section('Recommended demo path');

if (remoteReady) {
  console.log('  ✅  PATH B — Remote dev-auth demo');
  console.log('       API running + dev-auth flags set → remote push available');
  console.log('       Button will show: "Alpha · Dev auth · Manual only"');
} else if (localReady) {
  console.log('  ✅  PATH A — Local-only demo');
  console.log('       No backend required → all local-first features work');
  if (remoteUrl && !devAuth) {
    console.log('       Remote URL set but dev-auth disabled → push button may appear but require wallet signing');
  } else if (!remoteUrl) {
    console.log('       Set VITE_REMOTE_SYNC_URL and dev-auth vars to enable remote push');
  }
} else {
  console.log('  ⚠️   Demo path unclear — check warnings above');
}

console.log('\n  Docs: docs/alpha/06-demo-operator-checklist.md');
console.log('  Full check: pnpm check:release\n');
