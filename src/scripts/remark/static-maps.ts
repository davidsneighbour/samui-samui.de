import type { Image, Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import { staticMapsSchema } from '../../utils/static-maps/schema';

/** Expand before Astro collects Markdown images, so its existing asset pipeline owns optimisation. */
export function remarkStaticMaps() {
  return (tree: Root, file: VFile) => {
    const frontmatter = (
      file.data as { astro?: { frontmatter?: Record<string, unknown> } }
    ).astro?.frontmatter;
    function imageFor(source: string): Image | undefined {
      const match =
        /^\s*<dnb-map\s+id=["']([a-z][a-z0-9-]*)["']\s*>\s*<\/dnb-map>\s*$/.exec(
          source,
        );
      if (!match) return undefined;
      const map = staticMapsSchema
        .parse(frontmatter?.['maps'] ?? [])
        .find((map) => map.id === match[1]);
      if (!map)
        throw new Error(`Unknown static map "${match[1]}" in ${file.path}.`);
      return {
        alt: map.alt,
        data: {
          hProperties: { dataLegacyImage: 'never', dataStaticMap: map.id },
        },
        type: 'image',
        url: `./${map.image}`,
      };
    }
    visit(tree, (node) => {
      if (node.type === 'paragraph') {
        const source = node.children
          .map((child) =>
            child.type === 'html' || child.type === 'text' ? child.value : '',
          )
          .join('');
        const image = imageFor(source);
        if (
          image &&
          node.children.every(
            (child) => child.type === 'html' || child.type === 'text',
          )
        )
          node.children = [image];
      }
    });
    visit(tree, 'html', (node, index, parent) => {
      const image = imageFor(node.value);
      if (image && parent?.type === 'root' && index !== undefined)
        parent.children[index] = { children: [image], type: 'paragraph' };
      else if (/<\/?dnb-map\b/.test(node.value))
        throw new Error(
          `Use <dnb-map id="route"></dnb-map> on its own line in ${file.path}.`,
        );
    });
  };
}
