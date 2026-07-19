# Blog archive

Tracked by milestone [Blog archive: chronological & thematic navigation](https://github.com/davidsneighbour/samui-samui.de/milestone/7).
Turns the 2,049-post, 21-year `posts` collection into a chronological and
thematic archive that complements — not replaces — the existing paginated
blog listing.

## Audit summary (state before this milestone)

Already implemented and reused as-is where noted:

* `src/pages/archiv/index.astro` — existed only as a 27-line stub: a flat,
  unstyled list of year links. No counts, no search, no statistics, no tag
  entry points. Rebuilt in
  [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908).
* `src/pages/archiv/[year].astro` — existed, groups posts by month and lists
  them, but had no month-jump navigation, no prev/next-year navigation, and
  no anchors. Extended in
  [#909](https://github.com/davidsneighbour/samui-samui.de/issues/909).
* `src/pages/tags/[slug].astro` — complete and reused unchanged. Derives the
  real tag universe from every post's `tags[]` (slugified, case/separator
  collisions collapsed), not from the `tags` content collection (which only
  supplies optional title/description overrides per slug).
* `src/pages/tags/index.astro` — did not exist. Added in
  [#912](https://github.com/davidsneighbour/samui-samui.de/issues/912).
* `src/pages/suche.astro` + `src/scripts/integrations/pagefind.ts` — full-text
  search works; reused as the archive's search entry point
  ([#908](https://github.com/davidsneighbour/samui-samui.de/issues/908)).
  No year/tag faceting existed (`data-pagefind-filter`/`-meta` unused
  anywhere) — added in
  [#913](https://github.com/davidsneighbour/samui-samui.de/issues/913).
* `src/pages/index.astro` / `src/pages/seite/[seite].astro` + `BlogList.astro`
  — the paginated listing, kept unchanged as the "read recent posts" surface.
  Cross-linked from the archive in
  [#914](https://github.com/davidsneighbour/samui-samui.de/issues/914).
* No breadcrumb component and no structured data (JSON-LD) existed anywhere
  on the site prior to this milestone — both added in
  [#911](https://github.com/davidsneighbour/samui-samui.de/issues/911).
* No `robots.txt`, and the sitemap integration had no `filter` — addressed in
  [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915).
* No test runner existed in the repo at all (no `test` script, no Vitest, no
  `*.test.ts` files) — added in
  [#905](https://github.com/davidsneighbour/samui-samui.de/issues/905).

## Route structure

```text
/archiv/                    year overview, statistics, search, curated tags
/archiv/[year]/             all posts of a year, grouped by month, anchors
/archiv/[year]/[month]/     optional — see decision below
/tags/                      full tag index (alphabetical + frequency)
/tags/[slug]/               unchanged, existing page
/[year]/[month]/slug/       individual post URLs — unchanged, never touched
```

`/archiv/` is a distinct prefix from the post permalinks (`/yyyy/mm/slug/`),
so there is no route conflict and breadcrumbs stay unambiguous.

Whether `/archiv/[year]/[month]/` ships as real static routes or stays
anchor-only on the year page is decided in
[#910](https://github.com/davidsneighbour/samui-samui.de/issues/910); record
the outcome here once resolved.

## Data source

All archive data is derived at build time from the `posts` and `tags`
content collections defined in `src/content.config.ts` — no hard-coded
counts or year lists anywhere.

There is no `draft`/`publish` boolean in the `posts` schema. Draft state is
handled out-of-band via the free-form `publisher.status` frontmatter block
(managed by `npm run publisher`, never rendered), not a schema-level gate.
**Decision: archive pages query `getCollection('posts')` unfiltered, same as
every other listing page on the site today** (`index.astro`,
`seite/[seite].astro`, `tags/[slug].astro`). There is no evidence of
in-progress/unpublished content living in the `posts` collection that would
need excluding — if that changes, filtering belongs in one shared query
helper, not duplicated per archive page.

**Gap years:** `/archiv/` lists every year in the continuous range from the
oldest to the newest post, not just years that have posts — a year with zero
posts (e.g. 2023) still appears in the UI, shown unlinked (muted year
number, "Keine Beiträge", twelve hollow activity dots, no month disclosure),
so the archive reads as an unbroken timeline. It never gets a
`/archiv/[year]/` route — there's nothing to build a page for.

## Indexing strategy

Indexable (included in the sitemap, get canonical + meta description):

* `/archiv/`
* `/archiv/[year]/` for every year with ≥1 post
* `/archiv/[year]/[month]/` for every month with ≥1 post, if built
  ([#910](https://github.com/davidsneighbour/samui-samui.de/issues/910))
* `/tags/`
* `/tags/[slug]/` for every tag with ≥1 post

Not indexable / never generated as static routes:

* Empty years and months — no route is generated for them, so they can't be
  indexed by construction.
* Pagefind search results (`/suche/?q=...`) — client-side only, no static
  route exists for a query, so nothing to exclude.
* Any expanded/collapsed disclosure state on `/archiv/` — pure client-side
  UI state (native `<details>`), not a route.

See [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915) for
the `robots.txt` and sitemap `filter` implementation.
