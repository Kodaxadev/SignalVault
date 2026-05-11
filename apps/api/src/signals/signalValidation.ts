import { z } from 'zod';

const REMOTE_VISIBILITY = ['tribe', 'officer', 'scout_cell', 'public', 'private'] as const;

export const createSignalPayloadSchema = z.object({
  visibility: z.enum(REMOTE_VISIBILITY),
  signalType: z.string().min(1).max(100),
  confidence: z.string().min(1).max(50),
  title: z.string().min(1).max(500),
  body: z.string().min(1).max(10_000),
  linkedEntities: z.array(z.unknown()).max(20),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

// Auth is supplied via HTTP headers (Authorization, X-Wallet-Signature, etc.).
// The request body carries only the signal payload.
export const createSignalRequestSchema = z.object({
  signal: createSignalPayloadSchema,
});

export type ValidatedCreateSignalRequest = z.infer<typeof createSignalRequestSchema>;
