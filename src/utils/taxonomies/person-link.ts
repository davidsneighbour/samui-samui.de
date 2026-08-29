import path from 'node:path';
import type { Element, ElementContent } from 'hast';
import { toHtml } from 'hast-util-to-html';
import { h } from 'hastscript';
// Reused as-is: generic Lucide-icon-to-hast builder, not notice-specific --
// see src/utils/notices/icons.ts's own docstring.
import { buildLucideIconHast } from '../notices/icons';
// Shared with src/components/ui/tooltip.astro -- see that script's own
// docstring for why it lives here instead of inline in the component.
import { TOOLTIP_CONTROLLER_SCRIPT } from '../tooltip/controller';
import { readYamlFrontmatter } from './frontmatter';

const LEUTE_BASE = path.join(process.cwd(), 'src/content/leute');
// `inline-flex` on the wrapper, not just `inline-block` on the icon: a
// browser can still insert a line-break opportunity between two separate
// adjacent inline-level boxes (the icon and the link) even with a literal
// `&nbsp;` between them and even with zero characters between them --
// replaced elements like `<svg>` get soft-wrap opportunities synthesized
// at their edges more or less unconditionally. Flex layout doesn't have
// that problem: flex items never wrap onto separate lines from each other
// (`flex-wrap` defaults to `nowrap`), so icon and link are guaranteed to
// stay on the same line -- while the `<a>`'s own text can still wrap
// internally within its own flex-item box, since that's normal text
// layout inside the item, not inline-level line-breaking between boxes.
// `align-[-2px]` nudges the whole flex box to sit on the surrounding
// prose baseline instead of the ~2px-off baseline an `inline-flex`
// container synthesizes by default for its content.
const WRAPPER_CLASSES = 'inline-flex items-center align-[-2px]';
const ICON_CLASSES = 'size-3.5 shrink-0';
// A real non-breaking space (U+00A0) for the visual gap, not a margin --
// keeps the same character an author can use inside the tag's own body to
// glue together parts of a name, e.g. `Lt.&nbsp;Name Surname` (survives as
// this exact character through remark/rehype's standard entity decoding).
const ICON_GAP = '\u00A0';

// Mirrors src/components/ui/tooltip.astro's own class contract exactly
// (documentation/components/tooltips.md: "Use the component instead of
// adding local absolute-positioned tooltip markup"), specifically its
// `interactive` mode (see Footer.astro's sound-toggle button for the same
// pattern): the trigger here is a real, already-focusable `<a>`, so the
// wrapper doesn't need its own tabindex/aria-label, and `aria-describedby`
// is set directly on the `<a>` instead.
const TRIGGER_CLASSES =
  'tooltip__trigger inline-flex items-center justify-center';
const CONTENT_CLASSES =
  'tooltip__content fixed z-50 w-max rounded-[calc(var(--radius)-4px)] border border-border bg-muted px-3 py-2 text-center text-xs leading-snug text-card-foreground opacity-0 shadow-md transition-[opacity,transform] duration-150 ease-out';

export interface PersonLinkOptions {
  id: string;
  /** Already-hast label content -- see buildPersonLinkHast's docstring. */
  label: ElementContent[];
  /** Source file, for actionable error messages. */
  sourceFile?: string | undefined;
}

export interface PersonLinkHast {
  node: Element;
  /** Present only when the person has a `subtitle` (renders a tooltip). */
  script: Element | undefined;
}

interface ResolvedPerson {
  href: string;
  subtitle: string | undefined;
}

function hashString(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

/**
 * Reads a `leute` entity's frontmatter directly from disk (no
 * `astro:content`, unavailable to the rehype integration point -- see
 * src/utils/taxonomies/validation.ts for the same pattern) and validates
 * that a public page will actually exist for it: `leute/[slug].astro`'s
 * `getStaticPaths` skips draft entries, so linking to one would 404.
 */
function resolvePerson(
  id: string,
  sourceFile: string | undefined,
): ResolvedPerson {
  const file = path.join(LEUTE_BASE, id, '_index.md');
  let data: Record<string, unknown>;
  try {
    data = readYamlFrontmatter(file);
  } catch (cause) {
    throw new Error(
      `Unknown leute id "${id}" referenced by <dnb-person>${sourceFile ? ` in ${sourceFile}` : ''}. ` +
        `Create ${path.relative(process.cwd(), file)} first.`,
      { cause },
    );
  }

  if (data['draft'] === true) {
    throw new Error(
      `<dnb-person> references "${id}"${sourceFile ? ` in ${sourceFile}` : ''}, but ${path.relative(process.cwd(), file)} is a draft and has no public page.`,
    );
  }

  const subtitle = data['subtitle'];
  return {
    href: `/leute/${id}/`,
    subtitle: typeof subtitle === 'string' ? subtitle : undefined,
  };
}

/**
 * Builds the canonical `<dnb-person>` markup as hast nodes -- the single
 * source of truth for both integration points, mirroring
 * src/utils/notices/render.ts's `buildNoticeHast`: the `<PersonLink>` MDX
 * component and the `<dnb-person>` plain-Markdown rehype transform
 * (src/scripts/rehype/person-link.ts) both call this and either splice the
 * result directly into a hast tree or stringify it (via
 * `personLinkHastToHtml`) for `set:html`. `label` is already hast content
 * (the source element's own children for the rehype path, or the parsed
 * MDX slot for the component path) rather than a plain string, so inline
 * formatting inside the tag's body renders as authored.
 *
 * Without a `subtitle`, this is just a plain link with a leading icon --
 * no tooltip markup, no script. With one, the link (not the icon) reuses
 * the exact `.tooltip`/`.tooltip__trigger`/`.tooltip__content` contract of
 * the shared `Tooltip` component (its CSS lives globally in
 * src/styles/theme.css precisely so this rehype-built markup can pick it
 * up) plus its positioning/show-hide controller script, which must
 * accompany each occurrence for pages that don't otherwise render
 * `<Tooltip>` -- idempotent via the controller's own `window` flag guard,
 * so repeating it for multiple `<dnb-person>` occurrences on one page is
 * harmless.
 */
export function buildPersonLinkHast(
  options: PersonLinkOptions,
): PersonLinkHast {
  const { id, label, sourceFile } = options;
  const { href, subtitle } = resolvePerson(id, sourceFile);
  const icon = buildLucideIconHast('user-round', { class: ICON_CLASSES });

  if (!subtitle) {
    const link = h('a', { href }, label);
    const wrapper = h('span', { class: WRAPPER_CLASSES }, [
      icon,
      ICON_GAP,
      link,
    ]) as Element;
    return { node: wrapper, script: undefined };
  }

  const tooltipId = `dnb-person-link-${hashString(`${id}:${subtitle}`)}`;

  const link = h('a', { 'aria-describedby': tooltipId, href }, label);
  const trigger = h(
    'span',
    { class: TRIGGER_CLASSES, 'data-tooltip-trigger': '' },
    [link],
  );
  const content = h(
    'span',
    {
      'aria-hidden': 'true',
      class: CONTENT_CLASSES,
      'data-tooltip-content': '',
      id: tooltipId,
      role: 'tooltip',
    },
    subtitle,
  );
  const tooltip = h(
    'span',
    {
      class: 'tooltip inline-flex',
      'data-tooltip': '',
      'data-tooltip-placement': 'top',
    },
    [trigger, content],
  );
  const wrapper = h('span', { class: WRAPPER_CLASSES }, [
    icon,
    ICON_GAP,
    tooltip,
  ]) as Element;

  const script = h('script', {}, TOOLTIP_CONTROLLER_SCRIPT) as Element;

  return { node: wrapper, script };
}

/** Stringifies a `buildPersonLinkHast()` result for use with Astro's `set:html`. */
export function personLinkHastToHtml(result: PersonLinkHast): string {
  return toHtml(result.node) + (result.script ? toHtml(result.script) : '');
}
