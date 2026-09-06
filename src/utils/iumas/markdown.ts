import type { ElementContent, Root as HastRoot } from 'hast';
import { toHtml } from 'hast-util-to-html';
import type { Root as MdastRoot } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

// `allowDangerousHtml` is intentionally left at its default (falsy): raw
// HTML tags in `value` are dropped by mdast-util-to-hast rather than passed
// through as executable markup. See src/utils/notices/markdown.ts for the
// same rationale; src/data/iumas.ts's `findMarkupIssue` also rejects raw
// HTML/entities in `value` up front, so this is a second line of defence.
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);

/**
 * Renders an IUMAS entry `value` as inline Markdown -- emphasis, links,
 * inline code, and (via a CommonMark hard break: a trailing backslash
 * before the newline) `<br>`s for entries that carry more than one line,
 * e.g. an original quote followed by its translations. Block structure
 * (multiple paragraphs) is intentionally collapsed to inline content, since
 * `value` is always displayed as a single quoted line in the UI.
 */
export function renderIumasValue(source: string): string {
  const mdast = processor.parse(source) as MdastRoot;
  const hast = processor.runSync(mdast) as HastRoot;
  const blocks = hast.children as ElementContent[];
  const inline = blocks.flatMap((block) =>
    block.type === 'element' ? block.children : [block],
  );
  return toHtml(inline);
}
