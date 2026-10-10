import type { CollectionEntry } from 'astro:content';
import type { Nodes } from 'hast';
import { fromHtml } from 'hast-util-from-html';

export interface PostReadingTime {
  minutes: number;
  hasVideo: boolean;
}

// An editorial estimate, not a measurement of an individual reader's speed.
const WORDS_PER_MINUTE = 200;
const VIDEO_TAGS = new Set(['dnb-youtube', 'dnb-vimeo', 'video', 'iframe']);
const OMITTED_TAGS = new Set(['script', 'style', 'template', 'pre', 'code']);

export function estimateReadingTime(html: string): PostReadingTime {
  const text: string[] = [];
  let hasVideo = false;
  function visit(node: Nodes): void {
    if (node.type === 'element') {
      if (VIDEO_TAGS.has(node.tagName)) {
        // Generic iframes count only when they embed a known video provider.
        if (
          node.tagName !== 'iframe' ||
          /(?:youtube(?:-nocookie)?\.com|youtu\.be|vimeo\.com)/i.test(
            String(node.properties['src'] ?? ''),
          )
        ) {
          hasVideo = true;
        }
        return;
      }
      if (
        OMITTED_TAGS.has(node.tagName) ||
        node.properties['ariaHidden'] === 'true'
      )
        return;
    }
    if (node.type === 'text') text.push(node.value);
    else if ('children' in node) node.children.forEach(visit);
  }
  visit(fromHtml(html, { fragment: true }));
  const words =
    text.join(' ').match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return { hasVideo, minutes: Math.ceil(words / WORDS_PER_MINUTE) };
}

export function getPostReadingTime(
  post: CollectionEntry<'posts'>,
): PostReadingTime | undefined {
  // Missing rendered content is unknown, rather than a zero-minute estimate.
  if (post.rendered?.html === undefined) return undefined;
  const result = estimateReadingTime(post.rendered.html);
  const cover = post.data.cover;
  return {
    ...result,
    hasVideo:
      result.hasVideo || cover?.type === 'youtube' || cover?.type === 'vimeo',
  };
}
