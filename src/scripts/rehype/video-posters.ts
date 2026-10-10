import type { ImageMetadata } from 'astro';
import type { Element, ElementContent, Root } from 'hast';
import { visitParents } from 'unist-util-visit-parents';
import type { VFile } from 'vfile';
// Relative import only: astro.config.ts loads this module directly, before
// Vite's `@utils/*` path aliases are registered (see rehype/legacy-images.ts).
import {
  resolveLocalThumbnail,
  type VideoThumbnailProvider,
} from '../../utils/video-thumbnails';

const ELEMENT_NAMES = {
  'dnb-vimeo': 'vimeo',
  'dnb-youtube': 'youtube',
} as const satisfies Record<string, VideoThumbnailProvider>;

type ThumbnailResolver = (
  provider: VideoThumbnailProvider,
  videoId: string,
) => ImageMetadata | string | undefined;

interface Target {
  node: Element;
  provider: (typeof ELEMENT_NAMES)[keyof typeof ELEMENT_NAMES];
}

function readAttr(
  properties: Element['properties'],
  name: string,
): string | undefined {
  const value = properties[name];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(' ');
  return undefined;
}

function hasPosterChild(node: Element): boolean {
  return node.children.some(
    (child) =>
      child.type === 'element' &&
      readAttr(child.properties, 'slot') === 'poster',
  );
}

/**
 * Rehype plugin giving raw-markdown `<dnb-youtube>`/`<dnb-vimeo>` embeds
 * (see rehype/notices.ts and rehype/person-link.ts for the sibling plugins
 * this one follows the same shape as) the same locally cached poster image
 * that post covers already get from `PostCover.astro` — both consumers
 * share `resolveLocalThumbnail()` (src/utils/video-thumbnails.ts) as their
 * single source of truth (see
 * documentation/content/video-thumbnail-cache.md).
 *
 * The custom elements use the injected local poster. When no thumbnail
 * exists, they show a neutral placeholder without contacting the provider.
 *
 * Must run after `rehypeRaw` (see astro.config.ts), same requirement as
 * `rehypeDnbNotice`/`rehypeDnbPerson`.
 *
 * @param resolveThumbnail Injectable for testing (this repo has no
 * precedent for testing `import.meta.glob`-based code, so tests stub this
 * instead); defaults to the real `resolveLocalThumbnail`.
 */
export function rehypeVideoPosters(
  resolveThumbnail: ThumbnailResolver = resolveLocalThumbnail,
) {
  return (tree: Root, file: VFile) => {
    const targets: Target[] = [];
    visitParents(tree, 'element', (node) => {
      const provider =
        ELEMENT_NAMES[node.tagName as keyof typeof ELEMENT_NAMES];
      if (!provider) return;
      if (hasPosterChild(node)) return;
      targets.push({ node, provider });
    });

    for (const { node, provider } of targets) {
      const videoId = readAttr(node.properties, 'videoid');
      if (!videoId) continue;

      const thumbnail = resolveThumbnail(provider, videoId);
      if (!thumbnail) continue;
      // Config-loaded asset imports are source paths before Astro's image
      // pipeline runs. Register them so Astro emits a local build asset.
      const src = typeof thumbnail === 'string' ? thumbnail : thumbnail.src;
      if (typeof thumbnail === 'string') {
        const data = file.data as {
          astro?: { localImagePaths?: string[] };
        };
        data.astro ??= {};
        data.astro.localImagePaths ??= [];
        if (!data.astro.localImagePaths.includes(src)) {
          data.astro.localImagePaths.push(src);
        }
      }

      const poster: Element = {
        children: [],
        properties: {
          alt: '',
          ...(typeof thumbnail === 'string'
            ? {}
            : { height: thumbnail.height, width: thumbnail.width }),
          slot: 'poster',
          src,
        },
        tagName: 'img',
        type: 'element',
      };

      (node.children as ElementContent[]).push(poster);
    }
  };
}
