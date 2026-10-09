import { describe, expect, it } from 'vitest';
import { validateDocroot } from '../scripts/deploy/lib/config.ts';
import { isReleaseName, releaseName } from '../scripts/deploy/lib/dreamhost.ts';
import {
  fileToUrlPath,
  isImmutableAsset,
  planPurge,
} from '../scripts/deploy/lib/purge-plan.ts';

const SITE = 'https://samui-samui.de';

describe('validateDocroot', () => {
  it('accepts the DreamHost web directory', () => {
    expect(
      validateDocroot('/home/samuisamui/samui-samui.de/public', 'samuisamui'),
    ).toBe('/home/samuisamui/samui-samui.de/public');
  });

  it.each([
    ['', 'empty'],
    ['/', 'root'],
    ['/home/samuisamui', 'home directory'],
    ['/home/samuisamui/samui-samui.de', 'site directory'],
    ['/home/samuisamui/samui-samui.de/public/', 'trailing slash'],
    ['home/samuisamui/samui-samui.de/public', 'relative'],
    ['/home/samuisamui/../other/public', 'dot-dot'],
    ['/home/samuisamui/site dir/public', 'space'],
    ['/home/samuisamui/samui-samui.de/$(rm -rf ~)', 'shell metacharacters'],
    ['/var/www/samui-samui.de/public', 'outside /home'],
  ])('rejects %j (%s)', (docroot) => {
    expect(() => validateDocroot(docroot)).toThrow(/Refusing DREAMHOST_PATH/);
  });

  it('rejects another user’s home', () => {
    expect(() =>
      validateDocroot('/home/other/samui-samui.de/public', 'samuisamui'),
    ).toThrow(/inside \/home\/samuisamui\//);
  });
});

describe('release names', () => {
  it('are sortable UTC timestamps with the git sha', () => {
    const name = releaseName(
      new Date('2026-10-09T08:30:00.123Z'),
      '1aaaef2',
      false,
    );
    expect(name).toBe('20261009T083000Z-1aaaef2');
    expect(isReleaseName(name)).toBe(true);
    expect(isReleaseName(`${name}-dirty`)).toBe(true);
  });

  it('never match paths that could escape the releases directory', () => {
    for (const name of [
      '',
      '.',
      '..',
      '../public',
      '*',
      '20261009T083000Z/../x',
    ]) {
      expect(isReleaseName(name)).toBe(false);
    }
  });
});

describe('fileToUrlPath', () => {
  it('maps directory-format pages to trailing-slash URLs', () => {
    expect(fileToUrlPath('index.html')).toBe('/');
    expect(fileToUrlPath('2026/10/neuer-post/index.html')).toBe(
      '/2026/10/neuer-post/',
    );
    expect(fileToUrlPath('archiv/themen/müll/index.html')).toBe(
      '/archiv/themen/m%C3%BCll/',
    );
    expect(fileToUrlPath('rss.xml')).toBe('/rss.xml');
  });

  it('skips files that are not one addressable URL', () => {
    expect(fileToUrlPath('404.html')).toBeNull();
    expect(fileToUrlPath('.htaccess')).toBeNull();
  });

  it('recognises fingerprinted Astro output', () => {
    expect(isImmutableAsset('assets/BaseHead.Bgn8Dyxd.css')).toBe(true);
    expect(isImmutableAsset('assets/webfonts/100/font.woff2')).toBe(false);
  });
});

describe('planPurge', () => {
  const contentDeploy = {
    added: [
      '2026/10/neuer-post/index.html',
      'assets/cover.Abc123.webp',
      'pagefind/fragment/de_1.pf_fragment',
    ],
    changed: [
      '2026/10/neuer-post/index.html',
      'index.html',
      'seite/2/index.html',
      'rss.xml',
      'sitemap-0.xml',
      'pagefind/pagefind-entry.json',
      'assets/cover.Abc123.webp',
      'pagefind/fragment/de_1.pf_fragment',
    ],
    deleted: ['pagefind/fragment/de_0.pf_fragment'],
  };

  it('purges exactly the changed URLs for a content deploy', () => {
    const plan = planPurge(contentDeploy, { siteUrl: SITE });
    expect(plan.mode).toBe('selective');
    expect(plan.tags).toEqual([]);
    expect(plan.urls).toEqual([
      `${SITE}/`,
      `${SITE}/2026/10/neuer-post/`,
      `${SITE}/seite/2/`,
      `${SITE}/pagefind/fragment/de_0.pf_fragment`,
      `${SITE}/pagefind/pagefind-entry.json`,
      `${SITE}/rss.xml`,
      `${SITE}/sitemap-0.xml`,
    ]);
  });

  it('switches to the html tag when a template change touches many pages', () => {
    const changed = Array.from(
      { length: 2800 },
      (_, index) => `page-${index}/index.html`,
    );
    const plan = planPurge(
      { added: [], changed: [...changed, 'rss.xml'], deleted: [] },
      { siteUrl: SITE },
    );
    expect(plan.mode).toBe('html-tag');
    expect(plan.tags).toEqual(['html']);
    // Non-HTML files are still purged one by one; immutable assets never.
    expect(plan.urls).toEqual([`${SITE}/rss.xml`]);
  });

  it('honours an explicit broad purge', () => {
    const plan = planPurge(contentDeploy, { mode: 'html', siteUrl: SITE });
    expect(plan.mode).toBe('html-tag');
    expect(plan.urls.every((url) => !url.endsWith('/'))).toBe(true);
  });

  it('purges html and static tags when .htaccess changed', () => {
    const plan = planPurge(
      { added: [], changed: ['.htaccess'], deleted: [] },
      { siteUrl: SITE },
    );
    expect(plan.tags).toEqual(['html', 'static']);
  });

  it('does nothing when nothing changed', () => {
    expect(
      planPurge({ added: [], changed: [], deleted: [] }, { siteUrl: SITE })
        .mode,
    ).toBe('none');
  });
});
