/**
 * CI guardrail: fails if the main web bundle contains evefrontier references.
 *
 * Run after `pnpm build`. The main chunk (index-*.js) must have 0 references
 * to @evefrontier packages — dApp Kit must stay isolated to the InGameRoute chunk.
 *
 * A non-zero count means a dApp Kit import leaked into the main bundle,
 * which breaks the chunk isolation invariant and loads dApp Kit for all users
 * regardless of whether they are in-game.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST_DIR = join(ROOT, 'apps', 'web', 'dist', 'assets');
const FORBIDDEN_PATTERN = /evefrontier/;
const MAIN_CHUNK_PATTERN = /^index-.*\.js$/;

let files;
try {
  files = await readdir(DIST_DIR);
} catch {
  console.error(`❌ dist/assets not found at ${DIST_DIR}`);
  console.error('   Run `pnpm build` before running this check.');
  process.exit(1);
}

const mainChunks = files.filter((f) => MAIN_CHUNK_PATTERN.test(f));

if (mainChunks.length === 0) {
  console.error('❌ No main chunk (index-*.js) found in dist/assets.');
  console.error('   Run `pnpm build` before running this check.');
  process.exit(1);
}

let failed = false;

for (const chunk of mainChunks) {
  const content = await readFile(join(DIST_DIR, chunk), 'utf8');
  const matches = content.match(new RegExp(FORBIDDEN_PATTERN.source, 'g'));
  if (matches && matches.length > 0) {
    console.error(
      `❌ ${chunk}: found ${matches.length} evefrontier reference(s) in main bundle.`
    );
    console.error(
      '   dApp Kit must stay isolated to InGameRoute chunk. A shared component likely imported from @evefrontier.'
    );
    failed = true;
  } else {
    console.log(`✅ ${chunk}: 0 evefrontier references — main chunk is clean.`);
  }
}

if (failed) {
  console.error('\nBundle isolation check failed. Fix the import before deploying.');
  process.exit(1);
}
