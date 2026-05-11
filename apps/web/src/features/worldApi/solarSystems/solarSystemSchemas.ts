import { z } from 'zod';

export const WorldSolarSystemLocationSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const WorldSolarSystemSchema = z.object({
  id: z.number(),
  name: z.string(),
  constellationId: z.number(),
  regionId: z.number(),
  location: WorldSolarSystemLocationSchema.optional(),
  gateLinks: z.array(z.number()).optional().default([]),
});

export const WorldSolarSystemListSchema = z.object({
  data: z.array(WorldSolarSystemSchema),
  metadata: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
});
