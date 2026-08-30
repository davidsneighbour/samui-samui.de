import type { Element, ElementContent, Root } from 'hast';
import { visitParents } from 'unist-util-visit-parents';
import type { VFile } from 'vfile';
// Relative import only: astro.config.ts loads this module directly, before
// Vite's `@utils/*` path aliases are registered (see rehype/legacy-images.ts).
import { buildPersonLinkHast } from '../../utils/taxonomies/person-link';

const ELEMENT_NAME = 'dnb-person';

interface Target {
  node: Element;
  parent: Root | Element;
}

function readAttr(
  properties: Element['properties'],
  name: string,
): string | undefined {
  const value = properties[name];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(' ');
  return undefined;
}

/**
 * Rehype plugin implementing the plain-Markdown `<dnb-person>` custom
 * element (issue #1672): links inline prose to a `leute` entity page,
 * mirroring the MDX `<PersonLink>` component (src/components/content/person/PersonLink.astro).
 * Both call into `buildPersonLinkHast()` (src/utils/taxonomies/person-link.ts)
 * so they render identical markup -- same split as `<dnb-notice>` /
 * `<Notice>` (src/scripts/rehype/notices.ts).
 *
 * Unlike `<dnb-notice>`, no `<p>`-unwrap handling is needed: `<dnb-person>`
 * is meant for inline use inside a sentence (`Vorsitzender ist
 * <dnb-person id="...">Name</dnb-person> oder ...`), so CommonMark parses it
 * as inline raw HTML, never as its own HTML block. The replacement is an
 * inline `<span>` too, so it can always be spliced in place.
 *
 * Must run after `rehypeRaw` (see astro.config.ts), same requirement as
 * `rehypeDnbNotice`.
 */
export function rehypeDnbPerson() {
  return (tree: Root, file: VFile) => {
    const targets: Target[] = [];
    visitParents(tree, 'element', (node, ancestors) => {
      if (node.tagName !== ELEMENT_NAME) return;
      const parent = ancestors.at(-1);
      if (!parent) return;
      targets.push({ node, parent: parent as Root | Element });
    });

    for (const { node, parent } of targets) {
      const id = readAttr(node.properties, 'id');
      if (!id) {
        throw new Error(
          `<${ELEMENT_NAME}> is missing a required "id" attribute${file.path ? ` in ${file.path}` : ''}.`,
        );
      }

      // Drops only insignificant whitespace-only text nodes (indentation/
      // newlines between elements from how the markdown source is
      // formatted) -- not `String.prototype.trim()`, which also treats a
      // lone `&nbsp;` (U+00A0) as trimmable and would silently discard an
      // author's non-breaking space if it ever ends up as its own text
      // node (e.g. between two inline elements in the tag's body).
      const label = node.children.filter(
        (child) => !(child.type === 'text' && /^[ \t\n\r]*$/.test(child.value)),
      );

      const { node: replacement, script } = buildPersonLinkHast({
        id,
        label: label as ElementContent[],
        sourceFile: file.path,
      });

      const children = parent.children as ElementContent[];
      const index = children.indexOf(node);
      if (index === -1) continue;
      children.splice(
        index,
        1,
        ...(script ? [replacement, script] : [replacement]),
      );
    }
  };
}
