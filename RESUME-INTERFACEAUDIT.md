# Resume: interface audit tasks

This file turns the interface audit into an actionable task list. The audit used
the `emil-design-engineering` skill as the review lens and checked the local site
at mobile and desktop sizes.

Tracking issue:
[#1645](https://github.com/davidsneighbour/samui-samui.de/issues/1645).

**Status (2026-07-24): all tasks below are checked off and `npm run check`
passes.** Remaining before closing #1645: decide what to do with the
unrelated `src/components/Analytics.astro` working-tree change (see note in
the verification checklist), review/commit the changes in this file's task
list, and re-run the visual pass once more after commit to catch anything
`npm run check` can't (it doesn't screenshot).

The current visual direction is coherent and worth preserving: the legacy
maroon/parchment/coral palette, clipped masthead, and card-based reading surface
give the site a recognizable identity. Most remaining work is interaction
engineering, mobile comfort, and token hygiene rather than a redesign.

## Tasks

### Homepage and editorial optimisation sequence

These items came from a `gpt-taste` review of the local homepage and article
surfaces. Treat them as the suggested implementation order for the visual polish
track, while preserving the current identity: Panton, the maroon/parchment/coral
palette, the clipped masthead, and the archive-first reading model.

* [x] Overhaul the first homepage article into a stronger editorial feature.
  * Issue: The first post is larger than the rest, but it still reads mostly as
    the first item in a chronological list rather than a deliberate front-page
    composition.
  * Reasoning: This is the highest-leverage visual change because it improves
    the homepage's first content impression without redesigning the whole site.
  * Suggestion: Start here. Give the lead article a more intentional editorial
    rhythm: stronger image/title relationship, tighter excerpt length, clearer
    reading action, and spacing that distinguishes it from the standard list
    items while staying inside the existing card and token system.
  * Likely files: `src/components/BlogList.astro`,
    `src/components/BlogPostTitle.astro`,
    `documentation/components/blog-list-previews.md`, `DESIGN.md` if the
    component contract changes.

* [x] Rebalance mobile type hierarchy on the homepage.
  * Resolution: `.masthead__tagline` now uses `clamp(0.95rem, 0.6rem + 1.4vw,
    1.75rem)` instead of a bare `1.85vw` (which hit ~7px on a 390px phone).
    `BlogPostTitle`'s default size dropped from `text-3xl sm:text-4xl` to
    `text-[1.75rem] sm:text-3xl md:text-4xl` so the featured title reads
    strong without eating the whole first viewport. Verified via mobile
    screenshots at 390px.
  * Files touched: `src/components/Header.astro`,
    `src/components/BlogPostTitle.astro`.

* [x] Make the header navigation and search row feel more intentional.
  * Issue: The current nav/search row is functional and token-aligned, but it
    reads as a tidy row of controls rather than a clearly designed masthead
    system.
  * Reasoning: The masthead is doing most of the brand work; the control row
    should support it with clearer grouping and rhythm.
  * Suggestion: Preserve the established search contract: keep `/suche/`, keep
    `Finden`, keep the binoculars icon, and keep the lighter parchment search
    field before the theme toggle. Explore a restrained split-nav or compact-bar
    treatment using existing tokens.
  * Likely files: `src/components/Header.astro`,
    `src/components/HeaderLink.astro`, `documentation/features/search.md`,
    `DESIGN.md` if navigation component variants change.

* [x] Reduce construction banner dominance in the first viewport.
  * Resolution: Dropped mobile font-size (0.8rem → 0.7rem) and padding, hid the
    purely decorative trailing icon below `640px` (kept at `sm:` and up), and
    reduced `min-height` on mobile — this took the banner from 3 wrapped lines
    to 2 on a 390px phone, moving the first article further into view.
    Dismissal already persisted via `localStorage`; left unchanged.
  * Files touched: `src/components/ConstructionBanner.astro`.

* [x] Add interaction polish to post cards.
  * Resolution: Standard list-item `<article>` in `BlogList.astro` got a
    `group` class, a transparent border that turns to `border-border/60` on
    `hover`/`focus-within`, and the cover image now scales
    (`group-hover:scale-105`, mirrored for `group-focus-within` so keyboard
    users get the same feedback) inside a new `overflow-hidden` figure
    wrapper. `BlogPostTitle`'s link picked up
    `group-hover:underline group-hover:text-primary` (plus
    `group-focus-within:*`) so hovering anywhere on the card — not just the
    title text — gives a color/underline cue. Verified with Playwright hover
    in both light and dark themes.
  * Files touched: `src/components/BlogList.astro`,
    `src/components/BlogPostTitle.astro`.

* [x] Add subtle motion primitives, not heavy scroll spectacle.
  * Resolution: Covered by the cover-image reveal/scale above, plus a new
    `active:scale-[0.97]` pressed state on `ui/button.astro`. Added a sitewide
    `prefers-reduced-motion: reduce` safety net in `theme.css` (zeroes
    transition/animation durations) since Tailwind utility classes like
    `group-hover:scale-105` can't be wrapped in a per-component media query
    the way the existing bespoke `<style>` blocks are. Deliberately skipped
    masthead/search entrance motion — didn't want to introduce load-time
    layout shift risk for marginal benefit.
  * Files touched: `src/components/ui/button.astro`, `src/styles/theme.css`.

* [x] Tune article pages as the quiet reading mode.
  * Resolution: Reviewed `BlogPost.astro` against a real long-title post at
    390px — hero/title/meta/taxonomy/prose rhythm was already solid (this is
    where the masthead-tagline and title-sizing fixes above pay off too,
    since `BlogPostTitle` is shared). No structural changes made; the existing
    layout already meets the "calmer than the homepage" bar.
  * Files touched: none (verification only).

### Interface hygiene tasks

* [x] Fix iOS zoom risk in contact form fields.
  * Issue: `src/components/ContactForm.astro` uses `text-sm` for inputs and the
    textarea, which can render below 16px.
  * Reasoning: iOS Safari zooms focused form controls below 16px, which makes the
    contact flow feel jumpy and less controlled on phones.
  * Suggestion: Make input and textarea text at least 16px while keeping labels
    and helper copy visually compact. Prefer token-backed Tailwind classes over
    one-off CSS.
  * Likely files: `src/components/ContactForm.astro`,
    `documentation/features/contact-form.md`.

* [x] Make search-page autofocus touch-aware.
  * Issue: `src/components/PagefindSearchPage.astro` sets `autofocus` on the
    Pagefind input unconditionally.
  * Reasoning: Desktop autofocus can be convenient, but on phones it can open the
    keyboard immediately after navigation and compress the already header-heavy
    first viewport.
  * Suggestion: Keep autofocus for pointer/keyboard desktop contexts, but suppress
    it on touch devices. If the Pagefind component cannot express that directly,
    remove unconditional autofocus and add a small client script that focuses only
    when `(hover: hover) and (pointer: fine)` matches.
  * Likely files: `src/components/PagefindSearchPage.astro`,
    `documentation/features/search.md`.

* [x] Raise mobile tap targets to 44px without bloating the visual design.
  * Resolution: `HeaderLink` nav links got `min-height: 2.75rem` (44px) via
    `align-items: center`, so the visible link stays compact but the hit box
    doesn't. `ui/button.astro` and `ui/pagination.astro` controls (36-40px
    tall) got an invisible `before:absolute before:-inset-1` hit-area
    extension — sized so adjacent pagination controls' expanded hit areas
    meet at the `gap-2` midpoint without overlapping. The map popup close
    button (`size-6` = 24px) got `before:-inset-2.5` to reach 44px. Left
    MapLibre's own zoom/compass `NavigationControl` buttons untouched — that's
    third-party-rendered DOM tuned around a 29px icon size, not something the
    audit named.
  * Files touched: `src/components/HeaderLink.astro`,
    `src/components/ui/button.astro`, `src/components/ui/pagination.astro`,
    `src/components/ui/map.tsx`.

* [x] Remove active-navigation layout shift.
  * Issue: `src/components/HeaderLink.astro` changes active links to
    `font-weight: 700`.
  * Reasoning: Changing font weight between states can shift neighboring
    navigation items. This is especially noticeable in a compact wrapping mobile
    nav.
  * Suggestion: Use a stable nav font weight and express active state with the
    existing primary underline, color, or a subtle token-backed background.
  * Likely files: `src/components/HeaderLink.astro`, `DESIGN.md` if the active
    treatment changes the documented component contract.

* [x] Add reduced-motion handling for visible UI motion.
  * Issue: The construction banner animates `grid-template-rows`, while theme and
    sound toggles animate opacity, transform, and blur without a
    `prefers-reduced-motion` override.
  * Reasoning: Motion preferences need to be respected consistently. The banner
    animation also touches layout, which is less ideal than opacity/transform.
  * Suggestion: Add `@media (prefers-reduced-motion: reduce)` rules to disable
    transitions. Consider replacing the banner close animation with an immediate
    collapse or a transform/opacity-only treatment.
  * Likely files: `src/components/ConstructionBanner.astro`,
    `src/components/ThemeToggle.astro`, `src/components/Footer.astro`.

* [x] Gate decorative hover states to hover-capable devices.
  * Resolution: Confirmed via a direct Tailwind v4 `compile()` test that this
    project's `hover:` and `group-hover:` variants already compile to
    `@media (hover: hover) { ... }` (Tailwind v4's built-in behavior) — so
    every Tailwind-utility hover state (`ui/button.astro`, `ui/badge.astro`,
    `ui/pagination.astro`, `ui/map.tsx`'s JSX className hovers) was already
    gated with no changes needed. Audited every remaining bespoke CSS
    `:hover` selector site-wide (`rg ":hover"`) and gated the ones that
    weren't: `YoutubeScript.astro`'s play-button hover (brought in line with
    the already-gated `VimeoScript.astro` pattern, plus added the matching
    `prefers-reduced-motion` rule it was missing), `ConstructionBanner.astro`'s
    close-button hover (split from its `:focus-visible` pairing, which must
    stay ungated), and the MapLibre control-button hover in
    `src/styles/theme.css`. `HeaderLink.astro` and `ContactForm.astro` were
    already gated from the prior pass.
  * Files touched: `src/components/YoutubeScript.astro`,
    `src/components/ConstructionBanner.astro`, `src/styles/theme.css`.

* [x] Replace `transition: all` in Vimeo placeholder.
  * Issue: `src/components/VimeoScript.astro` uses `transition: all 0.2s ...` for
    the custom play button.
  * Reasoning: `transition: all` can accidentally animate layout-affecting
    properties and is explicitly discouraged by the audit rules.
  * Suggestion: Transition only `background-color` and `opacity`, matching the
    properties that actually change on hover.
  * Likely files: `src/components/VimeoScript.astro`,
    `documentation/components/vimeo.md`.

* [x] Bring contact form status colors into the token system.
  * Issue: Success and error feedback colors in `src/components/ContactForm.astro`
    are hardcoded hex values.
  * Reasoning: The rest of the site has a strong `DESIGN.md` and theme-token
    contract. Untokenized status colors can drift, especially across light and
    dark modes.
  * Suggestion: Either map success/error feedback to existing tokens with shape
    and icon/text cues, or deliberately add documented status tokens and update
    `DESIGN.md`.
  * Likely files: `src/components/ContactForm.astro`, `DESIGN.md`,
    `documentation/features/contact-form.md`.

## Verification checklist

* [x] Check mobile and desktop screenshots for the homepage, search page, archive
  page, and contact page. Also spot-checked `/seite/2/` (standard list cards)
  and a real long-title article page.
* [x] Verify light and dark modes after token or feedback-color changes. Card
  hover (border + title color/underline) checked in both themes via Playwright.
* [x] Verify keyboard focus order and visible focus rings for header nav, search,
  pagination, contact form, and map popup controls. Tabbed through the header
  nav into pagination and confirmed the `before:-inset-*` hit-area
  pseudo-elements don't affect the visible focus ring (it still renders
  tight to the control's real box) or tab order.
* [x] Verify touch targets are at least 44px or have equivalent invisible hit
  areas. Header nav, buttons, pagination, and map popup close button now meet
  44px via `min-height` or `before:-inset-*` hit-area expansion.
* [x] Verify `prefers-reduced-motion: reduce` disables nonessential transitions.
  Added a sitewide safety-net rule in `theme.css` in addition to the
  already-gated per-component rules.
* [x] Run the relevant quality gate, preferably `npm run check` unless the change
  is deliberately scoped to a narrower validation. `npm run check` passes
  (format, lint, astro check, taxonomy validation, 121 vitest tests) — run with
  the unrelated pre-existing `src/components/Analytics.astro` working-tree
  change stashed since it fails `biome format` on its own and isn't part of
  this audit pass (see note below).

**Note on `src/components/Analytics.astro`:** this file appeared modified in
the working tree partway through this session without any edit from the audit
work (quote style flipped from single to double, a comment removed, a
self-closing tag change) — almost certainly an editor auto-format from the
file being open elsewhere. Left untouched; it still needs a decision (revert
vs. reformat to match Biome) before `npm run check` will pass cleanly on the
full working tree.

## Repeating the audit

Use this process after making interface changes so the next audit is comparable
to this one.

1. Read the active design contracts before judging visuals:
   * `DESIGN.md`
   * `AGENTS.md`
   * the relevant component or feature document under `documentation/`
   * the `emil-design-engineering` skill, especially `ui-polish.md`,
     `touch-accessibility.md`, `forms-controls.md`, `animations.md`, and
     `performance.md`

2. Check the worktree before starting:

   ```bash
   git status --short
   ```

   Preserve unrelated changes. In the current audit run, `README.md` was already
   modified and was intentionally left untouched.

3. Start the local site:

   ```bash
   npm run dev
   ```

   The local site should be available at `https://localhost:4321/`.

4. Capture the same representative surfaces:

   ```bash
   google-chrome --headless=new --disable-gpu --no-sandbox \
     --ignore-certificate-errors --window-size=390,844 \
     --screenshot=/tmp/samui-home-mobile.png https://localhost:4321/

   google-chrome --headless=new --disable-gpu --no-sandbox \
     --ignore-certificate-errors --window-size=1440,1100 \
     --screenshot=/tmp/samui-home-desktop.png https://localhost:4321/

   google-chrome --headless=new --disable-gpu --no-sandbox \
     --ignore-certificate-errors --window-size=390,844 \
     --screenshot=/tmp/samui-search-mobile.png https://localhost:4321/suche/

   google-chrome --headless=new --disable-gpu --no-sandbox \
     --ignore-certificate-errors --window-size=390,844 \
     --screenshot=/tmp/samui-contact-mobile.png https://localhost:4321/kontakt/

   google-chrome --headless=new --disable-gpu --no-sandbox \
     --ignore-certificate-errors --window-size=390,844 \
     --screenshot=/tmp/samui-archive-mobile.png https://localhost:4321/archiv/
   ```

   If Chrome cannot run inside the sandbox, rerun the same commands with the
   required approval rather than skipping the visual pass.

5. Inspect source patterns that commonly regress design quality:

   ```bash
   rg -n "transition: all|transition-all" src
   rg -n "hover:|:hover" src
   rg -n "font-weight|z-\\[|z-[0-9]" src
   rg -n "outline-none|focus-visible" src
   rg -n "prefers-reduced-motion|touch-action" src
   rg -n "h-9|size-6|text-sm" src
   ```

6. Re-check the audit criteria:
   * no layout shift from active, hover, or dynamic states
   * inputs and textareas are at least 16px on mobile
   * touch targets are at least 44px or have equivalent invisible hit areas
   * hover-only styling is limited to hover-capable devices
   * icon-only buttons have useful `aria-label` values
   * focus rings are visible and keyboard order matches visual order
   * all nonessential motion respects `prefers-reduced-motion`
   * transitions specify exact properties and avoid layout-affecting animation
   * feedback states are visible, close to the action, and not color-only
   * light and dark modes remain readable

7. Validate the implementation:

   ```bash
   npm run check
   ```

   If a narrower validation is chosen, document why and include the exact command
   output summary in the handoff or commit message.

8. Update this file after each pass:
   * mark completed tasks
   * add new findings as tasks, not loose notes
   * include the affected files and suggested verification steps
   * remove stale findings only after screenshot/source verification confirms the
     issue is gone
