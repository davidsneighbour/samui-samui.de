# Thai typography

Thai characters render in Anuphan; all other text keeps Panton. The design tokens are in [DESIGN.md](../../DESIGN.md) ("Thai fallback"); this file records how the setup works and how to check it.

## How it works

* `src/styles/theme.css` imports `@fontsource-variable/anuphan/wght.css` and sets `--font-sans` to `"Panton", "Anuphan Variable", ui-sans-serif, system-ui, sans-serif`.
* Panton has no Thai glyphs. The browser picks the font per character, so Thai in mixed German/Thai text falls through to Anuphan. No markup, `lang` attribute, or JavaScript is needed. The old `<span class="thai">` markup in 2005 posts has no special styling; most of it is transliterated Latin text and stays in Panton.
* The Fontsource CSS registers four subsets (thai, vietnamese, latin-ext, latin), each with its own `unicode-range`. Fonts are self-hosted and bundled by Vite into `dist/assets/`; there are no external font requests.
* The browser downloads a subset file only when a page contains a character from its range that Panton cannot show. Panton covers U+0020–007E, U+00A0–0161, U+0164–017F, and some punctuation. In practice only `anuphan-thai-wght-normal.woff2` is fetched. In the archive, one post (`2020/12/doodle-of-the-day-national-theatre`) contains a combining breve (U+0306), which loads the `latin-ext` file there.
* `font-display: swap` comes from the Fontsource CSS. If Anuphan fails to load, Thai falls back to the system Thai font.

## Weight

Anuphan looks heavier than Panton at the same weight. `body` sets `font-variation-settings: "wght" 300`, so Thai glyphs always render at weight 300, also in bold text and headings. Panton is a static font and ignores this setting. This was a deliberate choice (commit `571038526ff8`): Thai stays visually level with the surrounding Latin text, and Thai is not emphasised by weight.

## Static maps

The static map generator uses the packaged Thai file directly for Thai labels; see [Static article maps](../features/static-maps.md).

## Checking

* Pages with Thai: `/iumas/` and posts with Thai script, for example `2019/01/koreanische-zombies`.
* In the browser developer tools, the "Rendered fonts" panel of a Thai text node shows "Anuphan Variable", and the network panel shows only the `thai` subset file.
* Thai marks above and below the line must not be clipped, also in headings with a tight line height.
