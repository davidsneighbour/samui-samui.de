import { clearNoticeRegistryCache } from '@utils/notices/registry';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Notice from '../components/content/notices/Notice.astro';

beforeEach(() => {
  clearNoticeRegistryCache();
});

afterEach(() => {
  clearNoticeRegistryCache();
});

async function renderNotice(
  props: Record<string, unknown>,
  slots?: Record<string, string>,
) {
  const container = await AstroContainer.create();
  return container.renderToString(Notice, {
    props,
    ...(slots ? { slots } : {}),
  });
}

describe('Notice.astro (MDX integration point)', () => {
  it('renders a known slug with no overrides', async () => {
    const html = await renderNotice({ slug: 'flickr-nicht-mehr-verwendet' });
    expect(html).toContain('data-dnb-notice=""');
    expect(html).toContain('data-variant="historical"');
    expect(html).toContain('role="note"');
    expect(html).toContain('aria-labelledby=');
    expect(html).toContain('Redaktionsnotiz');
    expect(html).toContain(
      'Flickr wird von dieser Website heute nicht mehr verwendet',
    );
    expect(html).toContain('lucide-camera-off');
  });

  it('throws a clear error for an unknown slug', async () => {
    await expect(renderNotice({ slug: 'does-not-exist' })).rejects.toThrow(
      /Unknown notice slug "does-not-exist".*Valid slugs:/is,
    );
  });

  it('applies a title-only override', async () => {
    const html = await renderNotice({
      slug: 'flickr-nicht-mehr-verwendet',
      title: 'Hinweis zum ursprünglichen Beitrag',
    });
    expect(html).toContain('Hinweis zum ursprünglichen Beitrag');
    expect(html).not.toContain('>Redaktionsnotiz<');
  });

  it('applies a description-only override', async () => {
    const html = await renderNotice({
      description: 'Eigene Beschreibung.',
      slug: 'flickr-nicht-mehr-verwendet',
    });
    expect(html).toContain('Eigene Beschreibung.');
    expect(html).not.toContain('Flickr wird von dieser Website');
  });

  it('applies an icon override', async () => {
    const html = await renderNotice({
      icon: 'info',
      slug: 'flickr-nicht-mehr-verwendet',
    });
    expect(html).toContain('lucide-info');
    expect(html).not.toContain('lucide-camera-off');
  });

  it('applies a variant override', async () => {
    const html = await renderNotice({
      slug: 'flickr-nicht-mehr-verwendet',
      variant: 'warning',
    });
    expect(html).toContain('data-variant="warning"');
  });

  it('lets default-slot body content override the description', async () => {
    const html = await renderNotice(
      { slug: 'flickr-nicht-mehr-verwendet' },
      {
        default:
          'Diese <strong>abweichende Beschreibung</strong> ersetzt nur die konfigurierte Beschreibung.',
      },
    );
    expect(html).toContain(
      'Diese <strong>abweichende Beschreibung</strong> ersetzt nur die konfigurierte Beschreibung.',
    );
    expect(html).not.toContain('Flickr wird von dieser Website');
  });

  it('resolves an ad hoc notice with no slug', async () => {
    const html = await renderNotice({
      description: 'Nur meine Meinung.',
      icon: 'scale',
      title: 'Keine Rechtsberatung',
      variant: 'legal',
    });
    expect(html).toContain('Keine Rechtsberatung');
    expect(html).toContain('Nur meine Meinung.');
    expect(html).toContain('data-variant="legal"');
  });

  it('throws when an ad hoc notice is missing required fields', async () => {
    await expect(renderNotice({ title: 'Nur ein Titel' })).rejects.toThrow(
      /missing required field\(s\)/i,
    );
  });

  it('throws for an unsupported Lucide icon', async () => {
    await expect(
      renderNotice({
        description: 'Text.',
        icon: 'not-a-real-icon',
        title: 'Titel',
      }),
    ).rejects.toThrow(/Unsupported Lucide icon "not-a-real-icon"/);
  });

  it('renders no dismiss button or script when non-dismissible', async () => {
    const html = await renderNotice({ slug: 'flickr-nicht-mehr-verwendet' });
    expect(html).not.toContain('data-dnb-notice-dismiss');
    expect(html).not.toContain('<script>');
  });

  it('renders an accessible dismiss button and script when dismissible', async () => {
    const html = await renderNotice({
      dismissible: true,
      slug: 'flickr-nicht-mehr-verwendet',
    });
    expect(html).toContain('data-dnb-notice-dismiss=""');
    expect(html).toContain('aria-label="Hinweis schließen"');
    expect(html).toContain('<script>');
  });

  it('lets dismissLabel override the default label', async () => {
    const html = await renderNotice({
      dismissible: true,
      dismissLabel: 'Weg damit',
      slug: 'flickr-nicht-mehr-verwendet',
    });
    expect(html).toContain('aria-label="Weg damit"');
  });

  it('renders safe Markdown (bold, link) in the title and description', async () => {
    const html = await renderNotice({
      description: 'Ein Link zu [example.com](https://example.com) und `code`.',
      icon: 'info',
      title: 'Ein **wichtiger** Titel',
    });
    expect(html).toContain('<strong>wichtiger</strong>');
    expect(html).toContain('<a href="https://example.com">example.com</a>');
    expect(html).toContain('<code>code</code>');
  });
});
