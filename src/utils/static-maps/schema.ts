import { z } from 'zod';

export const coordinatesSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict();
export const boundsSchema = z
  .object({
    bottomRight: coordinatesSchema,
    topLeft: coordinatesSchema,
  })
  .strict()
  .superRefine((bounds, ctx) => {
    if (
      bounds.topLeft.latitude <= bounds.bottomRight.latitude ||
      bounds.topLeft.longitude >= bounds.bottomRight.longitude
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Bounds must run north-west to south-east.',
      });
    }
  });
const idSchema = z.string().regex(/^[a-z][a-z0-9-]*$/);
export const staticMapSchema = z
  .object({
    alt: z.string().trim().min(1),
    bounds: boundsSchema,
    caption: z.string().trim().min(1).optional(),
    id: idSchema,
    image: z
      .string()
      .regex(
        /^[a-zA-Z0-9][a-zA-Z0-9_-]*\.webp$/,
        'Use a bundle-local WebP filename without paths or dot segments.',
      ),
    points: z
      .array(
        z
          .object({
            coordinates: coordinatesSchema,
            id: idSchema,
            label: z
              .union([z.string().trim().min(1), z.literal(false)])
              .optional(),
            marker: z
              .object({ type: z.enum(['place', 'route-anchor']) })
              .strict()
              .optional(),
            title: z.string().trim().min(1),
          })
          .strict(),
      )
      .min(1),
    routes: z
      .array(z.object({ points: z.array(idSchema).min(2) }).strict())
      .default([]),
    size: z
      .object({
        height: z.number().int().min(64).max(4096),
        width: z.number().int().min(64).max(4096),
      })
      .strict()
      .default({ height: 630, width: 1200 }),
  })
  .strict()
  .superRefine((map, ctx) => {
    const ids = new Set<string>();
    for (const point of map.points) {
      if (ids.has(point.id))
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate point: ${point.id}`,
        });
      ids.add(point.id);
      const { latitude, longitude } = point.coordinates;
      if (
        latitude > map.bounds.topLeft.latitude ||
        latitude < map.bounds.bottomRight.latitude ||
        longitude < map.bounds.topLeft.longitude ||
        longitude > map.bounds.bottomRight.longitude
      ) {
        ctx.addIssue({
          code: 'custom',
          message: `Point outside bounds: ${point.id}`,
        });
      }
    }
    for (const route of map.routes)
      for (const id of route.points) {
        if (!ids.has(id))
          ctx.addIssue({
            code: 'custom',
            message: `Unknown route point: ${id}`,
          });
      }
  });
export const staticMapsSchema = z
  .array(staticMapSchema)
  .superRefine((maps, ctx) => {
    for (const key of ['id', 'image'] as const) {
      if (new Set(maps.map((map) => map[key])).size !== maps.length)
        ctx.addIssue({
          code: 'custom',
          message: `Map ${key} values must be unique.`,
        });
    }
  });
export type StaticMap = z.infer<typeof staticMapSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
