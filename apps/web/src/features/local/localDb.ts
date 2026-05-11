import Dexie, { type Table } from 'dexie';
import type { SignalRecord, ClassificationRecord, WorldApiCacheRecord } from './localDbTypes';

class SignalVaultDB extends Dexie {
  signals!: Table<SignalRecord, string>;
  classifications!: Table<ClassificationRecord, string>;
  worldApiCache!: Table<WorldApiCacheRecord, string>;

  constructor(databaseName: string) {
    super(databaseName);
    this.version(1).stores({
      signals: '&id, entityKey, createdAt',
      classifications: '&id, entityKey, createdAt',
    });
    this.version(2).stores({
      signals: '&id, entityKey, createdAt',
      classifications: '&id, entityKey, createdAt',
      worldApiCache: '&key, kind, expiresAt',
    });
  }
}

export const db = new SignalVaultDB('signal-vault');
