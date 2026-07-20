import path from 'node:path';
import { clearNoticeRegistryCache } from '@utils/notices/registry';
import { resolveNotice } from '@utils/notices/resolve';
import { beforeEach, describe, expect, it } from 'vitest';

const fixtureRegistry = path.join(
  process.cwd(),
  'src/test/fixtures/notices/valid.yaml',
);

beforeEach(() => {
  clearNoticeRegistryCache();
});

describe('resolveNotice', () => {
  it('resolves a known slug from the registry', () => {
    const resolved = resolveNotice(
      { slug: 'beispiel-hinweis' },
      fixtureRegistry,
    );
    expect(resolved).toMatchObject({
      description: 'Ein **Beispieltext** mit [Link](https://example.com).',
      descriptionSource: 'registry',
      dismissible: false,
      dismissLabel: 'Hinweis schließen',
      icon: 'info',
      title: 'Beispiel',
      variant: 'note',
    });
  });

  it('throws a clear error for an unknown slug, listing valid slugs', () => {
    expect(() =>
      resolveNotice({ slug: 'does-not-exist' }, fixtureRegistry),
    ).toThrow(
      /Unknown notice slug "does-not-exist".*beispiel-hinweis.*beispiel-korrektur/is,
    );
  });

  it('overrides only the title, keeping the rest from the registry', () => {
    const resolved = resolveNotice(
      { slug: 'beispiel-hinweis', title: 'Eigener Titel' },
      fixtureRegistry,
    );
    expect(resolved.title).toBe('Eigener Titel');
    expect(resolved.descriptionSource).toBe('registry');
  });

  it('overrides only the description, keeping the rest from the registry', () => {
    const resolved = resolveNotice(
      { description: 'Eigene Beschreibung.', slug: 'beispiel-hinweis' },
      fixtureRegistry,
    );
    expect(resolved.description).toBe('Eigene Beschreibung.');
    expect(resolved.descriptionSource).toBe('prop');
    expect(resolved.title).toBe('Beispiel');
  });

  it('overrides only the icon', () => {
    const resolved = resolveNotice(
      { icon: 'triangle-alert', slug: 'beispiel-hinweis' },
      fixtureRegistry,
    );
    expect(resolved.icon).toBe('triangle-alert');
  });

  it('overrides only the variant', () => {
    const resolved = resolveNotice(
      { slug: 'beispiel-hinweis', variant: 'warning' },
      fixtureRegistry,
    );
    expect(resolved.variant).toBe('warning');
  });

  it('lets body content override the description, ranked above the registry', () => {
    const resolved = resolveNotice(
      { bodyDescription: 'Aus dem Body.', slug: 'beispiel-hinweis' },
      fixtureRegistry,
    );
    expect(resolved.description).toBe('Aus dem Body.');
    expect(resolved.descriptionSource).toBe('body');
  });

  it('ranks an explicit description prop above body content', () => {
    const resolved = resolveNotice(
      {
        bodyDescription: 'Aus dem Body.',
        description: 'Explizite Beschreibung.',
        slug: 'beispiel-hinweis',
      },
      fixtureRegistry,
    );
    expect(resolved.description).toBe('Explizite Beschreibung.');
    expect(resolved.descriptionSource).toBe('prop');
  });

  it('resolves an ad hoc notice with no slug when all required fields are given', () => {
    const resolved = resolveNotice(
      {
        description: 'Nur meine Meinung.',
        icon: 'scale',
        title: 'Keine Rechtsberatung',
        variant: 'legal',
      },
      fixtureRegistry,
    );
    expect(resolved).toMatchObject({
      description: 'Nur meine Meinung.',
      icon: 'scale',
      title: 'Keine Rechtsberatung',
      variant: 'legal',
    });
  });

  it('throws when an ad hoc notice is missing required fields', () => {
    expect(() =>
      resolveNotice({ title: 'Nur ein Titel' }, fixtureRegistry),
    ).toThrow(/missing required field\(s\): description, icon/i);
  });

  it('throws for an unsupported Lucide icon on an ad hoc notice', () => {
    expect(() =>
      resolveNotice(
        {
          description: 'Text.',
          icon: 'not-a-real-icon',
          title: 'Titel',
        },
        fixtureRegistry,
      ),
    ).toThrow(/Unsupported Lucide icon "not-a-real-icon"/);
  });

  it('defaults dismissible to false and uses the default German dismiss label', () => {
    const resolved = resolveNotice(
      { slug: 'beispiel-hinweis' },
      fixtureRegistry,
    );
    expect(resolved.dismissible).toBe(false);
    expect(resolved.dismissLabel).toBe('Hinweis schließen');
  });

  it('picks up a registry-level dismissible: true default', () => {
    const resolved = resolveNotice(
      { slug: 'beispiel-korrektur' },
      fixtureRegistry,
    );
    expect(resolved.dismissible).toBe(true);
  });

  it('lets an explicit dismissible prop override the registry default', () => {
    const resolved = resolveNotice(
      { dismissible: false, slug: 'beispiel-korrektur' },
      fixtureRegistry,
    );
    expect(resolved.dismissible).toBe(false);
  });

  it('includes the source file in error messages when provided', () => {
    expect(() =>
      resolveNotice(
        { slug: 'missing', sourceFile: 'src/content/posts/example/index.md' },
        fixtureRegistry,
      ),
    ).toThrow(/in src\/content\/posts\/example\/index\.md/);
  });
});
