import type { ElementContent, Root as HastRoot } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import type { Root as MdastRoot } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

// `allowDangerousHtml` is intentionally left at its default (falsy):
// mdast-util-to-hast then drops raw HTML tags from notice title/description
// text entirely (their surrounding plain text is kept, escaped) instead of
// passing them through as executable markup -- see documentation/components/notices.md
// ("Safe rendering") for why the registry is not a trusted-HTML surface.
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);

function toHast(source: string): HastRoot {
  const mdast = processor.parse(source) as MdastRoot;
  return processor.runSync(mdast) as HastRoot;
}

/**
 * Renders a notice `description` as block-level Markdown (paragraphs,
 * lists, links, inline code, ...), returning the hast child nodes to embed
 * directly in the notice body.
 */
export function renderNoticeDescription(source: string): ElementContent[] {
  return toHast(source).children as ElementContent[];
}

/**
 * Renders a notice `title` as inline Markdown only. Titles are a single
 * heading-adjacent line of text (see Notice.astro), so block structure
 * (multiple paragraphs, lists) is intentionally collapsed: a lone top-level
 * paragraph is unwrapped to its inline children, and any additional blocks
 * contribute only their own inline children.
 */
export function renderNoticeTitle(source: string): ElementContent[] {
  const blocks = toHast(source).children as ElementContent[];
  const [onlyBlock] = blocks;
  if (
    blocks.length === 1 &&
    onlyBlock?.type === 'element' &&
    onlyBlock.tagName === 'p'
  ) {
    return onlyBlock.children;
  }
  return blocks.flatMap((block) =>
    block.type === 'element' ? block.children : [block],
  );
}

/**
 * Parses an already-rendered HTML fragment (e.g. an MDX `<Notice>` default
 * slot, compiled by the MDX pipeline before Astro renders this component)
 * into hast child nodes, without re-running it through Markdown parsing.
 */
export function parseHtmlFragment(html: string): ElementContent[] {
  return fromHtml(html, { fragment: true }).children as ElementContent[];
}
