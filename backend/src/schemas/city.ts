import { z } from 'zod';

export const CitySchema = z.object({
  id: z.number(),
  name: z.string(),
  state: z.string(),
  country: z.string(),
  coord: z.object({
    lon: z.number(),
    lat: z.number(),
  }),
});

export const CityListSchema = z.array(CitySchema);

export const CitiesQuerySchema = z.object({
  q: z.string().optional().default(''),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(300).optional().default(20),
});

export const NearestQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export type City = z.infer<typeof CitySchema>;
