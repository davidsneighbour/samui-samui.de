import type { Root } from 'hast';
import { visit } from 'unist-util-visit';
import {
  buildLostContent,
  lostContentTypeSchema,
} from '../../utils/lost-content';

/** Plain Markdown equivalent of LostContent.astro; runs after rehypeRaw. */
export function rehypeLostContent() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'dnb-lost-content') return;
      const type = lostContentTypeSchema.parse(
        node.properties['type'] ?? 'unknown',
      );
      const language = node.properties['language'];
      if (language !== undefined && typeof language !== 'string') {
        throw new Error('Lost-content language must be a language tag.');
      }
      Object.assign(node, buildLostContent(type, language));
    });
  };
}
