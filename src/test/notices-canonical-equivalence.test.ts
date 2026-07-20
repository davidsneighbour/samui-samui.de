import { rehypeDnbNotice } from '@scripts/rehype/notices';
import { clearNoticeRegistryCache } from '@utils/notices/registry';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { beforeEach, describe, expect, it } from 'vitest';
import Notice from '../components/Notice.astro';

beforeEach(() => {
  clearNoticeRegistryCache();
});

async function renderMarkdown(markup: string): Promise<string> {
  const file = new VFile(markup);
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeDnbNotice);
  const tree = (await processor.run(processor.parse(file), file)) as Root;
  return toHtml(tree);
}

async function renderMdx(props: Record<string, unknown>): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Notice, { props });
}

// Both integration points must resolve through the same central resolver
// and produce the same canonical markup (task requirement) -- these tests
// compare the actual rendered HTML byte-for-byte for equivalent input.
describe('canonical markup equivalence (Markdown vs MDX)', () => {
  it('produces identical markup for a plain slug reference', async () => {
    const markdownHtml = await renderMarkdown(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet"></dnb-notice>',
    );
    const mdxHtml = await renderMdx({ slug: 'flickr-nicht-mehr-verwendet' });
    expect(markdownHtml).toBe(mdxHtml);
  });

  it('produces identical markup for a title override', async () => {
    const markdownHtml = await renderMarkdown(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet" title="Eigener Titel"></dnb-notice>',
    );
    const mdxHtml = await renderMdx({
      slug: 'flickr-nicht-mehr-verwendet',
      title: 'Eigener Titel',
    });
    expect(markdownHtml).toBe(mdxHtml);
  });

  it('produces identical markup for a dismissible ad hoc notice', async () => {
    const markdownHtml = await renderMarkdown(
      '<dnb-notice title="Titel" description="Text." icon="info" variant="warning" dismissible></dnb-notice>',
    );
    const mdxHtml = await renderMdx({
      description: 'Text.',
      dismissible: true,
      icon: 'info',
      title: 'Titel',
      variant: 'warning',
    });
    expect(markdownHtml).toBe(mdxHtml);
  });
});
