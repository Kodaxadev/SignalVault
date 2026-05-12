import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../appEnv';
import { createChallenge } from './challengeStore';
import type { ChallengeResponse } from './challengeTypes';

const challengeRequestSchema = z.object({
  walletAddress: z.string().min(1, 'walletAddress is required'),
});

export const challengeRoutes = new Hono<AppEnv>();

challengeRoutes.post('/', async (c) => {
  const requestId = c.get('requestId');

  let body: unknown;
  try {
    body = await c.req.json<unknown>();
  } catch {
    return c.json({ code: 'validation_failed', message: 'Invalid JSON body', requestId }, 400);
  }

  const parsed = challengeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { code: 'validation_failed', message: 'walletAddress is required', requestId },
      400
    );
  }

  const challenge = await createChallenge(parsed.data.walletAddress);

  const response: ChallengeResponse = {
    challengeId: challenge.challengeId,
    message: challenge.message,
    expiresAt: challenge.expiresAt.toISOString(),
  };

  return c.json(response, 200);
});
