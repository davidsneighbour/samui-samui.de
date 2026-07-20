import { rehypeDnbNotice } from '@scripts/rehype/notices';
import { clearNoticeRegistryCache } from '@utils/notices/registry';
import type { Element, Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { beforeEach, describe, expect, it } from 'vitest';

// Mirrors astro.config.ts's `markdown.rehypePlugins` ordering: rehypeRaw
// must run before rehypeDnbNotice so `<dnb-notice>` is a real hast element
// by the time the plugin visits it (see src/scripts/rehype/notices.ts).
function buildProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeDnbNotice);
}

async function render(source: string, filePath?: string): Promise<string> {
  const file = new VFile({ path: filePath, value: source });
  const processor = buildProcessor();
  const tree = (await processor.run(processor.parse(file), file)) as Root;
  return toHtml(tree);
}

beforeEach(() => {
  clearNoticeRegistryCache();
});

// `resolveNotice()`'s registry path can't be injected through the rehype
// plugin (it always resolves against the default src/data/notices.yaml),
// so these tests exercise the real project registry directly, matching how
// the plugin actually runs in production.
describe('rehypeDnbNotice', () => {
  it('renders a known slug with no overrides', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet"></dnb-notice>',
    );
    expect(html).toContain('data-dnb-notice=""');
    expect(html).toContain('data-variant="historical"');
    expect(html).toContain('role="note"');
    expect(html).toContain('Redaktionsnotiz');
    expect(html).toContain(
      'Flickr wird von dieser Website heute nicht mehr verwendet',
    );
    expect(html).toContain('lucide-camera-off');
  });

  it('throws a clear error for an unknown slug, including the file path', async () => {
    await expect(
      render(
        '<dnb-notice slug="does-not-exist"></dnb-notice>',
        'src/content/posts/example/index.md',
      ),
    ).rejects.toThrow(
      /Unknown notice slug "does-not-exist" in src\/content\/posts\/example\/index\.md/,
    );
  });

  it('applies a title-only override', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet" title="Hinweis zum ursprünglichen Beitrag"></dnb-notice>',
    );
    expect(html).toContain('Hinweis zum ursprünglichen Beitrag');
    expect(html).not.toContain('>Redaktionsnotiz<');
  });

  it('applies a description-only override via attribute', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet" description="Eigene Beschreibung."></dnb-notice>',
    );
    expect(html).toContain('Eigene Beschreibung.');
    expect(html).not.toContain('Flickr wird von dieser Website');
  });

  it('applies an icon override via attribute', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet" icon="info"></dnb-notice>',
    );
    expect(html).toContain('lucide-info');
    expect(html).not.toContain('lucide-camera-off');
  });

  it('applies a variant override via attribute', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet" variant="warning"></dnb-notice>',
    );
    expect(html).toContain('data-variant="warning"');
  });

  it('throws for an invalid variant attribute', async () => {
    await expect(
      render(
        '<dnb-notice slug="flickr-nicht-mehr-verwendet" variant="urgent"></dnb-notice>',
      ),
    ).rejects.toThrow(/Invalid <dnb-notice> variant "urgent"/);
  });

  it('lets body content override the description and renders its Markdown', async () => {
    const html = await render(
      [
        '<dnb-notice slug="flickr-nicht-mehr-verwendet">',
        'Diese **abweichende Beschreibung** ersetzt nur die konfigurierte Beschreibung.',
        '</dnb-notice>',
      ].join('\n'),
    );
    expect(html).toContain(
      'Diese <strong>abweichende Beschreibung</strong> ersetzt nur die konfigurierte Beschreibung.',
    );
    expect(html).not.toContain('Flickr wird von dieser Website');
  });

  it('resolves an ad hoc notice with no slug', async () => {
    const html = await render(
      '<dnb-notice title="Keine Rechtsberatung" description="Nur meine Meinung." icon="scale" variant="legal"></dnb-notice>',
    );
    expect(html).toContain('Keine Rechtsberatung');
    expect(html).toContain('Nur meine Meinung.');
    expect(html).toContain('data-variant="legal"');
  });

  it('throws when an ad hoc notice is missing required fields', async () => {
    await expect(
      render('<dnb-notice title="Nur ein Titel"></dnb-notice>'),
    ).rejects.toThrow(/missing required field\(s\)/i);
  });

  it('throws for an unsupported Lucide icon', async () => {
    await expect(
      render(
        '<dnb-notice title="Titel" description="Text." icon="not-a-real-icon"></dnb-notice>',
      ),
    ).rejects.toThrow(/Unsupported Lucide icon "not-a-real-icon"/);
  });

  it('renders no dismiss button or script when non-dismissible', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet"></dnb-notice>',
    );
    expect(html).not.toContain('data-dnb-notice-dismiss');
    expect(html).not.toContain('<script>');
  });

  it('renders an accessible dismiss button and script when dismissible', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet" dismissible></dnb-notice>',
    );
    expect(html).toContain('data-dnb-notice-dismiss=""');
    expect(html).toContain('aria-label="Hinweis schließen"');
    expect(html).toContain('<script>');
    expect(html).toContain('__dnbNoticeDismissInit');
  });

  it('lets a dismiss-label attribute override the default label', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet" dismissible dismiss-label="Weg damit"></dnb-notice>',
    );
    expect(html).toContain('aria-label="Weg damit"');
  });

  it('unwraps the auto-inserted <p> around a single-line element', async () => {
    const tree = (await buildProcessor().run(
      buildProcessor().parse(
        new VFile(
          '<dnb-notice slug="flickr-nicht-mehr-verwendet"></dnb-notice>',
        ),
      ),
    )) as Root;
    const hasNestedAside = tree.children.some(
      (node) =>
        node.type === 'element' &&
        node.tagName === 'p' &&
        (node as Element).children.some(
          (child) => child.type === 'element' && child.tagName === 'aside',
        ),
    );
    expect(hasNestedAside).toBe(false);
    const topLevelAside = tree.children.some(
      (node) => node.type === 'element' && node.tagName === 'aside',
    );
    expect(topLevelAside).toBe(true);
  });

  it('does not permit raw HTML through the description into rendered output', async () => {
    const html = await render(
      '<dnb-notice slug="flickr-nicht-mehr-verwendet" description="Text mit &lt;img src=x onerror=alert(1)&gt;"></dnb-notice>',
    );
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<img');
  });
});
