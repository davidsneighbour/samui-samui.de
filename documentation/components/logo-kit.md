# Logo kit

The approved "Island voice" identity combines a simplified Koh Samui silhouette with negative-space `?!`, preserving the question-and-answer rhythm of "Samui? Samui!". The kit lives in `src/assets/brand/samui/`. It is a delivery asset, and does not replace the current masthead or website icons automatically. Work is tracked in [#1748](https://github.com/davidsneighbour/samui-samui.de/issues/1748).

## Files and selection

| Folder or file | Purpose |
| --- | --- |
| `svg/symbol-*.svg` | Full island-and-punctuation mark. |
| `svg/horizontal-*.svg` | Symbol and custom wordmark, with fixed horizontal spacing. |
| `svg/stacked-*.svg` | Symbol above the two-line wordmark. |
| `svg/wordmark-*.svg` | Custom lettering without the symbol. |
| `svg/island-small.svg` | Simplified island-only cut for small uses. |
| `svg/punctuation-small.svg` | Punctuation-only alternative. |
| `svg/app-icon.svg` | Full symbol on a plum tile, for larger app and touch icons. |
| `pdf/` | Vector plum symbol, horizontal, and stacked print masters; RGB colours require a print proof. |
| `png/` | Transparent symbol, wordmark, horizontal, and stacked PNG exports. |
| `web/` | Island-only favicon SVG, 16/32/48 px PNGs, multi-size ICO, touch/app icons, maskable icon, web manifest, and integration snippet. |
| `web/punctuation/` | Alternative punctuation-only favicons and touch/app icons. |
| `presentation/index.html` | Portable presentation showing six illustrative editorial contexts. |
| `presentation/overview.svg` and `overview.png` | Vector and raster presentation board. Presentation labels use system text; the logo artwork itself contains only vector shapes. |

Use `*-colour.svg` on plum: coral symbol and cream lettering. Use `*-plum.svg` or `*-light-coral.svg` on pale backgrounds. The single-colour black, white, plum, coral, and dark coral variants have transparent punctuation holes, rather than painted background patches. The white and bright coral cuts slightly enlarge the counters and dots to reduce apparent weight on dark backgrounds.

At favicon sizes, use the island alone, or `?!` alone. Never squeeze both elements into 16–32 px. The island is the primary option. Larger touch/app icons use the full symbol; the punctuation alternative remains available as a complete alternative icon family. The adaptive favicon SVG uses dark coral by default and bright coral when the browser requests a dark colour scheme. PNG and ICO fallbacks use fixed dark coral.

## Usage rules

Keep clear space of at least one exclamation-stem width around the visible artwork: 17 units on the symbol’s 256-unit canvas. Do not add a frame, move punctuation, stretch the island, rotate it, or change the fixed lockup proportions. The outline keeps the source orientation. Logo geometry is an identifier, rather than a navigational map.

Use the full symbol at 64 px or larger, horizontal lockups at 320 px or larger, stacked lockups at 192 px or larger, and wordmarks at 240 px or larger. Below these sizes, switch to the island-only cut. The favicon alternatives are supplied at 16, 32, and 48 px. These are practical screen recommendations from the rendered tests, rather than guarantees for every printing process. Use at least 17 mm for the full symbol and ask the producer for a proof before embroidery, engraving, or other coarse reproduction.

| Colour | HEX | RGB | Approximate CMYK | Use |
| --- | --- | --- | --- | --- |
| Coral | `#ec7263` | 236, 114, 99 | 0, 52, 58, 7 | Symbol on plum. |
| Plum | `#290e1c` | 41, 14, 28 | 0, 66, 32, 84 | Dark background and pale-surface mark. |
| Cream | `#f5f1e6` | 245, 241, 230 | 0, 2, 6, 4 | Wordmark on plum. |
| Ink | `#2b2929` | 43, 41, 41 | 0, 5, 5, 83 | Supporting text in documents. |
| Dark coral | `#b8402f` | 184, 64, 47 | 0, 65, 74, 28 | Mark and favicon on pale backgrounds. |

All colours reuse [DESIGN.md](../../DESIGN.md). Calculated sRGB contrast is 6.09:1 for coral/plum, 15.85:1 for cream/plum, and 4.88:1 for dark coral/cream. CMYK values are mathematical estimates without an ICC profile; a printer must verify them against the material and process. No Pantone match has been selected or verified.

## Rebuild and integrate

Run from the repository root with Node 26 and `rsvg-convert` available:

```bash
node src/scripts/brand/build-logo-kit.ts
```

The strict TypeScript ESM generator reads the owner-supplied `src/assets/koh-samui-outline-main.svg`, reduces the contour from 73 to 40 vertices for the full mark and 21 for the small cut, constructs custom outlined letters, renders PNGs, and assembles PNG-backed ICO files. It does not use a map service, a font, network requests, or the assistant’s temporary concept files. It overwrites only the generated kit files. Meaningful early concepts were preserved during development; subsequent changes should preserve the prior approved artwork in Git before regenerating.

To integrate later, copy the selected `web/` files into `public/assets/brand/samui/` and adapt `web/head-snippet.html` in the shared page head. The manifest uses relative icon URLs, so keep it beside its icons. To select punctuation, copy `web/punctuation/` favicons and touch/app files in place of the matching primary files. The primary maskable icon and manifest are island-based; a punctuation deployment should either omit the manifest or generate its own matching maskable icon and manifest. The prepared snippet is an example for that later integration, and its URLs are not live until the files have been copied.

## Provenance and validation

The coastline comes from the SVG supplied by the owner. Its upstream author, source URL, licence, geographic accuracy, and attribution obligations are unverified. [#1749](https://github.com/davidsneighbour/samui-samui.de/issues/1749) tracks source confirmation before publication. No geographic facts were inferred or added. The wordmark and punctuation are custom geometric drawings; no Panton or other font file is embedded, and no font licence is required to render them. A professional similarity and trademark search is recommended before registering or commercially licensing the identity; no clearance is claimed.

The artwork was rendered and visually inspected on pale and dark backgrounds. SVG audits checked representative symbol, wordmark, and favicon masters. Coastline angle warnings are expected for preserved geographic contours; forcing those vertices onto a typography grid would change the shape. Masters have no live text, strokes, raster images, filters, masks, or external resources. The full mark’s punctuation is a real even-odd cut-out. The presentation board contains live labels, which are not part of any logo master. Browser checks cover the adaptive favicon’s light and dark appearance, and the ICO frames were checked against their PNG sizes.
