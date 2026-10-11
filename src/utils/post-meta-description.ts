import type { CollectionEntry } from 'astro:content';
import type { Nodes } from 'hast';
import { fromHtml } from 'hast-util-from-html';

export const POST_META_DESCRIPTION_LENGTH = 160;

const omittedTags = new Set([
  'script',
  'style',
  'template',
  'pre',
  'iframe',
  'video',
  'audio',
  'dnb-youtube',
  'dnb-vimeo',
]);
const blockTags = new Set([
  'p',
  'div',
  'section',
  'article',
  'blockquote',
  'li',
  'tr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'br',
  'hr',
]);

function normaliseWhitespace(text: string): string {
  return text.replace(/\s+/gu, ' ').trim();
}

export function getPostMetaDescription(post: CollectionEntry<'posts'>): string {
  for (const value of [post.data.description, post.data.summary]) {
    if (value?.trim()) return normaliseWhitespace(value);
  }

  const parts: string[] = [];
  function visit(node: Nodes): void {
    if (node.type === 'text') {
      parts.push(node.value);
      return;
    }
    if (node.type === 'element') {
      if (
        omittedTags.has(node.tagName) ||
        node.properties['ariaHidden'] === 'true' ||
        node.properties['hidden']
      )
        return;
      const block = blockTags.has(node.tagName);
      if (block) parts.push(' ');
      node.children.forEach(visit);
      if (block) parts.push(' ');
      return;
    }
    if ('children' in node) node.children.forEach(visit);
  }
  visit(fromHtml(post.rendered?.html ?? '', { fragment: true }));
  const text = normaliseWhitespace(parts.join(''));
  const characters = Array.from(text);
  if (characters.length <= POST_META_DESCRIPTION_LENGTH) return text;
  const excerpt = characters.slice(0, POST_META_DESCRIPTION_LENGTH).join('');
  if (/\s/u.test(characters[POST_META_DESCRIPTION_LENGTH] ?? '')) {
    return excerpt.trimEnd();
  }
  const boundary = excerpt.lastIndexOf(' ');
  return boundary > 0 ? excerpt.slice(0, boundary) : excerpt;
}
