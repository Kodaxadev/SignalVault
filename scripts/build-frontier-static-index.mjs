import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_OUT = 'data/frontier/derived/frontier-static-index.json';

export function buildFrontierStaticIndex({ ecosystem, landscape, source = {} }) {
  const ecosystems = buildEcosystemIndex(ecosystem);
  const systems = {};
  const ecosystemUsage = new Map();
  const tagUsage = new Map();
  let beltGroupCount = 0;
  let trojanGroupCount = 0;
  let siteCount = 0;
  let missingEcosystemRefs = 0;

  for (const [systemId, system] of Object.entries(landscape)) {
    const summary = summarizeSystem(system, {
      ecosystems,
      ecosystemUsage,
      tagUsage,
    });

    beltGroupCount += summary.beltGroups;
    trojanGroupCount += summary.trojanGroups;
    siteCount += summary.siteCount;
    missingEcosystemRefs += summary.missingEcosystemRefs;

    systems[systemId] = {
      siteCount: summary.siteCount,
      beltGroups: summary.beltGroups,
      trojanGroups: summary.trojanGroups,
      dangerTaggedGroups: summary.dangerTaggedGroups,
      ecosystemIds: summary.ecosystemIds,
      tags: summary.tags,
    };
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: {
      ecosystem: source.ecosystem ?? 'ecosystem.json',
      landscape: source.landscape ?? 'landscape.json',
      provenance:
        source.provenance ??
        'user-provided EVE Frontier alpha client-mined data; Discord permission reported by user; public-doc provenance not independently confirmed',
    },
    stats: {
      ecosystemCount: Object.keys(ecosystems).length,
      systemCount: Object.keys(systems).length,
      beltGroupCount,
      trojanGroupCount,
      siteCount,
      missingEcosystemRefs,
      topTags: topEntries(tagUsage, 20),
      topEcosystems: topEntries(ecosystemUsage, 20).map(([id, count]) => ({
        id,
        count,
        name: ecosystems[id]?.name ?? null,
      })),
    },
    ecosystems,
    systems,
  };
}

export function buildEcosystemIndex(ecosystem) {
  return Object.fromEntries(
    Object.entries(ecosystem).map(([id, value]) => [
      id,
      {
        id,
        name: normalizeText(value.name),
        description: normalizeText(value.description),
        entryDungeonId: value.entryPattern?.dungeonID ?? null,
        naturalPatternCount: Array.isArray(value.naturalWorldPatterns)
          ? value.naturalWorldPatterns.length
          : 0,
        brokenPatternCount: Array.isArray(value.brokenWorldPatterns)
          ? value.brokenWorldPatterns.length
          : 0,
      },
    ])
  );
}

export function summarizeSystem(system, context) {
  const ecosystemIds = new Set();
  const tags = new Set();
  let beltGroups = 0;
  let trojanGroups = 0;
  let siteCount = 0;
  let dangerTaggedGroups = 0;
  let missingEcosystemRefs = 0;

  for (const groupName of ['asteroidBelts', 'trojans']) {
    const group = system[groupName] ?? {};
    if (groupName === 'asteroidBelts') beltGroups = Object.keys(group).length;
    if (groupName === 'trojans') trojanGroups = Object.keys(group).length;

    for (const siteGroup of Object.values(group)) {
      const groupTags = Array.isArray(siteGroup.tags) ? siteGroup.tags : [];
      if (groupTags.includes('non_zero_danger_level')) dangerTaggedGroups += 1;

      for (const tag of groupTags) {
        tags.add(tag);
        increment(context.tagUsage, tag);
      }

      for (const site of Object.values(siteGroup.sites ?? {})) {
        const ecosystemId = String(site.ecosystemID);
        siteCount += 1;
        ecosystemIds.add(ecosystemId);
        increment(context.ecosystemUsage, ecosystemId);
        if (!context.ecosystems[ecosystemId]) missingEcosystemRefs += 1;
      }
    }
  }

  return {
    siteCount,
    beltGroups,
    trojanGroups,
    dangerTaggedGroups,
    missingEcosystemRefs,
    ecosystemIds: [...ecosystemIds].sort(compareNumericStrings),
    tags: [...tags].sort(),
  };
}

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function compareNumericStrings(a, b) {
  return Number(a) - Number(b);
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function topEntries(map, limit) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.ecosystem || !options.landscape) {
    throw new Error(
      'Usage: node scripts/build-frontier-static-index.mjs --ecosystem <path> --landscape <path> [--out <path>]'
    );
  }

  const ecosystemPath = resolve(options.ecosystem);
  const landscapePath = resolve(options.landscape);
  const outPath = resolve(options.out ?? DEFAULT_OUT);

  const ecosystem = JSON.parse(await readFile(ecosystemPath, 'utf8'));
  const landscape = JSON.parse(await readFile(landscapePath, 'utf8'));
  const index = buildFrontierStaticIndex({
    ecosystem,
    landscape,
    source: {
      ecosystem: ecosystemPath,
      landscape: landscapePath,
      provenance: options.provenance,
    },
  });

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(index)}\n`, 'utf8');
  printSummary(index, outPath);
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
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

function printSummary(index, outPath) {
  console.log(`Wrote ${outPath}`);
  console.log(`Systems: ${index.stats.systemCount}`);
  console.log(`Sites: ${index.stats.siteCount}`);
  console.log(`Missing ecosystem refs: ${index.stats.missingEcosystemRefs}`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
