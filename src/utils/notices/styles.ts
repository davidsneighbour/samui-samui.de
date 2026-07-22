import type { NoticeVariant } from './schema';

// Mirrors the muted, bordered treatment used by tag badges on single-post
// pages (src/components/ui/badge.astro's `muted` variant / ThemaBadges.astro)
// and the author-bio `bg-muted` surface in BlogPost.astro, rather than
// introducing a separate visual system -- see documentation/components/notices.md and
// DESIGN.md ("Colors" / "Do's and Don'ts": no new tokens, no box-shadow).
export const NOTICE_CONTAINER_CLASSES =
  'not-prose flex items-start gap-3 rounded-(--radius) border bg-muted px-4 py-3 text-card-foreground';

// `legal`/`warning` get a touch of the existing `primary` accent on the
// border; the rest stay on the plain `border` token. Variants are mostly
// distinguished through icon choice + the sr-only announcement in
// render.ts, keeping colour use "restrained" per the task spec rather than
// inventing a semantic red/yellow/blue palette this design doesn't have.
export const NOTICE_VARIANT_BORDER_CLASSES: Record<NoticeVariant, string> = {
  correction: 'border-border',
  historical: 'border-border',
  legal: 'border-primary/40',
  note: 'border-border',
  warning: 'border-primary/40',
};

export const NOTICE_ICON_CLASSES =
  'mt-0.5 size-5 shrink-0 text-muted-foreground';

export const NOTICE_BODY_CLASSES = 'min-w-0 flex-1 space-y-1 text-sm';

export const NOTICE_TITLE_CLASSES = 'font-medium text-card-foreground';

// `not-prose` on the container already opts the whole notice out of
// prose-plugin margins; these arbitrary-variant utilities restore just
// enough spacing/markers for the description's own Markdown output
// (paragraphs, lists, links, inline code) to stay legible without the
// prose plugin's larger vertical rhythm -- see task requirement "prose
// styles do not add unsuitable margins inside the notice".
export const NOTICE_DESCRIPTION_CLASSES =
  'text-muted-foreground [&_a:hover]:no-underline [&_a]:text-link [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-card-foreground/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_li]:mt-1 [&_strong]:text-card-foreground [&>ol]:mt-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>p+p]:mt-2 [&>ul]:mt-2 [&>ul]:list-disc [&>ul]:pl-5';

export const NOTICE_DISMISS_CLASSES =
  'ml-auto -mr-1 -mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-[calc(var(--radius)-4px)] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export const NOTICE_DISMISS_ICON_CLASSES = 'size-4';
