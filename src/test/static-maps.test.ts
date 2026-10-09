import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { bundleOutput, main } from '@scripts/maps/maps';
import { rehypeStaticMaps } from '@scripts/rehype/static-maps';
import { remarkStaticMaps } from '@scripts/remark/static-maps';
import { datasetSchema } from '@utils/static-maps/data';
import { renderStaticMap } from '@utils/static-maps/render';
import { staticMapSchema, staticMapsSchema } from '@utils/static-maps/schema';
import { staticMapStyle } from '@utils/static-maps/style';
import type { Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import sharp from 'sharp';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { afterEach, describe, expect, it } from 'vitest';
import { stringify } from 'yaml';

const root = process.cwd();
const minimal = {
  alt: 'Karte von Samui',
  bounds: {
    bottomRight: { latitude: 9, longitude: 101 },
    topLeft: { latitude: 10, longitude: 99 },
  },
  id: 'route',
  image: 'map-route.webp',
  points: [
    {
      coordinates: { latitude: 9.5, longitude: 100 },
      id: 'samui',
      title: 'Koh Samui',
    },
  ],
  size: { height: 320, width: 640 },
};
const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporary
      .splice(0)
      .map((directory) => fs.rm(directory, { force: true, recursive: true })),
  );
});
async function fixture() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'static-maps-'));
  temporary.push(directory);
  for (const file of [
    'src/data/static-maps/southern-thailand-malaysia.json',
    'src/utils/static-maps/render.ts',
    staticMapStyle.latinFont,
    staticMapStyle.thaiFont,
  ]) {
    await fs.mkdir(path.dirname(path.join(directory, file)), {
      recursive: true,
    });
    if (file === staticMapStyle.latinFont || file === staticMapStyle.thaiFont)
      await fs.symlink(path.join(root, file), path.join(directory, file));
    else await fs.copyFile(path.join(root, file), path.join(directory, file));
  }
  const bundle = path.join(directory, 'src/content/posts/2020/01/map-test');
  await fs.mkdir(bundle, { recursive: true });
  await fs.writeFile(
    path.join(bundle, 'index.md'),
    `---\n${stringify({ maps: [minimal] })}---\n<dnb-map id="route"></dnb-map>\n`,
  );
  return { bundle, directory };
}

describe('static map schema', () => {
  it('accepts multiple maps and supplies defaults', () => {
    const maps = staticMapsSchema.parse([
      minimal,
      { ...minimal, id: 'detail', image: 'map-detail.webp', size: undefined },
    ]);
    expect(maps[1]?.size).toEqual({ height: 630, width: 1200 });
  });
  it.each([
    { bounds: { ...minimal.bounds, topLeft: { latitude: 8, longitude: 99 } } },
    {
      bounds: { ...minimal.bounds, topLeft: { latitude: 10, longitude: 102 } },
    },
    { bounds: { ...minimal.bounds, topLeft: { latitude: 91, longitude: 99 } } },
    {
      bounds: {
        ...minimal.bounds,
        bottomRight: { latitude: 9, longitude: 181 },
      },
    },
    { points: [...minimal.points, ...minimal.points] },
    { routes: [{ points: ['samui', 'missing'] }] },
    { image: '../escape.webp' },
    { image: 'folder/map.webp' },
    { image: 'folder\\map.webp' },
    { image: 'map..webp' },
    { alt: ' ' },
    { size: { height: 630, width: 0 } },
    {
      points: [
        { ...minimal.points[0], coordinates: { latitude: 11, longitude: 100 } },
      ],
    },
  ])('rejects invalid configuration %j', (patch) => {
    expect(staticMapSchema.safeParse({ ...minimal, ...patch }).success).toBe(
      false,
    );
  });
  it('rejects duplicate resource IDs and filenames', () => {
    expect(staticMapsSchema.safeParse([minimal, minimal]).success).toBe(false);
    expect(
      staticMapsSchema.safeParse([minimal, { ...minimal, id: 'detail' }])
        .success,
    ).toBe(false);
  });
});

describe('map placement', () => {
  it('creates an ordinary Markdown image for Astro and automatic HTML attribution', async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkStaticMaps)
      .use(remarkRehype)
      .use(rehypeStaticMaps);
    const file = new VFile({
      path: '/posts/example/index.md',
      value: 'Before.\n\n<dnb-map id="route"></dnb-map>\n\nAfter.',
    });
    file.data['astro'] = { frontmatter: { maps: [minimal] } };
    const html = toHtml(
      (await processor.run(processor.parse(file), file)) as Root,
    );
    expect(html).toContain('src="./map-route.webp"');
    expect(html).toContain('alt="Karte von Samui"');
    expect(html).toContain('<figure');
    expect(html).toContain('Kartendaten ©');
    expect(html).toContain('href="https://www.openstreetmap.org/copyright"');
    expect(html.indexOf('Before.')).toBeLessThan(html.indexOf('<figure'));
    expect(html.indexOf('After.')).toBeGreaterThan(html.indexOf('</figure>'));
    expect(html).not.toContain('<script');
  });
  it('fails on unknown map IDs and inline placement', async () => {
    const processor = unified().use(remarkParse).use(remarkStaticMaps);
    for (const value of [
      '<dnb-map id="missing"></dnb-map>',
      'Text <dnb-map id="route"></dnb-map>',
    ]) {
      const file = new VFile({ value });
      file.data['astro'] = { frontmatter: { maps: [minimal] } };
      await expect(
        processor.run(processor.parse(file), file),
      ).rejects.toThrow();
    }
  });
});

describe('offline generation and verification', () => {
  it('creates deterministic assets, preserves unchanged outputs, and verifies without rendering inputs', async () => {
    const { directory, bundle } = await fixture();
    await main(['--post=2020/01/map-test'], directory);
    const output = path.join(bundle, minimal.image);
    const first = await fs.readFile(output);
    expect(await sharp(first).metadata()).toMatchObject({
      format: 'webp',
      height: 320,
      width: 640,
    });
    await main(['--all'], directory);
    expect(await fs.readFile(output)).toEqual(first);
    const before = (await fs.stat(output)).mtimeMs;
    await main(['--changed'], directory);
    expect((await fs.stat(output)).mtimeMs).toBe(before);
    await fs.rm(path.join(directory, 'src/data'), { recursive: true });
    await fs.rm(path.join(directory, 'public'), { recursive: true });
    await main(['--verify'], directory);
    const text = await fs.readFile(path.join(bundle, 'index.md'), 'utf8');
    await fs.writeFile(
      path.join(bundle, 'index.md'),
      text.replace('Karte von Samui', 'Neue Karte'),
    );
    await expect(main(['--verify'], directory)).rejects.toThrow(/modified/);
  });
  it('fails clearly when local data is missing', async () => {
    const { directory } = await fixture();
    await fs.rm(path.join(directory, 'src/data'), { recursive: true });
    await expect(main(['--all'], directory)).rejects.toThrow(
      /Local map data is unavailable/,
    );
  });
  it('rejects traversal, symlink output, and unrelated image overwrites', async () => {
    const { directory, bundle } = await fixture();
    await expect(main(['--post=../../outside'], directory)).rejects.toThrow(
      /unsafe/,
    );
    await expect(bundleOutput(bundle, '../outside.webp')).rejects.toThrow(
      /bundle-local/,
    );
    const outside = path.join(directory, 'outside.webp');
    await fs.writeFile(outside, 'keep');
    await fs.symlink(outside, path.join(bundle, minimal.image));
    await expect(main(['--all'], directory)).rejects.toThrow(/non-regular/);
    expect(await fs.readFile(outside, 'utf8')).toBe('keep');
    await fs.unlink(path.join(bundle, minimal.image));
    await fs.writeFile(path.join(bundle, minimal.image), 'unrelated');
    await expect(main(['--all'], directory)).rejects.toThrow(/not owned/);
  });
  it('detects orphaned generated images and missing assets', async () => {
    const { directory, bundle } = await fixture();
    await main(['--all'], directory);
    await fs.writeFile(path.join(bundle, 'map-abandoned.webp'), 'orphan');
    await expect(main(['--verify'], directory)).rejects.toThrow(/Undeclared/);
    await fs.unlink(path.join(bundle, 'map-abandoned.webp'));
    await fs.unlink(path.join(bundle, minimal.image));
    await expect(main(['--verify'], directory)).rejects.toThrow();
  });
  it('renders Thai and escaped Latin labels locally, and rejects out-of-region frames', async () => {
    const data = datasetSchema.parse(
      JSON.parse(
        await fs.readFile(
          path.join(
            root,
            'src/data/static-maps/southern-thailand-malaysia.json',
          ),
          'utf8',
        ),
      ),
    );
    for (const label of ['เกาะสมุย', 'Samui & <Penang>']) {
      const map = staticMapSchema.parse({
        ...minimal,
        points: [{ ...minimal.points[0], label }],
      });
      const bytes = await renderStaticMap(map, data, root);
      expect((await sharp(bytes).metadata()).width).toBe(640);
    }
    const map = staticMapSchema.parse({
      ...minimal,
      bounds: { ...minimal.bounds, topLeft: { latitude: 12, longitude: 99 } },
    });
    await expect(renderStaticMap(map, data, root)).rejects.toThrow(/exceed/);
  });
});
