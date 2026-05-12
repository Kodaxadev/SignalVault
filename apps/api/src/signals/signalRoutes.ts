import { Hono } from 'hono';
import type { AppEnv } from '../appEnv';
import { parseAuthHeaders } from '../auth/parseAuthHeaders';
import { verifyAuthFromHeaders } from '../auth/verifyAuth';
import { checkPolicy } from '../policy/checkPolicy';
import { createSignalRequestSchema } from './signalValidation';
import { insertAuditEvent } from '../audit/insertAuditEvent';
import { dbEnv } from '../db/dbEnv';
import { findSignalById, insertSignal, listSignals } from '../db/signalRepository';
import type { DbSignalRow, DbViewerContext } from '../db/signalRepository';

export const signalRoutes = new Hono<AppEnv>();

function rowToSignal(row: DbSignalRow) {
  return {
    id: row.id,
    authorCharacterId: row.author_character_id,
    authorCharacterName: row.author_character_name,
    authorWalletAddress: row.author_wallet_address,
    authorTribeId: row.author_tribe_id,
    identityResolvedAt: row.identity_resolved_at,
    visibility: row.visibility,
    signalType: row.signal_type,
    confidence: row.confidence,
    title: row.title,
    body: row.body,
    linkedEntities: row.linked_entities,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  };
}

function hasAuthHeaders(headers: Headers): boolean {
  return Boolean(
    headers.get('authorization')
    || headers.get('x-wallet-signature')
    || headers.get('x-challenge-id')
  );
}

async function resolveReadViewer(headers: Headers): Promise<
  | { ok: true; viewer: DbViewerContext }
  | { ok: false; reason: string }
> {
  if (!hasAuthHeaders(headers)) {
    return { ok: true, viewer: { characterId: null, tribeId: null } };
  }

  const authResult = await verifyAuthFromHeaders(parseAuthHeaders(headers));
  if (!authResult.ok) return { ok: false, reason: authResult.reason };
  return {
    ok: true,
    viewer: {
      characterId: authResult.auth.characterId ?? null,
      tribeId: authResult.auth.tribeId ?? null,
    },
  };
}

signalRoutes.get('/', async (c) => {
  const requestId = c.get('requestId');
  const viewerResult = await resolveReadViewer(c.req.raw.headers);
  if (!viewerResult.ok) {
    return c.json({ code: viewerResult.reason, message: 'Authentication failed', requestId }, 401);
  }

  try {
    const rows = await listSignals(viewerResult.viewer);
    return c.json({ signals: rows.map(rowToSignal), nextCursor: undefined });
  } catch {
    return c.json({ code: 'server_error', message: 'Signal read failed', requestId }, 503);
  }
});

signalRoutes.get('/:id', async (c) => {
  const requestId = c.get('requestId');
  const viewerResult = await resolveReadViewer(c.req.raw.headers);
  if (!viewerResult.ok) {
    return c.json({ code: viewerResult.reason, message: 'Authentication failed', requestId }, 401);
  }

  try {
    const row = await findSignalById(c.req.param('id'), viewerResult.viewer);
    if (!row) {
      return c.json(
        { code: 'signal_not_found', message: 'Signal not found', requestId },
        404
      );
    }
    return c.json({ signal: rowToSignal(row), requestId });
  } catch {
    return c.json({ code: 'server_error', message: 'Signal read failed', requestId }, 503);
  }
});

signalRoutes.post('/', async (c) => {
  const requestId = c.get('requestId');

  let body: unknown;
  try {
    body = await c.req.json<unknown>();
  } catch {
    return c.json({ code: 'validation_failed', message: 'Invalid JSON body', requestId }, 400);
  }

  const parsed = createSignalRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { code: 'validation_failed', message: 'Request validation failed', requestId },
      400
    );
  }

  const { signal } = parsed.data;
  const authResult = await verifyAuthFromHeaders(parseAuthHeaders(c.req.raw.headers));
  if (!authResult.ok) {
    return c.json({ code: authResult.reason, message: 'Authentication failed', requestId }, 401);
  }

  const policyResult = checkPolicy({
    walletAddress: authResult.auth.walletAddress,
    characterId: authResult.auth.characterId,
    tribeId: authResult.auth.tribeId,
    requestedVisibility: signal.visibility,
    operation: 'create',
  });

  if (!policyResult.allowed) {
    await insertAuditEvent({
      eventType: 'signal_created',
      actorWalletAddress: authResult.auth.walletAddress,
      actorCharacterId: authResult.auth.characterId,
      actorCharacterName: authResult.auth.characterName,
      actorTribeId: authResult.auth.tribeId,
      actorRoleSnapshot: {},
      targetSignalId: 'pending-create',
      newVisibility: signal.visibility,
      outcome: 'denied',
      denialReason: policyResult.reason,
      requestId,
      metadata: {},
      identitySource: authResult.auth.identitySource,
      identityResolvedAt: authResult.auth.identityResolvedAt,
    });
    return c.json(
      { code: policyResult.reason, message: 'Policy check denied', requestId },
      403
    );
  }

  if (!dbEnv.enableRemoteSignalWrites) {
    return c.json(
      {
        code: 'server_error',
        message: 'Remote signal writes disabled (ENABLE_REMOTE_SIGNAL_WRITES=false)',
        requestId,
      },
      503
    );
  }

  let inserted: Awaited<ReturnType<typeof insertSignal>>;
  try {
    inserted = await insertSignal({
      authorCharacterId: authResult.auth.characterId ?? null,
      authorCharacterName: authResult.auth.characterName ?? null,
      authorWalletAddress: authResult.auth.walletAddress,
      authorTribeId: authResult.auth.tribeId ?? null,
      identityResolvedAt: authResult.auth.identityResolvedAt ?? null,
      visibility: signal.visibility,
      signalType: signal.signalType,
      confidence: signal.confidence,
      title: signal.title,
      body: signal.body,
      linkedEntities: signal.linkedEntities,
      createdAt: signal.createdAt,
      expiresAt: signal.expiresAt,
    });
  } catch {
    return c.json(
      { code: 'server_error', message: 'Signal write failed', requestId },
      503
    );
  }

  await insertAuditEvent({
    eventType: 'signal_created',
    actorWalletAddress: authResult.auth.walletAddress,
    actorCharacterId: authResult.auth.characterId,
    actorCharacterName: authResult.auth.characterName,
    actorTribeId: authResult.auth.tribeId,
    actorRoleSnapshot: {},
    targetSignalId: inserted.id,
    newVisibility: signal.visibility,
    outcome: 'success',
    requestId,
    metadata: {},
    identitySource: authResult.auth.identitySource,
    identityResolvedAt: authResult.auth.identityResolvedAt,
  });

  return c.json({ signalId: inserted.id, requestId }, 201);
});

signalRoutes.patch('/:id', (c) => {
  return c.json(
    {
      code: 'server_error',
      message: 'Remote signal updates not enabled in this phase',
      requestId: c.get('requestId'),
    },
    503
  );
});

signalRoutes.delete('/:id', (c) => {
  return c.json(
    {
      code: 'server_error',
      message: 'Remote signal deletion not enabled in this phase',
      requestId: c.get('requestId'),
    },
    503
  );
});
