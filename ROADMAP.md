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
  posts, leute, tags, archive, feiertage, and the top-level pages (kontakt/
  suche/datenschutzerklaerung) — see `MIGRATION.status.md` for the full
  breakdown. `npm run build` (2,371 pages), `npm run astro:check`, `npm run
  check` all pass clean on `main`.
* Visual identity done (#716 closed): shadcn/ui adopted as a Tailwind v4
  `@theme` + zero-JS Astro component foundation, old site's colors used as
  WCAG-checked inspiration (not an exact copy), Panton webfont wired in,
  Header/Footer/BlogList/BlogPost restyled. Content fidelity done (#715
  closed): all Hugo shortcode types converted, zero raw `{{<`/`{{%` left.
  Inventory gap done (#688 closed): feiertage/sitewide route questions
  resolved from their own Hugo front matter.
* Open GitHub issues: 7, across 2 milestones (see below) plus 6 unmilestoned
  cross-cutting issues. Visual/behavioral parity is now considered verified
  (#692 closed) — the manual route-group pass (#706) covered the real gaps;
  an automated screenshot-diff workflow (#705) was closed as not needed per
  owner decision (exact pixel parity with the old site isn't the goal).
* Label taxonomy (`type:*`, `status:*`, `prio:*`, `resolution:*`, `meta:*`) is set
  up and in active use — see `AGENTS.md` for the full table.
* Project health: `npm run astro:check` passes clean (0 errors, 0 warnings) on
  `main` as of 2026-07-18. 4 open Dependabot PRs pending review (#674
  pagefind, #677 nanoid, #681 postcss, #714 npm_and_yarn group) — routine
  dependency maintenance is automated, not tracked as issues. GitHub also
  reports 42 Dependabot security alerts (21 high, 17 moderate, 4 low) on
  `main` as of 2026-07-18 — not yet triaged into issues.

## Open issues by milestone

### Migration: cleanup

* #693 Clean up legacy migration leftovers after parity (parent/tracking)

### Migration: post-parity improvements

* #694 Track post-parity improvements (parent/tracking; not to be worked until
  parity is accepted)

### Unmilestoned / cross-cutting

* #695 Periodic main-branch intake during migration
* #717 Migrate historical Disqus comments into Giscus/GitHub Discussions
  (`prio:low` — export already backed up in `scratch/`, needs an import
  approach; attribution scheme and skip rules for spam/deleted comments
  already confirmed in the issue's comments)
* #720 Matomo tracking script throws "Assignment to constant variable" on
  Astro pages (`prio:low` — found while verifying #709's CSP against preview
  deploys; not a CSP issue, throws inside Matomo's own minified `matomo.js`
  loaded verbatim from the old Hugo site's `src/components/Analytics.astro`)
* #721 Replace Google Maps privacy-policy section with a non-Google map
  solution (`prio:low` — stale boilerplate text, no actual Maps embed exists
  in the Astro site; owner decision 2026-07-18 was to migrate to a Leaflet/
  OpenStreetMap embed rather than just delete the text)
* #722 Google reCAPTCHA: disclose in privacy policy or replace with a
  non-Google alternative (`prio:medium` — real gap: `ContactForm.astro` +
  `netlify/functions/contact.mjs` use reCAPTCHA v3 but
  `datenschutzerklaerung.md` has no mention of it at all)

## Recently closed migration issues

* #692 Verify visual and behavioral parity (parent/tracking) — closed
  2026-07-18, both sub-issues resolved (#706 done, #705 closed as not
  needed).
* #705 Screenshot-based parity workflow — closed 2026-07-18, not built per
  owner decision: exact pixel parity with the old site isn't the goal, the
  manual pass (#706) already covers the real gaps. Its scratch conversion
  scripts (`convert-figure.mjs`, `convert-gallery-quote.mjs`,
  `convert-youtube.mjs`) were confirmed already-applied (zero shortcodes
  remain in `src/content/posts/`) and deleted.
* #691 Migrate current content and route surface to Astro (parent/tracking)
  — closed 2026-07-18, all 9 content-parity sub-issues complete.
* #706 Parity checks across route groups — closed, recorded in
  `MIGRATION.status.md`.
* #708 Cleanup: remove unused static/admin CMS boilerplate — closed.
* #709 Fix or remove stale Netlify deployment config — closed, minimal
  `netlify.toml` with CSP landed.
* #718 Configure Astro dev server to run over HTTPS — closed.
* #716 Visual redesign — shadcn/ui adopted, old site's colors used as
  WCAG-checked inspiration (the shadcn theme preset from `TODO.md` explicitly
  rejected per user decision), Panton webfont wired in, Header/Footer/
  BlogList/BlogPost restyled. Surfaced and fixed a site-wide regression
  during in-browser testing: `@tailwindcss/typography`'s default palette
  assumes a light background, so every plain page needed the same
  `bg-card` treatment (`src/layouts/PageLayout.astro` extracted for this).
* #715 Content fidelity — all shortcode types (figure, gallery, quote,
  youtube, languagelink, ref, emojify, vimeo, soundcloud) converted, zero
  remaining `{{<`/`{{%` occurrences.
* #688 Inventory — feiertage/sitewide route questions resolved directly from
  their own Hugo `_build` front matter (feiertage is a real page; sitewide is
  data-only, e.g. the author-bio footer now wired into every post).
* #704 Widgets and embeds parity — Matomo, OpenSearch, PWA manifest, giscus,
  social sharing all done; schema.org JSON-LD investigated (nothing to
  migrate, the old "schema" module was front-matter validation not
  structured data); YouTube embeds folded into #715.
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

None currently open.

## Recommended next steps

1. #722 (reCAPTCHA privacy-policy disclosure) is `prio:medium` and
   independently actionable — either disclose reCAPTCHA usage or swap it for
   a non-Google alternative.
2. #717, #720, #721 are all low-priority with clarification already resolved
   in-issue — any can be picked up next.
3. Review and merge the 4 open Dependabot PRs opportunistically (routine
   maintenance, no scope decision needed).
4. The 42 Dependabot security alerts GitHub reports on `main` haven't been
   triaged — worth a `dnb-osv-scan`-style pass or at least a look at the
   Security tab to see whether any are exploitable in this static site's
   actual usage (vs. build-time-only tooling).
5. #693/#694/#695 remain parent/tracking or deferred issues without
   independent next actions of their own — no action needed until their
   sub-scope changes. Note: #693 (cleanup of legacy migration leftovers) is
   now unblocked since parity is accepted — worth a pass to check for
   remaining Hugo-specific scaffolding (e.g. stale `HUGO-COMPATIBILITY.md`
   references in `AGENTS.md`/`README.md`/`PROJECT.md`/`ROADMAP.md` even
   though the file itself was already deleted).
