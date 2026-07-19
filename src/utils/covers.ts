import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

type PostEntry = CollectionEntry<'posts'>;

interface ResolvedPostCoverBase {
  caption?: string | undefined;
  type: 'image' | 'youtube' | 'vimeo';
}

export interface ResolvedPostImageCover extends ResolvedPostCoverBase {
  alt: string;
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

function resolveBundledPostImage(
  post: PostEntry,
  fileName: string,
): ImageMetadata | undefined {
  const postFilePath = normalizePostFilePath(post.filePath);
  if (!postFilePath) return undefined;

  const postDirectory = postFilePath.replace(/\/[^/]+$/, '');
  return postImages[`${postDirectory}/${fileName}`];
}

function trimmed(value: string | undefined): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

export function getPostCover(post: PostEntry): ResolvedPostCover | undefined {
  const cover = post.data.cover;

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
      autoplay: cover.autoplay,
      autoload: cover.autoload,
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
    return {
      alt: post.data.title,
      caption: undefined,
      optimized: false,
      src: post.data.featured_image,
      type: 'image',
    };
  }

  return undefined;
}
