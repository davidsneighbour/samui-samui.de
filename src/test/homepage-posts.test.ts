import type { CollectionEntry } from 'astro:content';
import { orderPostsForHomepage } from '@utils/homepage-posts';
import { describe, expect, it } from 'vitest';

type PostEntry = CollectionEntry<'posts'>;

function post(id: string, featured = true): PostEntry {
  return {
    collection: 'posts',
    data: {
      date: new Date('2026-07-24T00:00:00+07:00'),
      options: { featured },
      title: id,
    },
    id,
  } as PostEntry;
}

describe('orderPostsForHomepage', () => {
  it('keeps an already eligible first post in place', () => {
    const posts = [post('first'), post('second', false), post('third')];

    expect(orderPostsForHomepage(posts).map((entry) => entry.id)).toEqual([
      'first',
      'second',
      'third',
    ]);
  });

  it('moves the next eligible post ahead of explicitly unfeatured posts', () => {
    const posts = [
      post('first', false),
      post('second', false),
      post('third'),
      post('fourth'),
    ];

    expect(orderPostsForHomepage(posts).map((entry) => entry.id)).toEqual([
      'third',
      'first',
      'second',
      'fourth',
    ]);
  });
});
