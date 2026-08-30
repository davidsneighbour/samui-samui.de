# Blog archive

Tracked by milestone [Blog archive: chronological & thematic navigation](https://github.com/davidsneighbour/samui-samui.de/milestone/7). Turns the multi-year `posts` collection into a chronological and thematic archive that complements — not replaces — the existing paginated blog listing.

## Audit summary (state before this milestone)

Already implemented and reused as-is where noted:

* `src/pages/archiv/index.astro` — existed only as a 27-line stub: a flat, unstyled list of year links. No counts, no search, no statistics, no topic entry points. Rebuilt in [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908).
* `src/pages/archiv/[year].astro` — existed, groups posts by month and lists them, but had no month-jump navigation, no prev/next-year navigation, and no anchors. Extended in [#909](https://github.com/davidsneighbour/samui-samui.de/issues/909).
* `src/pages/themen/[slug].astro` — derives the real topic universe from every post's `themen[]` (slugified, case/separator collisions collapsed), not from the `themen` content collection (which only supplies optional title, description, aliases, and slug overrides).
* `src/pages/themen/index.astro` — did not exist. Added in [#912](https://github.com/davidsneighbour/samui-samui.de/issues/912).
* `src/pages/suche.mdx` + `src/scripts/integrations/pagefind.ts` — full-text search works; reused as the archive's search entry point ([#908](https://github.com/davidsneighbour/samui-samui.de/issues/908)). No year/topic faceting existed (`data-pagefind-filter`/`-meta` unused anywhere) — added in [#913](https://github.com/davidsneighbour/samui-samui.de/issues/913).
* `src/pages/index.astro` / `src/pages/seite/[seite].astro` + `BlogList.astro` — the paginated listing, kept unchanged as the "read recent posts" surface. Cross-linked from the archive in [#914](https://github.com/davidsneighbour/samui-samui.de/issues/914). The active page number in the numbered pagination doubles as a compact page-jump control, added in [#1238](https://github.com/davidsneighbour/samui-samui.de/issues/1238): its subtle pencil icon signals that readers can click the current page chip, edit the page number in place, and press Enter to navigate to `/` for page 1 or `/seite/[page]/` for later pages. Invalid empty values do nothing; out-of-range numeric values are clamped to the nearest generated page. Page 2 and later also render the same pagination above the post list, added in [#1237](https://github.com/davidsneighbour/samui-samui.de/issues/1237), so readers who arrive on an older listing page can jump again without scrolling to the bottom first.
* No breadcrumb component and no structured data (JSON-LD) existed anywhere on the site prior to this milestone — both added in [#911](https://github.com/davidsneighbour/samui-samui.de/issues/911).
* No `robots.txt`, and the sitemap integration had no `filter` — addressed in [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915).
* No test runner existed in the repo at all (no `test` script, no Vitest, no `*.test.ts` files) — added in [#905](https://github.com/davidsneighbour/samui-samui.de/issues/905).

## Route structure

```text
/archiv/                    year overview, statistics, search, curated topics
/archiv/[year]/             all posts of a year, grouped by month, anchors
/themen/                    full topic index (alphabetical + frequency)
/themen/[slug]/             topic page
/[year]/[month]/slug/       individual post URLs — unchanged, never touched
```

`/archiv/` is a distinct prefix from the post permalinks (`/yyyy/mm/slug/`), so there is no route conflict and breadcrumbs stay unambiguous.

**Decision ([#910](https://github.com/davidsneighbour/samui-samui.de/issues/910)): no separate `/archiv/[year]/[month]/` routes are built.** The year page (`/archiv/[year]/`, [#909](https://github.com/davidsneighbour/samui-samui.de/issues/909)) already gives every month a directly linkable `#monat-MM` anchor, a compact post list, and month-level counts — the anchors are retained as the sole implementation of "browse a month" per the EN plan's explicit fallback. Reasons against building real month routes:

* Every month page would duplicate the year page's per-month section almost verbatim (same post list, same counts), which is exactly the kind of thin duplicate-content the plan warns against.
* Populated prev/next navigation across year boundaries (e.g. Dec 2006 → Jan 2007) and a canonical-vs-index decision for each new route would add meaningful upkeep for a "browse a month" need the year page already meets.
* No post currently links to, or depends on, a `/archiv/[year]/[month]/` URL.

If a genuine need for directly shareable month URLs surfaces later (e.g. an external link expects one), this decision can be revisited — nothing here prevents adding the routes retroactively.

## Data source

All archive data is derived at build time from the `posts` and `themen` content collections defined in `src/content.config.ts` — no hard-coded counts, age copy, or year lists anywhere.

Post year and month grouping uses Thailand time (`Asia/Bangkok`, UTC+07:00), via `getPostDateParts()` in [`src/utils/dates.ts`](../../src/utils/dates.ts). Do not group posts with raw UTC or build-machine-local `Date` getters; many legacy timestamps are stored as UTC instants that belong to the following Bangkok calendar day.

The archive intro age uses [`src/components/SiteAge.astro`](../../src/components/SiteAge.astro) and the shared `formatDateDuration()` helper in [`src/utils/dates.ts`](../../src/utils/dates.ts). The same formatter powers the plain-Markdown `<dnb-site-age>` tag through [`src/scripts/rehype/site-age.ts`](../../src/scripts/rehype/site-age.ts), so plain `.md` content can render build-time age text without switching to MDX:

```html
<dnb-site-age since-date="2005-01-08" format="%y Jahre"></dnb-site-age>
```

Custom `format` strings support `%y` complete years, `%m` remaining months, `%d` remaining days, `%M` total complete months, `%D` total days, and `%%` for a literal percent sign. Without `format`, `unit="years"`, `unit="months"`, or `unit="days"` returns one total unit.

There is no `draft`/`publish` boolean in the `posts` schema. Draft state is handled out-of-band via the free-form `publisher.status` frontmatter block (managed by `npm run publisher`, never rendered), not a schema-level gate. **Decision: archive pages query `getCollection('posts')` unfiltered, same as every other listing page on the site today** (`index.astro`, `seite/[seite].astro`, `themen/[slug].astro`). There is no evidence of in-progress/unpublished content living in the `posts` collection that would need excluding — if that changes, filtering belongs in one shared query helper, not duplicated per archive page.

**Gap years:** `/archiv/` lists every year in the continuous range from the oldest to the newest post, not just years that have posts — a year with zero posts (e.g. 2023) still appears in the UI, shown unlinked (muted year number, "Keine Beiträge", twelve hollow activity dots, no month disclosure), so the archive reads as an unbroken timeline. It never gets a `/archiv/[year]/` route — there's nothing to build a page for.

## Indexing strategy

Indexable (included in the sitemap, get canonical + meta description):

* `/archiv/`
* `/archiv/[year]/` for every year with ≥1 post
* `/themen/`
* `/themen/[slug]/` for every topic with ≥1 post

Not indexable / never generated as static routes:

* Empty years and months — no route is generated for them, so they can't be indexed by construction.
* Pagefind search results (`/suche/?q=...`) — client-side only, no static route exists for a query, so nothing to exclude.
* Any expanded/collapsed disclosure state on `/archiv/` — pure client-side UI state (native `<details>`), not a route.

Excluded from the sitemap, but still built and crawlable (not `robots.txt` disallowed):

* `/seite/[seite]/` (pages 2+ of the paginated blog listing) — thin duplicates of content already indexed via `/archiv/`, `/themen/`, and individual post permalinks. Filtered out via `@astrojs/sitemap`'s `filter` option in `astro.config.ts`. Page 1 (`/`) is unaffected.

`/robots.txt` (`public/robots.txt`) allows all crawling and points at `/sitemap-index.xml`; no route needs disallowing since the exclusions above are handled at the sitemap level instead.

Canonical URLs are a simple self-referencing tag (`new URL(Astro.url.pathname, Astro.site)` in `BaseHead.astro`) with no per-page override. That's sufficient today: #910 decided against building `/archiv/[year]/[month]/` routes, so there's no duplicate-content pairing that would need a canonical pointing elsewhere.

Implemented in [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915).
