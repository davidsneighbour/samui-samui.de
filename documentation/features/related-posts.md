<!-- markdownlint-disable MD013 -->
# Related posts

Individual blog posts show up to four links under "Verwandte Beiträge", between the article body and chronological navigation. The section is omitted when no other post shares a taxonomy value. It uses existing card, link, heading, spacing, radius, and focus tokens, stacks on small screens, and uses two columns from the `sm` breakpoint. It requires no browser JavaScript and is excluded from Pagefind text indexing.

`src/utils/related-posts.ts` builds an inverted taxonomy index once during route generation. Each distinct shared canonical value contributes four points for `ereignisse`, three for `personen`, two for `orte`, or one for `themen`. Scores add across values and taxonomies. This favours specific event connections over a single broad topic match. References may be strings or Astro reference objects; identical IDs in different taxonomies remain distinct. Holidays are outside this discovery model.

The current post is excluded, duplicate values count once, and each candidate appears once. Results sort by score descending, publication instant descending, and collection ID ascending as a deterministic final tie-break. There is no unrelated chronological fallback. Links use `getPostUrl`, preserving explicit historical URLs and Bangkok-time permalink calculation. No frontmatter or taxonomy changes are required.

For manual verification, open the event archives for [the 2014 military coup](https://samui-samui.de/archiv/ereignisse/militaerputsch-2014/), [the 2011 floods](https://samui-samui.de/archiv/ereignisse/hochwasser-thailand-2011/), and [the 2010 red-shirt protests](https://samui-samui.de/archiv/ereignisse/rothemden-proteste-2010/), then follow their post links. Check related links, absence of self-links, narrow-screen wrapping, keyboard focus, and both reader themes. This implements [#1684](https://github.com/davidsneighbour/samui-samui.de/issues/1684).
