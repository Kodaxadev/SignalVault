export type EntityType =
  | 'smart_gate'
  | 'smart_storage_unit'
  | 'smart_turret'
  | 'network_node'
  | 'character'
  | 'tribe'
  | 'system'
  | 'route'
  | 'market'
  | 'item'
  | 'unknown';

export type ResolutionConfidence =
  | 'url_hint'
  | 'manual'
  | 'cached'
  | 'indexed'
  | 'onchain_verified'
  | 'conflicted'
  | 'unknown';

export interface ObjectContext {
  objectId?: string;
  tenant?: string;
  itemId?: string;
  entityType: EntityType;
  confidence: ResolutionConfidence;
}
