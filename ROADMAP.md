# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth — GitHub Issues are authoritative.
Regenerate via the `dnb-project-task-triage` skill rather than hand-editing.

**The Astro migration is governed by `MIGRATION.md`, with route/system progress
tracked in `MIGRATION.status.md`.**

## Project state

* Current stack: Hugo v0.140.2 (extended), pinned — see `HUGO-COMPATIBILITY.md`.
* Migration target: Astro static site — **now actively bootstrapped**, worked on
  directly on `main` (no separate migration branch, by explicit decision — see
  `PROJECT.md`).
* A prior Astro rewrite (21 commits, all 2,049 posts already migrated) was
  recovered after an earlier accidental force-push and is backed up at
  `origin/recovered-astro-main`. **Adopted** as the Astro Foundation base
  (#689 closed, decision in `PROJECT.md`) — its foundation builds cleanly but
  has no page routes for any collection yet; that work is scoped into #690.
* Open GitHub issues: 20, across 6 milestones (see below) plus 1 unmilestoned
  cross-cutting issue.
* Label taxonomy (`type:*`, `status:*`, `prio:*`, `resolution:*`, `meta:*`) is set
  up and in active use — see `AGENTS.md` for the full table.

## Open issues by milestone

### Migration: inventory

* #688 Inventory current site for Astro migration (parent/tracking)

### Migration: astro foundation

* #690 Build Astro static-site foundation (parent/tracking)
* #707 Validation and quality gates for the Astro project

### Migration: content parity

* #691 Migrate current content and route surface to Astro (parent/tracking)
* #696 Top-level static pages parity (home, kontakt, datenschutzerklaerung, suche)
* #697 Content collection parity: posts (2,049 posts)
* #698 Content collection parity: leute (people)
* #699 Content collection parity: tags (taxonomy)
* #700 Archive route parity (year-based archive pages)
* #701 Shared assets and system files parity
* #702 Forms parity: contact form
* #703 Redirects and deprecated paths parity
* #704 Widgets and embeds parity

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

## Recently closed migration issues

* #689 Review recovered-astro-main branch and decide adoption — **adopted**, see
  `PROJECT.md` decision log and the issue's closing comment for the full review.

## Open clarification questions

* Whether `content/feiertage/` and `content/sitewide/` need dedicated route-parity
  issues — see "Open Inventory Questions" in `MIGRATION.status.md`.
* Whether any real historical redirects exist beyond the current boilerplate
  `public/_redirects` output.

## Recommended next steps

1. #690 (Astro Foundation): bring `origin/recovered-astro-main` into `main`, then
   build the missing page-route layer (individual post/leute/tag pages, archive,
   kontakt/suche/datenschutzerklaerung) — the recovered branch's content is ready
   but has no routes to render it yet.
2. #688 (inventory) can proceed in parallel.
3. Work through remaining Content Parity issues (#696, #700-#704) once routes
   exist for the collections that need them.
4. Address Cleanup issues (#708, #709) opportunistically — they don't block
   migration progress but are independent, low-risk fixes.
