import { WorldSolarSystemSchema, WorldSolarSystemListSchema } from './solarSystemSchemas';
import type { WorldApiResult } from '../worldApiTypes';
import { worldApiLoaded, worldApiUnavailable } from '../worldApiTypes';

export type SystemContext = {
  id: string;
  name: string;
  constellationId: string;
  regionId: string;
  connectedSystemIds: string[];
  raw?: unknown;
};

export function extractSolarSystem(raw: unknown): WorldApiResult<SystemContext> {
  const parsed = WorldSolarSystemSchema.safeParse(raw);
  if (!parsed.success) {
    return worldApiUnavailable('invalid response', undefined);
  }

  const d = parsed.data;
  return worldApiLoaded({
    id: String(d.id),
    name: d.name,
    constellationId: String(d.constellationId),
    regionId: String(d.regionId),
    connectedSystemIds: (d.gateLinks ?? []).map(String),
    raw,
  });
}

export function extractSolarSystemList(raw: unknown): WorldApiResult<SystemContext[]> {
  const parsed = WorldSolarSystemListSchema.safeParse(raw);
  if (!parsed.success) {
    return worldApiUnavailable('invalid response', undefined);
  }

  return worldApiLoaded(
    parsed.data.data.map((d) => ({
      id: String(d.id),
      name: d.name,
      constellationId: String(d.constellationId),
      regionId: String(d.regionId),
      connectedSystemIds: (d.gateLinks ?? []).map(String),
    })),
  );
}
