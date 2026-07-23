# Blog list previews

Blog list pages are rendered by `src/components/BlogList.astro`. The homepage
passes `featuredFirst`, so the first eligible post on the first page is shown as
a large featured article.

Posts are eligible for that homepage lead slot unless they explicitly opt out
with:

```yaml
options:
  featured: false
```

When a newer post opts out, the homepage moves the next eligible post into the
lead slot and keeps the opt-out posts immediately after it in their normal
chronological order. This keeps short notices, housekeeping posts, or other
non-feature material from owning the first homepage impression while preserving
the archive-first list order after the lead.

The featured homepage card follows the same top-level article order as the
single post layout:

1. Post cover media, when `cover` frontmatter resolves.
2. Header section with title, metadata, topics, and separator.
3. Full rendered post content.
4. The giscus comment form mapped to the post pathname, not the homepage path.

Previews come from Astro's rendered post HTML (`post.rendered.html`), not from
regex-stripped raw Markdown. This keeps paragraphs, lists, links, headings,
inline formatting, and blockquotes valid in list previews. The preview helper
skips media-only blocks so a cover image or video is not repeated immediately in
the excerpt.

Only the homepage lead article renders the full post body and comments. Compact
list cards keep the shorter one-block preview length. If rendered post HTML is
unavailable, the helper falls back to escaped `summary` frontmatter, then escaped
`description` frontmatter.
