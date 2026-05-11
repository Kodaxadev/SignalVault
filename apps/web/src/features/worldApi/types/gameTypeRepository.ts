import { worldApiGet } from '../worldApiClient';
import type { WorldApiResult } from '../worldApiTypes';
import type { TypeContext } from './gameTypeExtractors';
import { extractGameType } from './gameTypeExtractors';

export async function fetchGameType(typeId: string): Promise<WorldApiResult<TypeContext>> {
  const result = await worldApiGet<unknown>(`/v2/types/${typeId}`);
  if (result.status === 'unavailable') return result;
  return extractGameType(result.data);
}
