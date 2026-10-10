# About the author

The author page at `/ueber-mich/` introduces Patrick, his arrival on Koh Samui, his professional work, the purpose of Samui? Samui!, and the subjects covered by the blog. It implements the soft launch of [the author-page issue](https://github.com/davidsneighbour/samui-samui.de/issues/1682). The visible heading is `Wer schreibt hier eigentlich?`, and the primary navigation label is `Über Patrick`.

## Content and presentation

`src/pages/ueber-mich.mdx` follows the existing standalone MDX page convention, with title and description in frontmatter and Markdown prose. It uses `PageLayout` for the normal header, footer, heading, and content card, and the shared card-aware prose classes. The year on Samui comes from `AUTHOR_SAMUI_MOVE_DATE` in `src/utils/life-stats.ts`, interpreted through the Bangkok date helper. The article biography remains separately authored in `src/content/sitewide/authorfooter/index.mdx`; `BlogPost.astro` adds `Mehr über Patrick →` beneath it, linking to the full biography.

The local author portrait uses Astro's `Image` component. It occupies the full prose width below Tailwind's `lg` breakpoint (1024px); on larger screens it occupies half the prose width and floats right, with the existing 32px spacing token separating it from the text. The prose wrapper establishes a flow root so the image remains inside the content card even when the biography is short.

## Discovery and indexing

The page is linked from the shared main navigation and the article author block. It uses the standard canonical metadata and has no `noindex` directive or sitemap exclusion. Its prose carries `data-pagefind-body` so local search indexes the biography rather than the shared navigation and footer. Rebuild the search index with `npm run build:nocache` when changing these indexing attributes: the automatic Pagefind cache primarily tracks `src/content/**`, and this standalone page lives under `src/pages/`.

## Later editorial development

The useful biography is approved for navigation and indexing. Further archive research, photographs, site-history material, and personal details can be added incrementally. Keep the full page thematic and the life timeline chronological. A future timeline teaser must use the canonical timeline dataset and must not embed the map application. The broader editorial work remains open under the existing issue.
