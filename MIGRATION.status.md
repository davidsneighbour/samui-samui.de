# Astro migration status

This file tracks visible migration progress for the Astro migration described in
`MIGRATION.md`. GitHub Issues remain the source of truth for tasks. This file
answers: "How close are we to the same website on Astro?"

## Summary

Status basis: local scan of `main` (Hugo source) plus a full review of the recovered
`origin/recovered-astro-main` branch (built it locally in an isolated worktree),
2026-07-17. **Adoption decided: yes** (see `PROJECT.md` decision log) — but nothing
has been ported into `main` yet, that's issue #690. The counts below reflect what
still needs doing on `main`, and notes flag what's already done on
`recovered-astro-main` vs. what's missing even there.

Review findings: the Astro foundation (config, integrations, Tailwind v4, Biome,
pagefind, image processing, package.json generation pipeline) builds cleanly and is
usable as-is. Content for `posts`/`leute`/`tags` is fully migrated with clean front
matter. However, **no page routes exist for any collection** — no individual post
pages, no leute pages, no tag pages, no archive, no kontakt/suche/datenschutzerklaerung.
Only `/`, `/about`, paginated `/seite/N`, and RSS actually render (104 pages total).
Every post link in the paginated list currently points at a route that doesn't exist.

Resolved means `done + removed`.

| Done | In progress | Untouched | Removed | Total | Resolved |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 3 | 14 | 1 | 18 | 6% |

## Status values

* `untouched`: not migrated yet.
* `in progress`: migration work has started but parity is not accepted.
* `done`: migrated and parity-checked.
* `removed`: intentionally not migrated; redirect or equivalent handling is tracked.

## Page and route inventory

| Source path | Target path | Status | Issue | Notes |
| --- | --- | --- | --- | --- |
| `/` | `/` | untouched | #696 | Home page. |
| `/kontakt/` | TBD | untouched | #696, #702 | Contains the contact form. |
| `/datenschutzerklaerung/` | TBD | untouched | #696 | Privacy policy. |
| `/suche/` | TBD | untouched | #696 | Search page (Pagefind-backed). |
| `content/posts/<year>/<slug>/` (2,049 posts) | `src/content/posts/**` | in progress | #697 | Content fully migrated on `recovered-astro-main` (adopted, see #690), front matter clean. **No individual post page route exists yet** — only the paginated list links to post URLs that 404. |
| `content/leute/<slug>/` | `src/content/leute/**` | in progress | #698 | Content migrated (incl. images/webp) on `recovered-astro-main`. **No leute page route exists yet.** |
| `content/tags/<tag>/` | `src/content/tags/**` | in progress | #699 | Content/collection schema migrated on `recovered-astro-main`. **No tag page route exists yet.** |
| `content/archive/<year>.md` | TBD | untouched | #700 | Recovered branch history mentions archive pagination work landing and later being reworked — reconcile, don't assume complete. |
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
