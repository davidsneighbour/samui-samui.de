import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseFrontmatter = z.object({
  description: z.string().optional(),
  slug: z.string().optional(),
  title: z.string(),
});

// Repo-internal editorial metadata, never rendered on the site. `status` is a
// free-form string (e.g. "ok", "need-work") rather than an enum, since the
// values are just labels the `publisher` CLI script (src/scripts/publisher.ts)
// and whoever is triaging content agree on ad hoc -- extra keys beyond
// `status` are allowed for the same reason.
const publisherFrontmatter = z
  .object({
    status: z.string().optional(),
  })
  .catchall(z.union([z.string(), z.number(), z.boolean()]))
  .optional();

const curationStatus = z.enum(['include', 'exclude', 'review']);

const curationFrontmatter = z
  .object({
    anniversary: z
      .object({
        note: z.string().optional(),
        status: curationStatus,
      })
      .strict()
      .optional(),
  })
  .strict()
  .optional();

const legacyImageOverride = z.enum(['auto', 'always', 'never']);

const bundledCoverImageFrontmatter = z.object({
  alt: z.string().optional(),
  caption: z.string().optional(),
  // Per-image override for the legacy-image presentation system (see
  // src/utils/legacy-images/) -- takes precedence over the post-level
  // `legacyImages` frontmatter below.
  legacyPresentation: legacyImageOverride.optional(),
  src: z
    .string()
    .refine(
      (src) => src === '' || (!src.includes('/') && !src.includes('\\')),
      'Cover src must be a file name in the same folder as the post index.md.',
    ),
  // `title` is kept for existing image covers; use `caption` for new entries.
  title: z.string().optional(),
  type: z.literal('image'),
});

const bundledCoverVideoFrontmatter = z.object({
  autoload: z.boolean().optional(),
  autoplay: z.boolean().optional(),
  caption: z.string().optional(),
  hash: z.string().optional(),
  params: z.string().optional(),
  startAt: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(['youtube', 'vimeo']),
  video: z.union([z.string(), z.number()]),
});

const bundledCoverFrontmatter = z
  .discriminatedUnion('type', [
    bundledCoverImageFrontmatter,
    bundledCoverVideoFrontmatter,
  ])
  .optional();

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/index.md' }),
  schema: baseFrontmatter
    .extend({
      cover: bundledCoverFrontmatter,
      curation: curationFrontmatter,
      date: z.coerce.date(),
      dsq_thread_id: z.array(z.union([z.string(), z.number()])).optional(),
      featured_image: z.string().optional(),
      lastmod: z.coerce.date().optional(),
      // Post-level override for the legacy-image presentation system (see
      // src/utils/legacy-images/); defaults to automatic classification.
      legacyImages: legacyImageOverride.default('auto'),
      leute: z.array(z.string()).optional(),
      publisher: publisherFrontmatter,
      resources: z
        .array(
          z.object({
            name: z.string().optional(),
            src: z.string(),
            title: z.string().optional(),
          }),
        )
        .optional(),
      summary: z.string().optional(),
      tags: z.array(z.string()).optional(),
      url: z.string().optional(),
      video: z.string().optional(),
    })
    .passthrough(),
});

const leute = defineCollection({
  loader: glob({ base: './src/content/leute', pattern: '**/_index.md' }),
  schema: baseFrontmatter.extend({
    slug: z.string(),
  }),
});

const tags = defineCollection({
  loader: glob({ base: './src/content/tags', pattern: '**/_index.md' }),
  schema: baseFrontmatter.extend({
    slug: z.string(),
  }),
});

// A single standalone page (public holidays list), section-organized like
// leute/tags rather than a flat file, hence its own collection instead of
// living in `pages`.
const feiertage = defineCollection({
  loader: glob({ base: './src/content/feiertage', pattern: '**/_index.md' }),
  schema: baseFrontmatter.extend({
    date: z.coerce.date().optional(),
  }),
});

// Cross-page snippets consumed by other templates (e.g. the author-bio
// footer rendered on every post), never routed to their own page --
// mirrors Hugo's `_build: { render: never }` on these source files. Unlike
// posts' `featured_image` (an absolute /wp-content/... public/ path), this
// `image` is a genuine bundle-local file, hence the `image()` helper for
// automatic optimization.
const sitewide = defineCollection({
  loader: glob({ base: './src/content/sitewide', pattern: '**/index.md' }),
  schema: ({ image }) =>
    baseFrontmatter.extend({
      image: image().optional(),
      imagetitle: z.string().optional(),
      lastmod: z.coerce.date().optional(),
    }),
});

export const collections = { feiertage, leute, posts, sitewide, tags };
