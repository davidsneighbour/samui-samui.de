import type { CollectionEntry } from 'astro:content';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import PostTaxonomyGroups from '../components/content/post/PostTaxonomyGroups.astro';
import redirects from '../data/redirects.json';
import {
  isPublicEntity,
  resolvePostTaxonomyGroups,
} from '../utils/taxonomies/entities';
import {
  buildPersonLinkHast,
  personLinkHastToHtml,
} from '../utils/taxonomies/person-link';
import { validateTaxonomyIntegrity } from '../utils/taxonomies/validation';
import { groupPostsByThema } from '../utils/themen';

function post(
  data: Partial<CollectionEntry<'posts'>['data']>,
): CollectionEntry<'posts'> {
  return {
    collection: 'posts',
    data: {
      date: new Date('2026-01-01T00:00:00+07:00'),
      ereignisse: [],
      feiertage: [],
      legacyImages: 'auto',
      orte: [],
      personen: [],
      themen: [],
      title: 'Beispiel',
      ...data,
    },
    id: '2026/beispiel',
  } as CollectionEntry<'posts'>;
}

function entity<
  C extends 'personen' | 'orte' | 'ereignisse' | 'themen' | 'feiertage',
>(
  collection: C,
  id: string,
  title: string,
  data: Record<string, unknown> = {},
): CollectionEntry<C> {
  return {
    collection,
    data: {
      aliases: [],
      draft: false,
      noindex: false,
      title,
      ...data,
    },
    id,
  } as CollectionEntry<C>;
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'samui-taxonomies-'));
  fs.mkdirSync(path.join(root, 'src/content/posts'), { recursive: true });
  for (const collection of [
    'personen',
    'orte',
    'ereignisse',
    'feiertage',
    'themen',
  ]) {
    fs.mkdirSync(path.join(root, 'src/content', collection), {
      recursive: true,
    });
  }
  return root;
}

function writeFixture(root: string, file: string, content: string): void {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

describe('taxonomies', () => {
  it('resolves a valid person reference to the canonical title', () => {
    const groups = resolvePostTaxonomyGroups({
      ereignisse: [],
      feiertage: [],
      orte: [],
      personen: [
        entity('personen', 'thaksin-shinawatra', 'Thaksin Shinawatra'),
      ],
      post: post({
        personen: [{ collection: 'personen', id: 'thaksin-shinawatra' }],
      }),
    });

    expect(groups[0]).toMatchObject({
      items: [
        {
          href: '/archiv/personen/thaksin-shinawatra/',
          label: 'Thaksin Shinawatra',
        },
      ],
      label: 'Personen',
    });
    expect(groups[0]?.items[0]?.label).not.toBe('thaksin-shinawatra');
  });

  it('throws a useful error for a missing person reference', () => {
    expect(() =>
      resolvePostTaxonomyGroups({
        ereignisse: [],
        feiertage: [],
        orte: [],
        personen: [],
        post: post({
          personen: [{ collection: 'personen', id: 'fehlt' }],
        }),
      }),
    ).toThrow(/Fehlende Taxonomie-Referenz: personen:fehlt/);
  });

  it('renders person-link classes for the icon hover animation', () => {
    const html = personLinkHastToHtml(
      buildPersonLinkHast({
        id: 'anutin-charnvirakul',
        label: [{ type: 'text', value: 'Anutin Charnvirakul' }],
      }),
    );

    expect(html).toContain('dnb-person-link inline-flex');
    expect(html).toContain('dnb-person-link__icon size-3.5 shrink-0');
  });

  it('orders post taxonomy groups and omits topics from the lower list', () => {
    const groups = resolvePostTaxonomyGroups({
      ereignisse: [
        entity('ereignisse', 'songkran', 'Songkran', {
          orte: [],
          personen: [],
          recurring: true,
        }),
      ],
      feiertage: [
        entity('feiertage', '_index', 'Feiertage in Thailand', {
          date: new Date('2026-01-01T00:00:00+07:00'),
        }),
      ],
      orte: [entity('orte', 'bangkok', 'Bangkok')],
      personen: [
        entity('personen', 'thaksin-shinawatra', 'Thaksin Shinawatra'),
      ],
      post: post({
        ereignisse: [{ collection: 'ereignisse', id: 'songkran' }],
        feiertage: [{ collection: 'feiertage', id: '_index' }],
        orte: [{ collection: 'orte', id: 'bangkok' }],
        personen: [{ collection: 'personen', id: 'thaksin-shinawatra' }],
        themen: ['politik'],
      }),
    });

    expect(groups.map((group) => group.label)).toEqual([
      'Orte',
      'Ereignisse',
      'Feiertage',
      'Personen',
    ]);
    expect(groups.flatMap((group) => group.items)).toEqual([
      { href: '/archiv/orte/bangkok/', label: 'Bangkok' },
      { href: '/archiv/ereignisse/songkran/', label: 'Songkran' },
      { href: '/feiertage/', label: 'Feiertage in Thailand' },
      {
        href: '/archiv/personen/thaksin-shinawatra/',
        label: 'Thaksin Shinawatra',
      },
    ]);
  });

  it('accepts a valid place parent reference', () => {
    const root = makeFixture();
    writeFixture(
      root,
      'src/content/orte/thailand/_index.md',
      '---\ntitle: Thailand\n---\n',
    );
    writeFixture(
      root,
      'src/content/orte/bangkok/_index.md',
      '---\ntitle: Bangkok\nparent: thailand\n---\n',
    );

    expect(validateTaxonomyIntegrity(root)).toEqual([]);
  });

  it('reports an invalid place parent reference', () => {
    const root = makeFixture();
    writeFixture(
      root,
      'src/content/orte/bangkok/_index.md',
      '---\ntitle: Bangkok\nparent: thailand\n---\n',
    );

    expect(validateTaxonomyIntegrity(root)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'parent', reference: 'thailand' }),
      ]),
    );
  });

  it('reports an invalid holiday reference from a post', () => {
    const root = makeFixture();
    writeFixture(
      root,
      'src/content/posts/2026/beispiel/index.md',
      '---\ntitle: Beispiel\ndate: 2026-01-01T00:00:00+07:00\nfeiertage:\n  - fehlt\n---\n',
    );

    expect(validateTaxonomyIntegrity(root)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'feiertage', reference: 'fehlt' }),
      ]),
    );
  });

  it('accepts an event with people and places', () => {
    const root = makeFixture();
    writeFixture(
      root,
      'src/content/personen/thaksin/_index.md',
      '---\ntitle: Thaksin\n---\n',
    );
    writeFixture(
      root,
      'src/content/orte/bangkok/_index.md',
      '---\ntitle: Bangkok\n---\n',
    );
    writeFixture(
      root,
      'src/content/ereignisse/rueckkehr/_index.md',
      '---\ntitle: Rückkehr\npersonen:\n  - thaksin\norte:\n  - bangkok\n---\n',
    );

    expect(validateTaxonomyIntegrity(root)).toEqual([]);
  });

  it('reports an event whose end date is before its start date', () => {
    const root = makeFixture();
    writeFixture(
      root,
      'src/content/ereignisse/test/_index.md',
      '---\ntitle: Test\nstartDate: 2026-02-01\nendDate: 2026-01-01\n---\n',
    );

    expect(validateTaxonomyIntegrity(root)).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'endDate' })]),
    );
  });

  it('allows a free-form topic without a collection entry', () => {
    const groups = groupPostsByThema([post({ themen: ['politik'] })], []);

    expect(groups).toMatchObject([{ slug: 'politik', title: 'Politik' }]);
  });

  it('uses curated topic metadata as a title override', () => {
    const groups = groupPostsByThema(
      [post({ themen: ['politik'] })],
      [entity('themen', 'politik', 'Politik in Thailand')],
    );

    expect(groups[0]?.title).toBe('Politik in Thailand');
  });

  it('normalises topic casing into one public slug', () => {
    const groups = groupPostsByThema(
      [post({ themen: ['TAT'] }), post({ themen: ['tat'] })],
      [],
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ posts: expect.any(Array), slug: 'tat' });
    expect(groups[0]?.posts).toHaveLength(2);
  });

  it('renders separate taxonomy groups', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PostTaxonomyGroups, {
      props: {
        groups: [
          {
            items: [{ href: '/archiv/orte/bangkok/', label: 'Bangkok' }],
            label: 'Orte',
          },
          {
            items: [{ href: '/archiv/personen/thaksin/', label: 'Thaksin' }],
            label: 'Personen',
          },
        ],
      },
    });

    expect(html).toContain('Orte');
    expect(html).toContain('Personen');
    expect(html).not.toContain('Themen');
    expect(html).toContain('/archiv/orte/bangkok/');
    expect(html).toContain('/archiv/personen/thaksin/');
  });

  it('hides draft entities from public indexes', () => {
    expect(
      isPublicEntity(entity('personen', 'draft', 'Draft', { draft: true })),
    ).toBe(false);
  });

  it('keeps permanent compatibility redirects from old tag and taxonomy URLs', () => {
    expect(redirects['/tags/']).toBe('/archiv/themen/');
    expect(redirects['/tags/[slug]']).toBe('/archiv/themen/[slug]');
    expect(redirects['/themen/']).toBe('/archiv/themen/');
    expect(redirects['/themen/[slug]']).toBe('/archiv/themen/[slug]');
    expect(redirects['/leute/']).toBe('/archiv/personen/');
    expect(redirects['/leute/[slug]']).toBe('/archiv/personen/[slug]');
    expect(redirects['/orte/']).toBe('/archiv/orte/');
    expect(redirects['/orte/[slug]']).toBe('/archiv/orte/[slug]');
    expect(redirects['/ereignisse/']).toBe('/archiv/ereignisse/');
    expect(redirects['/ereignisse/[slug]']).toBe('/archiv/ereignisse/[slug]');
  });

  it('reports duplicate aliases inside registered entities', () => {
    const root = makeFixture();
    writeFixture(
      root,
      'src/content/personen/a/_index.md',
      '---\ntitle: A\naliases:\n  - Gleich\n---\n',
    );
    writeFixture(
      root,
      'src/content/personen/b/_index.md',
      '---\ntitle: B\naliases:\n  - Gleich\n---\n',
    );

    expect(validateTaxonomyIntegrity(root)).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'aliases' })]),
    );
  });
});
