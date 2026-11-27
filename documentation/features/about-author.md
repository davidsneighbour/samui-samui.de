# About the author

The author page at `/ueber-mich/` introduces Patrick, his arrival on Koh Samui, his professional work, the purpose of Samui? Samui!, and the subjects covered by the blog. It implements the soft launch of [the author-page issue](https://github.com/davidsneighbour/samui-samui.de/issues/1682). The visible heading is `Wer schreibt hier eigentlich?`, and the primary navigation label is `Über Patrick`.

## Content and presentation

`src/pages/ueber-mich.mdx` follows the existing standalone MDX page convention, with title and description in frontmatter and Markdown prose. It uses `PageLayout` for the normal header, footer, heading, and content card, and the shared card-aware prose classes. The year on Samui comes from `AUTHOR_SAMUI_MOVE_DATE` in `src/utils/life-stats.ts`, interpreted through the Bangkok date helper. The article biography remains separately authored in `src/content/sitewide/authorfooter/index.mdx`; `BlogPost.astro` adds `Mehr über Patrick →` beneath it, linking to the full biography.

The local author portrait uses Astro's `Image` component. It occupies the full prose width below Tailwind's `lg` breakpoint (1024px); on larger screens it occupies half the prose width and floats right, with the existing 32px spacing token separating it from the text. The prose wrapper establishes a flow root so the image remains inside the content card even when the biography is short.

## Discovery and indexing

The page is linked from the shared main navigation and the article author block. It uses the standard canonical metadata and has no `noindex` directive or sitemap exclusion. Its prose carries `data-pagefind-body` so local search indexes the biography rather than the shared navigation and footer. Rebuild the search index with `npm run build:nocache` when changing these indexing attributes: the automatic Pagefind cache primarily tracks `src/content/**`, and this standalone page lives under `src/pages/`.

## Later editorial development

The useful biography is approved for navigation and indexing. Further work is tracked in [#1865](https://github.com/davidsneighbour/samui-samui.de/issues/1865) (site history, archive and IUMAS links, images, "Und sonst?", structured data) and [#1866](https://github.com/davidsneighbour/samui-samui.de/issues/1866) (life-timeline teaser and static map, blocked by #1865).

Rules for that work:

* The page is thematic and narrative, not a CV. The chronology belongs to `/timeline/`; the About page does not repeat it year by year.
* A timeline teaser derives its data from `src/data/life-timeline.json` and `src/data/map-points.json`. There is no second chronology dataset. Do not embed `/timeline/` (no iframe, no full player) and do not load MapLibre on the About page.
* The timeline intentionally starts in 1974, one year before the birth year 1975 (`AUTHOR_BIRTH_DATE` in `src/utils/life-stats.ts`), so that it opens with a moment "before" the author.
* The article author block stays short and is authored separately in `src/content/sitewide/authorfooter/`.
* Do not render unfinished sections as placeholder content.
* Tone: first person, dry humour, specific rather than generic, personal rather than promotional. Avoid "passionate about", "my journey", "digital nomad", and paradise clichés that are not deliberately undercut. The footer line "Dipl. Ing. (FH), soviel Zeit muss sein" is the tonal benchmark.
