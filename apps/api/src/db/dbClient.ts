import { Pool } from 'pg';
import { dbEnv } from './dbEnv';

let _pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!dbEnv.databaseUrl) return null;
  if (!_pool) {
    _pool = new Pool({ connectionString: dbEnv.databaseUrl });
  }
  return _pool;
}

export const db = {
  get isConnected(): boolean {
    return Boolean(dbEnv.databaseUrl);
  },

  async ping(): Promise<boolean> {
    const pool = getPool();
    if (!pool) return false;
    try {
      await pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  },
};
