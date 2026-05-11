/**
 * CI guardrail: fails if alpha docs contain known-stale phrases.
 *
 * Checks a set of doc files for forbidden phrases (outdated claims) and
 * required phrases (facts that must be present after each update).
 *
 * Add entries to CHECKS when a new phase changes a previously documented claim.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * @type {Array<{
 *   file: string,
 *   forbidden: string[],
 *   required: string[],
 * }>}
 */
const CHECKS = [
  {
    file: 'docs/alpha/00-alpha-guide.md',
    forbidden: [
      // Pre-09H stale claims removed in Phase 12A/12B
      'no tribe vault yet',
      'No tribe sharing: You cannot share Signals with tribe members yet',
      'No remote backup: All backups are manual export/import',
      // Would indicate the guide still describes an old state with no remote at all
      'There is no cloud sync, no cross-device sharing, and no tribe vault yet',
    ],
    required: [
      // Must explain tribe/officer exists locally
      'tribe',
      'officer',
      // Must acknowledge scout cell is locked
      'scout cell',
      // Must describe dev-auth remote push
      'dev-auth',
      // Must say remote push is not reliable backup
      'not a reliable backup',
    ],
  },
  {
    file: 'docs/alpha/01-alpha-release-readiness.md',
    forbidden: [
      // Would indicate readiness doc was overwritten with stale content
      'no tribe vault',
    ],
    required: [
      // Must have a gate status section
      'Gate Status',
      // Must label dev-auth constrained features
      'Dev-auth',
      // Must reference character token
      'character token',
    ],
  },
  {
    file: 'docs/alpha/04-risk-register.md',
    forbidden: [],
    required: [
      // Both Critical risks must be present
      'RISK-01',
      'RISK-02',
      // Must include the CI action item for dev-auth flags
      'AUTH_DEV_MODE=false',
    ],
  },
  {
    file: 'docs/backend/16-character-token-contract.md',
    forbidden: [],
    required: [
      // Hard invariants must be present
      'No background or automatic sync',
      'AUTH_DEV_MODE',
      'BLOCKED',
    ],
  },
];

let totalFailed = 0;

for (const check of CHECKS) {
  const filePath = join(ROOT, check.file);
  let content;
  try {
    content = await readFile(filePath, 'utf8');
  } catch {
    console.error(`❌ ${check.file}: file not found.`);
    totalFailed++;
    continue;
  }

  let fileFailed = false;

  const lower = content.toLowerCase();

  for (const phrase of check.forbidden) {
    if (lower.includes(phrase.toLowerCase())) {
      console.error(`❌ ${check.file}: contains stale phrase: "${phrase}"`);
      fileFailed = true;
    }
  }

  for (const phrase of check.required) {
    if (!lower.includes(phrase.toLowerCase())) {
      console.error(`❌ ${check.file}: missing required phrase: "${phrase}"`);
      fileFailed = true;
    }
  }

  if (!fileFailed) {
    console.log(`✅ ${check.file}: passes all phrase checks.`);
  } else {
    totalFailed++;
  }
}

if (totalFailed > 0) {
  console.error(`\n${totalFailed} doc file(s) failed consistency checks.`);
  console.error('Update the docs to reflect current implementation state before deploying.');
  process.exit(1);
}

console.log('\n✅ All alpha doc consistency checks passed.');
