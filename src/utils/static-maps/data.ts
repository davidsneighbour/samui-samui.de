import { z } from 'zod';
import { boundsSchema } from './schema.ts';

const position = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-85.051129).max(85.051129),
]);
export const datasetSchema = z.object({
  bounds: boundsSchema,
  features: z
    .array(
      z.object({
        geometry: z.object({
          coordinates: z.array(z.array(position).min(4)).min(1),
          type: z.literal('Polygon'),
        }),
        properties: z.object({ layer: z.literal('land') }),
        type: z.literal('Feature'),
      }),
    )
    .min(1),
  licence: z.literal('ODbL-1.0'),
  source: z.url(),
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
  supplement: z.object({ path: z.string(), sha256: z.string() }).optional(),
  type: z.literal('FeatureCollection'),
});
export type MapDataset = z.infer<typeof datasetSchema>;
