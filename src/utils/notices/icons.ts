import type { Element } from 'hast';
import { h } from 'hastscript';
// Raw icon geometry (`{ [kebabName]: [[tag, attrs], ...] }`), pinned to the
// same release as the `@lucide/astro` components used elsewhere on the site
// (see src/packages/site/icons.jsonc / notices.jsonc). `@lucide/astro`'s
// icon exports are Astro component factories that can only be rendered
// inside Astro's SSR pipeline, which a remark/rehype transform is not --
// `lucide-static` ships the same icon set as plain SVG node data so both
// the MDX (`Notice.astro`) and plain-Markdown (`<dnb-notice>` rehype
// transform) integration points can build identical `<svg>` markup from
// the exact same function.
import iconNodes from 'lucide-static/icon-nodes.json';

type IconNode = [tag: string, attrs: Record<string, string>][];

const nodesByName = iconNodes as unknown as Record<string, IconNode>;

// Mirrors `@lucide/astro`'s `defaultAttributes.ts` so notice icons match
// the visual weight of Lucide icons used elsewhere on the site.
const DEFAULT_SVG_ATTRIBUTES = {
  fill: 'none',
  height: 24,
  stroke: 'currentColor',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'stroke-width': 2,
  viewBox: '0 0 24 24',
  width: 24,
  xmlns: 'http://www.w3.org/2000/svg',
} as const;

export function isValidLucideIconName(name: string): boolean {
  return Object.hasOwn(nodesByName, name);
}

export function listLucideIconNames(): string[] {
  return Object.keys(nodesByName).sort();
}

export interface BuildLucideIconOptions {
  class?: string;
}

/**
 * Builds the canonical hast `<svg>` element for a Lucide icon name. Used by
 * both the Notice.astro component (stringified via hast-util-to-html for
 * `set:html`) and the `<dnb-notice>` rehype transform (spliced into the
 * tree directly) so both integration points render byte-identical icon
 * markup.
 */
export function buildLucideIconHast(
  name: string,
  options: BuildLucideIconOptions = {},
): Element {
  const node = nodesByName[name];
  if (!node) {
    throw new Error(`Unsupported Lucide icon "${name}".`);
  }

  const children = node.map(([tag, attrs]) => h(tag, attrs));

  return h(
    'svg',
    {
      ...DEFAULT_SVG_ATTRIBUTES,
      'aria-hidden': 'true',
      class: ['lucide', `lucide-${name}`, options.class]
        .filter((value): value is string => Boolean(value))
        .join(' '),
    },
    children,
  ) as Element;
}
