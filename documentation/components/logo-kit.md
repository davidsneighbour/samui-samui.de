<!-- markdownlint-disable MD013 -->
# Logo kit

The selected revision A of the "Island voice" identity combines a simplified Koh Samui silhouette with negative-space `?!`, preserving the question-and-answer rhythm of "Samui? Samui!". The kit lives in `src/assets/brand/samui/`. The owner selected A after reviewing the Panton studies. The masthead uses the selected symbol as a photo mask beside its two-line title; website icons remain separate integration assets. See [Masthead](masthead.md). Work is tracked in [#1748](https://github.com/davidsneighbour/samui-samui.de/issues/1748).

## Revised logo studies

The owner retained the island silhouette and negative-space `?!`, requested a small leftward optical shift, and replaced the custom wordmark with the website title font. The three comparisons under `src/assets/brand/samui/concepts/` use outlines from `public/assets/webfonts/900/heavy/panton-heavy-webfont.ttf`, at a source font size of 192 px and weight 900. Normal font features and variation settings apply; legacy font kerning is preserved. The family stack for website text remains `Panton, "Anuphan Variable", ui-sans-serif, system-ui, sans-serif`. Outlined Latin artwork requires no fallback font at rendering time. The uppercase title treatment and both punctuation marks preserve the existing site name.

* A moves the original punctuation 8 units left on the 256-unit symbol canvas, preserving its proportions.
* B compresses punctuation horizontally to 92%, with its centre approximately 8 units left of the earlier mark.
* C reduces punctuation to 90%, with its centre approximately 8 units left of the earlier mark and its vertical centre preserved.

`comparison.png` and `comparison.svg` show all three with identical Panton lockups, dark and pale backgrounds, and 64/32/16 px symbol checks. The island-only small-size alternative is shown separately. A is the recommendation because it preserves punctuation strength while correcting balance. The owner selected A. The delivery kit now retains A’s optical centre and uses actual Panton Heavy outlines for both the wordmark and island punctuation; B and C remain historical comparisons. At 32 px and below, the comparison and favicon exports use the island silhouette alone, with no punctuation or wordmark.

Regenerate the concepts from the repository root with Python 3, uv, and `rsvg-convert`:

```bash
uv run src/scripts/brand/build-logo-concepts.py
```

The script declares its pinned FontTools dependency, reads the existing island master and local Panton font, exports vector outlines, and renders the comparison. It does not alter the old kit or website. The original coastline and font licensing requirements continue to apply; outlining the font does not remove those requirements. Symbol and lockup audits reported no structural failures; the lockups retain the actual font’s contour complexity and angled exclamation sides, and their wide proportions will need a stacked alternative when a direction is selected; preserved coastline angle warnings are covered by the exception in DESIGN.md. The rendered comparison was visually inspected. At 16–32 px, use the island-only alternative rather than treating the full punctuation mark as a finished favicon.

## Panton punctuation revision

Both `?` and `!` inside the island are now outlined directly from the same local Panton Heavy font as the title. The pair is uniformly scaled to a visible height of 96 units, with its visible bounding-box centre at (116.25, 124), preserving A’s leftward optical balance. Glyph proportions, kerning, curved sides, and rounded-square dots come from the font. Normal and reversed symbols share this geometry, and the detailed coastline version uses the same holes. The selected 32px-and-below island-only rule remains.

To regenerate the selected punctuation and font outline data, then all delivery assets:

```bash
uv run src/scripts/brand/build-logo-concepts.py --update-punctuation
node src/scripts/brand/build-logo-kit.ts
```

The update flag changes only the selected masters and font outline data; it leaves the historical comparison artwork intact. The earlier studies retain their hand-drawn punctuation for historical comparison.

## Files and selection

| Folder or file | Purpose |
| --- | --- |
| `svg/symbol-*.svg` | Full island-and-punctuation mark; `symbol-detail-white.svg` retains the complete supplied coastline for the large masthead. |
| `svg/horizontal-*.svg` | Symbol and outlined Panton wordmark, with fixed horizontal spacing. |
| `svg/stacked-*.svg` | Symbol above the two-line wordmark. |
| `svg/wordmark-*.svg` | Outlined Panton Heavy lettering without the symbol. |
| `svg/island-small.svg` | Simplified island-only cut for small uses. |
| `svg/punctuation-small.svg` | Punctuation-only alternative. |
| `svg/app-icon.svg` | Full symbol on a plum tile, for larger app and touch icons. |
| `pdf/` | Vector plum symbol, horizontal, and stacked print masters; RGB colours require a print proof. |
| `png/` | Transparent symbol, wordmark, horizontal, and stacked PNG exports. |
| `web/` | Island-only favicon SVG, 16/32/48 px PNGs, multi-size ICO, touch/app icons, maskable icon, web manifest, and integration snippet. |
| `web/punctuation/` | Alternative punctuation-only favicons and touch/app icons. |
| `presentation/panels/` | Nine individual PNG panels extracted from the brand overview without regenerating or redrawing its artwork. |
| `presentation/brandkit-overview.png` | Image-generated 3 × 3 brand overview, based on the refined Panton symbol and centred photo-cut masthead. Illustrative applications and lettering are not exact production masters. |
| `presentation/index.html` | Portable presentation showing six illustrative editorial contexts. |
| `presentation/overview.svg` and `overview.png` | Vector and raster presentation board. Presentation labels use system text; the logo artwork itself contains only vector shapes. |

Use `*-colour.svg` on plum: coral symbol and cream lettering. Use `*-plum.svg` or `*-light-coral.svg` on pale backgrounds. The single-colour black, white, plum, coral, and dark coral variants have transparent punctuation holes, rather than painted background patches. All colour cuts now share the exact Panton Heavy punctuation geometry, including its rounded-square dots.

At 32 px and below, use only the island silhouette, with no punctuation or wordmark. The punctuation-only family is retained as an unused historical alternative, rather than the selected small-size mark. Larger touch/app icons use the full symbol; the punctuation alternative remains available as a complete alternative icon family. The adaptive favicon SVG uses dark coral by default and bright coral when the browser requests a dark colour scheme. PNG and ICO fallbacks use fixed dark coral.

## Usage rules

Keep clear space of at least one exclamation-stem width around the visible artwork: 32 units on the symbol’s 256-unit canvas, rounded upwards from Panton’s approximately 31-unit exclamation stem. For any selected final version, do not add a frame, move punctuation, stretch the island, rotate it, or change the fixed lockup proportions. The outline keeps the source orientation. Logo geometry is an identifier, rather than a navigational map.

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

The strict TypeScript ESM generator reads the owner-supplied `src/assets/koh-samui-outline-main.svg`, reduces the contour from 73 to 40 vertices for the full mark and 21 for the small cut, reads the selected left-balanced symbol masters and outlined Panton lettering, renders PNGs, and assembles PNG-backed ICO files. The kit generator uses no map service or network requests. Its wordmark outlines come from the local Panton font. After changing the font, first run the concept generator to rebuild `panton-wordmark.json`, then regenerate the kit. The selected symbol masters live in `selected/` and remain stable across rebuilds. It overwrites only the generated kit files. Meaningful early concepts were preserved during development; subsequent changes should preserve the prior draft artwork in Git before regenerating.

To integrate later, copy the selected `web/` files into `public/assets/brand/samui/` and adapt `web/head-snippet.html` in the shared page head. The manifest uses relative icon URLs, so keep it beside its icons. To select punctuation, copy `web/punctuation/` favicons and touch/app files in place of the matching primary files. The primary maskable icon and manifest are island-based; a punctuation deployment should either omit the manifest or generate its own matching maskable icon and manifest. The prepared snippet is an example for that later integration, and its URLs are not live until the files have been copied.

## Provenance and validation

The coastline comes from the SVG supplied by the owner. Its upstream author, source URL, licence, geographic accuracy, and attribution obligations are unverified. [#1749](https://github.com/davidsneighbour/samui-samui.de/issues/1749) tracks source confirmation before publication. No geographic facts were inferred or added. The punctuation now uses the same Panton Heavy font outlines as the wordmark. The selected wordmark and studies use outlined Panton Heavy glyphs from the repository font; no font file is embedded in the SVG, but the Panton licence still governs the source font and its permitted uses. A professional similarity and trademark search is recommended before registering or commercially licensing the identity; no clearance is claimed.

The artwork was rendered and visually inspected on pale and dark backgrounds. SVG audits checked representative symbol, wordmark, and favicon masters. Coastline angle warnings are expected for preserved geographic contours; forcing those vertices onto a typography grid would change the shape. Masters have no live text, strokes, raster images, filters, masks, or external resources. The full mark’s punctuation is a real even-odd cut-out. The presentation board contains live labels, which are not part of any logo master. Browser checks cover the adaptive favicon’s light and dark appearance, and the ICO frames were checked against their PNG sizes.

## Brand overview image

`src/assets/brand/samui/presentation/brandkit-overview.png` presents the refined identity as a 3 × 3 board: logo, symbol construction, photo-cut website application, tagline, palette, typography, postcard, island image direction, and icon applications. It was generated with the brandkit skill using the centred header preview and current coral symbol as references. The image is a presentation illustration; generated typography, coastline details, photographic scenes, and UI examples can differ from the exact SVG assets and implemented website. Use the selected SVG masters and DESIGN.md for production geometry, font, colour, and component decisions. The regular kit generator leaves this separately generated PNG intact.

The nine original panels are also saved individually under `presentation/panels/`, numbered in reading order from `01-logo.png` to `09-icons-and-navigation.png`. They are pixel-preserving crops of `brandkit-overview.png`; the outer canvas and gutters are excluded. These illustrative extracts share the overview’s production limitations.
