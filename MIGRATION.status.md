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
(#703), and widget/embed parity — giscus, Matomo, schema.org JSON-LD, etc. (#704).
Also found and filed separately: 260 posts still contain raw, unconverted Hugo
shortcode syntax (#715) — a content-fidelity gap distinct from routing.

Resolved means `done + removed`.

| Done | In progress | Untouched | Removed | Total | Resolved |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 1 | 9 | 1 | 18 | 44% |

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
| `content/posts/<year>/<slug>/` (2,049 posts) | `src/pages/[...slug].astro` | done | #697 | Hugo-parity `/:year/:month/:slug/` URLs (from front matter `url` or computed from `date`). 260 posts still have raw unconverted Hugo shortcode syntax in their body — tracked separately as #715. |
| `content/leute/<slug>/` | `src/pages/leute/[slug].astro` | done | #698 | Only `prayuth-chan-ocha` has a page (matches original Hugo gap — `thanathorn-juangroongruangkit` never had an `_index.md` there either). |
| `content/tags/<tag>/` | `src/pages/tags/[slug].astro` | done | #699 | Generates a page per distinct tag slug used across all posts (Hugo taxonomy behavior), with override support from the one tag with a manual `_index.md`. |
| `content/archive/<year>.md` | `src/pages/archiv/[year].astro` + index | done | #700 | German "archiv" URL (per original Hugo permalinks). Computed from posts' `date`, not a separate content collection. |
| `content/feiertage/` | TBD | untouched | none yet | Not a registered Hugo collection; unclear if it renders its own routes or is only consumed as data. See Open Inventory Questions. |
| `content/sitewide/` (e.g. `authorfooter`) | TBD | untouched | none yet | Cross-page snippets, not routes. See Open Inventory Questions. |

## Asset and system inventory

| Area | Status | Issue | Notes |
| --- | --- | --- | --- |
| Images and media (`static/images`, `static/assets`, legacy `static/wp-content/{uploads,old-images,imagecache}`) | untouched | #701 | Legacy WordPress-era paths may still be linked from old posts; must be preserved. |
| PDFs and downloads | untouched | #701 | None specifically inventoried yet — confirm any exist. |
| CSS and theme files | untouched | #701 | Current: Bootstrap + hand-written SCSS. Target: Tailwind v4+ (see `AGENTS.md`). Refactor only after parity. |
| JavaScript and plugins (`assets/js`) | untouched | #701 | Preserve behavior first. |
| Forms | untouched | #702 | Contact form, see `[dnb.forms.contactform]` in `config/_default/params.toml`. |
| Redirects | untouched | #703 | Current generated `public/_redirects` is mostly boilerplate (dev-only redirect + 404 catch-all) — confirm no other real redirects exist before assuming this is trivial. |
| Widgets/embeds (giscus, YouTube, OpenSearch, PWA, Matomo, schema.org JSON-LD, social) | untouched | #704 | |
| `/admin` (Decap/Netlify CMS) | **removed** | #708 | Confirmed unconfigured boilerplate; dropped from parity target. |
| Netlify deployment config | untouched | #709 | Currently broken/stale regardless of Hugo vs. Astro — see `netlify.toml`. |

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
