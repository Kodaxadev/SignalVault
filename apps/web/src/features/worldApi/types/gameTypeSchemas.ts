import { z } from 'zod';

export const WorldGameTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  groupId: z.number().optional(),
  groupName: z.string().optional(),
  categoryId: z.number().optional(),
  categoryName: z.string().optional(),
  iconUrl: z.string().optional(),
  mass: z.number().optional(),
  volume: z.number().optional(),
  portionSize: z.number().optional(),
});

export const WorldGameTypeListSchema = z.object({
  data: z.array(WorldGameTypeSchema),
  metadata: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
});
