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
    fontWeight: 400
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
the sole carrier of the information. Hovering a dot also reveals its
month abbreviation via a plain CSS `attr()` tooltip (`.month-dot` in
`theme.css`) — a supplementary mouse affordance, not a second carrier,
so the dots stay non-focusable rather than gaining 252 new tab stops.

Thresholds are computed per year, not against the whole archive: for
each year, its own busiest active month is "many" and its own
least-busy active month is "few", with "some" in between (#1652).
Earlier versions used fixed archive-wide thresholds (tuned against the
real per-month distribution: 157 months have ≥1 post, median 5, 75th
percentile 21, max 93 in a single month) — that made every low-volume
recent year read as uniformly faded next to peak years like 2005–2007,
since nothing in a 3-post year could reach the "many" threshold tuned
for a 93-post month. Per-year scaling means every year shows its own
internal month-to-month contrast, at the cost of no longer being able
to compare absolute volume between years by dot color alone (the
"Beiträge" count text next to each year is the source for that).

### Pagefind component UI

The search UI uses Pagefind's Component UI web components, but its theme is not
an independent design system. `src/styles/theme.css` maps Pagefind's `--pf-*`
custom properties onto the existing Samui tokens:

| Pagefind role | Samui token source |
| --- | --- |
| Text | `card-foreground` and `muted-foreground` |
| Surface | `card`; header search scopes the compact input to `accent` |
| Borders and focus | `border` and `ring` |
| Hover and skeleton fills | `accent`, `muted`, and `card` |
| Highlight mark | `primary` |
| Typography | `--font-sans` / Panton |
| Radius | `--radius - 4px`, matching compact controls |

The header search uses the compact `<pagefind-searchbox>` dropdown variant so
it behaves like an inline masthead control beside the text-link navigation. Its
input background is scoped to the existing `accent` token for a lighter,
yellowed parchment surface, and its search icon is Pagefind's
`--pf-icon-search` variable set to the Lucide binoculars shape. The `/suche/`
page uses the composable primitives (`input`, filter dropdowns, summary,
results) for a fuller search surface without introducing new visual tokens.

## Typography

Font family is **Panton** everywhere (`--font-sans`), self-hosted as
woff2/woff under `public/assets/webfonts/`, loaded via `@font-face` in
`theme.css`. Weights actually registered: 400 (regular + italic), 600
(bold), 700 (extra-bold), 900 (heavy) — the font ships 100–900 on disk,
but only these faces are wired into CSS, deliberately, to avoid unused
`@font-face` requests.

* **Thai fallback** — `--font-sans` is
  `"Panton", "Anuphan Variable", ui-sans-serif, system-ui, sans-serif`.
  Panton has no Thai glyphs, so any Thai character in otherwise-Latin
  content (mixed German/Thai strings, `<span class="thai">`, `/iumas`,
  post body text) automatically falls through to **Anuphan**, a Google
  font self-hosted via `@fontsource-variable/anuphan` (`wght.css`,
  imported in `theme.css`). No markup or JS is needed per Thai fragment
  — the browser resolves per-character. The package's variable-font CSS
  ships one `@font-face` per Unicode subset (thai, vietnamese,
  latin-ext, latin), each scoped with its own `unicode-range`; because
  Panton already serves every Latin glyph, only the `thai` subset file
  is ever fetched in practice — the other three subsets stay registered
  but unrequested. Anuphan's variable weight axis covers 100–700, which
  is enough to sit alongside Panton's 400–900 without a mismatch at the
  weights actually used in content (400/700). Anuphan reads visibly
  heavier than Panton at the same numeric weight, so `body` in
  `theme.css` pins Anuphan's `wght` axis to a fixed `300` via
  `font-variation-settings` regardless of the requested weight — a
  no-op for Panton, which is a static (non-variable) font and ignores
  the property.

* **`brand-masthead`** — the site name in `src/components/layout/header/Header.astro`. The selected island sits on the left of two left-aligned lines, `Samui?` and `Samui!`, using outlined Panton Heavy (900) artwork. One SVG image of `header-201906.jpg` spans all three shapes, clipped by a combined vector path; the photograph is never repeated between elements. The island’s even-odd `?!` holes reveal the active page background. The composition uses a 900 × 300 viewBox: the 256-unit symbol is translated by (0, 3) and scaled by 1.2; the normalised 48-unit cap-height first line is scaled by 1.92645 at (294.30657, 45.46975), while the second is scaled by 2 at (294.24, 171.46975). This preserves the visible left edge and aligns the punctuation-dot centres vertically. These direct path positions centre the title against the detailed coastline. The simplified coastline preserves all four extrema, so its bounds match the detailed coastline and no mobile-only vertical word translation is needed. The responsive artwork width is `min(calc(100vw - 32px), 1600px)`, limited to the viewport minus the existing 32px large spacing token. The photograph uses `xMidYMid slice`, covering the combined canvas once. The home link has a `ring` focus outline, a 4px offset, and the existing medium radius. This deliberately extends the inherited photo-cut masthead without introducing another colour or font.
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
  Prose list items deliberately use half of the
  `@tailwindcss/typography` default vertical item rhythm through
  `src/utils/prose.ts`: direct `<li>` spacing is `0.25em` above and
  below, while the first and last paragraphs inside loose Markdown list
  items keep a reduced `0.625em` edge margin. This keeps separate list
  items distinguishable without reading like a blank paragraph between
  every item.
* **`nav-link`** / **`nav-link-active`** — header navigation
  (`HeaderLink.astro`). Active state keeps the same 400 weight as the
  default link to avoid layout shift and is signaled by the `primary`-colored
  bottom border, not a color change.

* **`sticky-navigation`** — the shared main navigation is a sibling of the scrolling masthead, with `position: sticky`, a zero top offset, and stacking level 40. Its full-width wrapper uses the existing opaque `background` colour and `border-foreground/10` bottom border; the inner navigation retains its current spacing, responsive grid, and `max-w-5xl` width. Content scrolls underneath it. Footer visibility releases the bar back into document flow without animation or a placeholder change; keyboard focus within the bar keeps it sticky until focus leaves. The measured bar height supplies root scroll padding for anchor/focus clearance and adapts to mobile wrapping and viewport changes. Search dropdowns and existing overlays retain their own layers. See [Header navigation](documentation/components/header-navigation.md).

## Layout

* Content max-width: `max-w-4xl`/`max-w-5xl` (Tailwind defaults, 56rem /
  64rem) depending on component — post lists and the page card use
  `4xl`, the header nav uses `5xl`. Not yet unified; see Do's and Don'ts.
* The masthead deliberately spans the viewport outside the narrower article and navigation columns. Its combined photo-cut artwork has 16px on each side and a 1600px maximum width for very large displays; the inherited stepped container limits are removed. The composition scales uniformly, keeping the island and both words together.
* Standard horizontal padding is `px-4` (16px), widening to `sm:px-8`
  (32px) on card surfaces at the `sm` breakpoint.
* No custom spacing scale is defined in `theme.css` — Tailwind's default
  spacing scale is used throughout. The `spacing` tokens in this
  document's frontmatter are not a redefinition; they're the small,
  recurring subset (4/8/16/32/40px) that shows up consistently in
  component padding/gaps, recorded so agents don't invent a sixth value
  where one of these already covers it.

<!-- markdownlint-disable-next-line title-case-style -->
## Elevation & depth

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

## Motion

Motion is reserved for feedback and state changes; reading surfaces stay static. There are no motion tokens in `theme.css`; these values are the documented conventions. The global reduced-motion rule in `theme.css` shortens every transition and animation to 0.01ms, so components do not need their own reduced-motion branch unless they run bespoke JavaScript motion.

* **Hover and colour changes** — 150ms `ease-out` on colour, background, and border properties.
* **Press feedback** — `active:scale-[0.97]` with a 150ms transform transition on buttons and button-like controls (`buttonVariants`, pagination controls, footnote return links). Compact icon buttons (ThemeToggle, sound toggle, tooltip triggers) use `0.96`.
* **Entrance curve** — `cubic-bezier(0.2, 0, 0, 1)` for elements that enter (footer sound icon swap at 180ms, contact form status).
* **Contact form status** — enters over 200ms from `opacity: 0` and a 4px downward offset via `@starting-style`. It has no exit animation.
* **Busy spinner** — while a request runs, the contact form's submit icon becomes Lucide `loader-circle` spinning at 700ms `linear` per turn (faster than Tailwind's 1s `animate-spin`, because a faster spin makes the same wait feel shorter). The disabled button keeps full opacity while busy, so it reads as working, not unavailable.

Do not stagger list items, reveal blog cards on scroll, or animate the height of disclosures; these surfaces are used often and motion would slow every visit.

## Components

### Post footnotes

Generated Markdown footnotes use a separate "Fußnoten" section with 32px of space above it. The regular-weight, 16px heading has a decorative 32px by 1px line on its left in the `link` colour, separated by an 8px gap, and 16px of space below. Footnote copy uses the existing 14px navigation size at a 1.5 line height, with `muted-foreground` text, `link` links, and numbered list markers. Return links use the installed Lucide `corner-left-up` SVG at 16px in a 24px inline target, with a German accessible label. They reuse the button's ghost treatment: no resting fill or border, an `accent` hover/focus fill with `accent-foreground` text, the small 8px radius, 150ms colour/background/transform transitions, and a 0.97 active scale. The global reduced-motion rule disables prolonged transitions. Reference and return links have a visible `ring` focus outline. This pattern uses the existing card surface, colour tokens, and spacing scale, without a new panel or shadow.

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
* **Tooltip** (`src/components/ui/tooltip.astro`) — reusable hover/focus
  disclosure for compact help text. Tooltip content is fixed-positioned so it
  is not clipped by card overflow, opens below the trigger, centers to the
  trigger when space allows, and clamps to the viewport with a small arrow still
  pointing back to the trigger. The surface uses `muted`, `card-foreground`,
  `border`, and the standard small radius calculation.
* **BlogPostTitle** (`src/components/BlogPostTitle.astro`) — shared post
  title component for list cards and single-post pages. It always renders
  uppercase at weight 600, supports `h1`/`h2`, and offers default
  (`text-3xl sm:text-4xl`) and compact (`text-2xl`) sizes.
* **BlogPostMeta** (`src/components/BlogPostMeta.astro`) — shared metadata
  row beneath post titles. It owns published/updated dates and optional tag
  badges. The published date appears inline with a `CalendarDays` icon; when an
  updated date exists, a `CalendarCheck` icon follows it and reveals the
  "Aktualisiert" timestamp via the shared `Tooltip` component. The date
  line is a centered flex row so both icons and date text share the same visual
  middle. The row stacks left-aligned date and tags on small screens, then
  places dates on the left and tag badges on the right from the `sm` breakpoint
  upward.
* **Card** — not a dedicated component file; the pattern (`bg-card`,
  `text-card-foreground`, `rounded-(--radius)`, `px-4 py-8 sm:px-8`) is
  repeated inline in `BlogList.astro`, `PageLayout.astro`, and
  `BlogPost.astro`. A shared `Card.astro` would be a reasonable future
  extraction but does not exist yet — don't assume one when reading
  those files.
* **HeaderLink** (`src/components/HeaderLink.astro`) — nav links with a
  Lucide icon plus text label, spaced inline with a 2px transparent
  bottom border that turns `primary`-colored when active or when hovered on
  hover-capable pointer devices.
* **ThemeToggle** (`src/components/ThemeToggle.astro`) — header icon
  button for switching between light and dark themes. It uses a fixed
  44px hit area (`size-11`), `rounded-(--radius)`, the existing
  `accent` hover fill, and Morphicons' Astro custom element to morph
  between Lucide `Sun`/`Moon` icon data while honoring the user's
  reduced-motion preference.
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
* **Map surfaces** (`src/components/ui/map.tsx` and
  `src/components/ContactMap.tsx`) — mapcn-style MapLibre controls,
  markers, and popups adapted to this site's existing tokens. The map
  frame uses `border`, `muted`, and `rounded-(--radius)` like other
  framed tools; the marker uses `primary` with a `card` border and
  `primary-foreground` center dot; popups use `card`,
  `card-foreground`, `border`, and the small radius calculation. No new
  map-specific colors, radii, or shadows are introduced.
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
## Do's and don'ts

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

## Island logo kit

The selected identity direction is "Island voice", revision A: a simplified Koh Samui silhouette containing negative-space Panton Heavy `?!`. The punctuation retains revision A’s leftward optical centre at x = 116.25 and y = 124 on the 256-unit symbol canvas, at a uniform visible height of 96 units. The delivery kit under `src/assets/brand/samui/` uses the existing dark `primary` coral, `background` plum, and `foreground` cream; pale surfaces use plum or the existing light `primary` dark coral. Horizontal and stacked lockups use the actual self-hosted Panton Heavy font at weight 900, outlined from a 192 px source size, with normal font features and variation settings. The website font stack remains `Panton, "Anuphan Variable", ui-sans-serif, system-ui, sans-serif`. At 32 px and below, use the island silhouette alone, without punctuation or wordmark. The selected artwork replaces the earlier custom geometric wordmark; the three studies remain as historical comparisons. No website palette or masthead token changes are introduced. See [Logo kit](documentation/components/logo-kit.md) for files, clear space, minimum sizes, provenance, and regeneration.

The square symbol canvas is 256 units. The full coastline retains 50 vertices, and the island-only small cut retains 20. Preserve the geographic orientation and its organic angles; do not snap coastline vertices to typographic angle grids. Clear space is 32 symbol units, rounding the Panton exclamation’s approximately 31-unit stem width upwards. All colour cuts preserve the same undistorted Panton punctuation geometry; the earlier hand-drawn counters and dots are superseded. The standalone favicon uses only the island, with a punctuation-only alternative; never combine both at 16–32 px. App icon tiles reuse the existing 12 px medium radius on a 256-unit export canvas. These asset construction rules do not change component spacing or radius tokens.

The presentation is flat and uses existing brand colours. Its six contexts are illustrative applications, not implemented website changes. The coastline is derived from a committed OpenStreetMap snapshot under ODbL 1.0, replacing the untraceable supplied SVG in [#1749](https://github.com/davidsneighbour/samui-samui.de/issues/1749). See [Logo coastline](documentation/components/logo-coastline.md) for source data, projection, regeneration, and attribution. The shared footer carries a visible linked coastline credit using its existing text size, spacing, colours, and link treatment.

The masthead uses the full documented OSM coastline at viewport widths of 768px and above, and the simplified 50-vertex contour below 768px. Both cuts use the same selected punctuation geometry, canvas, and scale. CSS selects the visible clipping path; one photograph covers the composition in either case. The tagline is constrained to the same responsive width and can wrap on narrow screens.

The visible island-to-wordmark gap is approximately 25.98 viewBox units with the documented OSM contour. The word positions and single continuous photo crop retain the approved composition. The 1600px maximum width limits enlargement of the source photograph.

The masthead viewBox starts at x = -43.23906 while retaining its 900 × 300 size. This balances the empty horizontal margins around the visible island-and-title block, aligning its centre with the decorative divider and tagline without resizing the artwork, changing the internal gaps, or moving the image relative to its clipping shapes.
