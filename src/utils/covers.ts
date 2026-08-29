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
  /** Remote thumbnail URL resolved at build time, for `astro:assets` to cache and serve from `self`. Undefined when resolution fails (e.g. Vimeo oEmbed lookup errors). */
  posterUrl?: string | undefined;
  startAt?: string | undefined;
  title: string;
  type: 'youtube' | 'vimeo';
  videoid: string;
}

export type ResolvedPostCover = ResolvedPostImageCover | ResolvedPostVideoCover;

type VimeoOembedResponse = {
  thumbnail_url?: string;
};

// oEmbed lookups happen server-side during the build/dev process, so
// `fetch` here isn't subject to the browser CSP that blocks the
// equivalent client-side call in VimeoScript.astro (#1670). Memoized per
// process so the same video isn't looked up twice across posts/rebuilds.
const vimeoPosterUrls = new Map<string, Promise<string | undefined>>();

function resolveVimeoPosterUrl(videoId: string): Promise<string | undefined> {
  const cached = vimeoPosterUrls.get(videoId);
  if (cached) return cached;

  const promise = (async (): Promise<string | undefined> => {
    try {
      const apiUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
        `https://vimeo.com/${videoId}`,
      )}`;
      const response = await fetch(apiUrl);
      if (!response.ok) return undefined;

      const json = (await response.json()) as VimeoOembedResponse;
      const thumbnailUrl = json.thumbnail_url;
      if (!thumbnailUrl) return undefined;

      const imgId = thumbnailUrl
        .slice(thumbnailUrl.lastIndexOf('/') + 1)
        .split('_')[0];
      return `https://i.vimeocdn.com/video/${imgId}.jpg?mw=1100&mh=619&q=70`;
    } catch {
      return undefined;
    }
  })();

  vimeoPosterUrls.set(videoId, promise);
  return promise;
}

// YouTube's thumbnail lives at a predictable URL, so unlike Vimeo it needs
// no lookup -- but the URL is still a guess (e.g. deleted/private videos
// 404), and `astro:assets`' `inferSize` throws a hard, page-crashing error
// for a URL that turns out not to exist, so this HEAD-checks the guess
// before handing it to the image pipeline.
const youtubePosterUrls = new Map<string, Promise<string | undefined>>();

function resolveYoutubePosterUrl(videoId: string): Promise<string | undefined> {
  const cached = youtubePosterUrls.get(videoId);
  if (cached) return cached;

  const promise = (async (): Promise<string | undefined> => {
    const url = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok ? url : undefined;
    } catch {
      return undefined;
    }
  })();

  youtubePosterUrls.set(videoId, promise);
  return promise;
}

async function resolveVideoPosterUrl(
  type: 'youtube' | 'vimeo',
  videoId: string,
): Promise<string | undefined> {
  return type === 'youtube'
    ? resolveYoutubePosterUrl(videoId)
    : resolveVimeoPosterUrl(videoId);
}

const postImages = import.meta.glob<ImageMetadata>(
  '/src/content/posts/**/*.{avif,gif,jpeg,jpg,png,webp}',
  { eager: true, import: 'default' },
);

function normalizePostFilePath(
  filePath: string | undefined,
): string | undefined {
  if (!filePath) return undefined;

  const normalizedFilePath = filePath.replaceAll(path.sep, path.posix.sep);
  const contentPathIndex = normalizedFilePath.indexOf('src/content/posts/');
  if (contentPathIndex === -1) return undefined;

  return `/${normalizedFilePath.slice(contentPathIndex)}`;
}

function normalizePostIdPath(id: string): string | undefined {
  const normalizedId = id.replaceAll('\\', '/').replace(/^\/+/, '');
  const contentPathIndex = normalizedId.indexOf('src/content/posts/');
  const relativeId =
    contentPathIndex === -1
      ? normalizedId
      : normalizedId.slice(contentPathIndex + 'src/content/posts/'.length);
  const postPath = relativeId.replace(/\/index(?:\.md)?$/, '');

  if (!postPath) return undefined;

  return `/${path.posix.join('src/content/posts', postPath)}`;
}

function postDirectoryFor(post: PostEntry): string | undefined {
  const postFilePath = normalizePostFilePath(post.filePath);
  return postFilePath?.replace(/\/[^/]+$/, '') ?? normalizePostIdPath(post.id);
}

function resolveBundledPostImage(
  post: PostEntry,
  fileName: string,
): ImageMetadata | undefined {
  const postDirectory = postDirectoryFor(post);
  if (!postDirectory) return undefined;

  return postImages[path.posix.join(postDirectory, fileName)];
}

/** Absolute filesystem path to a bundled post image, for local processing (e.g. the legacy-image blur derivative) that `astro:assets` doesn't cover. */
function resolveBundledPostImageFsPath(
  post: PostEntry,
  fileName: string,
): string | undefined {
  const postDirectory = postDirectoryFor(post);
  if (!postDirectory) return undefined;

  return path.join(process.cwd(), postDirectory.replace(/^\/+/, ''), fileName);
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
      posterUrl: await resolveVideoPosterUrl(cover.type, videoid),
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
