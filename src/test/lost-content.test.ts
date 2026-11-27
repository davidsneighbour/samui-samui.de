import fs from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { toHtml } from 'hast-util-to-html';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import LostContent from '../components/content/post/LostContent.astro';
import { rehypeLostContent } from '../scripts/rehype/lost-content';
import { buildLostContent, type LostContentType } from '../utils/lost-content';

async function renderMarkdown(source: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeLostContent);
  return toHtml(await processor.run(processor.parse(source)));
}

describe('lost content annotations', () => {
  it.each([
    ['text', 'Originaltext nicht mehr rekonstruierbar.'],
    ['image', 'Ursprüngliche Abbildung nicht mehr verfügbar.'],
    ['video', 'Ursprüngliches Video nicht mehr verfügbar.'],
    ['audio', 'Ursprüngliche Tonaufnahme nicht mehr verfügbar.'],
    ['unknown', 'Originalinhalt nicht mehr rekonstruierbar.'],
  ] as [LostContentType, string][])(
    'renders accessible German %s messages identically in Astro and Markdown',
    async (type, message) => {
      const container = await AstroContainer.create();
      const astro = await container.renderToString(LostContent, {
        props: { type },
      });
      const markdown = await renderMarkdown(
        `Vorher <dnb-lost-content type="${type}"></dnb-lost-content> nachher.`,
      );
      for (const html of [astro, markdown]) {
        expect(html).toContain(`[${message}]`);
        expect(html).toContain('role="note"');
        expect(html).toContain('lang="de"');
        expect(html).toContain('data-pagefind-ignore');
        expect(html).not.toContain('<script');
      }
      expect(markdown).toContain('Vorher <span');
      expect(markdown).toContain('</span> nachher.');
    },
  );
  it('identifies the original language without marking German text as Thai', () => {
    expect(toHtml(buildLostContent('text', 'th'))).toContain(
      '[Thailändischer Originaltext nicht mehr rekonstruierbar.]',
    );
    expect(toHtml(buildLostContent('audio', 'en'))).toContain(
      'Originalsprache: Englisch.',
    );
    expect(() => buildLostContent('text', '<script>')).toThrow();
  });
  it('rejects invalid content types in Markdown', async () => {
    await expect(
      renderMarkdown('<dnb-lost-content type="typo"></dnb-lost-content>'),
    ).rejects.toThrow();
  });
  it('preserves Fu Noi source evidence, identity, and photograph while replacing visible damage', async () => {
    const source = fs.readFileSync(
      'src/content/posts/2006/11/fu-noi/index.md',
      'utf8',
    );
    expect(source).toContain('title: Fu noi.');
    expect(source).toContain('date: 2006-11-24T16:43:54+07:00');
    expect(source).toContain('reason: lost-content');
    expect(source).toContain('extent: partial');
    expect(source).toContain('![Fu](./fu-304971824.jpg)');
    const body = source.split('\n---\n')[1]!;
    const html = await renderMarkdown(body);
    expect(html).toContain(
      '[Thailändischer Originaltext nicht mehr rekonstruierbar.]',
    );
    expect(html).toContain('src="./fu-304971824.jpg"');
    expect(html.replace(/<!--[\s\S]*?-->/g, '')).not.toMatch(
      /[�]|class="thai"/,
    );
    expect(source).toContain('?ั?หวั?ว???อ?ะ?ิ?ึ??ั?');
  });
});
