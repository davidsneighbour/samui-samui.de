import type { CollectionEntry } from 'astro:content';
import { getPostPreviewHtml } from '@utils/post-preview';
import { describe, expect, it } from 'vitest';

type PostEntry = CollectionEntry<'posts'>;

function post(html: string, data: Partial<PostEntry['data']> = {}): PostEntry {
  return {
    collection: 'posts',
    data: {
      date: new Date('2026-08-28T00:00:00+07:00'),
      title: 'Test post',
      ...data,
    },
    id: 'test-post',
    rendered: { html },
  } as PostEntry;
}

describe('getPostPreviewHtml', () => {
  it('skips media-only blocks and returns the first text block', () => {
    expect(
      getPostPreviewHtml(
        post(
          '<p><img src="/cover.jpg" alt=""></p><p><iframe src="/embed">Fallback</iframe></p><p>Preview text.</p>',
        ),
        1,
      ),
    ).toEqual(['<p>Preview text.</p>']);
  });

  it('escapes frontmatter fallback text', () => {
    expect(
      getPostPreviewHtml(
        post('', { summary: '<script>alert("x")</script> & weiter' }),
        1,
      ),
    ).toEqual([
      '<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; weiter</p>',
    ]);
  });
});
