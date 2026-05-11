import { worldApiGet } from '../worldApiClient';
import type { WorldApiResult } from '../worldApiTypes';
import type { SystemContext } from './solarSystemExtractors';
import { extractSolarSystem, extractSolarSystemList } from './solarSystemExtractors';

export async function fetchSolarSystem(systemId: string): Promise<WorldApiResult<SystemContext>> {
  const result = await worldApiGet<unknown>(`/v2/solarsystems/${systemId}`);
  if (result.status === 'unavailable') return result;
  return extractSolarSystem(result.data);
}

export async function fetchSolarSystems(): Promise<WorldApiResult<SystemContext[]>> {
  const result = await worldApiGet<unknown>('/v2/solarsystems');
  if (result.status === 'unavailable') return result;
  return extractSolarSystemList(result.data);
}
