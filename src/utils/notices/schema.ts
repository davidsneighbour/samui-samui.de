import { z } from 'zod';

// Restrained, muted-only variants -- see documentation/notices.md and
// DESIGN.md for the token mapping each one uses.
export const NOTICE_VARIANTS = [
  'note',
  'historical',
  'legal',
  'correction',
  'warning',
] as const;

export const noticeVariantSchema = z.enum(NOTICE_VARIANTS);

export type NoticeVariant = z.infer<typeof noticeVariantSchema>;

export const noticeDefinitionSchema = z.object({
  description: z.string().min(1, 'description must not be empty'),
  dismissible: z.boolean().optional(),
  icon: z.string().min(1, 'icon must not be empty'),
  title: z.string().min(1, 'title must not be empty'),
  variant: noticeVariantSchema.optional(),
});

export type NoticeDefinition = z.infer<typeof noticeDefinitionSchema>;

// Registry keys are the notice slugs referenced by `<Notice slug="...">`
// and `<dnb-notice slug="...">`.
export const noticeRegistrySchema = z.record(
  z.string(),
  noticeDefinitionSchema,
);

export type NoticeRegistry = z.infer<typeof noticeRegistrySchema>;
