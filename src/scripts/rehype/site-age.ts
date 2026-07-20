import type { Element, ElementContent, Root, Text } from 'hast';
import { visitParents } from 'unist-util-visit-parents';
import type { VFile } from 'vfile';
// Relative import only: astro.config.ts loads this before Vite aliases exist.
import {
  type DateDurationFormatOptions,
  type DateDurationUnit,
  formatDateDuration,
} from '../../utils/dates';

const ELEMENT_NAME = 'dnb-site-age';
const VALID_UNITS = ['years', 'months', 'days'] as const;

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

function readUnitAttr(
  properties: Element['properties'],
  sourceFile: string | undefined,
): DateDurationUnit | undefined {
  const value = readAttr(properties, 'unit');
  if (value === undefined) return undefined;
  if ((VALID_UNITS as readonly string[]).includes(value)) {
    return value as DateDurationUnit;
  }
  throw new Error(
    `Invalid <${ELEMENT_NAME}> unit "${value}"${sourceFile ? ` in ${sourceFile}` : ''}. ` +
      `Valid units: ${VALID_UNITS.join(', ')}.`,
  );
}

interface SiteAgeTarget {
  node: Element;
  ancestors: HastParent[];
}

/**
 * Implements the plain-Markdown `<dnb-site-age>` custom element by replacing
 * it with build-time text from the same formatter used by SiteAge.astro.
 */
export function rehypeSiteAge() {
  return (tree: Root, file: VFile) => {
    const targets: SiteAgeTarget[] = [];
    visitParents(tree, 'element', (node, ancestors) => {
      if (node.tagName === ELEMENT_NAME) {
        targets.push({ ancestors: [...ancestors] as HastParent[], node });
      }
    });

    for (const { ancestors, node } of targets) {
      const properties = node.properties ?? {};
      const sourceFile = file.path;
      const sinceDate =
        readAttr(properties, 'sinceDate') ??
        readAttr(properties, 'sincedate') ??
        readAttr(properties, 'since-date');

      if (!sinceDate) {
        throw new Error(
          `<${ELEMENT_NAME}> requires a since-date attribute` +
            `${sourceFile ? ` in ${sourceFile}` : ''}.`,
        );
      }

      const options: DateDurationFormatOptions = { sinceDate };
      const format = readAttr(properties, 'format');
      const unit = readUnitAttr(properties, sourceFile);
      const untilDate =
        readAttr(properties, 'untilDate') ??
        readAttr(properties, 'untildate') ??
        readAttr(properties, 'until-date');
      if (format !== undefined) options.format = format;
      if (unit !== undefined) options.unit = unit;
      if (untilDate !== undefined) options.untilDate = untilDate;

      const replacement: Text = {
        type: 'text',
        value: formatDateDuration(options),
      };

      const immediateParent = ancestors[ancestors.length - 1];
      if (!immediateParent) continue;

      const siblings = immediateParent.children as ElementContent[];
      const index = siblings.indexOf(node);
      if (index === -1) continue;
      siblings.splice(index, 1, replacement);
    }
  };
}
