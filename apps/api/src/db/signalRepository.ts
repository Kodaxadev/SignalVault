import { getPool } from './dbClient';

export interface DbSignalRow {
  id: string;
  author_character_id: string | null;
  author_wallet_address: string;
  author_tribe_id: string | null;
  visibility: string;
  signal_type: string;
  confidence: string;
  title: string;
  body: string;
  linked_entities: unknown;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export async function findSignalById(id: string): Promise<DbSignalRow | null> {
  const pool = getPool();
  if (!pool) return null;
  const result = await pool.query<DbSignalRow>(
    'SELECT * FROM signals WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function listSignals(): Promise<DbSignalRow[]> {
  const pool = getPool();
  if (!pool) return [];
  const result = await pool.query<DbSignalRow>(
    'SELECT * FROM signals ORDER BY created_at DESC LIMIT 50'
  );
  return result.rows;
}

export interface DbInsertSignalInput {
  authorCharacterId: string | null;
  authorWalletAddress: string;
  authorTribeId: string | null;
  visibility: string;
  signalType: string;
  confidence: string;
  title: string;
  body: string;
  linkedEntities: unknown[];
  createdAt: string;
  expiresAt?: string;
}

const INSERT_SIGNAL_SQL = `
  INSERT INTO signals (
    author_character_id, author_wallet_address, author_tribe_id,
    visibility, signal_type, confidence, title, body, linked_entities,
    created_at, expires_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING *
`;

export function buildInsertSignalValues(input: DbInsertSignalInput): unknown[] {
  return [
    input.authorCharacterId ?? null,
    input.authorWalletAddress,
    input.authorTribeId ?? null,
    input.visibility,
    input.signalType,
    input.confidence,
    input.title,
    input.body,
    JSON.stringify(input.linkedEntities),
    input.createdAt,
    input.expiresAt ?? null,
  ];
}

export async function insertSignal(input: DbInsertSignalInput): Promise<DbSignalRow> {
  const pool = getPool();
  if (!pool) throw new Error('No database connection');
  const result = await pool.query<DbSignalRow>(
    INSERT_SIGNAL_SQL,
    buildInsertSignalValues(input)
  );
  const row = result.rows[0];
  if (!row) throw new Error('Signal INSERT returned no rows');
  return row;
}
