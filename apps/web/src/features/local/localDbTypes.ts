import type { Signal } from '@/features/signals/signalTypes';
import type { EntityClassificationClaim } from '@/features/entities/entityClassificationTypes';

export interface SignalRecord {
  id: string;
  signal: Signal;
  entityKey: string;
  createdAt: string;
}

export interface ClassificationRecord {
  id: string;
  claim: EntityClassificationClaim;
  entityKey: string;
  createdAt: string;
}

export type WorldApiCacheKind = 'solar_system' | 'tribe' | 'game_type';

export interface WorldApiCacheRecord<T = unknown> {
  key: string;
  kind: WorldApiCacheKind;
  data: T;
  fetchedAt: string;
  expiresAt: string;
  schemaVersion: 1;
}
