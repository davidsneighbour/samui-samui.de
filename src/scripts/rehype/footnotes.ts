import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

/** Give generated Markdown footnotes a visible heading and accessible returns. */
export function rehypeFootnotes() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'section' && 'dataFootnotes' in node.properties) {
        node.properties.ariaLabelledBy = ['footnote-label'];
        for (const child of node.children) {
          if (
            child.type === 'element' &&
            child.properties.id === 'footnote-label'
          ) {
            child.properties.className = ['footnotes__heading'];
            child.children = [{ type: 'text', value: 'Fußnoten' }];
          }
        }
      }
      if (node.tagName === 'a' && 'dataFootnoteBackref' in node.properties) {
        const label = node.properties.ariaLabel;
        node.properties.ariaLabel =
          typeof label === 'string'
            ? label.replace('Back to reference', 'Zurück zur Textstelle')
            : 'Zurück zur Textstelle';
        node.children = [{ type: 'text', value: '↵' }];
      }
    });
  };
}
