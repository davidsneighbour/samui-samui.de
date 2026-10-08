import type { Element, ElementContent, Root } from 'hast';

/**
 * Marks top-level embedded media in a post body with the `prose-wide` class.
 *
 * Post text sits in a reading column (`--reading-measure`), but embedded
 * elements such as figures, iframes, tables, and image-only paragraphs may use
 * the full card width. The CSS side (`.prose-reading` in theme.css) limits
 * every prose child to the reading column and releases `.prose-wide` children.
 * CSS alone cannot tell an image-only paragraph from a paragraph that has text
 * and one inline image, so the decision is made here at build time.
 *
 * Runs after `rehypeLegacyImages` and `rehypeVideoPosters`, so it sees their
 * output (for example `span.legacy-image-frame`).
 */

export const WIDE_MEDIA_CLASS = 'prose-wide';

/** Elements that are always embedded media at the top level. */
const WIDE_TAGS = new Set([
  'dnb-vimeo',
  'dnb-youtube',
  'figure',
  'iframe',
  'picture',
  'table',
  'video',
]);

/** Legacy wrapper `div`s that only hold embedded media. */
const WIDE_DIV_CLASSES = new Set(['flex-video', 'flickr', 'media']);

/** Elements that count as media inside an otherwise empty paragraph. */
const MEDIA_TAGS = new Set([
  'dnb-vimeo',
  'dnb-youtube',
  'iframe',
  'img',
  'picture',
  'video',
]);

function classList(node: Element): string[] {
  // Typed as an array by hast, but raw HTML can still carry a string.
  const value: unknown = node.properties?.className;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

function isBlank(node: ElementContent): boolean {
  return node.type === 'text' && node.value.trim() === '';
}

/** True for media, or for a link/span wrapper that only holds media. */
function isMediaContent(node: ElementContent): boolean {
  if (node.type === 'comment' || isBlank(node)) return true;
  if (node.type !== 'element') return false;
  if (MEDIA_TAGS.has(node.tagName)) return true;
  if (node.tagName === 'br') return true;
  if (classList(node).includes('legacy-image-frame')) return true;
  if (node.tagName === 'a' || node.tagName === 'span') {
    return node.children.length > 0 && node.children.every(isMediaContent);
  }
  return false;
}

function hasMedia(node: ElementContent): boolean {
  if (node.type !== 'element') return false;
  if (MEDIA_TAGS.has(node.tagName)) return true;
  if (classList(node).includes('legacy-image-frame')) return true;
  return node.children.some(hasMedia);
}

export function isWideMedia(node: Element): boolean {
  if (WIDE_TAGS.has(node.tagName)) return true;
  if (node.tagName === 'div') {
    return classList(node).some((name) => WIDE_DIV_CLASSES.has(name));
  }
  if (node.tagName === 'p') {
    return node.children.some(hasMedia) && node.children.every(isMediaContent);
  }
  return false;
}

export function rehypeWideMedia() {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type !== 'element' || !isWideMedia(node)) continue;
      node.properties = {
        ...node.properties,
        className: [...classList(node), WIDE_MEDIA_CLASS],
      };
    }
  };
}
