import { rehypeVideoPosters } from '@scripts/rehype/video-posters';
import type { ImageMetadata } from 'astro';
import type { Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { VFile } from 'vfile';
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
  it('registers source-path imports for Astro image processing', async () => {
    const src = '/src/assets/images/video-thumbnails/youtube/d8TgCmngOqY.jpg';
    const processor = buildProcessor(() => src);
    const file = new VFile();
    const tree = await processor.run(
      processor.parse('<dnb-youtube videoid="d8TgCmngOqY"></dnb-youtube>'),
      file,
    );

    expect(file.data).toMatchObject({ astro: { localImagePaths: [src] } });
    expect(toHtml(tree as Root)).toContain(`src="${src}"`);
    expect(toHtml(tree as Root)).toContain('slot="poster"');
  });

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

describe('relic video preservation', () => {
  it('suppresses confirmed missing players on relics while preserving available players and source text', async () => {
    const source =
      '<dnb-youtube videoid="missing"><img slot="poster" src="/historical.jpg"></dnb-youtube><dnb-vimeo videoid="123"></dnb-vimeo>';
    const tree = {
      children: [
        {
          children: [
            {
              children: [],
              properties: { slot: 'poster', src: '/historical.jpg' },
              tagName: 'img',
              type: 'element',
            },
          ],
          properties: { videoid: 'missing' },
          tagName: 'dnb-youtube',
          type: 'element',
        },
        {
          children: [],
          properties: { videoid: '123' },
          tagName: 'dnb-vimeo',
          type: 'element',
        },
      ],
      type: 'root',
    } as Root;
    const media = {
      'vimeo:123': {
        availability: 'available',
        consecutiveFailures: 0,
        files: [],
        id: '123',
        lastChecked: '2026-11-27',
        provider: 'vimeo',
        url: 'https://vimeo.com/123',
      },
      'youtube:missing': {
        availability: 'unavailable',
        consecutiveFailures: 2,
        files: [],
        id: 'missing',
        lastChecked: '2026-11-27',
        provider: 'youtube',
        url: 'https://www.youtube.com/watch?v=missing',
      },
    } as const;
    const file = new VFile({
      data: { astro: { frontmatter: { relic: { status: 'relic' } } } },
      value: source,
    });
    rehypeVideoPosters(() => undefined, JSON.parse(JSON.stringify(media)))(
      tree,
      file,
    );
    const html = toHtml(tree);
    expect(html).not.toContain('dnb-youtube');
    expect(html).toContain('nicht mehr verfügbar');
    expect(html).toContain('dnb-vimeo');
    expect(String(file)).toBe(source);
  });
});
