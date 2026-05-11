import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url().optional(),
  VITE_GRAPHQL_URL: z.string().url().optional(),
  VITE_DEFAULT_TENANT: z.string().default('utopia'),
  VITE_WORLD_API_ENV: z.enum(['stillness', 'utopia']).default('utopia'),
  VITE_WORLD_API_BASE_URL: z.string().url().optional(),
  // Remote sync backend. Preflight checks this before attempting any network call.
  VITE_REMOTE_SYNC_URL: z.string().url().optional(),
  // Dev-only: enables mock credentials for remote sync alpha testing.
  // Never set in production — dev auth is not production auth.
  VITE_REMOTE_DEV_AUTH: z.enum(['true', 'false']).optional(),
  VITE_REMOTE_DEV_CHARACTER_JWT: z.string().optional(),
  VITE_REMOTE_DEV_WALLET_SIGNATURE: z.string().optional(),
  VITE_REMOTE_DEV_WALLET_ADDRESS: z.string().optional(),
  VITE_REMOTE_DEV_SIGNATURE_MESSAGE: z.string().optional(),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(import.meta.env);
