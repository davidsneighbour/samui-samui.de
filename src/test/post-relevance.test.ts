import type { CollectionEntry } from 'astro:content';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { collections } from '../content.config';

const postSchema = collections.posts.schema;
if (!postSchema || typeof postSchema === 'function') {
  throw new Error('Expected a direct post frontmatter schema.');
}
const schema = postSchema;
const post = { date: '2026-10-09T12:00:00+07:00', title: 'Testbeitrag' };

describe('post relevance', () => {
  it.each(['enduring', 'contextual', 'moment', 'ephemeral'])(
    'accepts %s without changing the classification',
    (relevance) => {
      expect(schema.parse({ ...post, relevance }).relevance).toBe(relevance);
    },
  );

  it('keeps a post without relevance unclassified', () => {
    const result = schema.parse(post);
    expect(result.relevance).toBeUndefined();
    expect(result).not.toHaveProperty('relevance');
  });

  it.each(['evergreen', 'unclassified', 'Enduring', '', null, 1, [], {}])(
    'rejects invalid relevance %j even though legacy fields are allowed',
    (relevance) => {
      expect(schema.safeParse({ ...post, relevance }).success).toBe(false);
    },
  );

  it('infers exactly the four values plus undefined for collection consumers', () => {
    expectTypeOf<CollectionEntry<'posts'>['data']['relevance']>().toEqualTypeOf<
      'enduring' | 'contextual' | 'moment' | 'ephemeral' | undefined
    >();
  });
});
