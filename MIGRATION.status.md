# Astro migration status

This file tracks visible migration progress for the Astro migration described in
`MIGRATION.md`. GitHub Issues remain the source of truth for tasks. This file
answers: "How close are we to the same website on Astro?"

## Summary

Status basis: local scan of `main` after building the page-route layer,
2026-07-17. **The Astro foundation is live and route-complete for all defined
content** (#690, #696-#700 done): `astro.config.ts` (TypeScript, Astro pinned to
6.4.8), `biome.jsonc` extending `@dnbhq/biome-config`, the `src/packages/*.jsonc`
fragment-based `package.json` pipeline, and all Hugo source/config/tooling removed
entirely. `npm run build` (2,370 pages), `npm run astro:check` (0 errors), and
`npm run check` (biome + markdownlint) all pass clean.

Every content collection now has a working page route: individual posts
(`src/pages/[...slug].astro`, Hugo-parity `/:year/:month/:slug/` URLs), leute
(`src/pages/leute/[slug].astro`), tags (`src/pages/tags/[slug].astro`, generates a
page per distinct tag slug used across posts, matching Hugo's taxonomy behavior —
not just the one tag with a manual override), archive
(`src/pages/archiv/[year].astro` + index, German "archiv" spelling per the
original permalinks), and the top-level pages kontakt/suche/datenschutzerklaerung.
`suche` wires up `@pagefind/default-ui` against the existing pagefind build
integration.

**Not yet done:** the contact form itself (kontakt.astro renders the page's prose
but the form is explicitly deferred, #702), shared asset parity (#701), redirects
(#703), and most of widget/embed parity — giscus, YouTube, OpenSearch, PWA,
schema.org JSON-LD, social sharing (#704; Matomo analytics is done). Also found
and filed separately: 260 posts still contain raw, unconverted Hugo shortcode
syntax (#715) — a content-fidelity gap distinct from routing.

Resolved means `done + removed`.

| Done | In progress | Untouched | Removed | Total | Resolved |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 11 | 3 | 3 | 1 | 18 | 67% |

## Status values

* `untouched`: not migrated yet.
* `in progress`: migration work has started but parity is not accepted.
* `done`: migrated and parity-checked.
* `removed`: intentionally not migrated; redirect or equivalent handling is tracked.

## Page and route inventory

| Source path | Target path | Status | Issue | Notes |
| --- | --- | --- | --- | --- |
| `/` | `/` | done | #690 | Home page (paginated blog list). |
| `/kontakt/` | `src/pages/kontakt.astro` | in progress | #696, #702 | Page and prose done; the actual contact form is deferred to #702. |
| `/datenschutzerklaerung/` | `src/pages/datenschutzerklaerung.astro` | done | #696 | Privacy policy. |
| `/suche/` | `src/pages/suche.astro` | done | #696 | Pagefind-backed search, using `@pagefind/default-ui`. |
| `content/posts/<year>/<slug>/` (2,049 posts) | `src/pages/[...slug].astro` | done | #697 | Hugo-parity `/:year/:month/:slug/` URLs (from front matter `url` or computed from `date`). Raw unconverted Hugo shortcode syntax in post bodies is tracked separately as #715 — languagelink/ref/emojify/vimeo/soundcloud/figure/gallery/quote are converted; only youtube (31 posts) remains. |
| `content/leute/<slug>/` | `src/pages/leute/[slug].astro` | done | #698 | Only `prayuth-chan-ocha` has a page (matches original Hugo gap — `thanathorn-juangroongruangkit` never had an `_index.md` there either). |
| `content/tags/<tag>/` | `src/pages/tags/[slug].astro` | done | #699 | Generates a page per distinct tag slug used across all posts (Hugo taxonomy behavior), with override support from the one tag with a manual `_index.md`. |
| `content/archive/<year>.md` | `src/pages/archiv/[year].astro` + index | done | #700 | German "archiv" URL (per original Hugo permalinks). Computed from posts' `date`, not a separate content collection. |
| `content/feiertage/` | TBD | untouched | none yet | Not a registered Hugo collection; unclear if it renders its own routes or is only consumed as data. See Open Inventory Questions. |
| `content/sitewide/` (e.g. `authorfooter`) | TBD | untouched | none yet | Cross-page snippets, not routes. See Open Inventory Questions. |

## Asset and system inventory

| Area | Status | Issue | Notes |
| --- | --- | --- | --- |
| Images and media (`images`, `assets`, legacy `wp-content/{uploads,old-images,imagecache}`) | done | #701 | Restored from `legacy/hugo`'s `static/` into `public/` (783 files), verified present in `dist/` after build. |
| PDFs and downloads | done | #701 | None exist locally or ever did in `legacy/hugo`'s `static/`; the few posts mentioning `.pdf` link to external URLs. Nothing to migrate. |
| CSS/theme + JS behavior + visual identity | untouched | #716 | User wants the site to look more like the old one soon. Old site's actual colors (`#290e1c` body, `#e2e2b6` content bg, `#ec7263` primary), font ("Panton", already restored to `public/assets/webfonts/` but not wired in), and old JS behaviors (reading-progress bar, sticky-header brand toggle) are documented on the issue. Needs a scope decision (shadcn/ui adoption vs. plain Tailwind) before starting. |
| Forms | done | #702 | Contact form implemented via a Netlify Function (Resend + reCAPTCHA v3 + spam heuristics), adapted from `thaicookingclass-samui.com`'s reference implementation. Needs Resend/reCAPTCHA credentials set as Netlify env vars before it sends real mail — code-complete either way. |
| Redirects | done | #703 | No real historical redirects exist anywhere (no `aliases:` front matter, no configured `dnb.netlification.redirects` beyond dev boilerplate) — the original WordPress→Hugo migration preserved exact URLs via `url:` front matter instead, already replicated by `getPostUrl()`. Added `src/pages/404.astro`, which didn't exist at all. |
| Widgets/embeds (giscus, YouTube, OpenSearch, PWA, Matomo, schema.org JSON-LD, social) | in progress | #704 | Matomo analytics done (`src/components/Analytics.astro`, gated to production builds via `import.meta.env.PROD`). OpenSearch done (`src/pages/opensearch.xml.ts` + `<link rel="search">` in `BaseHead.astro`); the old site's own descriptor pointed at a 404'd `/search/` URL, fixed here to the real `/suche/?q=` path, and `suche.astro` now reads `?q=` and calls Pagefind's `triggerSearch()`. PWA manifest done (`<link rel="manifest">` + theme-color meta in `BaseHead.astro`, pointing at the already-restored `public/images/favicon/site.webmanifest`) — the old site's own Hugo "pwa" module output was a broken manifest with every field empty, not worth porting. Giscus done (`src/components/Giscus.astro`, wired into `BlogPost.astro`), adapted from `kollitsch.dev`'s reference; GitHub Discussions enabled on the repo; still needs the giscus GitHub App installed (manual step, see `MIGRATION.md`). Social sharing done (`src/components/SocialShare.astro`, Facebook + Twitter share links matching the live site's exact URL/param format, wired into `BlogPost.astro`). Schema.org JSON-LD: investigated, nothing to migrate — the old site's "schema" Hugo module was front-matter build-time validation (`assets/config/schema/frontmatter.schema.json`), not structured-data output; the live site emits no `application/ld+json` anywhere. Remaining: YouTube embeds — 31 posts use `{{< youtube ID >}}`, deliberately left for #715 since it's the same raw-shortcode-conversion work as that issue's other shortcode types (figure, quote, gallery, languagelink, ref — all now converted), not a standalone widget build. |
| `/admin` (Decap/Netlify CMS) | **removed** | #708 | Confirmed unconfigured boilerplate; dropped from parity target. |
| Netlify deployment config | in progress | #709 | A minimal `netlify.toml` now exists (build command + functions directory, added alongside the contact form) — still needs confirming the Netlify site is actually connected to this repo, and headers/CSP are undecided. |

## Accepted disparities

* `/admin` (Decap/Netlify CMS admin UI) will not be recreated in Astro — see issue
  #708 and the decision log in `PROJECT.md`.

## Open inventory questions

* Does `content/feiertage/` (holidays) render its own public routes, or is it purely
  data consumed by templates (e.g. a holiday calendar widget)? Affects whether it
  needs a dedicated route-parity issue.
* Does `content/sitewide/` need anything beyond being reproduced as shared
  layout/component content (i.e., is it ever a standalone route)?
* Are there real historical redirects anywhere (front matter `aliases`, a hand-written
  `static/_redirects`, etc.) beyond the boilerplate currently generated into
  `public/_redirects`?
