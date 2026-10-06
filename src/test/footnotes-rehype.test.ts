import { toHtml } from 'hast-util-to-html';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { rehypeFootnotes } from '../scripts/rehype/footnotes';

async function render(markdown: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeFootnotes);
  return toHtml(await processor.run(processor.parse(markdown)));
}

describe('post footnotes', () => {
  it('labels the section and preserves both returns for a shared source', async () => {
    const html = await render(
      'First.[^src-example] Again.[^src-example]\n\n[^src-example]: [Source](https://example.com/article).',
    );
    expect(html).toContain('aria-labelledby="footnote-label"');
    expect(html).toContain(
      'class="footnotes__heading" id="footnote-label">Fußnoten</h2>',
    );
    expect(html).not.toContain('sr-only');
    expect(html).toContain('href="https://example.com/article"');
    expect(html.match(/<li id=/g)).toHaveLength(1);
    expect(html).toContain('href="#user-content-fnref-src-example"');
    expect(html).toContain('href="#user-content-fnref-src-example-2"');
    expect(html).toContain('aria-label="Zurück zur Textstelle 1"');
    expect(html).toContain('aria-label="Zurück zur Textstelle 1-2"');
    expect(html.match(/>↵<\/a>/g)).toHaveLength(2);
  });

  it('leaves posts without footnotes and ordinary ordered lists unchanged', async () => {
    const html = await render('A paragraph.\n\n1. First\n2. Second');
    expect(html).not.toContain('Fußnoten');
    expect(html).not.toContain('data-footnotes');
    expect(html).toContain('<ol>');
  });
});
