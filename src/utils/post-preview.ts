import type { CollectionEntry } from 'astro:content';

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

const stripHtml = (value: string) =>
  value
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();

const isMediaOnlyBlock = (value: string) => {
  const withoutMedia = value
    .replaceAll(/<img\b[^>]*>/gi, '')
    .replaceAll(
      /<dnb-(?:youtube|vimeo)\b[\s\S]*?<\/dnb-(?:youtube|vimeo)>/gi,
      '',
    )
    .replaceAll(/<iframe\b[\s\S]*?<\/iframe>/gi, '');

  return stripHtml(withoutMedia).length === 0;
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
