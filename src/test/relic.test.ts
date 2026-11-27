import type { CollectionEntry } from 'astro:content';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import RelicNotice from '../components/content/post/RelicNotice.astro';
import { orderPostsForHomepage } from '../utils/homepage-posts';
import {
  availabilityFromStatus,
  type MediaHistory,
  mediaCandidate,
  updateMediaHistory,
} from '../utils/media-history';
import { createRelatedPostLookup } from '../utils/related-posts';
import { isRelic, relicReviewSchema } from '../utils/relic';
import { getRelicPaths } from '../utils/relic-paths';
import { getVideoReferences } from '../utils/video-references';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { force: true, recursive: true });
});
const review = {
  reason: 'missing-media',
  reviewed: new Date('2026-11-27'),
  status: 'relic',
} as const;
const original =
  '---\ntitle: Example\ndate: 2005-01-01T00:00:00+07:00\nurl: /original-url/\n# Preserve this comment\ncover:\n  type: youtube\n  video: dQw4w9WgXcQ\n---\nSurviving body.\n';
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'samui-relic-'));
  roots.push(root);
  for (const dir of [
    'src/scripts/content',
    'src/utils',
    'src/data',
    'src/content/posts/2005/example',
  ])
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  for (const file of [
    'src/scripts/publisher.ts',
    'src/scripts/content/fetch-video-thumbnails.ts',
    'src/utils/relic.ts',
    'src/utils/media-history.ts',
    'src/utils/video-references.ts',
  ])
    fs.copyFileSync(file, path.join(root, file));
  fs.symlinkSync(
    path.resolve('node_modules'),
    path.join(root, 'node_modules'),
    'dir',
  );
  fs.writeFileSync(path.join(root, 'package.json'), '{"type":"module"}');
  fs.writeFileSync(path.join(root, 'src/data/video-media.json'), '{}');
  fs.writeFileSync(
    path.join(root, 'src/content/posts/2005/example/index.md'),
    original,
  );
  return root;
}
function publisher(root: string, ...args: string[]) {
  return spawnSync(
    process.execPath,
    ['src/scripts/publisher.ts', 'relic', ...args],
    { cwd: root, encoding: 'utf8' },
  );
}
const post = (id: string, relic = false) =>
  ({
    data: {
      date: new Date(),
      options: { featured: true },
      themen: ['samui'],
      title: id,
      ...(relic ? { relic: review } : {}),
    },
    id,
  }) as CollectionEntry<'posts'>;
const observation: MediaHistory = {
  availability: 'available',
  consecutiveFailures: 0,
  files: ['src/content/posts/2005/example/index.md'],
  id: 'dQw4w9WgXcQ',
  lastChecked: '2026-11-27T00:00:00Z',
  provider: 'youtube',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

describe('digital relic editorial lifecycle', () => {
  it('distinguishes unreviewed, reviewed regular posts, and relics', () => {
    expect(relicReviewSchema.optional().parse(undefined)).toBeUndefined();
    expect(isRelic(post('unreviewed'))).toBe(false);
    expect(
      relicReviewSchema.parse({ reviewed: '2026-11-27', status: 'not-relic' })
        .status,
    ).toBe('not-relic');
    expect(relicReviewSchema.parse(review)).toMatchObject(review);
    for (const invalid of [
      false,
      {},
      { reviewed: '2026-11-27', status: 'relic' },
      { ...review, reason: 'old' },
      { ...review, reviewed: '2026-02-31' },
      { ...review, reviewed: null },
      { ...review, note: ' ' },
      { reason: 'other', reviewed: '2026-11-27', status: 'not-relic' },
    ])
      expect(relicReviewSchema.safeParse(invalid).success).toBe(false);
  });
  it('excludes relics from promotion while retaining the input archive', () => {
    const posts = [post('relic', true), post('regular')];
    expect(orderPostsForHomepage(posts).map((p) => p.id)).toEqual(['regular']);
    expect(
      createRelatedPostLookup(posts)(post('source')).map((p) => p.id),
    ).toEqual(['regular']);
    expect(posts).toHaveLength(2);
  });
  it('renders a muted German notice, escaped note, review date, and explanation link', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(RelicNotice, {
      props: { review: { ...review, note: '<script>unsafe</script>' } },
    });
    expect(html).toContain('Digitales Relikt');
    expect(html).toContain('mound-shovel');
    expect(html).toContain('data-pagefind-ignore');
    expect(html).toContain('/digitale-archaeologie/');
    expect(html).toContain('27. November 2026');
    expect(html).not.toContain('<script>unsafe');
  });
  it('keeps original permalink paths out of the sitemap only for classified relics', () => {
    const root = fixture();
    const file = path.join(root, 'src/content/posts/2005/example/index.md');
    expect(getRelicPaths(root).has('/original-url/')).toBe(false);
    fs.writeFileSync(
      file,
      original.replace(
        'title: Example',
        'title: Example\nrelic:\n  status: relic\n  reviewed: 2026-11-27\n  reason: missing-media',
      ),
    );
    expect(getRelicPaths(root).has('/original-url/')).toBe(true);
    fs.writeFileSync(
      file,
      original
        .replace('url: /original-url/\n', '')
        .replace('title: Example', 'title: Example\nrelic:\n  status: relic'),
    );
    expect(getRelicPaths(root).has('/2005/01/example/')).toBe(true);
  });
  it('requires one explicit path and a valid decision before editorial writes', () => {
    const root = fixture();
    const file = path.join(root, 'src/content/posts/2005/example/index.md');
    for (const args of [
      [],
      ['--path=**'],
      ['--path=2005/example', '--status=relic', '--reviewed=2026-11-27'],
      ['--path=../2005/example'],
      [
        '--path=2005/example',
        '--status=not-relic',
        '--reviewed=2026-11-27',
        '--dryrun',
      ],
    ]) {
      expect(publisher(root, 'review', ...args).status).toBe(1);
      expect(fs.readFileSync(file, 'utf8')).toBe(original);
    }
    const args = [
      '--path=2005/example',
      '--status=relic',
      '--reviewed=2026-11-27',
      '--reason=missing-media',
    ];
    expect(publisher(root, 'review', ...args, '--dry-run').status).toBe(0);
    expect(fs.readFileSync(file, 'utf8')).toBe(original);
    expect(publisher(root, 'review', ...args).status).toBe(0);
    const edited = fs.readFileSync(file, 'utf8');
    expect(edited).toContain('# Preserve this comment');
    expect(edited.endsWith('---\nSurviving body.\n')).toBe(true);
    expect(publisher(root, 'list', '--status=relic').stdout).toContain(
      '2005/example/index.md',
    );
    expect(
      publisher(root, 'restore', '--path=2005/example', '--reviewed=2026-11-27')
        .status,
    ).toBe(0);
    const restored = parse(
      /^---\n([\s\S]*?)\n---/.exec(fs.readFileSync(file, 'utf8'))?.[1] ?? '',
    );
    expect(restored.relic).toEqual({
      reviewed: '2026-11-27',
      status: 'not-relic',
    });
    expect(restored.url).toBe('/original-url/');
    expect(restored.cover.video).toBe('dQw4w9WgXcQ');
  });
});

describe('non-destructive automated media history', () => {
  it('shares cover and body reference parsing and retains unlisted Vimeo URLs', () => {
    const refs = getVideoReferences(
      '---\ncover:\n  type: vimeo\n  video: 123\n  hash: secret\n---\n<dnb-youtube videoid="dQw4w9WgXcQ"></dnb-youtube><dnb-vimeo videoid="456" videohash="other"></dnb-vimeo>',
    );
    expect(refs.map((ref) => ref.url)).toEqual([
      'https://vimeo.com/123/secret',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://vimeo.com/456/other',
    ]);
    expect(
      getVideoReferences('<dnb-youtube videoid="invalid"></dnb-youtube>'),
    ).toEqual([]);
  });
  it('preserves last known metadata and thumbnail after confirmed or inconclusive failure', () => {
    const previous = updateMediaHistory(undefined, {
      ...observation,
      author: 'Creator',
      description: 'Description',
      published: '2005-01-01',
      thumbnail: 'local.jpg',
      title: 'Known title',
    });
    const failed = updateMediaHistory(previous, {
      ...observation,
      author: ' ',
      availability: 'unavailable',
      lastChecked: '2026-11-28T00:00:00Z',
      title: '',
    });
    expect(failed).toMatchObject({
      author: 'Creator',
      consecutiveFailures: 1,
      description: 'Description',
      firstChecked: observation.lastChecked,
      lastAvailable: observation.lastChecked,
      published: '2005-01-01',
      thumbnail: 'local.jpg',
      title: 'Known title',
    });
    const repeated = updateMediaHistory(failed, {
      ...observation,
      availability: 'unavailable',
    });
    const cache = { video: repeated };
    expect(mediaCandidate(observation.files, undefined, cache)).toBe(
      'candidate',
    );
    expect(mediaCandidate(observation.files, 'not-relic', cache)).toBe(
      'candidate',
    );
    expect(mediaCandidate(observation.files, 'relic', cache)).toBeUndefined();
    expect(
      mediaCandidate(observation.files, 'relic', { video: observation }),
    ).toBe('restoration-candidate');
    const unknown = updateMediaHistory(repeated, {
      ...observation,
      availability: 'unknown',
    });
    expect(unknown.consecutiveFailures).toBe(0);
    expect(unknown.title).toBe('Known title');
    expect(
      mediaCandidate(observation.files, undefined, { video: unknown }),
    ).toBeUndefined();
    for (const status of [400, 429, 500, 503])
      expect(availabilityFromStatus(status)).toBe('unknown');
    expect(availabilityFromStatus(403)).toBe('restricted');
  });
  it('runs the real verification command without changing post sources or deleting thumbnails', () => {
    const root = fixture();
    const thumb = path.join(
      root,
      'src/assets/images/video-thumbnails/youtube/dQw4w9WgXcQ.jpg',
    );
    fs.mkdirSync(path.dirname(thumb), { recursive: true });
    fs.writeFileSync(thumb, 'historical thumbnail');
    const mock = path.join(root, 'mock.mjs');
    fs.writeFileSync(
      mock,
      'globalThis.fetch = async () => new Response(null, { status: 404 });',
    );
    const run = () =>
      spawnSync(
        process.execPath,
        [
          '--import',
          mock,
          'src/scripts/content/fetch-video-thumbnails.ts',
          '--verify',
        ],
        { cwd: root, encoding: 'utf8' },
      );
    expect(run().status).toBe(0);
    expect(run().status).toBe(1);
    expect(publisher(root, 'list', '--status=candidate').stdout).toContain(
      '2005/example/index.md',
    );
    expect(
      fs.readFileSync(
        path.join(root, 'src/content/posts/2005/example/index.md'),
        'utf8',
      ),
    ).toBe(original);
    expect(fs.readFileSync(thumb, 'utf8')).toBe('historical thumbnail');
    const sourceFile = path.join(
      root,
      'src/content/posts/2005/example/index.md',
    );
    fs.writeFileSync(
      sourceFile,
      original.replace('cover:\n  type: youtube\n  video: dQw4w9WgXcQ\n', ''),
    );
    expect(publisher(root, 'list', '--status=candidate').stdout).toBe('');
    fs.writeFileSync(sourceFile, original);

    fs.writeFileSync(
      mock,
      'globalThis.fetch = async () => { throw new Error("Network failure"); };',
    );
    expect(run().status).toBe(0);
    expect(publisher(root, 'list', '--status=candidate').stdout).toBe('');
  });
});
