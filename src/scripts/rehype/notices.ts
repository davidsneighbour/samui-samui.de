import type { Element, ElementContent, Root } from 'hast';
import { visitParents } from 'unist-util-visit-parents';
import type { VFile } from 'vfile';
// Relative imports only: astro.config.ts loads this module directly, before
// Vite's `@utils/*` path aliases are registered (see rehype/legacy-images.ts).
import { renderNoticeDescription } from '../../utils/notices/markdown';
import { buildNoticeHast } from '../../utils/notices/render';
import { resolveNotice } from '../../utils/notices/resolve';
import {
  NOTICE_VARIANTS,
  type NoticeVariant,
} from '../../utils/notices/schema';

const ELEMENT_NAME = 'dnb-notice';

type HastParent = Root | Element;

function readAttr(
  properties: Element['properties'],
  name: string,
): string | undefined {
  const value = properties[name];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(' ');
  return undefined;
}

function readBooleanAttr(
  properties: Element['properties'],
  name: string,
): boolean | undefined {
  if (!(name in properties)) return undefined;
  return readAttr(properties, name) !== 'false';
}

function readVariantAttr(
  properties: Element['properties'],
  sourceFile: string | undefined,
): NoticeVariant | undefined {
  const value = readAttr(properties, 'variant');
  if (value === undefined) return undefined;
  if ((NOTICE_VARIANTS as readonly string[]).includes(value)) {
    return value as NoticeVariant;
  }
  throw new Error(
    `Invalid <dnb-notice> variant "${value}"${sourceFile ? ` in ${sourceFile}` : ''}. ` +
      `Valid variants: ${NOTICE_VARIANTS.join(', ')}.`,
  );
}

function collectText(node: ElementContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(collectText).join('');
  return '';
}

/**
 * Recovers the `<dnb-notice>` element's body content as Markdown source,
 * for use as a description override (see resolveNotice's `bodyDescription`).
 * Structural, not regex-based: the body is already a parsed hast subtree by
 * the time this runs (this plugin must follow `rehypeRaw` in
 * `astro.config.ts`'s `markdown.rehypePlugins`, same requirement as
 * rehype/legacy-images.ts). Nested elements (e.g. a `<p>` produced when the
 * body contains a blank line) contribute only their text, so inline
 * Markdown emphasis immediately touching the opening/closing tag is
 * reprocessed correctly for the common single-paragraph case documented in
 * documentation/components/notices.md; multi-paragraph bodies still render, just
 * without the original blank-line paragraph break.
 */
function extractBodyMarkdown(node: Element): string | undefined {
  const text = node.children.map(collectText).join('').trim();
  return text.length > 0 ? text : undefined;
}

function isWhitespaceText(node: ElementContent): boolean {
  return node.type === 'text' && node.value.trim().length === 0;
}

interface NoticeTarget {
  node: Element;
  ancestors: HastParent[];
}

/**
 * Rehype plugin implementing the plain-Markdown `<dnb-notice>` custom
 * element: transforms it into the same canonical notice markup produced by
 * the MDX `<Notice>` component (src/components/content/notices/Notice.astro), both routed
 * through the shared resolver in src/utils/notices/. Must run after
 * `rehypeRaw` (see astro.config.ts) so `<dnb-notice>` is already a real
 * hast element rather than an unparsed raw HTML node.
 */
export function rehypeDnbNotice() {
  return (tree: Root, file: VFile) => {
    const targets: NoticeTarget[] = [];
    visitParents(tree, 'element', (node, ancestors) => {
      if (node.tagName === ELEMENT_NAME) {
        targets.push({ ancestors: [...ancestors] as HastParent[], node });
      }
    });

    for (const { node, ancestors } of targets) {
      const properties = node.properties ?? {};
      const sourceFile = file.path;

      const resolved = resolveNotice({
        bodyDescription: extractBodyMarkdown(node),
        description: readAttr(properties, 'description'),
        dismissible: readBooleanAttr(properties, 'dismissible'),
        dismissLabel:
          readAttr(properties, 'dismissLabel') ??
          readAttr(properties, 'dismiss-label'),
        icon: readAttr(properties, 'icon'),
        slug: readAttr(properties, 'slug'),
        sourceFile,
        title: readAttr(properties, 'title'),
        variant: readVariantAttr(properties, sourceFile),
      });

      const { aside, script } = buildNoticeHast(
        resolved,
        renderNoticeDescription(resolved.description),
      );
      const replacement: Element[] = script ? [aside, script] : [aside];

      // Unwrap an auto-inserted <p> when it wraps nothing but this element
      // (the common case for a single-line `<dnb-notice ... />`, which
      // CommonMark treats as inline HTML rather than a block) -- otherwise
      // the block-level <aside> would render invalidly nested in a <p>.
      const immediateParent = ancestors[ancestors.length - 1];
      const grandparent = ancestors[ancestors.length - 2];
      if (!immediateParent) continue;
      const canUnwrap =
        immediateParent.type === 'element' &&
        immediateParent.tagName === 'p' &&
        grandparent !== undefined &&
        (immediateParent.children as ElementContent[]).every(
          (child) =>
            (child as ElementContent) === node || isWhitespaceText(child),
        );

      const spliceParent = canUnwrap ? grandparent : immediateParent;
      const spliceTarget: ElementContent = canUnwrap ? immediateParent : node;
      if (!spliceParent) continue;
      const spliceChildren = spliceParent.children as ElementContent[];
      const spliceIndex = spliceChildren.indexOf(spliceTarget);
      if (spliceIndex === -1) continue;
      spliceChildren.splice(spliceIndex, 1, ...replacement);
    }
  };
}
