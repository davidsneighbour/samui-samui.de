import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';

type PostEntry = CollectionEntry<'posts'>;

export interface ResolvedPostCover {
  alt: string;
  optimized: boolean;
  src: ImageMetadata | string;
  title?: string | undefined;
  type: 'image';
}

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

export function getPostCover(post: PostEntry): ResolvedPostCover | undefined {
  const cover = post.data.cover;
  const coverSrc = cover?.src.trim();

  if (cover?.type === 'image' && coverSrc) {
    const image = resolveBundledPostImage(post, coverSrc);

    if (!image) {
      throw new Error(
        `Cover image "${cover.src}" for post "${post.id}" was not found next to ${post.filePath ?? 'the post file'}.`,
      );
    }

    return {
      alt: cover.title || post.data.title,
      optimized: true,
      src: image,
      title: cover.title || undefined,
      type: 'image',
    };
  }

  if (post.data.featured_image) {
    return {
      alt: post.data.title,
      optimized: false,
      src: post.data.featured_image,
      type: 'image',
    };
  }

  return undefined;
}
