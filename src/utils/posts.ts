import type { CollectionEntry } from 'astro:content';

/**
 * The canonical URL for a post, matching the Hugo site's permalink scheme
 * (`/:year/:month/:slug/`). Most posts carry an explicit `url` front matter
 * field preserved from the Hugo/WordPress migration; a handful of newer
 * posts don't, so fall back to computing it from `date` (all fallback
 * candidates were verified same-calendar-day in UTC vs. their original
 * +07:00 timestamps, so UTC components are safe here).
 */
export function getPostUrl(post: CollectionEntry<'posts'>): string {
  if (post.data.url) {
    const url = post.data.url.trim();
    return url.endsWith('/') ? url : `${url}/`;
  }
  const slug = post.data.slug ?? post.id.split('/').pop() ?? post.id;
  const year = post.data.date.getUTCFullYear();
  const month = String(post.data.date.getUTCMonth() + 1).padStart(2, '0');
  return `/${year}/${month}/${slug}/`;
}
