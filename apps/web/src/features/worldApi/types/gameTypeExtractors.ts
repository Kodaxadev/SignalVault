import { WorldGameTypeSchema, WorldGameTypeListSchema } from './gameTypeSchemas';
import type { WorldApiResult } from '../worldApiTypes';
import { worldApiLoaded, worldApiUnavailable } from '../worldApiTypes';

export type TypeContext = {
  id: string;
  name: string;
  description?: string;
  groupId?: string;
  groupName?: string;
  categoryId?: string;
  categoryName?: string;
};

export function extractGameType(raw: unknown): WorldApiResult<TypeContext> {
  const parsed = WorldGameTypeSchema.safeParse(raw);
  if (!parsed.success) {
    return worldApiUnavailable('invalid response', undefined);
  }

  const d = parsed.data;
  return worldApiLoaded({
    id: String(d.id),
    name: d.name,
    description: d.description,
    groupId: d.groupId != null ? String(d.groupId) : undefined,
    groupName: d.groupName,
    categoryId: d.categoryId != null ? String(d.categoryId) : undefined,
    categoryName: d.categoryName,
  });
}

export function extractGameTypeList(raw: unknown): WorldApiResult<TypeContext[]> {
  const parsed = WorldGameTypeListSchema.safeParse(raw);
  if (!parsed.success) {
    return worldApiUnavailable('invalid response', undefined);
  }

  return worldApiLoaded(
    parsed.data.data.map((d) => ({
      id: String(d.id),
      name: d.name,
      description: d.description,
      groupId: d.groupId != null ? String(d.groupId) : undefined,
      groupName: d.groupName,
      categoryId: d.categoryId != null ? String(d.categoryId) : undefined,
      categoryName: d.categoryName,
    })),
  );
}
