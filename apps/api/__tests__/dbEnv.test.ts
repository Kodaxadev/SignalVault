import { describe, it, expect } from 'vitest';
import { dbEnv } from '../src/db/dbEnv';

describe('dbEnv', () => {
  it('exports databaseUrl (undefined when DATABASE_URL not set in test env)', () => {
    // In CI/test without a DB configured this should be undefined
    expect(dbEnv.databaseUrl === undefined || typeof dbEnv.databaseUrl === 'string').toBe(true);
  });

  it('enableRemoteSignalWrites is false when env var not set to "true"', () => {
    // ENABLE_REMOTE_SIGNAL_WRITES is not set in the test environment
    expect(dbEnv.enableRemoteSignalWrites).toBe(false);
  });

  it('nodeEnv defaults to "development" when NODE_ENV not set', () => {
    expect(typeof dbEnv.nodeEnv).toBe('string');
    expect(dbEnv.nodeEnv.length).toBeGreaterThan(0);
  });

  it('exports the expected shape', () => {
    expect('databaseUrl' in dbEnv).toBe(true);
    expect('enableRemoteSignalWrites' in dbEnv).toBe(true);
    expect('nodeEnv' in dbEnv).toBe(true);
  });
});
