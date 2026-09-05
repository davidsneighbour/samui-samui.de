# Blog list previews

Blog list pages are rendered by `src/components/content/blog/BlogList.astro`. The homepage passes `featuredFirst`, so the first eligible post on the first page is shown as a large featured article.

Posts are eligible for that homepage lead slot unless they explicitly opt out with:

```yaml
options:
  featured: false
```

When a newer post opts out, the homepage moves the next eligible post into the lead slot and keeps the opt-out posts immediately after it in their normal chronological order. This keeps short notices, housekeeping posts, or other non-feature material from owning the first homepage impression while preserving the archive-first list order after the lead.

The featured homepage card follows the same top-level article order as the single post layout:

1. Post cover media, when `cover` frontmatter resolves.
2. Header section with title, metadata, topics, and separator.
3. Full rendered post content.
4. The giscus comment form mapped to the post pathname, not the homepage path.

Previews come from Astro's rendered post HTML (`post.rendered.html`), not from regex-stripped raw Markdown. This keeps paragraphs, lists, links, headings, inline formatting, and blockquotes valid in list previews. The preview helper skips media-only blocks so a cover image or video is not repeated immediately in the excerpt.

Only the homepage lead article renders the full post body and comments. Compact list cards keep the shorter one-block preview length. If rendered post HTML is unavailable, the helper falls back to escaped `summary` frontmatter, then escaped `description` frontmatter.

## Balanced media width on compact cards

Every compact (non-featured) card renders its title and meta byline as a full-width header first, above everything else. Below that, cards with a cover render a two-column row from the `md` breakpoint upward: media on one side, excerpt/button on the other, alternating sides by post index (`md:flex-row` / `md:flex-row-reverse`). The title/meta header sits outside this row deliberately -- it is not part of the height being balanced, only the excerpt and button are.

The media column's static width is one-third of the row (`md:w-[var(--balanced-media-width,33.333%)]` on the `PostCover` figure). A short excerpt next to a 16:9 video can leave that one-third media noticeably shorter than the excerpt column, so `src/scripts/balanced-media.ts` progressively widens the media column, up to one-half of the row, until the rendered media height approximately matches the rendered excerpt column's height (within an 8px tolerance).

How it works:

* `BlogList.astro` marks each eligible card's flex container with `data-balanced-media`, and its content column with `data-balanced-media-content`. The figure is selected structurally as the container's direct `<figure>` child (`PostCover`'s root element), so no changes were needed in `PostCover.astro` itself.
* The height measurement reads the actual image/video element inside the figure, not the figure itself. The figure is a flex item in the row and stretches to the row's height by default (`align-items: stretch`), so measuring it directly always reports the *taller* sibling's height regardless of the real media/content difference. The inner element keeps its own aspect-ratio-driven height (it's laid out in normal flow inside the figure, not as a flex item), so that's what the search actually compares.
* The pure search — `findBalancedMediaWidthRatio` in `src/utils/balanced-media-width.ts` — samples a handful of evenly spaced ratios between 1/3 and 1/2 (bounded by `maxIterations`, default 6) and keeps whichever came closest to equal heights, stopping early once a sample is within tolerance. It deliberately does not bisect on the sign of `mediaHeight - contentHeight`: that assumes widening the media column always shrinks the height gap, which is false once a long excerpt's height grows faster than the media as its column narrows and wraps more. Sampling avoids converging on the wrong bound in that case.
* `src/scripts/balanced-media.ts` drives that search per card with a `ResizeObserver`, writing each candidate width to the `--balanced-media-width` CSS custom property on the card and reading back `getBoundingClientRect().height` from the media and content elements. The final choice is written to the same property, which the `md:w-[var(--balanced-media-width,33.333%)]` class already reads -- so no JavaScript means no card ever leaves the static one-third fallback.
* Balancing only runs above the `md` breakpoint. A `ResizeObserver` on the card, the media element, and the content element re-triggers a pass on viewport/breakpoint changes and on reflow from other causes (taxonomy labels wrapping differently, etc.); a `matchMedia` listener re-runs or resets every card on breakpoint transitions; `document.fonts.ready` re-runs every card once, since webfonts swapping in shifts line-wrap points after first paint. Each card guards its own writes with an `#ignoreObservations` flag so the resize notifications caused by its own search don't retrigger another pass -- only external causes reschedule.
* Applies to both video (16:9) and image (4:3, `object-cover`) covers: since both keep a CSS-fixed aspect ratio, widening the media column changes only its rendered size, not its crop framing, so the existing cover presentation is unaffected.
* The row uses `md:items-center` rather than the flex default (`stretch`), so the figure keeps its own natural (aspect-ratio-driven) height instead of stretching to match the content column, and any residual gap between the two is split evenly above and below the media instead of left as dead space below it. This assumes list previews stay short enough that the figure is never dramatically shorter than the content -- true here since compact cards only ever show a one-block excerpt, not full post bodies.
