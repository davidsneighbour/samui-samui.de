import type { CollectionEntry } from 'astro:content';
import { describe, expect, it } from 'vitest';
import { createRelatedPostLookup } from '../utils/related-posts';

function post(
  id: string,
  data: Record<string, unknown> = {},
): CollectionEntry<'posts'> {
  return {
    collection: 'posts',
    data: {
      date: new Date('2014-05-01T00:00:00+07:00'),
      ereignisse: [],
      feiertage: [],
      legacyImages: 'auto',
      options: { featured: true },
      orte: [],
      personen: [],
      themen: [],
      title: id,
      ...data,
    },
    id,
  } as CollectionEntry<'posts'>;
}

describe('related posts', () => {
  it('prioritises event matches, handles Astro references, and excludes self and unrelated posts', () => {
    const current = post('current', {
      ereignisse: ['coup'],
      themen: ['politik'],
    });
    const event = post('event', {
      ereignisse: [{ collection: 'ereignisse', id: 'coup' }],
    });
    const topic = post('topic', {
      date: new Date('2026-01-01'),
      themen: ['politik'],
    });
    expect(
      createRelatedPostLookup([current, topic, post('other'), event])(
        current,
      ).map((p) => p.id),
    ).toEqual(['event', 'topic']);
  });

  it('counts distinct matches once and keeps taxonomy namespaces separate', () => {
    const current = post('current', {
      orte: ['place'],
      personen: ['same', 'same'],
      themen: ['topic'],
    });
    const combined = post('combined', { orte: ['place'], themen: ['topic'] });
    const person = post('person', {
      date: new Date('2013-01-01'),
      personen: ['same', 'same'],
    });
    expect(
      createRelatedPostLookup([
        current,
        person,
        combined,
        post('collision', { themen: ['same'] }),
      ])(current).map((p) => p.id),
    ).toEqual(['combined', 'person']);
  });

  it('limits results to four and sorts ties deterministically without mutating the input', () => {
    const current = post('current', { themen: ['topic'] });
    const posts = ['z', 'b', 'a', 'd', 'c'].map((id) =>
      post(id, { themen: ['topic'] }),
    );
    const original = [...posts];
    expect(createRelatedPostLookup(posts)(current).map((p) => p.id)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
    expect(posts).toEqual(original);
    expect(createRelatedPostLookup(posts)(post('untagged'))).toEqual([]);
  });
});
