# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth — GitHub Issues are authoritative.
Regenerate via the `dnb-project-task-triage` skill rather than hand-editing.

**The Astro migration is governed by `MIGRATION.md`, with route/system progress
tracked in `MIGRATION.status.md`.**

## Project state

* Current stack: **Astro** (`output: 'static'`), landed on `main` 2026-07-17
  (#690, #707 closed). Hugo removed entirely — see `PROJECT.md` decision log and
  `HUGO-COMPATIBILITY.md` (now historical only).
* A prior Astro rewrite (21 commits, all 2,049 posts already migrated) was
  recovered after an earlier accidental force-push and is backed up at
  `origin/recovered-astro-main`. **Adopted** as the Astro Foundation base
  (#689 closed, decision in `PROJECT.md`) and landed on `main` (#690 closed).
* **The page-route layer is built for every defined content type**: individual
  posts, leute, tags, archive, and the top-level pages (kontakt/suche/
  datenschutzerklaerung) — see `MIGRATION.status.md` for the full breakdown.
  `npm run build` (2,370 pages), `npm run astro:check`, `npm run check` all pass
  clean on `main`.
* Open GitHub issues: 14, across 6 milestones (see below) plus 3 unmilestoned
  cross-cutting issues.
* User feedback: wants the site to look more like the old one soon — tracked
  as #716, with the old site's actual colors/fonts and shadcn/ui component
  interest documented there, pending a scope decision. The shadcn theme
  preset specifically MUST NOT be applied without explicit user go-ahead
  (see the issue's comments).
* Label taxonomy (`type:*`, `status:*`, `prio:*`, `resolution:*`, `meta:*`) is set
  up and in active use — see `AGENTS.md` for the full table.
* Project health: 4 open Dependabot PRs pending review (#674 pagefind, #677
  nanoid, #681 postcss, #714 npm_and_yarn group) — routine dependency
  maintenance is automated, not tracked as issues.

## Open issues by milestone

### Migration: inventory

* #688 Inventory current site for Astro migration (parent/tracking)

### Migration: content parity

* #691 Migrate current content and route surface to Astro (parent/tracking)
* #715 Content fidelity: 260 posts still contain raw Hugo shortcode syntax
  (in progress — languagelink/ref/emojify/vimeo/soundcloud/figure/gallery/
  quote all done; only youtube (31 posts) remains, deliberately deferred
  per #704)
* #716 Visual redesign: restyle to match old site's identity, adopt shadcn/ui
  (`prio:medium`, needs a scope decision before starting — see the issue)

### Migration: visual parity

* #692 Verify visual and behavioral parity (parent/tracking)
* #705 Screenshot-based parity workflow
* #706 Parity checks across route groups

### Migration: cleanup

* #693 Clean up legacy migration leftovers after parity (parent/tracking)
* #708 Cleanup: remove unused static/admin CMS boilerplate
* #709 Fix or remove stale Netlify deployment config

### Migration: post-parity improvements

* #694 Track post-parity improvements (parent/tracking; not to be worked until
  parity is accepted)

### Unmilestoned / cross-cutting

* #695 Periodic main-branch intake during migration
* #717 Migrate historical Disqus comments into Giscus/GitHub Discussions
  (`prio:low` — export already backed up in `scratch/`, needs an import
  approach and an attribution-scheme decision, see the issue)
* #718 Configure Astro dev server to run over HTTPS (`prio:low` — likely
  needed for LAN-device PWA/service-worker testing now that the dev server
  listens on all interfaces; see the issue for the reasoning to confirm)

## Recently closed migration issues

* #704 Widgets and embeds parity — Matomo, OpenSearch, PWA manifest, giscus,
  social sharing all done; schema.org JSON-LD investigated (nothing to
  migrate, the old "schema" module was front-matter validation not
  structured data); YouTube embeds deliberately deferred to #715 since it's
  the same shortcode-conversion work as that issue's other types.
* #689 Review recovered-astro-main branch and decide adoption — **adopted**, see
  `PROJECT.md` decision log and the issue's closing comment for the full review.
* #690 Build Astro static-site foundation — landed on `main`, Hugo removed
  entirely, see the issue's closing comment for the full list of what changed.
* #707 Validation and quality gates for the Astro project — `astro:check`,
  `check` (Biome + markdownlint) all passing.
* #696 Top-level static pages parity — kontakt/suche/datenschutzerklaerung built
  (contact form itself deferred to #702).
* #697 Content collection parity: posts — `[...slug].astro`, Hugo-parity URLs.
* #698 Content collection parity: leute — `leute/[slug].astro`.
* #699 Content collection parity: tags — `tags/[slug].astro`, full taxonomy
  (not just the one tag with a manual override).
* #700 Archive route parity — `archiv/[year].astro` + index.
* #702 Forms parity: contact form — implemented via a Netlify Function
  (Resend + reCAPTCHA v3 + spam heuristics), adapted from
  `thaicookingclass-samui.com`'s reference. Needs Resend/reCAPTCHA
  credentials set as Netlify env vars before it sends real mail.
* #701 Shared assets and system files parity — images/media restored; PDFs
  confirmed non-existent; CSS/JS folded into #716.
* #703 Redirects and deprecated paths parity — no real redirects existed;
  added the missing `src/pages/404.astro`.

## Open clarification questions

* Whether `content/feiertage/` and `content/sitewide/` need dedicated route-parity
  issues — see "Open Inventory Questions" in `MIGRATION.status.md`.
* Whether any real historical redirects exist beyond the current boilerplate
  `public/_redirects` output.

## Recommended next steps

1. **#716 needs a scope decision from the user** before starting (shadcn/ui
   adoption vs. plain Tailwind, which components are actually needed, exact
   vs. inspired-by color/font match) — the highest-priority remaining item
   given explicit user interest in the site looking better soon.
2. #715 (raw Hugo shortcode syntax) — only `youtube` (31 posts) remains, can
   be finished independently of #716.
3. #688 (inventory) can proceed in parallel.
4. Address Cleanup issues (#708, #709) opportunistically — #709 now has a
   minimal `netlify.toml` but still needs the Netlify site connection
   confirmed and headers/CSP decided if wanted.
5. #717 and #718 are both low-priority and have open clarification questions
   in their issue bodies — resolve those with the user before implementing
   either.
6. Review and merge the 4 open Dependabot PRs opportunistically (routine
   maintenance, no scope decision needed).
