# Resume: interface audit tasks

This file turns the interface audit into an actionable task list. The audit used
the `emil-design-engineering` skill as the review lens and checked the local site
at mobile and desktop sizes.

Tracking issue:
[#1645](https://github.com/davidsneighbour/samui-samui.de/issues/1645).

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

* [ ] Rebalance mobile type hierarchy on the homepage.
  * Issue: The masthead tagline becomes nearly ornamental on narrow screens,
    while the featured article title becomes a tall block before the reader gets
    much context.
  * Reasoning: The mobile first viewport is visually coherent, but the
    proportions make the brand description too quiet and the first title too
    loud.
  * Suggestion: Use stable responsive sizing such as `clamp()` for the masthead
    tagline, and tune compact/featured title sizes so long titles remain strong
    without dominating the entire phone viewport.
  * Likely files: `src/components/Header.astro`,
    `src/components/BlogPostTitle.astro`, `DESIGN.md` if type tokens change.

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

* [ ] Reduce construction banner dominance in the first viewport.
  * Issue: On mobile, the construction banner, masthead, nav, and header search
    consume most of the first viewport before the main content appears. In
    screenshots, the black/yellow banner is the first thing the eye sees.
  * Reasoning: The banner's personality is useful, but it currently competes
    with the masthead and delays the first article.
  * Suggestion: Keep the banner's voice, but reduce its mobile height, simplify
    the close affordance, persist dismissal reliably, or use a calmer compact
    presentation while the site is in active review.
  * Likely files: `src/components/ConstructionBanner.astro`,
    `src/components/Header.astro`, `DESIGN.md` if masthead or banner tokens
    change.

* [ ] Add interaction polish to post cards.
  * Issue: Post cards are readable but static; standard list entries especially
    have little tactile response beyond text links.
  * Reasoning: Small interaction details can make the archive feel more alive
    without changing the reading model.
  * Suggestion: Add grouped hover/focus behaviour: subtle cover-image scale,
    stable title underline or color shift, and a light card-surface or border
    transition. Gate decorative hover effects to hover-capable devices.
  * Likely files: `src/components/BlogList.astro`,
    `src/components/PostCover.astro`, `src/components/ui/button.astro`,
    `documentation/components/blog-list-previews.md`.

* [ ] Add subtle motion primitives, not heavy scroll spectacle.
  * Issue: The site has room for more visual life, but heavy pinned scrolling or
    stacked-card effects would fight the blog's archive and reading surfaces.
  * Reasoning: The best motion direction is editorial restraint: motion should
    clarify state or reveal media, not turn normal reading into a presentation.
  * Suggestion: Prefer image reveal/scale, pressed states, and gentle masthead or
    search entrance motion. Pair this with reduced-motion handling before adding
    any new animation. Save GSAP-style pinned or scrubbed experiments for a
    future special archive or story page, not the default article list.
  * Likely files: `src/components/BlogList.astro`,
    `src/components/PostCover.astro`, `src/components/Header.astro`,
    `src/components/ConstructionBanner.astro`,
    `documentation/components/blog-list-previews.md`.

* [ ] Tune article pages as the quiet reading mode.
  * Issue: Article pages already have a strong foundation, but spacing, title
    scale, and metadata rhythm can be tightened after the homepage work.
  * Reasoning: Post detail pages should feel calmer than the homepage: image,
    title, metadata, taxonomy, and body copy should support long reading.
  * Suggestion: Make only light adjustments after the homepage sequence: verify
    the hero image/title relationship, mobile title wrap, taxonomy spacing, and
    text rhythm. Avoid bringing homepage-style motion or dense editorial layout
    into default article pages.
  * Likely files: `src/layouts/BlogPost.astro`,
    `src/components/BlogPostTitle.astro`,
    `documentation/components/post-covers.md`.

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

* [ ] Raise mobile tap targets to 44px without bloating the visual design.
  * Issue: Several frequently used controls render below the recommended 44px
    touch target: header nav links, small buttons, pagination controls, and the
    map popup close button.
  * Reasoning: The current controls look tidy, but small hit areas increase
    mistaps on phones. Emil's rule is touch-first with hover enhancements layered
    on top.
  * Suggestion: Add invisible hit-area padding or `min-h-11 min-w-11` where the
    visual size can remain compact. For text links, increase vertical padding or
    wrap the link in a larger inline-flex target.
  * Likely files: `src/components/Header.astro`,
    `src/components/ui/button.astro`, `src/components/ui/pagination.astro`,
    `src/components/ui/map.tsx`, `documentation/components/*` as applicable.

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

* [ ] Gate decorative hover states to hover-capable devices.
  * Issue: Hover styles are applied broadly across nav links, buttons, badges,
    pagination, map controls, and media placeholders.
  * Reasoning: Touch devices can leave hover styles "stuck" after tapping. Hover
    should enhance pointer devices, not become a touch state.
  * Suggestion: Move bespoke CSS `:hover` rules into
    `@media (hover: hover) and (pointer: fine)`. For Tailwind `hover:*` utilities,
    consider a project-wide pattern or targeted component CSS where touch behavior
    is most visible.
  * Likely files: `src/components/HeaderLink.astro`,
    `src/components/ui/button.astro`, `src/components/ui/badge.astro`,
    `src/components/ui/pagination.astro`, `src/components/ui/map.tsx`,
    `src/components/YoutubeScript.astro`, `src/components/VimeoScript.astro`.

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

* [ ] Check mobile and desktop screenshots for the homepage, search page, archive
  page, and contact page.
* [ ] Verify light and dark modes after token or feedback-color changes.
* [ ] Verify keyboard focus order and visible focus rings for header nav, search,
  pagination, contact form, and map popup controls.
* [ ] Verify touch targets are at least 44px or have equivalent invisible hit
  areas.
* [ ] Verify `prefers-reduced-motion: reduce` disables nonessential transitions.
* [ ] Run the relevant quality gate, preferably `npm run check` unless the change
  is deliberately scoped to a narrower validation.

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
