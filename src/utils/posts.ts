import type { CollectionEntry } from 'astro:content';
import { getPostDateParts } from '@utils/dates';

/**
 * The canonical URL for a post, matching the Hugo site's permalink scheme
 * (`/:year/:month/:slug/`). Most posts carry an explicit `url` front matter
 * field preserved from the Hugo/WordPress migration; a handful of newer
 * posts don't, so fall back to computing it from `date` and the post's folder
 * slug. Collection IDs for bundled `index.md` entries can include a trailing
 * `/index`, so strip that before reading the slug segment.
 */
export function getPostUrl(post: CollectionEntry<'posts'>): string {
  if (post.data.url) {
    const url = post.data.url.trim();
    return url.endsWith('/') ? url : `${url}/`;
  }
  const id = post.id.replace(/\/index$/, '');
  const slug = post.data['slug'] ?? id.split('/').pop() ?? id;
  const { monthPadded, year } = getPostDateParts(post.data.date);
  return `/${year}/${monthPadded}/${slug}/`;
}
