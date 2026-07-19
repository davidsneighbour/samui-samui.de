# Blog list previews

Blog list pages are rendered by `src/components/BlogList.astro`. The homepage
passes `featuredFirst`, so the first post on the first page is shown as a large
featured card.

The featured homepage card follows the same top-level article order as the
single post layout:

1. Post cover media, when `cover` frontmatter resolves.
2. Header section with title, metadata, tags, and separator.
3. Post preview content.
4. "Weiterlesen" link.

Previews come from Astro's rendered post HTML (`post.rendered.html`), not from
regex-stripped raw Markdown. This keeps paragraphs, lists, links, headings,
inline formatting, and blockquotes valid in list previews. The preview helper
skips media-only blocks so a cover image or video is not repeated immediately in
the excerpt.

The featured card shows up to five rendered content blocks. Compact list cards
keep the shorter one-block preview length. If rendered post HTML is unavailable,
the helper falls back to escaped `summary` frontmatter, then escaped
`description` frontmatter.
