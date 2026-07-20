import type { CollectionEntry } from 'astro:content';
import path from 'node:path';
import { resolveOverride } from '@utils/legacy-images/classify';
import type { LegacyImageOverride } from '@utils/legacy-images/config';
import {
  isRemoteSrc,
  probeImageDimensions,
  resolveImageFsPath,
} from '@utils/legacy-images/fs';
import type { ImageMetadata } from 'astro';

type PostEntry = CollectionEntry<'posts'>;

interface ResolvedPostCoverBase {
  caption?: string | undefined;
  type: 'image' | 'youtube' | 'vimeo';
}

export interface ResolvedPostImageCover extends ResolvedPostCoverBase {
  alt: string;
  /** Absolute filesystem path to the source file, when resolvable locally. */
  fsPath?: string | undefined;
  intrinsicHeight?: number | undefined;
  intrinsicWidth?: number | undefined;
  /** Combined per-image + post-level legacy-image override, resolved to a single "auto"/"always"/"never". */
  legacyOverride: LegacyImageOverride;
  optimized: boolean;
  src: ImageMetadata | string;
  type: 'image';
}

export interface ResolvedPostVideoCover extends ResolvedPostCoverBase {
  autoplay?: boolean | undefined;
  autoload?: boolean | undefined;
  hash?: string | undefined;
  params?: string | undefined;
  startAt?: string | undefined;
  title: string;
  type: 'youtube' | 'vimeo';
  videoid: string;
}

export type ResolvedPostCover = ResolvedPostImageCover | ResolvedPostVideoCover;

const postImages = import.meta.glob<ImageMetadata>(
  '/src/content/posts/**/*.{avif,gif,jpeg,jpg,png,webp}',
  { eager: true, import: 'default' },
);

function normalizePostFilePath(
  filePath: string | undefined,
): string | undefined {
  if (!filePath) return undefined;

  const contentPathIndex = filePath.indexOf('src/content/posts/');
  if (contentPathIndex === -1) return undefined;

  return `/${filePath.slice(contentPathIndex)}`;
}

function postDirectoryFor(post: PostEntry): string | undefined {
  const postFilePath = normalizePostFilePath(post.filePath);
  return postFilePath?.replace(/\/[^/]+$/, '');
}

function resolveBundledPostImage(
  post: PostEntry,
  fileName: string,
): ImageMetadata | undefined {
  const postDirectory = postDirectoryFor(post);
  if (!postDirectory) return undefined;

  return postImages[`${postDirectory}/${fileName}`];
}

/** Absolute filesystem path to a bundled post image, for local processing (e.g. the legacy-image blur derivative) that `astro:assets` doesn't cover. */
function resolveBundledPostImageFsPath(
  post: PostEntry,
  fileName: string,
): string | undefined {
  const postDirectory = postDirectoryFor(post);
  if (!postDirectory) return undefined;

  return path.join(process.cwd(), postDirectory, fileName);
}

function trimmed(value: string | undefined): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

export async function getPostCover(
  post: PostEntry,
): Promise<ResolvedPostCover | undefined> {
  const cover = post.data.cover;
  const postOverride = post.data.legacyImages;

  if (cover?.type === 'image') {
    const coverSrc = cover.src.trim();
    if (!coverSrc) return undefined;

    const image = resolveBundledPostImage(post, coverSrc);
    const caption = trimmed(cover.caption) ?? trimmed(cover.title);

    if (!image) {
      throw new Error(
        `Cover image "${cover.src}" for post "${post.id}" was not found next to ${post.filePath ?? 'the post file'}.`,
      );
    }

    return {
      alt: trimmed(cover.alt) ?? caption ?? post.data.title,
      caption,
      fsPath: resolveBundledPostImageFsPath(post, coverSrc),
      intrinsicHeight: image.height,
      intrinsicWidth: image.width,
      legacyOverride: resolveOverride(cover.legacyPresentation, postOverride),
      optimized: true,
      src: image,
      type: 'image',
    };
  }

  if (cover?.type === 'youtube' || cover?.type === 'vimeo') {
    const videoid = String(cover.video).trim();
    if (!videoid) return undefined;

    const caption = trimmed(cover.caption) ?? trimmed(cover.title);

    return {
      autoload: cover.autoload,
      autoplay: cover.autoplay,
      caption,
      hash: trimmed(cover.hash),
      params: trimmed(cover.params),
      startAt: trimmed(cover.startAt),
      title: caption ?? post.data.title,
      type: cover.type,
      videoid,
    };
  }

  if (post.data.featured_image) {
    const src = post.data.featured_image;
    const fsPath = isRemoteSrc(src)
      ? undefined
      : resolveImageFsPath(src, undefined);
    const dimensions = fsPath ? await probeImageDimensions(fsPath) : undefined;

    return {
      alt: post.data.title,
      caption: undefined,
      fsPath,
      intrinsicHeight: dimensions?.height,
      intrinsicWidth: dimensions?.width,
      legacyOverride: resolveOverride(undefined, postOverride),
      optimized: false,
      src,
      type: 'image',
    };
  }

  return undefined;
}
