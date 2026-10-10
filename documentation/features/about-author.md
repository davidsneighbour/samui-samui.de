# About the author

The author page at `/ueber-mich/` provides a place to develop Patrick's longer biography in small editorial increments. It implements the first milestone of [the author-page issue](https://github.com/davidsneighbour/samui-samui.de/issues/1682). The visible heading is `Wer schreibt hier eigentlich?`; `Über Patrick` remains the proposed navigation label for a later launch.

## Draft implementation

`src/pages/ueber-mich.mdx` follows the existing standalone MDX page convention, with title and description in frontmatter, Markdown prose, and non-rendered MDX editorial comments. It uses `PageLayout` for the normal header, footer, heading, and content card, and the shared card-aware prose classes. The introduction uses the existing author-footer information. The year on Samui comes from `AUTHOR_SAMUI_MOVE_DATE` in `src/utils/life-stats.ts`, interpreted through the Bangkok date helper. The compact article biography remains separately authored in `src/content/sitewide/authorfooter/index.mdx`; there is no new author schema or duplicated chronology dataset.

The page is directly accessible but has `noindex,follow` through the layout's existing `noindex` prop. The sitemap filter in `astro.config.ts` excludes `/ueber-mich/`, and `data-pagefind-ignore="all"` excludes the draft prose from local search. No navigation or article-author links promote the draft. A short German note explains that the page is still being written. Source comments reserve future sections without rendering empty headings or placeholder copy.

## Editorial development and launch

The local author portrait uses Astro's `Image` component. It occupies the full prose width below Tailwind's `lg` breakpoint (1024px); on larger screens it occupies half the prose width and floats right, with the existing 32px spacing token separating it from the text. The prose wrapper establishes a flow root so the image remains inside the content card even when the biography is short.

Review the early archive before writing the arrival story, then develop the professional context, site history, and subjects covered by the blog. Verify factual claims against source material and select appropriate local photographs. Keep the full page thematic and the life timeline chronological. A timeline teaser must eventually use the canonical timeline data and must not embed the map application.

When a useful biography is ready and approved for launch, remove `noindex`, remove the sitemap exclusion, remove the Pagefind exclusion, and replace the draft note. Add the article-author link and `Mehr über Patrick →`, then decide navigation placement. Verify the built robots metadata, sitemap, search results, mobile and desktop presentation, and structured metadata before treating the page as published. Until then, the later milestones remain open under the existing issue.
