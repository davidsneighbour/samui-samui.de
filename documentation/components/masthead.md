<!-- markdownlint-disable MD013 -->
# Masthead

`src/components/layout/header/Header.astro` owns the site masthead, including the title, tagline, header search control, navigation, and all masthead-specific CSS. The navigation is a sibling of the masthead header so it can remain sticky independently; see [Header navigation](header-navigation.md).

The home link contains real, server-rendered HTML text from `setup.title` in `src/data/setup.json`. The existing `sr-only` utility visually hides this exact text equivalent of the artwork while retaining it in the HTML and accessibility tree. The link derives its accessible name from this text; it does not rely on an `aria-label` alone. Visible lettering uses outlined Panton Heavy from the selected logo kit; changing the site name requires regenerating those outlines, as well as updating `setup.title`.

The tagline shown under the title uses `setup.siteDescription` from the same file — `setup.json` is the source of truth for both, and `src/data/iumas.json` is a historical archive only (see [`documentation/features/iumas.md`](../features/iumas.md)). Changing the visible tagline means editing `setup.json`, not `iumas.json`; append a matching dated entry to `iumas.json` in the same change so the `/iumas/` history stays complete.

## Photo-cut logo and responsive title

The selected revision A island symbol sits on the left, and `Samui?` and `Samui!` remain on two left-aligned lines on the right at every viewport width. One SVG `<image>` draws `/assets/header/header-201906.jpg` over the complete composition. A combined `<clipPath>` contains the island and both outlined words, so the photograph continues across all three shapes without repetition. `preserveAspectRatio="xMidYMid slice"` covers the full canvas. The island uses `clip-rule="evenodd"`, preserving transparent `?!` holes that reveal the active header background in both themes.

The source artwork comes from `src/assets/brand/samui/selected/symbol-reversed.svg` and `src/assets/brand/samui/panton-wordmark.json`. Astro imports their source at build time; there are no external image hosts, CSS data URLs, or new CSP directives. The single home link exposes the site title as HTML link text and to assistive technology, while the decorative SVG is hidden to prevent duplicate announcements. A visible two-tone focus indicator (cream `ring-contrast` band, coral `ring` outline) uses the existing radius token. No JavaScript is required for the photo treatment or theme response, and the SVG remains intact after Astro view transitions.

The artwork uses a 900 × 300 viewBox and scales to `min(calc(100vw - 32px), 1200px)`, giving 16px on each side and capping the artwork at 1200px on large screens. It spans the viewport independently of the article and navigation columns; the former stepped container limits are removed. The island’s 256-unit canvas is scaled by 1.2 and translated by (0, 3). Both word paths have a normalised 48-unit cap height. The first line uses scale 1.92645 at (294.30657, 45.46975), and the second uses scale 2 at (294.24, 171.46975). The slight first-line reduction preserves the visible left edge while aligning the question and exclamation dot centres vertically, restoring the earlier masthead’s optical treatment. These direct path positions centre the title against the detailed coastline. The simplified coastline preserves all four extrema, so its bounds match the detailed coastline and no mobile-only vertical word translation is needed. Keep the paths directly inside the clipping element: SVG clipping does not support a group as a clipping shape. These composition values are recorded in DESIGN.md. Separate logo uses at 32 px and below continue to use the island silhouette alone.

The masthead uses 12px top padding and an 8px gap between the artwork canvas and the divider/tagline wrapper at every viewport width. This reduces the outer vertical space while preserving the SVG canvas, island proportions, word positions, and photograph crop.

## Hover and focus response

When a visitor hovers the home link with a fine pointer, or focuses it with the keyboard, three layers change together over 700ms with the entrance curve:

* **Window drift** — the photograph scales to 1.04 and moves by (-8, -3) viewBox units. The island and words stay still, so the picture seems to move behind cut-out windows. The 4% scale gives 18 × 6 units of overscan, which covers the movement, so no canvas edge appears inside a shape.
* **Dusk** — a `primary`-coloured rectangle with `mix-blend-mode: multiply` fades from 0 to 0.55 opacity and deepens the photograph.
* **Question and answer** — a `<use>` copy of the `Samui?` path (`#masthead-word-question`), filled with the page `background` colour, fades from 0 to 0.35 opacity. The question line recedes and `Samui!` stays bright.

The `clip-path` sits on a `<g>` that wraps the photograph and the dusk rectangle, not on the `<image>`. A `clip-path` on a transformed element moves with that element, which would shift the cut-out shapes together with the photograph. The effect uses only `transform` and `opacity`; Safari does not support CSS `filter` on SVG child elements. Touch devices get no hover state. The global reduced-motion rule in `theme.css` makes the change instant.

## Development preview

The dev server exposes `/tests/masthead` for visual checks. It shows boxed iframe previews at common viewport widths, so each preview has its own media query environment. The frame URL is `/tests/masthead-frame`.

The route is declared in `src/pages/tests/[...path].astro`. `getStaticPaths()` returns no paths in production builds, so `npm run build` does not emit the testing page.

## Automated checks

The Playwright masthead checks in `src/test/masthead.spec.ts` cover two left-aligned word paths at all tested widths, a single elephant image clipped through all three shapes (the clip sits on its wrapper group), the even-odd island cut-out, real home-link text, the accessible home-link name, initial HTML and accessibility with JavaScript disabled, aligned punctuation-dot centres, vertical centring against the active island, and absence of horizontal overflow. Run the installed test package directly when the generic Playwright executable resolves a different version:

```bash
node node_modules/@playwright/test/cli.js test src/test/masthead.spec.ts
```

Visual checks cover light and dark themes. The clipping geometry lives inside the same SVG as its image and therefore travels with the header during an Astro view transition.

The masthead uses the full documented OSM coastline at viewport widths of 768px and above, and the simplified 50-vertex contour below 768px. Both cuts use the same selected punctuation geometry, canvas, and scale. CSS selects the visible clipping path; one photograph covers the composition in either case. The tagline is constrained to the same responsive width and can wrap on narrow screens.

The island’s `?!` now uses exact outlined Panton Heavy glyphs from the same font as both title lines. The source font’s rounded-square dots and stroke shapes are preserved with uniform scaling; both responsive coastlines use this same punctuation.

The visible island-to-wordmark gap is approximately 25.98 viewBox units with the documented OSM contour. The word positions and single continuous photo crop retain the approved composition. The 1200px maximum width limits enlargement of the source photograph.

The masthead viewBox starts at x = -43.23906 while retaining its 900 × 300 size. This balances the empty horizontal margins around the visible island-and-title block, aligning its centre with the decorative divider and tagline without resizing the artwork, changing the internal gaps, or moving the image relative to its clipping shapes.

## Text equivalent and search engines

The decorative SVG paths are artwork, not selectable lettering. The sibling text span supplies the exact site name without introducing another visible title or changing each page’s heading hierarchy. It is present in the initial HTML with JavaScript disabled and survives Astro navigation with the header. This provides descriptive home-link text in line with [Google’s link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable). Google’s [hidden-text policy](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-link-abuse) permits text intended for screen readers. This is an equivalent of the visible brand name, not additional search keywords; no ranking or indexing outcome is guaranteed. Dragging across the SVG still does not select the visible wordmark.

The final exclamation mark in `Samui!` has its own clipping path, split from the existing outlined artwork at build time. It grows by 12% around its centre on fine-pointer hover and keyboard focus, over the existing 700ms entrance curve. The letters and island retain their dimensions, and one continuous photograph still covers the complete artwork. With reduced motion, the exclamation mark keeps its resting size.
