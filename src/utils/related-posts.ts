import type { CollectionEntry } from 'astro:content';
import { getReferenceId } from './taxonomies/entities';

type Post = CollectionEntry<'posts'>;
const weights = { ereignisse: 4, orte: 2, personen: 3, themen: 1 } as const;

function keys(post: Post): Map<string, number> {
  const result = new Map<string, number>();
  for (const taxonomy of Object.keys(weights) as (keyof typeof weights)[]) {
    for (const reference of post.data[taxonomy] ?? []) {
      result.set(`${taxonomy}:${getReferenceId(reference)}`, weights[taxonomy]);
    }
  }
  return result;
}

/** Build once per route generation; only score candidates sharing a taxonomy. */
export function createRelatedPostLookup(posts: Post[]): (post: Post) => Post[] {
  const index = new Map<string, Set<Post>>();
  for (const post of posts) {
    for (const key of keys(post).keys()) {
      const bucket = index.get(key) ?? new Set<Post>();
      bucket.add(post);
      index.set(key, bucket);
    }
  }
  return (post) => {
    const scores = new Map<Post, number>();
    for (const [key, weight] of keys(post)) {
      for (const candidate of index.get(key) ?? []) {
        if (candidate.id === post.id) continue;
        scores.set(candidate, (scores.get(candidate) ?? 0) + weight);
      }
    }
    return [...scores]
      .sort(
        ([a, aScore], [b, bScore]) =>
          bScore - aScore ||
          b.data.date.valueOf() - a.data.date.valueOf() ||
          (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
      )
      .slice(0, 4)
      .map(([candidate]) => candidate);
  };
}
