import type { ImageMetadata } from 'astro';

export type VideoThumbnailProvider = 'vimeo' | 'youtube';

// Locally downloaded thumbnails (see
// src/scripts/content/fetch-video-thumbnails.ts) let post covers and
// in-body embeds serve an `astro:assets`-processed poster from `self`
// instead of live-fetching one from the provider on every page view — see
// documentation/content/video-thumbnail-cache.md.
const localThumbnails = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/video-thumbnails/{youtube,vimeo}/*.jpg',
  { eager: true },
);

/**
 * Resolves a video id to its locally cached thumbnail, if one has been
 * downloaded. Returns `undefined` when the maintenance script hasn't been
 * run for this id yet — callers fall back to their previous (documented)
 * live-fetch behaviour in that case.
 */
export function resolveLocalThumbnail(
  provider: VideoThumbnailProvider,
  videoId: string,
): ImageMetadata | undefined {
  const key = `/src/assets/images/video-thumbnails/${provider}/${videoId}.jpg`;
  return localThumbnails[key]?.default;
}
