import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

function taxonomyEntryId(entry: string): string {
  return entry
    .replace(/\\/g, '/')
    .replace(/\/_index\.md$/, '')
    .replace(/\/index\.md$/, '')
    .replace(/\.md$/, '');
}

const baseFrontmatter = z.object({
  description: z.string().optional(),
  title: z.string(),
});

const entityFrontmatter = baseFrontmatter.extend({
  aliases: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  noindex: z.boolean().default(false),
});

const taxonomyLoader = (base: string) =>
  glob({
    base,
    generateId: ({ entry }) => taxonomyEntryId(entry),
    pattern: '**/_index.md',
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

const postOptionsFrontmatter = z
  .object({
    featured: z.boolean().default(true),
  })
  .strict()
  .default({ featured: true });

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
      ereignisse: z.array(reference('ereignisse')).default([]),
      featured_image: z.string().optional(),
      feiertage: z.array(reference('feiertage')).default([]),
      lastmod: z.coerce.date().optional(),
      // Post-level override for the legacy-image presentation system (see
      // src/utils/legacy-images/); defaults to automatic classification.
      legacyImages: legacyImageOverride.default('auto'),
      leute: z.array(reference('leute')).default([]),
      options: postOptionsFrontmatter,
      orte: z.array(reference('orte')).default([]),
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
      themen: z.array(z.string()).default([]),
      url: z.string().optional(),
      video: z.string().optional(),
    })
    .loose(),
});

const leute = defineCollection({
  loader: taxonomyLoader('./src/content/leute'),
  schema: entityFrontmatter.extend({
    born: z.coerce.date().optional(),
    died: z.coerce.date().optional(),
    image: z.string().optional(),
    // Short descriptor shown as a tooltip by the `<dnb-person>`/`<PersonLink>`
    // taxonomy link (issue #1672), e.g. a person's role. Optional and not
    // rendered anywhere else -- do not invent one for an entry that doesn't
    // already have a well-established descriptor (see AGENTS.md's taxonomy
    // rules on not inventing facts).
    subtitle: z.string().optional(),
  }),
});

const ortType = z.enum([
  'land',
  'provinz',
  'bezirk',
  'insel',
  'stadt',
  'dorf',
  'stadtteil',
  'strand',
  'sehenswuerdigkeit',
  'gebaeude',
  'veranstaltungsort',
  'naturraum',
  'sonstiges',
]);

const orte = defineCollection({
  loader: taxonomyLoader('./src/content/orte'),
  schema: entityFrontmatter.extend({
    coordinates: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .strict()
      .optional(),
    parent: reference('orte').optional(),
    type: ortType.optional(),
  }),
});

const ereignisType = z.enum([
  'politisches-ereignis',
  'wahl',
  'militaerputsch',
  'naturkatastrophe',
  'festival',
  'feiertag',
  'kulturelles-ereignis',
  'historisches-ereignis',
  'persoenliches-ereignis',
  'sonstiges',
]);

const ereignisse = defineCollection({
  loader: taxonomyLoader('./src/content/ereignisse'),
  schema: baseFrontmatter
    .extend({
      aliases: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      endDate: z.coerce.date().optional(),
      leute: z.array(reference('leute')).default([]),
      noindex: z.boolean().default(false),
      orte: z.array(reference('orte')).default([]),
      recurring: z.boolean().default(false),
      startDate: z.coerce.date().optional(),
      type: ereignisType.optional(),
    })
    .superRefine((data, context) => {
      if (
        data.startDate &&
        data.endDate &&
        data.endDate.valueOf() < data.startDate.valueOf()
      ) {
        context.addIssue({
          code: 'custom',
          message:
            'Das Ende eines Ereignisses darf nicht vor dem Start liegen.',
          path: ['endDate'],
        });
      }
    }),
});

const themen = defineCollection({
  loader: taxonomyLoader('./src/content/themen'),
  schema: baseFrontmatter.extend({
    aliases: z.array(z.string()).default([]),
    slug: z.string().optional(),
  }),
});

// A single standalone page (public holidays list), section-organized like
// leute/themen rather than a flat file, hence its own collection instead of
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

export const collections = {
  ereignisse,
  feiertage,
  leute,
  orte,
  posts,
  sitewide,
  themen,
};
