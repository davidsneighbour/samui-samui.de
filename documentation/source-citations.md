# Source citations

This site uses Markdown footnotes for source citations in posts.

Use citations when a post relies on external reporting, official statements,
statistics, event listings, legal or policy claims, historical context, or
research notes that readers may want to verify.

## Citation style

Use named Markdown footnotes, not numeric footnotes:

```markdown
Die neue Faehrverbindung soll im August starten.[^src-bangkokpost-20260720-samui-ferry]

[^src-bangkokpost-20260720-samui-ferry]: Bangkok Post: ["New ferry route for Samui"](https://example.com/new-ferry-route), 20 July 2026 (accessed 22 July 2026).
```

Do not use `[^1]`, `[^2]`, and similar numeric identifiers for source
citations. Numeric identifiers are easy to collide with existing footnotes when
text is copied between posts or assembled from research notes.

## Footnote identifiers

Use this pattern:

```text
[^src-<source-slug>-<yyyymmdd>-<topic-slug>]
```

Examples:

```markdown
[^src-bangkokpost-20260720-samui-ferry]
[^src-tatnews-20260714-samui-award]
[^src-suratthani-20260703-nominee-crackdown]
```

Rules:

* Start source-citation identifiers with `src-`.
* Use lowercase ASCII letters, numbers, and hyphens.
* Use the publication date as `yyyymmdd`.
* Use the source or publication slug, not a generic label such as `news`.
* Use a short topic slug that distinguishes the article or announcement.
* Reuse the same identifier when citing the same source item multiple times in
  one post.
* If the same identifier would refer to two different source items, make the
  topic slug more specific.

If full post bodies with footnotes are ever rendered together on the same page
and an identifier collision becomes possible, prefix the topic slug with the
post slug or otherwise make the identifier page-unique. Individual post pages
and current list previews do not require post-slug prefixes by default.

## Required citation data

Capture as much of this data as is available:

* publication or organisation name;
* article, announcement, document, event, or page title;
* author or issuing body when named;
* publication date;
* event date when different from publication date;
* canonical URL;
* language;
* access date for volatile pages, live pages, social posts, PDFs, or pages that
  may change;
* archive URL when one is available and useful;
* note when the source is a press release, promotional item, social-only claim,
  translation, syndicated copy, or single-source claim.

The footnote text should be compact. Put interpretation in the post prose, not
inside the citation.

Link the source item title in the footnote by default:

```markdown
[^src-tatnews-20260714-samui-award]: TAT Newsroom: ["Ko Samui receives island award"](https://example.com/samui-award), 14 July 2026 (accessed 22 July 2026).
```

Use a raw URL only when the title is unavailable, unstable, or the exact URL is
itself editorially relevant. Do not put both a linked title and the same raw URL
in the same citation unless there is a specific reason.

## Copying from research reports

Research reports should provide copy-pasteable source footnotes near the text
they support. When copying a researched paragraph into a post, copy both:

* the prose with its `[^src-...]` markers;
* the matching `[^src-...]: ...` definitions.

Keep definitions near the bottom of the post or directly below a drafted
section while editing. Before publishing, remove definitions that are no longer
referenced.

## Source list entries are not citations

The source registry in `ai/skills/ss-research-news/resources/` tracks reusable
research entry points. A post citation points to the specific article,
announcement, document, event page, or source item used in the post.

Do not cite a source homepage when a direct article or document URL is
available.
