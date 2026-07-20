import { rehypeSiteAge } from '@scripts/rehype/site-age';
import type { Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { describe, expect, it } from 'vitest';

function buildProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSiteAge);
}

async function render(source: string, filePath?: string): Promise<string> {
  const file = new VFile({ path: filePath, value: source });
  const processor = buildProcessor();
  const tree = (await processor.run(processor.parse(file), file)) as Root;
  return toHtml(tree);
}

describe('rehypeSiteAge', () => {
  it('renders the plain markdown custom element as build-time text', async () => {
    const html = await render(
      '<dnb-site-age since-date="2005-01-08" until-date="2026-07-20" format="%y Jahre, %m Monate, und %d Tage"></dnb-site-age>',
    );

    expect(html).toBe('<p>21 Jahre, 6 Monate, und 12 Tage</p>');
  });

  it('supports camel-case attributes from MDX-like input', async () => {
    const html = await render(
      '<dnb-site-age sinceDate="2005-01-08" untilDate="2026-07-20" unit="months"></dnb-site-age>',
    );

    expect(html).toBe('<p>258</p>');
  });

  it('throws a clear error when since-date is missing', async () => {
    await expect(
      render(
        '<dnb-site-age unit="years"></dnb-site-age>',
        'src/content/posts/example/index.md',
      ),
    ).rejects.toThrow(
      /<dnb-site-age> requires a since-date attribute in src\/content\/posts\/example\/index\.md/,
    );
  });

  it('throws a clear error for invalid units', async () => {
    await expect(
      render(
        '<dnb-site-age since-date="2005-01-08" unit="weeks"></dnb-site-age>',
      ),
    ).rejects.toThrow(/Invalid <dnb-site-age> unit "weeks"/);
  });
});
