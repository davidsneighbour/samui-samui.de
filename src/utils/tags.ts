import type { CollectionEntry } from 'astro:content';
import { humanize, slugify } from '@utils/slugify';

export interface TagGroup {
  slug: string;
  title: string;
  description: string;
  posts: CollectionEntry<'posts'>[];
}

/**
 * Groups posts by tag slug, the same way for every tag-driven page. The
 * `tags` content collection only supplies an optional title/description/slug
 * override per term (Hugo taxonomy carry-over) -- the real tag universe comes
 * from every post's `tags[]`, slugified so inconsistent casing/separators for
 * the same term (e.g. "TAT"/"tat") collapse into one group instead of
 * colliding pages.
 */
export function groupPostsByTag(
  posts: CollectionEntry<'posts'>[],
  tagEntries: CollectionEntry<'tags'>[],
): TagGroup[] {
  const overridesBySlug = new Map(
    tagEntries.map((entry) => [slugify(entry.data.title), entry]),
  );

  const bySlug = new Map<
    string,
    { rawTag: string; posts: CollectionEntry<'posts'>[] }
  >();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      const slug = slugify(tag);
      const group = bySlug.get(slug);
      if (group) {
        group.posts.push(post);
      } else {
        bySlug.set(slug, { posts: [post], rawTag: tag });
      }
    }
  }

  return [...bySlug.entries()].map(([slug, { rawTag, posts: tagPosts }]) => {
    const override = overridesBySlug.get(slug);
    const title = humanize(override?.data.title ?? rawTag);
    return {
      description: override?.data.description ?? `Beiträge zum Thema ${title}`,
      posts: tagPosts,
      slug: override?.data.slug ?? slug,
      title,
    };
  });
}
