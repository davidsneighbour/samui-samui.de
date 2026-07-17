# Project

## Summary

* Repository: `davidsneighbour/samui-samui.de`
* Site: [https://samui-samui.de](https://samui-samui.de)
* Current system: Astro (`output: 'static'`), landed on `main` 2026-07-17 (issue #690). Hugo has been removed from this repository entirely — the live site was still Hugo-served, but Hugo no longer needs to be deployed, by explicit user decision, so there was no reason to keep it around during the migration.
* Target system: Astro static site (`output: 'static'`) — foundation and page-route layer for every content collection are done; migration work has moved on to Visual Parity verification (issue #692, see `MIGRATION.status.md`)
* Deployment target: Netlify — a minimal `netlify.toml` (build command + functions directory) exists, but the site connection and headers/CSP are unconfirmed, tracked as issue #709
* Source of truth for parity: the live site at [https://samui-samui.de](https://samui-samui.de) (the Hugo source itself is gone from `main`; `legacy/hugo` still has a frozen copy if the old source needs inspecting)

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
| 2026-07-17 | **Hugo removed entirely from `main`** (issue #690). All Hugo source/config/tooling (`content/`, `layouts/`, `config/`, `static/`, `assets/`, `go.mod`/`go.sum`, `netlify.toml`, `.frontmatter/`, `postcss.config.cjs`, `.pre-commit-config.yaml`, `DEVNOTES.md`) deleted; the recovered Astro tree landed in its place, with `package.json` regenerated from `src/packages/*.jsonc` fragments (adding a new `dnbhq.jsonc` fragment to preserve the `@dnbhq/biome-config`/`@dnbhq/markdownlint-config`/`@dnbhq/release-config`/`lint-staged`/`simple-git-hooks` tooling from the earlier dnbhq onboarding, which would otherwise have been silently dropped by the regeneration). Astro pinned to 6.4.8 (not 7.x — some integrations, e.g. `@astrojs/mdx`, hadn't caught up to Astro 7's peer deps at decision time); `astro.config.ts` used instead of `.mjs` per user preference. Full history is preserved via git (and `legacy/hugo`), so this is reversible if needed. | User instruction |

## Constraints

* Work directly on `main` — there is no separate `migration` branch for this
  project, by explicit user decision.
* Preserve user changes.
* Use GitHub Issues for actionable migration work.
* Ask one blocking clarification question at a time.
* Hugo has been removed from `main` (see decision log). `HUGO-COMPATIBILITY.md` is kept as historical record of why v0.140.2 was pinned while Hugo was still in use, not as an active constraint.
