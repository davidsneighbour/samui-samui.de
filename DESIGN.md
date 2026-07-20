---
name: Samui? Samui!
version: 1.0.0
description: >-
  A 20-year-old personal blog about expat life on Koh Samui, Thailand,
  rebuilt in Astro. The default dark palette and masthead treatment are
  inherited from the site's long-running Bootstrap/Hugo theme, with a
  documented light theme added as an alternate reading mode.
colors:
  background: "#290e1c"
  foreground: "#f5f1e6"
  card: "#f1ecd8"
  card-foreground: "#2b2929"
  primary: "#ec7263"
  primary-foreground: "#2b2929"
  secondary: "#3d1a2b"
  secondary-foreground: "#f5f1e6"
  muted: "#e5dfc7"
  muted-foreground: "#6b6250"
  accent: "#e5dfc7"
  accent-foreground: "#2b2929"
  link: "#b8402f"
  border: "#d9d3ba"
  ring: "#b8402f"
  masthead-tagline: "#e2e2b6"
typography:
  brand-masthead:
    fontFamily: Panton
    fontWeight: 900
    fontSize: 40px
    lineHeight: 0.85
  heading:
    fontFamily: Panton
    fontWeight: 400
  post-title:
    fontFamily: Panton
    fontWeight: 600
  body-md:
    fontFamily: Panton
    fontWeight: 400
    fontSize: 16px
    lineHeight: 1.5
  nav-link:
    fontFamily: Panton
    fontWeight: 400
    fontSize: 14px
  nav-link-active:
    fontFamily: Panton
    fontWeight: 700
    fontSize: 14px
rounded:
  sm: 8px
  md: 12px
  lg: 10px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 40px
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: 16px
    height: 40px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.md}"
    padding: 16px
    height: 40px
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: 16px
    height: 40px
  button-lg:
    rounded: "{rounded.lg}"
    padding: 32px
    height: 44px
  button-sm:
    rounded: "{rounded.sm}"
    padding: 12px
    height: 36px
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.sm}"
    padding: 8px
    height: 24px
  badge-muted:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.sm}"
    padding: 8px
    height: 24px
  badge-outline:
    backgroundColor: transparent
    textColor: currentColor
    rounded: "{rounded.sm}"
    padding: 8px
    height: 24px
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.md}"
    padding: 16px
  avatar:
    rounded: "{rounded.full}"
    size: 96px
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.md}"
    padding: 12px
  nav-link:
    textColor: "{colors.foreground}"
    typography: "{typography.nav-link}"
  nav-link-hover:
    textColor: "{colors.primary}"
  body-link:
    textColor: "{colors.link}"
  ghost-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  muted-text:
    textColor: "{colors.muted-foreground}"
---

<!-- markdownlint-disable-next-line title-case-style -->
# DESIGN.md

## Overview

"Samui? Samui!" is a personal blog running since 2005, migrated from a
Hugo + Bootstrap theme to Astro + Tailwind CSS v4. The design goal of the
migration is **parity, not redesign** — every token in this document was
extracted from the live site's compiled CSS
(`legacy` theme.min.css) and from `src/styles/theme.css`, not invented.
Where the two rebuilds necessarily diverge (Bootstrap's grid vs. Tailwind
utilities), the visual *result* — colors, the masthead effect, spacing
rhythm — stays identical.

The default tone is warm-dark: a deep maroon background, a
cream/parchment card surface for content, and a single coral accent used
sparingly for links, focus rings, and the brand type's photo-clip
effect. The site now offers a light reading mode, but the dark maroon
theme remains the no-JavaScript and first-visit fallback so the migrated
site still opens with the long-running visual identity intact.

Tailwind v4 utilities resolve through runtime CSS variables: `:root`
holds the light-mode values, `.dark` holds the legacy dark values, and
`<html class="dark">` ships in every document shell. The inline theme
script in `BaseHead.astro` may remove `.dark` before the body renders
when the reader has selected light mode.

## Colors

The frontmatter `colors` block records the dark/default delivered
theme. The complete mode matrix in `src/styles/theme.css` is:

| Token | Light Value | Dark Value | Usage |
| --- | --- | --- | --- |
| `background` | `#f8f3e6` | `#290e1c` | Page background (`body`, `header`, `footer`). Light mode uses warm parchment; dark mode uses the legacy deep maroon. |
| `foreground` | `#2b2929` | `#f5f1e6` | Default text on `background`. |
| `card` | `#fffaf0` | `#f1ecd8` | Content surface — post bodies, the page wrapper card. |
| `card-foreground` | `#2b2929` | `#2b2929` | Text on `card`. |
| `primary` | `#b8402f` | `#ec7263` | Coral accent. Buttons, active nav underline, masthead tagline divider. Light mode uses the darker contrast-safe coral because it appears more often against pale surfaces. |
| `primary-foreground` | `#fffaf0` | `#2b2929` | Text on `primary`. |
| `secondary` | `#eadfca` | `#3d1a2b` | Secondary buttons and subdued fills. |
| `secondary-foreground` | `#3d1a2b` | `#f5f1e6` | Text on `secondary`. |
| `muted` / `accent` | `#eee4d2` | `#e5dfc7` | Subtle fills (hover states, ghost buttons). Same value used for both roles within each mode today. |
| `muted-foreground` | `#635846` | `#6b6250` | De-emphasized text on `card`. |
| `link` | `#8f2f24` | `#b8402f` | Body-text links. Both are darkened coral values selected for readable small text on the active `card` color. |
| `border` | `#d7c9b1` | `#d9d3ba` | Card/input borders. |
| `ring` | `#b8402f` | `#b8402f` | Focus ring — matches the contrast-safe coral family, not always `primary`, for small UI readability. |
| `masthead-tagline` | `#6b2438` | `#e2e2b6` | Masthead description text in `Header.astro`. Dark mode keeps the exact legacy `.blogdescription` color; light mode uses a deeper maroon so the small viewport-scaled text remains readable on parchment. |

**Note on lint warnings:** `design.md lint` flags `border`, `ring`, and
`masthead-tagline` as "never referenced by any component." This is
expected, not a gap to fix: `border`/`ring` have no matching slot in the
DESIGN.md component-token schema (`component_sub_tokens` doesn't define
a border or ring-color property), so they're used directly as Tailwind
utilities (`border-border`, `ring-ring`) rather than through a
`components.*` mapping; `masthead-tagline` is a component-specific CSS
variable used by `Header.astro`, and the schema has no dedicated field
for this bespoke masthead text color.

**Theme persistence:** `BaseHead.astro` owns the inline script that reads
and writes `localStorage["samui-theme"]`. Only `light` and `dark` are
valid stored values; missing or invalid values fall back to `dark`.

**Masthead tagline:** `.masthead__tagline` in `Header.astro` uses the
dedicated `--masthead-tagline` variable. The dark value (`#e2e2b6`) is
the exact legacy `.blogdescription` color; the light value (`#6b2438`)
is intentionally darker for contrast on the light page background.

### Month activity indicator

The archive's year overview shows twelve small dots per year, one per
month, signaling how many posts that month had (0 / few / some / many).
Rather than a new hue or a net-new frontmatter token, this reuses the
existing `primary` token at four opacity steps — it stays inside the
site's one accent color instead of introducing a second color language,
and doesn't require a `design.md lint` change since no new token is
declared:

| Level | Meaning | Class |
| --- | --- | --- |
| none | 0 posts | `border border-border bg-transparent` (hollow, not just "0% opacity fill") |
| few | 1–4 posts | `bg-primary/25` |
| some | 5–19 posts | `bg-primary/60` |
| many | 20+ posts | `bg-primary` |

The "none" level is a hollow ring rather than a fourth opacity step so
the empty state reads as a distinct shape, not merely "very faint" —
this is what keeps the indicator understandable without relying on
color contrast alone. The dots are always paired with the actual post
count in text (in the year row and, expanded, in each month row), so
the dots themselves are decorative (`aria-hidden="true"`) rather than
the sole carrier of the information.

Thresholds are tuned against the archive's real per-month distribution
(157 months have ≥1 post; median 5, 75th percentile 21, max 93 in a
single month) rather than the round numbers in early planning drafts —
most 2005–2007 months land in "many", most 2012+ months land in "few"
or "some", which is the actual shape of this blog's history.

## Typography

Font family is **Panton** everywhere (`--font-sans`), self-hosted as
woff2/woff under `public/assets/webfonts/`, loaded via `@font-face` in
`theme.css`. Weights actually registered: 400 (regular + italic), 600
(bold), 700 (extra-bold), 900 (heavy) — the font ships 100–900 on disk,
but only these faces are wired into CSS, deliberately, to avoid unused
`@font-face` requests.

* **`brand-masthead`** — the site name in `Header.astro`. Weight 900,
  uppercase (via `text-transform`, not a font feature — DESIGN.md's
  typography schema has no uppercase token, so this is a CSS rule, not a
  listed property), rendered with the header photo clipped into the
  glyphs (`background-clip: text`). Font-size is **not** a single value:
  it steps through six sizes at the *old Bootstrap breakpoints*
  (576/768/992/1200/1400px → 40/68/92/125/149/172px), not Tailwind's
  default breakpoints, because matching the live site's line-wrap
  behavior required matching its exact breakpoints. See
  `Header.astro`'s `<style>` block for the full step table — this
  document records only the base (mobile) value.
* **`heading`** — `h1`–`h6` in article content render at **regular**
  weight (400), not bold, per a deliberate identity choice carried over
  from the old theme (see the comment in `theme.css`). Sizes themselves
  come from the `@tailwindcss/typography` plugin's defaults (`prose`
  classes in `src/utils/prose.ts`), not custom-set — don't add
  per-heading `fontSize` overrides here without checking that file.
* **`post-title`** — post titles in list cards and the single-post header.
  Weight 600, uppercase, `text-balance`, rendered by
  `BlogPostTitle.astro`. This is deliberately separate from article
  content headings, which remain weight 400.
* **`body-md`** — base body copy. 16px / 1.5 line-height, weight 400.
* **`nav-link`** / **`nav-link-active`** — header navigation
  (`HeaderLink.astro`). Active state is signaled by weight (700) plus a
  `primary`-colored bottom border, not a color change.

## Layout

* Content max-width: `max-w-4xl`/`max-w-5xl` (Tailwind defaults, 56rem /
  64rem) depending on component — post lists and the page card use
  `4xl`, the header nav uses `5xl`. Not yet unified; see Do's and Don'ts.
* The masthead (`.masthead` in `Header.astro`) is a deliberate exception:
  it replicates Bootstrap's *stepped* container widths (100% fluid →
  540 → 720 → 960 → 1140 → 1320px) rather than a flat Tailwind
  max-width, because the uppercase brand title needs the wider container
  to stay on one line at desktop sizes, matching the live site.
* Standard horizontal padding is `px-4` (16px), widening to `sm:px-8`
  (32px) on card surfaces at the `sm` breakpoint.
* No custom spacing scale is defined in `theme.css` — Tailwind's default
  spacing scale is used throughout. The `spacing` tokens in this
  document's frontmatter are not a redefinition; they're the small,
  recurring subset (4/8/16/32/40px) that shows up consistently in
  component padding/gaps, recorded so agents don't invent a sixth value
  where one of these already covers it.

<!-- markdownlint-disable-next-line title-case-style -->
## Elevation & Depth

There is no elevation system. **No `box-shadow` is used anywhere in the
codebase.** Depth/separation is communicated entirely through flat color
contrast (`card` surface against `background`) and thin 1px borders
(`border` token), never shadows. Do not introduce `shadow-*` utilities
without a specific reason — it would be a new, unprecedented pattern for
this design, not a use of an existing-but-undocumented one.

## Shapes

Single base radius token (`--radius: 0.75rem` = 12px), with two
context-specific reductions for optical balance at different button
heights (`lg`: 10px, `sm`: 8px) rather than a monotonic size scale — this
mirrors shadcn/ui's `calc(var(--radius) - Npx)` convention, which this
codebase's `button.astro` follows directly (it's a shadcn-style
`cva` button). Avatars use `rounded-full`. Nothing in the design uses
sharp (0px) corners.

## Components

* **Button** (`src/components/ui/button.astro`) — `cva`-based, variants
  `default` / `secondary` / `outline` / `ghost` / `link`, sizes
  `default` / `sm` / `lg`. See the `components.button-*` tokens above for
  the concrete color/radius/padding mapping per variant and size.
* **Badge** (`src/components/ui/badge.astro`) — shadcn-style `cva`
  component for compact labels and tag links. Tags use the `muted`
  variant, matching the author-bio surface color so the badges stay quieter
  on the cream card surface, with uppercase labels supplied by
  `TagBadges.astro`; `outline`, `ghost`, and `link` variants reuse
  existing `border`, `accent`, and `link` tokens.
* **BlogPostTitle** (`src/components/BlogPostTitle.astro`) — shared post
  title component for list cards and single-post pages. It always renders
  uppercase at weight 600, supports `h1`/`h2`, and offers default
  (`text-3xl sm:text-4xl`) and compact (`text-2xl`) sizes.
* **BlogPostMeta** (`src/components/BlogPostMeta.astro`) — shared metadata
  row beneath post titles. It owns published/updated dates and optional tag
  badges. The published date appears inline with a `CalendarDays` icon; when an
  updated date exists, a `CalendarCheck` icon follows it and reveals the
  "Zuletzt aktualisiert" timestamp on hover or keyboard focus. The row stacks
  left-aligned date and tags on small screens, then places dates on the left and
  tag badges on the right from the `sm` breakpoint upward.
* **Card** — not a dedicated component file; the pattern (`bg-card`,
  `text-card-foreground`, `rounded-(--radius)`, `px-4 py-8 sm:px-8`) is
  repeated inline in `BlogList.astro`, `PageLayout.astro`, and
  `BlogPost.astro`. A shared `Card.astro` would be a reasonable future
  extraction but does not exist yet — don't assume one when reading
  those files.
* **HeaderLink** (`src/components/HeaderLink.astro`) — nav links with a
  Lucide icon plus text label, spaced inline with a 2px transparent
  bottom border that turns `primary`-colored (and the text weight jumps
  to 700) when active or hovered.
* **ThemeToggle** (`src/components/ThemeToggle.astro`) — header icon
  button for switching between light and dark themes. It uses a fixed
  40px hit area (`size-10`), `rounded-(--radius)`, the existing
  `accent` hover fill, and cross-fades Lucide `Sun`/`Moon` icons with
  explicit `opacity`, `transform`, and `filter` transitions.
* **Giscus comments** (`src/components/Giscus.astro` plus
  `public/assets/styles/giscus-samui-light.css` and
  `public/assets/styles/giscus-samui-dark.css`) — the iframe cannot
  inherit runtime CSS variables from the page, so the custom Giscus
  themes pin the equivalent DESIGN.md colors inside Primer's variable
  names. Light mode uses `card` `#fffaf0`, `foreground` `#2b2929`,
  `muted` `#eee4d2`, `border` `#d7c9b1`, and light `primary`/`link`
  coral values. Dark mode keeps the site's surrounding dark page but
  renders the comments on the dark-theme `card` surface `#f1ecd8`,
  with `card-foreground` `#2b2929`, `muted` `#e5dfc7`, `border`
  `#d9d3ba`, and dark `primary` `#ec7263`. Both theme files load the
  same Panton 400/600 faces as the site and keep the comment form below
  the timeline header, matching the current Giscus layout preference.
* **Masthead** (`src/components/Header.astro`) — see Typography and
  Layout above; the site's one genuinely bespoke, non-utility-driven
  component.
* **ConstructionBanner** (`src/components/ConstructionBanner.astro`) —
  intentionally *not* on the theme palette: black/`#ffd400` (yellow)
  hazard-stripe styling, inverted in dark-mode media query. This is a
  deliberate visual break from the rest of the site (an "under
  construction" notice should look like one), not an oversight.
* **Notice** (`src/components/Notice.astro`, plus the `<dnb-notice>`
  plain-Markdown equivalent — see documentation/notices.md) — editorial
  annotation asides (historical context, corrections, legal disclaimers,
  warnings). Reuses the `muted`/`border`/`card-foreground` tokens already
  used by tag badges and the author-bio surface rather than introducing a
  semantic red/yellow/blue palette; `legal`/`warning` variants get
  `border-primary/40` as their only colour differentiator, everything else
  stays on the plain `border` token. `not-prose`, no `box-shadow`.

<!-- markdownlint-disable-next-line title-case-style -->
## Do's and Don'ts

* **Do** treat the live site
  ([https://samui-samui.de](https://samui-samui.de)) as the source of
  truth when a token's exact value is ambiguous from code alone — several
  values here (masthead breakpoints, the dark-mode `#e2e2b6` tagline
  color) were recovered by diffing the deployed theme's compiled CSS,
  not from any design file.
* **Do** update this document in the same commit/PR whenever a token in
  `theme.css`, `Header.astro`'s masthead styles, or `button.astro`'s
  `cva` config changes. A stale DESIGN.md is worse than none.
* **Do** keep dark mode as the first-visit and no-JavaScript fallback
  unless deliberately changing the migrated site's default visual
  identity.
* **Don't** invent a spacing or radius scale beyond what's listed here
  without checking actual usage first (`grep -rn "rounded-\|gap-\|px-\|py-" src`)
  — this document favors recording what's real over prescribing what's
  ideal.
* **Don't** replace the dark masthead tagline value (`#e2e2b6`) with the
  `muted` token — they're visually close but not equal, and `#e2e2b6`
  is the one that matches the live site.
* **Don't** add `box-shadow` / elevation utilities; this design is
  intentionally flat.
* **Don't** bold headings inside post content — regular weight (400) on
  `h1`–`h6` is a deliberate identity choice, not a missed style.
* **Don't** treat Bootstrap-breakpoint values (576/768/992/1200/1400)
  seen in `Header.astro` as a pattern to reuse elsewhere. They exist
  there for one reason (matching the live site's masthead line-wrap) and
  should stay scoped to that component; the rest of the site uses
  Tailwind's default breakpoints.
