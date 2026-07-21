import type { CollectionEntry } from 'astro:content';
import { humanize, slugify } from '@utils/slugify';

export interface ThemaGroup {
  slug: string;
  title: string;
  description: string;
  posts: CollectionEntry<'posts'>[];
}

export function getThemaSlug(
  thema: string,
  themaEntries: CollectionEntry<'themen'>[],
): string {
  const slug = slugify(thema);
  const entry = themaEntries.find((candidate) => {
    const keys = new Set(
      [candidate.id, slugify(candidate.data.title), candidate.data.slug].filter(
        (value): value is string => Boolean(value),
      ),
    );
    return keys.has(slug) || keys.has(thema);
  });

  return entry?.data.slug ?? slug;
}

/**
 * Groups posts by topic slug. The `themen` content collection supplies
 * optional metadata overrides; the real topic universe still comes from every
 * post's open `themen[]` list, slugified so inconsistent casing/separators for
 * the same term (e.g. "TAT"/"tat") collapse into one group.
 */
export function groupPostsByThema(
  posts: CollectionEntry<'posts'>[],
  themaEntries: CollectionEntry<'themen'>[],
): ThemaGroup[] {
  const overridesBySlug = new Map(
    themaEntries.flatMap((entry) => {
      const keys = new Set(
        [entry.id, slugify(entry.data.title), entry.data.slug].filter(
          (value): value is string => Boolean(value),
        ),
      );
      return [...keys].map((key) => [key, entry] as const);
    }),
  );

  const bySlug = new Map<
    string,
    { rawThema: string; posts: CollectionEntry<'posts'>[] }
  >();
  for (const post of posts) {
    for (const thema of post.data.themen ?? []) {
      const slug = slugify(thema);
      const group = bySlug.get(slug);
      if (group) {
        group.posts.push(post);
      } else {
        bySlug.set(slug, { posts: [post], rawThema: thema });
      }
    }
  }

  return [...bySlug.entries()].map(
    ([slug, { rawThema, posts: themaPosts }]) => {
      const override = overridesBySlug.get(slug);
      const title = override?.data.title ?? humanize(rawThema);
      return {
        description:
          override?.data.description ?? `Beiträge zum Thema ${title}`,
        posts: themaPosts,
        slug: getThemaSlug(rawThema, themaEntries),
        title,
      };
    },
  );
}
