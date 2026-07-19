# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth. GitHub Issues are authoritative.
Regenerate this file with the `dnb-project-task-triage` skill instead of
hand-editing it.

## Project state

* The Astro migration is complete. The site is now a static Astro project
  deployed on Netlify at [https://samui-samui.de](https://samui-samui.de).
* Open GitHub issues: 7 as of 2026-07-19 (down from 13 at the start of today).
* The `/archiv/` and `/tags/` feature milestone (issues #903-#917) is nearly
  done: #903-#914 are all closed (see prior session notes). Only
  [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915) (SEO
  pass), [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916)
  (a11y review), and [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917)
  (close-out) remain, all unblocked on their dependencies.
* **Dependency PR triage (this session):** 8 open Dependabot PRs were
  reviewed. 7 merged after local verification (build + `astro:check` +
  `npm test` against each, not just the repo's CodeQL/WIP checks, which don't
  actually run the build):
  * #918 sharp 0.34.5 -> 0.35.3, #919 wireit 0.14.12 -> 0.14.13, #921 cspell
    9.3.2 -> 10.0.1, #922 @astrojs/react 5.0.7 -> 6.0.1 (major; no `.tsx`/React
    usage in `src` today, so low risk), #923/#924 tailwindcss +
    `@tailwindcss/vite` 4.1.17 -> 4.3.2, #925 `@pagefind/default-ui` 1.4.0 ->
    1.5.2.
  * The `src/packages/*.jsonc` dependency-version fragments (which
    `compile:package` regenerates root `package.json` from) were synced
    afterward via `npm run compile:package:update` so the next regeneration
    doesn't silently revert these bumps.
  * **#920 (typescript 5.9.3 -> 7.0.2) was NOT merged** — `npm ci` fails
    outright because `@astrojs/check@0.9.9` (drives `astro:check`) only
    supports `typescript@^5.0.0 || ^6.0.0`. Commented on the PR and filed
    [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927) to
    track the follow-up.
  * [#750](https://github.com/davidsneighbour/samui-samui.de/issues/750)
    (brace-expansion DoS) closed as a side effect of the wireit merge —
    confirmed via `npm ls brace-expansion` (now 5.0.7) and GitHub's
    Dependabot alerts API (advisory no longer listed as open).
* No unprocessed scratchpad notes remain in `TODO.md`.
* Local health checks on 2026-07-19 (after all merges above):
  * `npm run check` passes: Biome format/lint and markdownlint report no errors.
  * `npm run astro:check` passes with 0 errors, 0 warnings, 57 existing
    `ts(6385)` Zod deprecation hints.
  * `npm test` passes (4 tests).
  * `npm run build` completes cleanly (2375 pages, sitemap + Pagefind index).
  * One open Dependabot security alert remains: markdown-it (moderate),
    tracked by #747.
* **Garuda footer (this session):** [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926)
  closed. The old `garuda.png` had its background baked in for the *old*
  footer's flat grey, with alpha only on the empty top half. Derived a
  properly alpha-masked artwork from the 4x-upscaled source (color-keyed the
  flat background out with ImageMagick), plus a tone-inverted light-mode
  variant (the line art is light-on-dark by design and unreadable on cream
  without inverting). Both composited-checked against the exact
  `--background` hex per theme before wiring in. `Footer.astro` now renders
  both, toggled via the existing `dark:` variant.

## Security and dependencies

* [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747) chore(deps):
  outdated markdown-it/linkify-it/js-yaml pins in markdownlint toolchain
  (`prio:high`, `status:confirmed`) - highest-priority open item. Tracks four
  GHSA advisories in the markdownlint tooling chain (devDependency only, not
  shipped to the deployed site).
* [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927) chore(deps):
  typescript 7.0.2 blocked by `@astrojs/check` peer dependency (`prio:medium`,
  new) - PR #920 breaks `npm ci`; either wait for `@astrojs/check` to support
  TS 7, or bump to the still-compatible `6.0.3` instead.

## Archive & tags feature milestone (#903-#917)

* [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915) SEO pass:
  robots.txt, sitemap filtering, canonical strategy (`prio:medium`,
  `status:confirmed`) - unblocked (#903 and #910 both resolved); needs
  `public/robots.txt` and a sitemap `filter` in `astro.config.ts`.
* [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916)
  Accessibility & responsive review of archive feature (`prio:high`,
  `status:confirmed`) - unblocked (#906, #907, #908, #909, #911 all closed);
  broad a11y pass across `/archiv/`, year pages, `/tags/`.
* [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917) Final
  visual review, screenshots, and milestone close-out (`prio:low`,
  `status:confirmed`) - depends on every other issue in this milestone
  (only #915 and #916 remain); closes the milestone once done.

## Content and design

* [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
  Implement optional post cover media system (`prio:medium`,
  `status:in-progress`) - refactor to let posts define cover frontmatter for
  local images, YouTube, or Vimeo, with rendering and a migration path for
  historical posts.

## Comments and community

* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) Migrate
  historical Disqus comments into Giscus/GitHub Discussions (`prio:low`,
  `status:blocked`) - data migration remains blocked until the import approach,
  attribution handling, and Giscus production setup are ready.

## Editorial tooling

* [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745)
  Auto-replace HTML entity umlauts (`&uuml;` etc.) with proper characters on
  save/commit (`prio:low`, `status:unconfirmed`, `meta:question`) - needs a
  scope decision before implementation.

## Open clarification questions

* [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) - decide
  whether this should be an editor-level transform, a pre-commit/content hook, or
  a one-time cleanup plus future guard; also decide whether an archive-wide bulk
  replacement is in scope.
* [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927) - decide
  whether to wait for `@astrojs/check` to support TypeScript 7, or bump to
  `6.0.3` as an interim step.
* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) - decide
  migration scope (all comments vs. curated subset) and attribution approach
  for re-posted historical comments.

## Recommended next steps

1. Handle [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747)
   as the only remaining high-priority security issue.
2. Finish the archive milestone: [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915)
   and [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916)
   are both unblocked now, then close out with
   [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917).
3. Decide the TypeScript path for
   [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927) (wait
   for upstream support vs. bump to 6.0.3).
4. Continue [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
   (already in progress).
5. Decide the scope for
   [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) before
   implementation, because the right fix depends on whether this should happen in
   the editor, pre-commit flow, or a content-cleanup script.
6. Resume [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717)
   once the comment platform setup and migration/import plan are unblocked.
