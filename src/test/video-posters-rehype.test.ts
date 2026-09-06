import { rehypeVideoPosters } from '@scripts/rehype/video-posters';
import type { ImageMetadata } from 'astro';
import type { Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

// Mirrors astro.config.ts's `markdown.rehypePlugins` ordering: rehypeRaw
// must run before rehypeVideoPosters so `<dnb-youtube>`/`<dnb-vimeo>` are
// real hast elements by the time the plugin visits them (see
// src/scripts/rehype/video-posters.ts).
function buildProcessor(
  resolveThumbnail: Parameters<typeof rehypeVideoPosters>[0],
) {
  return unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeVideoPosters, resolveThumbnail);
}

async function render(
  source: string,
  resolveThumbnail: Parameters<typeof rehypeVideoPosters>[0],
): Promise<string> {
  const processor = buildProcessor(resolveThumbnail);
  const tree = (await processor.run(processor.parse(source))) as Root;
  return toHtml(tree);
}

function fakeThumbnail(overrides: Partial<ImageMetadata> = {}): ImageMetadata {
  return {
    format: 'jpg',
    height: 480,
    src: '/assets/fake-thumbnail.jpg',
    width: 640,
    ...overrides,
  };
}

describe('rehypeVideoPosters', () => {
  it('injects a poster img for a dnb-youtube element with a known thumbnail', async () => {
    const html = await render(
      '<dnb-youtube videoid="dQw4w9WgXcQ"></dnb-youtube>',
      (provider, videoId) =>
        provider === 'youtube' && videoId === 'dQw4w9WgXcQ'
          ? fakeThumbnail()
          : undefined,
    );

    expect(html).toContain('slot="poster"');
    expect(html).toContain('src="/assets/fake-thumbnail.jpg"');
    expect(html).toContain('width="640"');
    expect(html).toContain('height="480"');
  });

  it('injects a poster img for a dnb-vimeo element with a known thumbnail', async () => {
    const html = await render(
      '<dnb-vimeo videoid="522265992"></dnb-vimeo>',
      (provider, videoId) =>
        provider === 'vimeo' && videoId === '522265992'
          ? fakeThumbnail({ src: '/assets/vimeo-thumb.jpg' })
          : undefined,
    );

    expect(html).toContain('slot="poster"');
    expect(html).toContain('src="/assets/vimeo-thumb.jpg"');
  });

  it('leaves the element untouched when no local thumbnail is known', async () => {
    const html = await render(
      '<dnb-youtube videoid="unknownvid"></dnb-youtube>',
      () => undefined,
    );

    expect(html).not.toContain('slot="poster"');
  });

  it('does not duplicate a poster when one already exists', async () => {
    const html = await render(
      '<dnb-youtube videoid="dQw4w9WgXcQ"><img slot="poster" src="/already-there.jpg" /></dnb-youtube>',
      () => fakeThumbnail(),
    );

    const posterMatches = html.match(/slot="poster"/g) ?? [];
    expect(posterMatches).toHaveLength(1);
    expect(html).toContain('/already-there.jpg');
    expect(html).not.toContain('/assets/fake-thumbnail.jpg');
  });
});
