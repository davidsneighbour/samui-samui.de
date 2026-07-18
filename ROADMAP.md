# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth — GitHub Issues are authoritative.
Regenerate via the `dnb-project-task-triage` skill rather than hand-editing.

## Project state

* **The Astro migration project is complete and closed out** (2026-07-18). Current
  stack: Astro (`output: 'static'`), deployed to Netlify at
  [https://samui-samui.de](https://samui-samui.de). Hugo has been removed entirely
  — see `AGENTS.md` for the current architecture. `npm run build` (2,371 pages),
  `npm run astro:check` (0 errors, 0 warnings), and `npm run check` all pass clean
  on `main`.
* All migration tracking scaffolding has been retired: `MIGRATION.md`,
  `MIGRATION.status.md`, and `PROJECT.md` deleted (their content is fully resolved
  or preserved in closed-issue comments); all 6 GitHub milestones closed. This
  project no longer uses milestones — open issues below are plain, unmilestoned
  follow-up work.
* Open GitHub issues: 5, all standalone post-migration follow-ups (no
  parent/tracking issues remain).
* Label taxonomy (`type:*`, `status:*`, `prio:*`, `resolution:*`, `meta:*`) is set
  up and in active use — see `AGENTS.md` for the full table.
* Project health: `npm run astro:check` passes clean (0 errors, 0 warnings) on
  `main` as of 2026-07-18. 4 open Dependabot PRs pending review (#674 pagefind,
  #677 nanoid, #681 postcss, #714 npm_and_yarn group) — routine dependency
  maintenance is automated, not tracked as issues. GitHub reports 42 open
  Dependabot security alerts (21 high, 17 medium, 4 low) on `main` as of
  2026-07-18 — not yet triaged into issues.

## Open issues

* [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722) Google
  reCAPTCHA: disclose in privacy policy or replace with a non-Google alternative
  (`prio:medium` — real gap: `ContactForm.astro` + `netlify/functions/contact.mjs`
  use reCAPTCHA v3 but `datenschutzerklaerung.md` has no mention of it at all)
* [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723) Production
  setup: contact form secrets + giscus GitHub App install (`prio:medium` —
  operational only, not a code gap: Netlify env vars for Resend/reCAPTCHA
  confirmed unset via `netlify env:list`; giscus GitHub App install needs the
  repo owner's own GitHub authorization)
* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) Migrate
  historical Disqus comments into Giscus/GitHub Discussions (`prio:low` — export
  already backed up in `scratch/`, needs an import approach; attribution scheme
  and skip rules for spam/deleted comments already confirmed in the issue's
  comments)
* [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720) Matomo
  tracking script throws "Assignment to constant variable" on Astro pages
  (`prio:low` — not a CSP issue, throws inside Matomo's own minified `matomo.js`
  loaded verbatim from the old Hugo site's `src/components/Analytics.astro`)
* [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721) Replace
  Google Maps privacy-policy section with a non-Google map solution (`prio:low` —
  stale boilerplate text, no actual Maps embed exists in the Astro site; owner
  decision 2026-07-18 was to migrate to a Leaflet/OpenStreetMap embed rather than
  just delete the text)

## Open clarification questions

None currently open.

## Recommended next steps

1. [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722) and
   [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723) are both
   `prio:medium` and independently actionable — #723 in particular blocks the
   contact form from sending real mail and comments from rendering in production.
2. [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717),
   [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720), and
   [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721) are all
   low-priority with clarification already resolved in-issue — any can be picked
   up next.
3. Review and merge the 4 open Dependabot PRs opportunistically (routine
   maintenance, no scope decision needed).
4. The 42 Dependabot security alerts GitHub reports on `main` haven't been
   triaged — worth a `dnb-osv-scan`-style pass or at least a look at the Security
   tab to see whether any are exploitable in this static site's actual usage (vs.
   build-time-only tooling).
