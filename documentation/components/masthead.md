<!-- markdownlint-disable MD013 -->
# Masthead

`src/components/layout/header/Header.astro` owns the site masthead, including the title, tagline, header search control, navigation, and all masthead-specific CSS.

The home link’s accessible name uses `setup.title` from `src/data/setup.json`. Visible lettering uses outlined Panton Heavy from the selected logo kit; changing the site name requires regenerating those outlines, as well as updating `setup.title`.

The tagline shown under the title uses `setup.siteDescription` from the same file — `setup.json` is the source of truth for both, and `src/data/iumas.json` is a historical archive only (see [`documentation/features/iumas.md`](../features/iumas.md)). Changing the visible tagline means editing `setup.json`, not `iumas.json`; append a matching dated entry to `iumas.json` in the same change so the `/iumas/` history stays complete.

## Photo-cut logo and responsive title

The selected revision A island symbol sits on the left, and `Samui?` and `Samui!` remain on two left-aligned lines on the right at every viewport width. One SVG `<image>` draws `/assets/header/header-201906.jpg` over the complete composition. A combined `<clipPath>` contains the island and both outlined words, so the photograph continues across all three shapes without repetition. `preserveAspectRatio="xMidYMid slice"` covers the full canvas. The island uses `clip-rule="evenodd"`, preserving transparent `?!` holes that reveal the active header background in both themes.

The source artwork comes from `src/assets/brand/samui/selected/symbol-reversed.svg` and `src/assets/brand/samui/panton-wordmark.json`. Astro imports their source at build time; there are no external image hosts, CSS data URLs, or new CSP directives. The single home link exposes the site title to assistive technology, while the decorative SVG is hidden to prevent duplicate announcements. A visible focus outline uses existing ring and radius tokens. No JavaScript is required for the photo treatment or theme response, and the SVG remains intact after Astro view transitions.

The artwork uses a 900 × 300 viewBox and scales to `min(calc(100vw - 32px), 1600px)`, giving 16px on each side and capping the artwork at 1600px on very large screens. It spans the viewport independently of the article and navigation columns; the former stepped container limits are removed. The island’s 256-unit canvas is scaled by 1.2 and translated by (0, 3). Both word paths have a normalised 48-unit cap height. The first line uses scale 1.92645 at (294.30657, 45.46975), and the second uses scale 2 at (294.24, 171.46975). The slight first-line reduction preserves the visible left edge while aligning the question and exclamation dot centres vertically, restoring the earlier masthead’s optical treatment. These direct path positions centre the title against the detailed coastline. Below 768px, each word receives a further 1.56-unit vertical translation to match the simplified coastline’s centre. Keep the paths directly inside the clipping element: SVG clipping does not support a group as a clipping shape. These composition values are recorded in DESIGN.md. Separate logo uses at 32 px and below continue to use the island silhouette alone.

## Development preview

The dev server exposes `/tests/masthead` for visual checks. It shows boxed iframe previews at common viewport widths, so each preview has its own media query environment. The frame URL is `/tests/masthead-frame`.

The route is declared in `src/pages/tests/[...path].astro`. `getStaticPaths()` returns no paths in production builds, so `npm run build` does not emit the testing page.

## Automated checks

The Playwright masthead checks in `src/test/masthead.spec.ts` cover two left-aligned word paths at all tested widths, a single elephant image clipped through all three shapes, the even-odd island cut-out, the accessible home-link name, aligned punctuation-dot centres, vertical centring against the active island, and absence of horizontal overflow. Run the installed test package directly when the generic Playwright executable resolves a different version:

```bash
node node_modules/@playwright/test/cli.js test src/test/masthead.spec.ts
```

Visual checks cover light and dark themes. The clipping geometry lives inside the same SVG as its image and therefore travels with the header during an Astro view transition.

The masthead uses the full supplied coastline at viewport widths of 768px and above, and the simplified 40-vertex contour below 768px. Both cuts use the same selected punctuation geometry, canvas, and scale. CSS selects the visible clipping path; one photograph covers the composition in either case. The tagline is constrained to the same responsive width and can wrap on narrow screens.

The island’s `?!` now uses exact outlined Panton Heavy glyphs from the same font as both title lines. The source font’s rounded-square dots and stroke shapes are preserved with uniform scaling; both responsive coastlines use this same punctuation.

The visible island-to-wordmark gap is approximately 25.76 viewBox units, half the earlier 51.52-unit gap. Both word lines move left together; the island geometry and the single continuous photo crop stay unchanged. The 1600px maximum width limits enlargement of the source photograph.
