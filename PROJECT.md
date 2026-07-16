# Project

## Summary

* Repository: `davidsneighbour/samui-samui.de`
* Site: [https://samui-samui.de](https://samui-samui.de)
* Current system: Hugo static site, pinned to v0.140.2 (extended) — see `HUGO-COMPATIBILITY.md`. Content and layouts under `content/`/`layouts/`/`config/` are the live, actively-built source (not `public/`, which is generated build output and gitignored).
* Target system: Astro static site (`output: 'static'`)
* Deployment target: Netlify (`netlify.toml`) — currently broken/stale, see decision log and issue #709
* Source of truth for parity: the Hugo source on `main` (content/layouts/config), compared against the live site when local rendering is ambiguous

## Migration goal

The first migration goal is parity with the current public website: visible design,
behavior, content, metadata, URLs, assets, forms, redirects, and deployment behavior.

Improvements are tracked separately as post-parity work (issue #694).

## Decisions

| Date | Decision | Source |
| --- | --- | --- |
| 2026-07-17 | Target Astro static output, Tailwind CSS v4+ preferred for new styling work. | User instruction, recorded in `AGENTS.md` |
| 2026-07-17 | All migration work happens directly on `main`, not on a separate `migration` branch (superseding the default branch-per-migration convention). | User instruction |
| 2026-07-17 | A prior Astro rewrite (21 commits, all 2,049 posts already migrated) was recovered after an earlier accidental force-push and backed up to `origin/recovered-astro-main`. Adoption is **not yet decided** — reviewing it is issue #689, tracked under the "Migration: Inventory" milestone. Do not assume it will be merged. | User instruction |
| 2026-07-17 | **Adopt `origin/recovered-astro-main` as the Astro Foundation base** (issue #689, closed). Evidence: builds cleanly with `npm install && astro build` (Astro 5.16.9, Tailwind v4.1.18, Biome 2.3.11, pagefind — 104 pages, zero errors); all 2,049 posts plus `leute`/`tags` content already migrated with clean front matter/body. Gap found: no page routes exist yet for any collection (no individual post/leute/tag pages, no archive, no kontakt/suche/datenschutzerklaerung) — only `/`, `/about`, paginated `/seite/N`, and RSS render. Bringing this into `main` is tracked as issue #690 (Astro Foundation) and is a separate, deliberate step — not done automatically by this decision. | Agent review, see `MIGRATION.status.md` |
| 2026-07-17 | `static/admin/config.yml` (Decap/Netlify CMS, served live at `/admin/`) is unconfigured boilerplate — dropped from the parity target, tracked as cleanup (#708) not parity. | User instruction |

## Constraints

* Work directly on `main` — there is no separate `migration` branch for this
  project, by explicit user decision.
* Preserve user changes.
* Use GitHub Issues for actionable migration work.
* Ask one blocking clarification question at a time.
* Hugo (while it's still the live system) MUST stay pinned to v0.140.2 — see `HUGO-COMPATIBILITY.md`.
