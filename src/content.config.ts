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

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/index.md' }),
  schema: baseFrontmatter
    .extend({
      date: z.coerce.date(),
      dsq_thread_id: z.array(z.union([z.string(), z.number()])).optional(),
      featured_image: z.string().optional(),
      lastmod: z.coerce.date().optional(),
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

// Standalone top-level pages (kontakt, suche, datenschutzerklaerung) --
// intentionally non-recursive so it doesn't pick up the posts/leute/tags
// subdirectories, which are their own collections above.
const pages = defineCollection({
  loader: glob({ base: './src/content', pattern: '*.md' }),
  schema: baseFrontmatter
    .extend({
      lastmod: z.coerce.date().optional(),
    })
    .passthrough(),
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

export const collections = { feiertage, leute, pages, posts, sitewide, tags };
