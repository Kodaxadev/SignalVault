import { WorldTribeSchema, WorldTribeListSchema } from './tribeSchemas';
import type { WorldApiResult } from '../worldApiTypes';
import { worldApiLoaded, worldApiUnavailable } from '../worldApiTypes';

export type TribeContext = {
  id: string;
  name: string;
  nameShort?: string;
  description?: string;
};

export function extractTribe(raw: unknown): WorldApiResult<TribeContext> {
  const parsed = WorldTribeSchema.safeParse(raw);
  if (!parsed.success) {
    return worldApiUnavailable('invalid response', undefined);
  }

  const d = parsed.data;
  return worldApiLoaded({
    id: String(d.id),
    name: d.name,
    nameShort: d.nameShort,
    description: d.description,
  });
}

export function extractTribeList(raw: unknown): WorldApiResult<TribeContext[]> {
  const parsed = WorldTribeListSchema.safeParse(raw);
  if (!parsed.success) {
    return worldApiUnavailable('invalid response', undefined);
  }

  return worldApiLoaded(
    parsed.data.data.map((d) => ({
      id: String(d.id),
      name: d.name,
      nameShort: d.nameShort,
      description: d.description,
    })),
  );
}
