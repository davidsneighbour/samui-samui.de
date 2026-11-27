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
      extent: z.enum(['partial', 'complete']).optional(),
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

/** Missing extent retains the original complete-relic exclusions. */
export function isCompleteRelic(
  review?:
    | { status?: string | undefined; extent?: string | undefined }
    | undefined,
): boolean {
  return review?.status === 'relic' && review.extent !== 'partial';
}

export function relicSearchValue(
  review?: RelicReview | undefined,
): 'false' | 'true' {
  if (review?.status !== 'relic') return 'false';
  return isCompleteRelic(review) ? 'true' : 'false';
}

/** Anniversary selection always needs an explicit editorial include. */
export function isAnniversaryEligible(post: {
  data: {
    relic?: RelicReview | undefined;
    curation?: { anniversary?: { status: string } | undefined } | undefined;
  };
}): boolean {
  return (
    !isCompleteRelic(post.data.relic) &&
    post.data.curation?.anniversary?.status === 'include'
  );
}
