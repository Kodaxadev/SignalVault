import { Pool, type PoolClient } from 'pg';
import { buildRlsPoolConfig } from './rlsDbConfig';

const poolConfig = buildRlsPoolConfig();
const pool = new Pool(poolConfig.config);
const runId = crypto.randomUUID();
const alpha = {
  characterId: `rls-alpha-${runId}`,
  wallet: `wallet-alpha-${runId}`,
  tribeId: `tribe-alpha-${runId}`,
};
const beta = {
  characterId: `rls-beta-${runId}`,
  wallet: `wallet-beta-${runId}`,
  tribeId: `tribe-beta-${runId}`,
};

const REQUIRED_RLS_TABLES = ['signals', 'audit_log'] as const;
const REQUIRED_POLICIES = [
  { tableName: 'signals', policyName: 'signal_read_scope' },
  { tableName: 'signals', policyName: 'signal_insert_auth' },
  { tableName: 'signals', policyName: 'signal_update_auth' },
  { tableName: 'signals', policyName: 'signal_delete_auth' },
  { tableName: 'audit_log', policyName: 'audit_append' },
  { tableName: 'audit_log', policyName: 'audit_read' },
] as const;
const REQUIRED_CONSTRAINTS = [
  {
    tableName: 'signals',
    constraintName: 'signals_identity_resolved_at_required_for_character',
  },
  {
    tableName: 'audit_log',
    constraintName: 'audit_identity_source_required_for_character',
  },
  {
    tableName: 'audit_log',
    constraintName: 'audit_identity_resolved_at_required_for_character',
  },
] as const;

try {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await verifyRlsSchemaPreflight(client);
    await verifyRls(client);
    await client.query('ROLLBACK');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}

async function verifyRls(client: PoolClient): Promise<void> {
  await setContext(client, alpha.characterId, alpha.tribeId);
  const tribeSignalId = await insertSignal(client, {
    characterId: alpha.characterId,
    wallet: alpha.wallet,
    tribeId: alpha.tribeId,
    visibility: 'tribe',
    title: 'RLS same-tribe probe',
  });

  await expectVisible(client, tribeSignalId, 'same tribe can read own tribe signal');

  await setContext(client, beta.characterId, beta.tribeId);
  await expectHidden(client, tribeSignalId, 'cross-tribe read is denied by RLS');

  await setContext(client, alpha.characterId, alpha.tribeId);
  await expectInsertDenied(
    client,
    {
      characterId: alpha.characterId,
      wallet: alpha.wallet,
      tribeId: beta.tribeId,
      visibility: 'tribe',
      title: 'Forged tribe probe',
    },
    'forged tribeId insert is denied'
  );

  await expectRawInsertDenied(
    client,
    'missing identity_resolved_at is denied',
    [
      alpha.characterId,
      alpha.wallet,
      alpha.tribeId,
      'public',
      'Missing snapshot probe',
      null,
    ]
  );

  await expectAuditDenied(client);
  await expectAuditAllowed(client);

  console.log('RLS verification passed');
}

async function verifyRlsSchemaPreflight(client: PoolClient): Promise<void> {
  const missing = [
    ...(await missingRlsEnabledTables(client)),
    ...(await missingPolicies(client)),
    ...(await missingConstraints(client)),
  ];

  if (missing.length > 0) {
    throw new Error(
      `RLS schema preflight failed. Missing or inactive: ${missing.join(', ')}`
    );
  }

  console.log('pass: RLS schema preflight');
}

async function missingRlsEnabledTables(client: PoolClient): Promise<string[]> {
  const result = await client.query<{ relname: string; relrowsecurity: boolean }>(
    `SELECT relname, relrowsecurity
     FROM pg_class
     WHERE relnamespace = 'public'::regnamespace
     AND relname = ANY($1)`,
    [REQUIRED_RLS_TABLES]
  );

  const enabled = new Set(
    result.rows
      .filter((row) => row.relrowsecurity)
      .map((row) => row.relname)
  );

  return REQUIRED_RLS_TABLES
    .filter((tableName) => !enabled.has(tableName))
    .map((tableName) => `${tableName}.rls_enabled`);
}

async function missingPolicies(client: PoolClient): Promise<string[]> {
  const tableNames = [...new Set(REQUIRED_POLICIES.map((policy) => policy.tableName))];
  const result = await client.query<{ tablename: string; policyname: string }>(
    `SELECT tablename, policyname
     FROM pg_policies
     WHERE schemaname = 'public'
     AND tablename = ANY($1)`,
    [tableNames]
  );

  const found = new Set(
    result.rows.map((row) => `${row.tablename}.${row.policyname}`)
  );

  return REQUIRED_POLICIES
    .filter((policy) => !found.has(`${policy.tableName}.${policy.policyName}`))
    .map((policy) => `${policy.tableName}.policy.${policy.policyName}`);
}

async function missingConstraints(client: PoolClient): Promise<string[]> {
  const tableNames = [...new Set(REQUIRED_CONSTRAINTS.map((item) => item.tableName))];
  const result = await client.query<{ table_name: string; constraint_name: string }>(
    `SELECT table_name, constraint_name
     FROM information_schema.table_constraints
     WHERE table_schema = 'public'
     AND table_name = ANY($1)`,
    [tableNames]
  );

  const found = new Set(
    result.rows.map((row) => `${row.table_name}.${row.constraint_name}`)
  );

  return REQUIRED_CONSTRAINTS
    .filter((item) => !found.has(`${item.tableName}.${item.constraintName}`))
    .map((item) => `${item.tableName}.constraint.${item.constraintName}`);
}

async function setContext(
  client: PoolClient,
  characterId: string,
  tribeId: string
): Promise<void> {
  await client.query(
    `SELECT
      set_config('app.current_character_id', $1, true),
      set_config('app.current_tribe_id', $2, true)`,
    [characterId, tribeId]
  );
}

type SignalInput = {
  characterId: string;
  wallet: string;
  tribeId: string | null;
  visibility: string;
  title: string;
};

async function insertSignal(client: PoolClient, input: SignalInput): Promise<string> {
  const result = await client.query<{ id: string }>(
    `INSERT INTO signals (
      author_character_id, author_character_name, author_wallet_address,
      author_tribe_id, visibility, signal_type, confidence, title, body,
      linked_entities, created_at, identity_resolved_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now())
    RETURNING id`,
    [
      input.characterId,
      'RLS Probe',
      input.wallet,
      input.tribeId,
      input.visibility,
      'field_note',
      'high',
      input.title,
      'RLS deployed-role verification probe.',
      '[]',
    ]
  );
  const row = result.rows[0];
  if (!row) throw new Error('Signal insert returned no id');
  return row.id;
}

async function expectVisible(
  client: PoolClient,
  id: string,
  label: string
): Promise<void> {
  const result = await client.query('SELECT id FROM signals WHERE id = $1', [id]);
  if (result.rows.length !== 1) throw new Error(`${label}: expected 1 row`);
  console.log(`pass: ${label}`);
}

async function expectHidden(
  client: PoolClient,
  id: string,
  label: string
): Promise<void> {
  const result = await client.query('SELECT id FROM signals WHERE id = $1', [id]);
  if (result.rows.length !== 0) throw new Error(`${label}: expected 0 rows`);
  console.log(`pass: ${label}`);
}

async function expectInsertDenied(
  client: PoolClient,
  input: SignalInput,
  label: string
): Promise<void> {
  await client.query('SAVEPOINT expected_denial');
  let denied = false;
  try {
    await insertSignal(client, input);
  } catch {
    denied = true;
    await client.query('ROLLBACK TO SAVEPOINT expected_denial');
  }
  if (!denied) throw new Error(`${label}: insert unexpectedly succeeded`);
  console.log(`pass: ${label}`);
}

async function expectRawInsertDenied(
  client: PoolClient,
  label: string,
  values: unknown[]
): Promise<void> {
  await client.query('SAVEPOINT expected_constraint_denial');
  let denied = false;
  try {
    await client.query(
      `INSERT INTO signals (
        author_character_id, author_wallet_address, author_tribe_id,
        visibility, signal_type, confidence, title, body, linked_entities,
        created_at, identity_resolved_at
      ) VALUES ($1,$2,$3,$4,'field_note','high',$5,'body','[]',now(),$6)`,
      values
    );
  } catch {
    denied = true;
    await client.query('ROLLBACK TO SAVEPOINT expected_constraint_denial');
  }
  if (!denied) throw new Error(`${label}: insert unexpectedly succeeded`);
  console.log(`pass: ${label}`);
}

async function expectAuditDenied(client: PoolClient): Promise<void> {
  await client.query('SAVEPOINT expected_audit_denial');
  let denied = false;
  try {
    await client.query(
      `INSERT INTO audit_log (
        event_type, actor_character_id, actor_wallet_address, actor_tribe_id,
        target_signal_id, outcome, request_id, created_at
      ) VALUES ('signal_created',$1,$2,$3,gen_random_uuid(),'denied',$4,now())`,
      [alpha.characterId, alpha.wallet, alpha.tribeId, runId]
    );
  } catch {
    denied = true;
    await client.query('ROLLBACK TO SAVEPOINT expected_audit_denial');
  }
  if (!denied) {
    throw new Error('audit identity_source constraint unexpectedly allowed insert');
  }
  console.log('pass: audit identity_source requirement is enforced');
}

async function expectAuditAllowed(client: PoolClient): Promise<void> {
  await client.query(
    `INSERT INTO audit_log (
      event_type, actor_character_id, actor_wallet_address, actor_tribe_id,
      target_signal_id, outcome, request_id, created_at, identity_source,
      identity_resolved_at
    ) VALUES ('signal_created',$1,$2,$3,gen_random_uuid(),'denied',$4,now(),
      'sui_player_profile',now())`,
    [alpha.characterId, alpha.wallet, alpha.tribeId, runId]
  );
  console.log('pass: audit insert with identity snapshot succeeds');
}
