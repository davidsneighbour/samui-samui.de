import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseFrontmatter = z.object({
  description: z.string().optional(),
  slug: z.string().optional(),
  title: z.string(),
});

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/index.md' }),
  schema: baseFrontmatter
    .extend({
      date: z.coerce.date(),
      dsq_thread_id: z.array(z.union([z.string(), z.number()])).optional(),
      featured_image: z.string().optional(),
      lastmod: z.coerce.date().optional(),
      leute: z.array(z.string()).optional(),
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

export const collections = { leute, pages, posts, tags };
