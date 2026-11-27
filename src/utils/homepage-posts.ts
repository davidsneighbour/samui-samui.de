import type { CollectionEntry } from 'astro:content';
import { isPromotable } from './relic';

type PostEntry = CollectionEntry<'posts'>;

export function orderPostsForHomepage(posts: PostEntry[]): PostEntry[] {
  posts = posts.filter(isPromotable);
  const featuredIndex = posts.findIndex(
    (post) => post.data.options.featured !== false,
  );

  if (featuredIndex <= 0) return posts;

  const featuredPost = posts[featuredIndex];
  if (!featuredPost) return posts;

  return [
    featuredPost,
    ...posts.slice(0, featuredIndex),
    ...posts.slice(featuredIndex + 1),
  ];
}
