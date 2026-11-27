import { z } from 'zod';

export const relicReasons = [
  'missing-media',
  'missing-source',
  'lost-content',
  'obsolete-context',
  'other',
] as const;
const reviewed = z
  .union([z.iso.date(), z.date()])
  .transform((value) => new Date(value));
const note = z.string().trim().min(1).optional();
export const relicReviewSchema = z.discriminatedUnion('status', [
  z.object({ note, reviewed, status: z.literal('not-relic') }).strict(),
  z
    .object({
      note,
      reason: z.enum(relicReasons),
      reviewed,
      status: z.literal('relic'),
    })
    .strict(),
]);
export type RelicReview = z.infer<typeof relicReviewSchema>;
export function isRelic(post: {
  data: { relic?: RelicReview | undefined };
}): boolean {
  return post.data.relic?.status === 'relic';
}
export function isPromotable(post: {
  data: { relic?: RelicReview | undefined };
}): boolean {
  return !isRelic(post);
}
