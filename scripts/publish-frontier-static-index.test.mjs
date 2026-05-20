import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  cleanPublishedFrontierStaticIndex,
  publishFrontierStaticIndex,
  validateDeployableIndex,
} from './publish-frontier-static-index.mjs';

let tempDir;

const VALID_INDEX = {
  schemaVersion: 1,
  generatedAt: '2026-05-19T00:00:00.000Z',
  source: {
    ecosystem: 'ecosystem.json',
    landscape: 'landscape.json',
    provenance: 'fixture',
  },
  stats: {
    ecosystemCount: 1,
    systemCount: 1,
    beltGroupCount: 1,
    trojanGroupCount: 1,
    siteCount: 2,
    missingEcosystemRefs: 0,
    topTags: [],
    topEcosystems: [],
  },
  ecosystems: {
    12: { id: '12', name: 'Garden' },
  },
  systems: {
    30000012: {
      siteCount: 2,
      beltGroups: 1,
      trojanGroups: 1,
      dangerTaggedGroups: 1,
      ecosystemIds: ['12'],
      tags: ['belt'],
    },
  },
};

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'signal-vault-static-index-'));
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe('publishFrontierStaticIndex', () => {
  it('validates and copies the compact generated index', async () => {
    const source = join(tempDir, 'derived.json');
    const dest = join(tempDir, 'public', 'frontier-static-index.json');
    await writeFile(source, `${JSON.stringify(VALID_INDEX)}\n`, 'utf8');

    const result = await publishFrontierStaticIndex({ source, dest });

    assert.equal(result.systemCount, 1);
    assert.equal(result.siteCount, 2);
    assert.deepEqual(JSON.parse(await readFile(dest, 'utf8')), VALID_INDEX);
  });

  it('fails when the source file is missing', async () => {
    await assert.rejects(
      () => publishFrontierStaticIndex({
        source: join(tempDir, 'missing.json'),
        dest: join(tempDir, 'public', 'frontier-static-index.json'),
      }),
      /ENOENT/,
    );
  });

  it('rejects malformed JSON before publishing', async () => {
    const source = join(tempDir, 'bad.json');
    await writeFile(source, '{bad', 'utf8');

    await assert.rejects(
      () => publishFrontierStaticIndex({
        source,
        dest: join(tempDir, 'public', 'frontier-static-index.json'),
      }),
      /valid JSON/,
    );
  });

  it('rejects raw placement fields', () => {
    assert.throws(
      () => validateDeployableIndex(VALID_INDEX, '{"position":{"x":1}}'),
      /raw placement/,
    );
  });

  it('cleans a published static index', async () => {
    const dest = join(tempDir, 'public', 'frontier-static-index.json');
    await mkdir(join(tempDir, 'public'), { recursive: true });
    await writeFile(dest, '{}', 'utf8');

    await cleanPublishedFrontierStaticIndex({ dest });

    await assert.rejects(() => readFile(dest, 'utf8'), /ENOENT/);
  });
});
