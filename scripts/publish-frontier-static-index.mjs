import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_SOURCE = 'data/frontier/derived/frontier-static-index.json';
export const DEFAULT_DEST = 'apps/web/public/frontier-static-index.json';

export async function publishFrontierStaticIndex({
  source = DEFAULT_SOURCE,
  dest = DEFAULT_DEST,
} = {}) {
  const sourcePath = resolve(source);
  const destPath = resolve(dest);
  const raw = await readFile(sourcePath, 'utf8');
  const index = parseDeployableIndex(raw);

  validateDeployableIndex(index, raw);
  await mkdir(dirname(destPath), { recursive: true });
  await copyFile(sourcePath, destPath);

  return {
    sourcePath,
    destPath,
    systemCount: index.stats.systemCount,
    siteCount: index.stats.siteCount,
  };
}

export async function cleanPublishedFrontierStaticIndex({
  dest = DEFAULT_DEST,
} = {}) {
  const destPath = resolve(dest);
  await rm(destPath, { force: true });
  return { destPath };
}

export function parseDeployableIndex(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Frontier static index is not valid JSON.');
  }
}

export function validateDeployableIndex(index, raw = JSON.stringify(index)) {
  if (!index || typeof index !== 'object') {
    throw new Error('Frontier static index payload must be an object.');
  }

  if (index.schemaVersion !== 1) {
    throw new Error('Frontier static index schemaVersion must be 1.');
  }

  if (!index.stats || typeof index.stats.systemCount !== 'number' || typeof index.stats.siteCount !== 'number') {
    throw new Error('Frontier static index stats are missing.');
  }

  if (!index.systems || typeof index.systems !== 'object') {
    throw new Error('Frontier static index systems are missing.');
  }

  if (!index.ecosystems || typeof index.ecosystems !== 'object') {
    throw new Error('Frontier static index ecosystems are missing.');
  }

  if (raw.includes('"position"') || raw.includes('"planetID"') || raw.includes('"planetId"')) {
    throw new Error('Frontier static index appears to contain raw placement data.');
  }
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--clean') {
      options.clean = true;
      continue;
    }
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    options[key] = value;
    i += 1;
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.clean) {
    const result = await cleanPublishedFrontierStaticIndex({ dest: options.dest });
    console.log(`Removed ${result.destPath}`);
    return;
  }

  const result = await publishFrontierStaticIndex({
    source: options.source,
    dest: options.dest,
  });
  console.log(`Published ${result.destPath}`);
  console.log(`Systems: ${result.systemCount}`);
  console.log(`Sites: ${result.siteCount}`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
