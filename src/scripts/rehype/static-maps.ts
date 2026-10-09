import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import { staticMapsSchema } from '../../utils/static-maps/schema';

export function rehypeStaticMaps() {
  return (tree: Root, file: VFile) => {
    const frontmatter = (
      file.data as { astro?: { frontmatter?: Record<string, unknown> } }
    ).astro?.frontmatter;
    const maps = staticMapsSchema.parse(frontmatter?.['maps'] ?? []);
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'p' || node.children.length !== 1) return;
      const image = node.children[0];
      if (
        image?.type !== 'element' ||
        image.tagName !== 'img' ||
        !image.properties['dataStaticMap']
      )
        return;
      const map = maps.find(
        (map) => map.id === image.properties['dataStaticMap'],
      );
      if (!map) throw new Error(`Unknown static map in ${file.path}.`);
      delete image.properties['dataStaticMap'];
      image.properties.loading = 'lazy';
      image.properties.decoding = 'async';
      image.properties.width = map.size.width;
      image.properties.height = map.size.height;
      node.tagName = 'figure';
      node.properties = { className: ['static-map'], dataStaticMap: map.id };
      const attribution: Element = {
        children: [
          ...(map.caption
            ? [{ type: 'text' as const, value: `${map.caption} — ` }]
            : []),
          { type: 'text', value: 'Kartendaten © ' },
          {
            children: [{ type: 'text', value: 'OpenStreetMap-Mitwirkende' }],
            properties: { href: 'https://www.openstreetmap.org/copyright' },
            tagName: 'a',
            type: 'element',
          },
        ],
        properties: {},
        tagName: 'figcaption',
        type: 'element',
      };
      node.children.push(attribution);
    });
  };
}
