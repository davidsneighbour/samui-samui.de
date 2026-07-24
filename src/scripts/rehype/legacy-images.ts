import path from 'node:path';
import type { Element, ElementContent, Root } from 'hast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
// Relative imports only: this module is loaded directly by astro.config.ts
// before Vite's `@utils/*` path aliases are registered.
import {
  classifyImagePresentation,
  foregroundMaxHeight,
  foregroundMaxWidth,
  resolveOverride,
} from '../../utils/legacy-images/classify';
import {
  defaultLegacyImageConfig,
  type LegacyImageConfig,
} from '../../utils/legacy-images/config';
import {
  computeFrameHeight,
  LEGACY_IMAGE_BG_CLASS,
  LEGACY_IMAGE_FG_CLASS,
  LEGACY_IMAGE_FRAME_CLASS,
  LEGACY_IMAGE_FRAME_THUMBNAIL_CLASS,
  LEGACY_IMAGE_SCRIM_CLASS,
} from '../../utils/legacy-images/frame';
import {
  buildTinyDerivativeDataUri,
  isRemoteSrc,
  isSvgSrc,
  probeImageDimensions,
  resolveImageFsPath,
} from '../../utils/legacy-images/fs';

// The prose column images render at across all current call sites (post
// body content has no narrower nested layout) -- see BlogPost.astro's
// `max-w-4xl` container. Kept in sync manually since body content has no
// per-image `sizes` the way <Picture> call sites do.
const DEFAULT_EXPECTED_RENDERED_WIDTH = 720;

const OVERRIDE_VALUES = new Set(['auto', 'always', 'never']);

export interface RehypeLegacyImagesOptions {
  config?: Partial<LegacyImageConfig>;
  expectedRenderedWidth?: number;
}

function readOverride(value: unknown): 'auto' | 'always' | 'never' | undefined {
  return typeof value === 'string' && OVERRIDE_VALUES.has(value)
    ? (value as 'auto' | 'always' | 'never')
    : undefined;
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

function readPixels(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value))
    return Number(value);
  return undefined;
}

interface BuildContext {
  config: LegacyImageConfig;
  expectedRenderedWidth: number;
  postOverride: 'auto' | 'always' | 'never' | undefined;
  fromDir: string | undefined;
}

async function buildFrame(
  img: Element,
  ctx: BuildContext,
): Promise<Element | undefined> {
  const properties = img.properties ?? {};
  const src = readAttr(properties, 'src');
  if (!src) return undefined;

  // The per-image override marker is only meaningful to us; strip it either
  // way so it never leaks into rendered output.
  const perImageOverride = readOverride(properties['dataLegacyImage']);
  delete properties['dataLegacyImage'];

  if (isSvgSrc(src)) return undefined;
  // Remote sources can't be probed or turned into a background derivative
  // without fetching them at build time, which this system deliberately
  // avoids -- always fall back to the existing plain rendering.
  if (isRemoteSrc(src)) return undefined;

  const override = resolveOverride(perImageOverride, ctx.postOverride);

  let intrinsicWidth = readPixels(properties.width);
  let intrinsicHeight = readPixels(properties.height);

  const fsPath = resolveImageFsPath(src, ctx.fromDir);

  if ((!intrinsicWidth || !intrinsicHeight) && fsPath) {
    const probed = await probeImageDimensions(fsPath);
    if (probed) {
      intrinsicWidth = probed.width;
      intrinsicHeight = probed.height;
    }
  }

  // No usable dimensions: don't guess a frame size, preserve existing
  // rendering instead.
  if (!intrinsicWidth || !intrinsicHeight) return undefined;

  const mode = classifyImagePresentation(
    {
      expectedRenderedWidth: ctx.expectedRenderedWidth,
      intrinsicHeight,
      intrinsicWidth,
      override,
    },
    ctx.config,
  );

  if (mode === 'standard') {
    properties.width = intrinsicWidth;
    properties.height = intrinsicHeight;
    return undefined;
  }

  const maxForegroundWidth = foregroundMaxWidth(intrinsicWidth, ctx.config);
  const maxForegroundHeight = foregroundMaxHeight(intrinsicHeight, ctx.config);
  const frameHeight = computeFrameHeight(
    maxForegroundHeight,
    ctx.expectedRenderedWidth,
  );

  const bgDataUri =
    mode === 'legacy' && fsPath
      ? await buildTinyDerivativeDataUri(fsPath, ctx.config.blurDerivativeWidth)
      : undefined;

  const children: ElementContent[] = [];

  if (bgDataUri) {
    children.push({
      children: [],
      properties: {
        ariaHidden: 'true',
        className: [LEGACY_IMAGE_BG_CLASS],
        style: `background-image:url(${bgDataUri})`,
      },
      tagName: 'span',
      type: 'element',
    });
    children.push({
      children: [],
      properties: { ariaHidden: 'true', className: [LEGACY_IMAGE_SCRIM_CLASS] },
      tagName: 'span',
      type: 'element',
    });
  }

  children.push({
    children: [],
    properties: {
      ...properties,
      className: [LEGACY_IMAGE_FG_CLASS],
      decoding: properties.decoding ?? 'async',
      height: intrinsicHeight,
      loading: properties.loading ?? 'lazy',
      style: `max-width:min(100%, ${maxForegroundWidth}px)`,
      width: intrinsicWidth,
    },
    tagName: 'img',
    type: 'element',
  });

  return {
    children,
    properties: {
      className: [
        LEGACY_IMAGE_FRAME_CLASS,
        ...(mode === 'thumbnail' ? [LEGACY_IMAGE_FRAME_THUMBNAIL_CLASS] : []),
      ],
      'data-legacy-image-mode': mode,
      style: `height:${frameHeight}px;--legacy-blur-radius:${ctx.config.blurRadius}px`,
    },
    tagName: 'span',
    type: 'element',
  };
}

/**
 * Rehype plugin that classifies post-body `<img>` elements (both Markdown
 * `![]()` syntax and raw HTML) into standard/legacy/thumbnail presentation
 * and rewrites legacy/thumbnail matches into the blurred-canvas markup
 * defined in src/styles/theme.css (`.legacy-image-frame` and friends).
 *
 * Must run after raw HTML in the Markdown source has been parsed into real
 * hast element nodes -- Astro's own `rehype-raw` pass runs *after* all
 * user-supplied rehype plugins, so this plugin is only useful when preceded
 * by an explicit `rehypeRaw` in `astro.config.ts`'s `markdown.rehypePlugins`
 * (see that file for the exact ordering).
 */
export function rehypeLegacyImages(options: RehypeLegacyImagesOptions = {}) {
  const config: LegacyImageConfig = {
    ...defaultLegacyImageConfig,
    ...options.config,
  };
  const expectedRenderedWidth =
    options.expectedRenderedWidth ?? DEFAULT_EXPECTED_RENDERED_WIDTH;

  return async (tree: Root, file: VFile) => {
    const postOverride = readOverride(
      (file.data as { astro?: { frontmatter?: Record<string, unknown> } })
        ?.astro?.frontmatter?.['legacyImages'],
    );
    const fromDir = file.path ? path.dirname(file.path) : undefined;
    const ctx: BuildContext = {
      config,
      expectedRenderedWidth,
      fromDir,
      postOverride,
    };

    const targets: { node: Element; index: number; parent: Root | Element }[] =
      [];
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'img' && parent && typeof index === 'number') {
        targets.push({ index, node, parent: parent as Root | Element });
      }
    });

    for (const { node, index, parent } of targets) {
      const replacement = await buildFrame(node, ctx);
      if (replacement) {
        (parent.children as ElementContent[])[index] = replacement;
      }
    }
  };
}
