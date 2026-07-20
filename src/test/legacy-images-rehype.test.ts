import path from 'node:path';
import { rehypeLegacyImages } from '@scripts/rehype/legacy-images';
import type { Element, Properties, Root } from 'hast';
import { VFile } from 'vfile';
import { describe, expect, it } from 'vitest';

const postsDir = path.join(process.cwd(), 'src/content/posts');
const bundledPostDir = path.join(
  postsDir,
  '2015/08/karrieren-die-auslaender-nicht',
);

function imgTree(properties: Properties): Root {
  const img: Element = {
    children: [],
    properties,
    tagName: 'img',
    type: 'element',
  };
  return { children: [img], type: 'root' };
}

function makeFile(
  options: { frontmatter?: Record<string, unknown>; fromDir?: string } = {},
) {
  const file = new VFile({
    data: { astro: { frontmatter: options.frontmatter ?? {} } },
    value: '',
  });
  if (options.fromDir) file.path = path.join(options.fromDir, 'index.md');
  return file;
}

async function run(
  tree: Root,
  file: VFile,
  options?: Parameters<typeof rehypeLegacyImages>[0],
) {
  const transformer = rehypeLegacyImages(options);
  await transformer(tree, file);
  return tree.children[0] as Element;
}

describe('rehypeLegacyImages', () => {
  it('leaves a remote image untouched (graceful fallback)', async () => {
    const tree = imgTree({ alt: 'x', src: 'https://example.com/photo.jpg' });
    const node = await run(tree, makeFile());
    expect(node.tagName).toBe('img');
    expect(node.properties.src).toBe('https://example.com/photo.jpg');
  });

  it('leaves an SVG image untouched', async () => {
    const tree = imgTree({
      alt: 'logo',
      height: 32,
      src: '/assets/logo.svg',
      width: 32,
    });
    const node = await run(tree, makeFile());
    expect(node.tagName).toBe('img');
  });

  it('leaves an image with unresolvable local metadata untouched', async () => {
    const tree = imgTree({
      alt: 'x',
      src: '/wp-content/old-images/does-not-exist.jpg',
    });
    const node = await run(tree, makeFile());
    expect(node.tagName).toBe('img');
  });

  it('wraps a small local root-relative image in a legacy frame', async () => {
    const tree = imgTree({
      alt: 'Winter',
      src: '/wp-content/old-images/100.jpg',
    });
    const node = await run(tree, makeFile());

    expect(node.tagName).toBe('span');
    expect(node.properties['data-legacy-image-mode']).toBe('legacy');
    expect(node.properties.className).toContain('legacy-image-frame');

    const bg = node.children.find(
      (child): child is Element =>
        child.type === 'element' &&
        child.tagName === 'span' &&
        (child.properties.className as string[])?.includes('legacy-image-bg'),
    );
    expect(bg).toBeDefined();
    expect(bg?.properties.ariaHidden).toBe('true');
    expect(bg?.properties.alt).toBeUndefined();
    expect(String(bg?.properties.style)).toContain(
      'background-image:url(data:image/webp;base64,',
    );

    const fg = node.children.find(
      (child): child is Element =>
        child.type === 'element' && child.tagName === 'img',
    );
    expect(fg?.properties.alt).toBe('Winter');
    expect(fg?.properties.width).toBe(420);
    expect(fg?.properties.height).toBe(315);
    // Only one alt attribute exists on the whole subtree -- no duplicated
    // alternative text between the decorative background and the foreground.
    const altCount = node.children.filter(
      (child): child is Element =>
        child.type === 'element' && 'alt' in child.properties,
    ).length;
    expect(altCount).toBe(1);
  });

  it('wraps an extremely small source as thumbnail without a blurred background', async () => {
    const tree = imgTree({
      alt: 'tiny',
      src: '/wp-content/old-images/105.jpg',
    });
    const node = await run(tree, makeFile());

    expect(node.properties['data-legacy-image-mode']).toBe('thumbnail');
    expect(node.properties.className).toContain(
      'legacy-image-frame--thumbnail',
    );
    const bg = node.children.find(
      (child): child is Element =>
        child.type === 'element' && child.tagName === 'span',
    );
    expect(bg).toBeUndefined();
  });

  it('leaves a large bundled (relative-path) image as standard', async () => {
    const tree = imgTree({ alt: 'Jobs', src: './jobs1.png' });
    const node = await run(tree, makeFile({ fromDir: bundledPostDir }));

    expect(node.tagName).toBe('img');
    expect(node.properties.width).toBe(1017);
    expect(node.properties.height).toBe(754);
  });

  it('applies a post-level "never" override even to a tiny source', async () => {
    const tree = imgTree({
      alt: 'tiny',
      src: '/wp-content/old-images/105.jpg',
    });
    const node = await run(
      tree,
      makeFile({ frontmatter: { legacyImages: 'never' } }),
    );
    expect(node.tagName).toBe('img');
  });

  it('applies a post-level "always" override to an otherwise-standard source', async () => {
    const tree = imgTree({ alt: 'Jobs', src: './jobs1.png' });
    const node = await run(
      tree,
      makeFile({
        fromDir: bundledPostDir,
        frontmatter: { legacyImages: 'always' },
      }),
    );
    expect(node.properties['data-legacy-image-mode']).toBe('legacy');
  });

  it('lets a per-image data-legacy-image override win over the post-level override', async () => {
    const tree = imgTree({
      alt: 'Jobs',
      dataLegacyImage: 'always',
      src: './jobs1.png',
    });
    const node = await run(
      tree,
      makeFile({
        fromDir: bundledPostDir,
        frontmatter: { legacyImages: 'never' },
      }),
    );
    expect(node.properties['data-legacy-image-mode']).toBe('legacy');
  });

  it('strips the data-legacy-image marker from rendered output either way', async () => {
    const tree = imgTree({
      alt: 'x',
      dataLegacyImage: 'never',
      height: 800,
      src: '/wp-content/old-images/100.jpg',
      width: 1200,
    });
    const node = await run(tree, makeFile());
    expect(node.properties.dataLegacyImage).toBeUndefined();
  });
});
