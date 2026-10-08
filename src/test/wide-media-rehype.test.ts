import { rehypeWideMedia } from '@scripts/rehype/wide-media';
import type { Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

async function render(source: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeWideMedia);
  const tree = (await processor.run(processor.parse(source))) as Root;
  return toHtml(tree);
}

describe('rehypeWideMedia', () => {
  it('marks an image-only paragraph', async () => {
    expect(await render('![Strand](/a.jpg)')).toBe(
      '<p class="prose-wide"><img src="/a.jpg" alt="Strand"></p>',
    );
  });

  it('marks a linked image-only paragraph', async () => {
    expect(await render('[![Strand](/a.jpg)](/b/)')).toBe(
      '<p class="prose-wide"><a href="/b/"><img src="/a.jpg" alt="Strand"></a></p>',
    );
  });

  it('leaves a paragraph with text and an inline image in the column', async () => {
    expect(await render('Hier ![Icon](/i.png) steht Text.')).toBe(
      '<p>Hier <img src="/i.png" alt="Icon"> steht Text.</p>',
    );
  });

  it('leaves text-only paragraphs, lists, and code blocks alone', async () => {
    const html = await render('Text\n\n- Punkt\n\n```\ncode\n```');
    expect(html).not.toContain('prose-wide');
  });

  it('marks tables, iframes, figures, and media wrapper divs', async () => {
    const html = await render(
      [
        '<table><tr><td>1</td></tr></table>',
        '<iframe src="https://example.com/"></iframe>',
        '<figure><img src="/a.jpg" alt=""></figure>',
        '<div class="media photo"><img src="/a.jpg" alt=""></div>',
        '<div class="flickr"><a href="/x"><img src="/a.jpg" alt=""></a></div>',
      ].join('\n\n'),
    );
    expect(html).toContain('<table class="prose-wide">');
    expect(html).toContain(
      '<iframe src="https://example.com/" class="prose-wide">',
    );
    expect(html).toContain('<figure class="prose-wide">');
    expect(html).toContain('<div class="media photo prose-wide">');
    expect(html).toContain('<div class="flickr prose-wide">');
  });

  it('marks a paragraph holding only a video embed element', async () => {
    expect(await render('<dnb-youtube id="abc"></dnb-youtube>')).toContain(
      'class="prose-wide"',
    );
  });

  it('does not mark unrelated divs or nested media', async () => {
    const html = await render(
      '<div class="note"><p><img src="/a.jpg" alt=""></p></div>',
    );
    expect(html).not.toContain('prose-wide');
  });
});
