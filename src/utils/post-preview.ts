import type { CollectionEntry } from 'astro:content';
import type { Nodes, Root } from 'hast';
import { fromHtml } from 'hast-util-from-html';

type PostEntry = CollectionEntry<'posts'>;

const BLOCK_TAGS = [
  'blockquote',
  'dl',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ol',
  'p',
  'pre',
  'table',
  'ul',
];

const blockPattern = new RegExp(
  `<(${BLOCK_TAGS.join('|')})(?:\\s[^>]*)?>[\\s\\S]*?<\\/\\1>`,
  'gi',
);

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const isMediaOnlyBlock = (value: string) => {
  const tree = fromHtml(value, { fragment: true }) as Root;
  const mediaTags = new Set(['dnb-vimeo', 'dnb-youtube', 'iframe', 'img']);

  const hasTextOutsideMedia = (node: Nodes): boolean => {
    if (node.type === 'text') return node.value.trim().length > 0;
    if (node.type === 'element' && mediaTags.has(node.tagName.toLowerCase())) {
      return false;
    }
    if ('children' in node) return node.children.some(hasTextOutsideMedia);
    return false;
  };

  return !hasTextOutsideMedia(tree);
};

const getRenderedBodyBlocks = (post: PostEntry) => {
  const html = post.rendered?.html;
  if (!html) return [];

  return [...html.matchAll(blockPattern)]
    .map((match) => match[0].trim())
    .filter((block) => block && !isMediaOnlyBlock(block));
};

export function getPostPreviewHtml(
  post: PostEntry,
  blockCount: number,
): string[] {
  const bodyBlocks = getRenderedBodyBlocks(post).slice(0, blockCount);
  if (bodyBlocks.length > 0) return bodyBlocks;

  const frontmatterSummary = post.data.summary?.trim();
  if (frontmatterSummary) return [`<p>${escapeHtml(frontmatterSummary)}</p>`];

  const description = post.data.description?.trim();
  if (description) return [`<p>${escapeHtml(description)}</p>`];

  return [];
}
