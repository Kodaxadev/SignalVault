import { z } from 'zod';

export const WorldTribeSchema = z.object({
  id: z.number(),
  name: z.string(),
  nameShort: z.string().optional(),
  description: z.string().optional(),
  taxRate: z.number().optional(),
  tribeUrl: z.string().optional(),
});

export const WorldTribeListSchema = z.object({
  data: z.array(WorldTribeSchema),
  metadata: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
});
