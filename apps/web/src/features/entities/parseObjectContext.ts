import type { EntityType, ObjectContext } from './entityTypes';

export function parseObjectContext(
  pathname: string,
  searchParams: URLSearchParams,
): ObjectContext {
  const tenant = searchParams.get('tenant') ?? undefined;
  const itemId = searchParams.get('itemId') ?? undefined;
  const typeHint = searchParams.get('type') as EntityType | null;

  // Path param: /ingame/object/:objectId
  const pathSegments = pathname.split('/').filter(Boolean);
  const objectId = pathSegments.length >= 3 ? pathSegments[2] : undefined;

  const entityType = typeHint ?? 'unknown';
  const confidence = typeHint ? 'url_hint' : 'unknown';

  return {
    objectId,
    tenant,
    itemId,
    entityType,
    confidence,
  };
}

export function hasObjectContext(ctx: ObjectContext): boolean {
  return !!(ctx.objectId || ctx.itemId || ctx.tenant);
}
