# Prose reading column

Long-form post text (the single post page and the featured full-text post on the home page) is limited to a reading column, while embedded media may use the full width of the post card.

## Behaviour

* The column width is the `--reading-measure` token in `src/styles/theme.css` (65ch, about 650px at 16px). The `ch` unit is the width of the `0` glyph, which is about 10px in Panton, while an average character in German post text is about 7.06px (measured in Chromium on 2026-10-09). Lines therefore hold about 90–95 characters, not 65. This is a deliberate owner choice; a column of about 66 real characters would need about 29rem (or 47ch).
* The post title block (title, metadata, breadcrumbs, taxonomy links) sits in a wrapper with the same maximum width.
* The prose container carries the `prose-reading` class. Every direct child is limited to `--reading-measure` and centred with `margin-inline: auto`.
* Children marked `prose-wide` may use the full card width (`max-width: 100%`). Image blocks among them shrink to the image (`width: fit-content`) and stay centred, so a small image lines up with the text column and a large one grows up to the card width. Iframes, video embeds, tables, and legacy image canvases keep their own width rules, usually 100%.
* On narrow screens the column and the card are the same width, so nothing changes.

## Which elements are wide

`src/scripts/rehype/wide-media.ts` (`rehypeWideMedia`, the last rehype plugin in `astro.config.ts`) adds `prose-wide` to top-level elements of the rendered post body only:

* `figure`, `iframe`, `table`, `video`, `picture`, `dnb-youtube`, and `dnb-vimeo`.
* Legacy wrapper `div`s with the class `flickr`, `media`, or `flex-video`.
* Paragraphs that contain media (`img`, `picture`, `iframe`, `video`, video custom elements, or a `legacy-image-frame`) and nothing else apart from whitespace, line breaks, and links or spans that only wrap media.

A paragraph with text and an inline image stays in the column. CSS cannot tell these two cases apart, which is why the decision is made at build time. Nested media (for example an image inside a notice) is not marked.

## Changing the rules

Add new embed types to the sets at the top of `wide-media.ts` and cover them in `src/test/wide-media-rehype.test.ts`. If a new wide element has no intrinsic width (a responsive wrapper with absolutely positioned content), add it to the `:has(...)` exclusion of the `width: fit-content` rule in `theme.css`, or it collapses to zero width.
