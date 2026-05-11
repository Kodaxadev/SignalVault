import { Hono } from 'hono';
import type { AppEnv } from '../appEnv';
import { parseAuthHeaders } from '../auth/parseAuthHeaders';
import { verifyAuthFromHeaders } from '../auth/verifyAuth';
import { checkPolicy } from '../policy/checkPolicy';
import { createSignalRequestSchema } from './signalValidation';
import { insertAuditEvent } from '../audit/insertAuditEvent';
import { dbEnv } from '../db/dbEnv';
import { insertSignal } from '../db/signalRepository';

export const signalRoutes = new Hono<AppEnv>();

// GET /api/v1/signals — read-only stub, returns empty list
signalRoutes.get('/', (c) => {
  return c.json({ signals: [], nextCursor: undefined });
});

// GET /api/v1/signals/:id — read-only stub, always 404 until DB reads are wired
signalRoutes.get('/:id', (c) => {
  return c.json(
    { code: 'signal_not_found', message: 'Signal not found', requestId: c.get('requestId') },
    404
  );
});

// POST /api/v1/signals — auth from HTTP headers; full guard pipeline; writes behind env gate
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
      actorTribeId: authResult.auth.tribeId,
      actorRoleSnapshot: {},
      targetSignalId: 'pending-create',
      newVisibility: signal.visibility,
      outcome: 'denied',
      denialReason: policyResult.reason,
      requestId,
      metadata: {},
      identitySource: authResult.auth.identitySource,
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
      authorWalletAddress: authResult.auth.walletAddress,
      authorTribeId: authResult.auth.tribeId ?? null,
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
    actorTribeId: authResult.auth.tribeId,
    actorRoleSnapshot: {},
    targetSignalId: inserted.id,
    newVisibility: signal.visibility,
    outcome: 'success',
    requestId,
    metadata: {},
    identitySource: authResult.auth.identitySource,
  });

  return c.json({ signalId: inserted.id, requestId }, 201);
});

// PATCH /api/v1/signals/:id — guarded stub; writes disabled
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

// DELETE /api/v1/signals/:id — guarded stub; writes disabled
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
