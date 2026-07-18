# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth — GitHub Issues are authoritative.
Regenerate via the `dnb-project-task-triage` skill rather than hand-editing.

## Project state

* **The Astro migration project is complete and closed out** (2026-07-18). Current
  stack: Astro (`output: 'static'`), deployed to Netlify at
  [https://samui-samui.de](https://samui-samui.de). Hugo has been removed entirely
  — see `AGENTS.md` for the current architecture.
* A follow-up burst of UI/polish work (theme toggle, tag badges, pagination
  redesign, title/meta component extraction, lucide icons, footer/copyright,
  formatting fixes) landed in 15 commits that closed issues #733–#743. These
  were closed manually during this run (repository state confirmed the work
  was done before the commits were confirmed pushed); the branch has since
  been pushed to `origin/main`, so GitHub's own closing-keyword automation is
  now in sync.
* Open GitHub issues: 6 (5 pre-existing post-migration follow-ups + 1 new item
  converted from a `TODO.md` scratch note this run).
* Label taxonomy (`type:*`, `status:*`, `prio:*`, `resolution:*`, `meta:*`) is set
  up and in active use — see `AGENTS.md` for the full table.
* Project health: `npm run astro:check` passes clean (0 errors, 0 warnings, 42
  hints — all `ts(6385)` deprecated-`z`-import hints in `src/content.config.ts`,
  cosmetic, from the Zod version bundled with Astro) as of 2026-07-18. 4 open
  Dependabot PRs pending review (#674 pagefind, #677 nanoid, #681 postcss, #714
  npm_and_yarn group) — routine dependency maintenance is automated, not tracked
  as issues. GitHub reports 42 open Dependabot security alerts (21 high, 17
  medium, 4 low, 0 critical) on `main` as of 2026-07-18 — not yet triaged into
  issues.
* An uncommitted change to `netlify/functions/contact.mjs` exists in the working
  tree outside this run's scope (project tracking files only) — left untouched.

## Open issues

* [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723) Production
  setup: contact form secrets + giscus GitHub App install (`prio:medium` —
  operational only, not a code gap: Netlify env vars for Resend/reCAPTCHA
  confirmed unset via `netlify env:list`; giscus GitHub App install needs the
  repo owner's own GitHub authorization)
* [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722) Google
  reCAPTCHA: disclose in privacy policy or replace with a non-Google alternative
  (`prio:medium` — real gap: `ContactForm.astro` + `netlify/functions/contact.mjs`
  use reCAPTCHA v3 but `datenschutzerklaerung.md` has no mention of it at all)
* [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721) Replace
  Google Maps privacy-policy section with a non-Google map solution (`prio:low` —
  stale boilerplate text, no actual Maps embed exists in the Astro site; owner
  decision 2026-07-18 was to migrate to a Leaflet/OpenStreetMap embed rather than
  just delete the text)
* [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720) Matomo
  tracking script throws "Assignment to constant variable" on Astro pages
  (`prio:low` — not a CSP issue, throws inside Matomo's own minified `matomo.js`
  loaded verbatim from the old Hugo site's `src/components/Analytics.astro`)
* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) Migrate
  historical Disqus comments into Giscus/GitHub Discussions (`prio:low` — export
  already backed up in `scratch/`, needs an import approach; attribution scheme
  and skip rules for spam/deleted comments already confirmed in the issue's
  comments)
* [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) Auto-replace
  HTML entity umlauts (`&uuml;` etc.) with proper characters on save/commit
  (`prio:low` — new this run, converted from a `TODO.md` note; open clarification
  questions on pre-commit hook vs. editor-level fix, and whether a bulk-fix pass
  over existing content is in scope)

## Open clarification questions

* [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) — pre-commit
  hook vs. VS Code editor-level transform, and whether a bulk-fix pass over
  existing content is in scope.

## Recommended next steps

1. [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722) and
   [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723) are both
   `prio:medium` and independently actionable — #723 in particular blocks the
   contact form from sending real mail and comments from rendering in production.
2. [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717),
   [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720),
   [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721), and
   [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) are all
   low-priority; #745 needs its clarification questions answered before
   implementation, the rest have clarification already resolved in-issue.
3. Review and merge the 4 open Dependabot PRs opportunistically (routine
   maintenance, no scope decision needed).
4. The 42 Dependabot security alerts GitHub reports on `main` haven't been
   triaged — worth a `dnb-osv-scan`-style pass or at least a look at the Security
   tab to see whether any are exploitable in this static site's actual usage (vs.
   build-time-only tooling).
