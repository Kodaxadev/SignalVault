import type {
  FrontierStaticIndex,
  FrontierSystemIntelSummary,
  FrontierSystemStaticIntel,
} from './frontierStaticTypes';

export const FRONTIER_STATIC_INDEX_PATH = '/frontier-static-index.json';

let cachedIndex: FrontierStaticIndex | null = null;

export function clearFrontierStaticIndexCache() {
  cachedIndex = null;
}

export function isFrontierStaticIndex(value: unknown): value is FrontierStaticIndex {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<FrontierStaticIndex>;
  return candidate.schemaVersion === 1
    && typeof candidate.generatedAt === 'string'
    && Boolean(candidate.source)
    && Boolean(candidate.stats)
    && Boolean(candidate.ecosystems)
    && Boolean(candidate.systems);
}

export async function fetchFrontierStaticIndex(
  fetcher: typeof fetch = fetch,
): Promise<FrontierStaticIndex> {
  if (cachedIndex) return cachedIndex;

  const response = await fetcher(FRONTIER_STATIC_INDEX_PATH, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Frontier static index unavailable (${response.status})`);
  }

  const payload: unknown = await response.json();
  if (!isFrontierStaticIndex(payload)) {
    throw new Error('Frontier static index schema is invalid');
  }

  cachedIndex = payload;
  return payload;
}

export function getFrontierSystemIntel(
  index: FrontierStaticIndex,
  systemId: string,
): FrontierSystemIntelSummary | null {
  const intel = index.systems[systemId];
  if (!intel) return null;

  return {
    ...intel,
    ecosystemNames: getEcosystemNames(index, intel),
  };
}

function getEcosystemNames(
  index: FrontierStaticIndex,
  intel: FrontierSystemStaticIntel,
) {
  return intel.ecosystemIds
    .map((id) => index.ecosystems[id]?.name)
    .filter((name): name is string => Boolean(name));
}
