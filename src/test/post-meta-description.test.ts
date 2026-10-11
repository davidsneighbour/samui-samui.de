import type { CollectionEntry } from 'astro:content';
import { getPostMetaDescription } from '@utils/post-meta-description';
import { describe, expect, it } from 'vitest';

function post(html = '', description?: string, summary?: string) {
  return {
    data: { description, summary, title: 'Repeated title' },
    rendered: { html },
  } as CollectionEntry<'posts'>;
}

describe('post meta descriptions', () => {
  it('prefers the description and preserves long editorial copy', () => {
    const description = 'Editorial description. '.repeat(12).trim();
    expect(
      getPostMetaDescription(post('<p>Body</p>', description, 'Summary')),
    ).toBe(description);
  });

  it('uses the existing summary when the description is blank', () => {
    expect(
      getPostMetaDescription(post('<p>Body</p>', '  ', '  An\nexcerpt. ')),
    ).toBe('An excerpt.');
  });

  it('extracts readable content without HTML, hidden text, or embed content', () => {
    expect(
      getPostMetaDescription(
        post(
          '<p>Ein <strong>schöner</strong> Tag &amp; Thaiแลนด์.</p><p>Weiter<br>geht es.</p><script>bad()</script><span hidden>Hidden</span><iframe>Embed</iframe><!-- comment -->',
        ),
      ),
    ).toBe('Ein schöner Tag & Thaiแลนด์. Weiter geht es.');
  });

  it('keeps adjacent inline text intact and separates blocks', () => {
    expect(
      getPostMetaDescription(
        post('<p>Photo<strong>graphie</strong>.</p><p>Nächster Absatz.</p>'),
      ),
    ).toBe('Photographie. Nächster Absatz.');
  });

  it('caps body excerpts at 160 characters without splitting words', () => {
    const text = `${'a '.repeat(78)}longword trailing`;
    const result = getPostMetaDescription(post(`<p>${text}</p>`));
    expect(result).toBe(`${'a '.repeat(78).trim()}…`);
    expect(Array.from(result).length).toBeLessThanOrEqual(160);
  });

  it('retains a complete word ending at the limit', () => {
    expect(getPostMetaDescription(post(`<p>${'a'.repeat(159)} next</p>`))).toBe(
      `${'a'.repeat(159)}…`,
    );
  });

  it('handles short bodies, unbroken text, and Unicode characters', () => {
    expect(getPostMetaDescription(post('<p>Short.</p>'))).toBe('Short.');
    expect(getPostMetaDescription(post(`<p>${'🌴'.repeat(170)}</p>`))).toBe(
      `${'🌴'.repeat(159)}…`,
    );
  });

  it('leaves content of exactly 160 characters complete without an ellipsis', () => {
    expect(getPostMetaDescription(post(`<p>${'a'.repeat(160)}</p>`))).toBe(
      'a'.repeat(160),
    );
  });

  it('returns no invented title when there is no usable content', () => {
    expect(
      getPostMetaDescription(post('<p><img src="/image.jpg" alt="Photo"></p>')),
    ).toBe('');
    const missing = { data: { title: 'Title' } } as CollectionEntry<'posts'>;
    expect(getPostMetaDescription(missing)).toBe('');
  });
});
