import { worldApiGet } from '../worldApiClient';
import type { WorldApiResult } from '../worldApiTypes';
import type { TribeContext } from './tribeExtractors';
import { extractTribe } from './tribeExtractors';

export async function fetchTribe(tribeId: string): Promise<WorldApiResult<TribeContext>> {
  const result = await worldApiGet<unknown>(`/v2/tribes/${tribeId}`);
  if (result.status === 'unavailable') return result;
  return extractTribe(result.data);
}
