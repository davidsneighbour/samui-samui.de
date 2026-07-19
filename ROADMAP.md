# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth. GitHub Issues are authoritative.
Regenerate this file with the `dnb-project-task-triage` skill instead of
hand-editing it.

## Project state

* The Astro migration is complete. The site is now a static Astro project
  deployed on Netlify at [https://samui-samui.de](https://samui-samui.de).
* Open GitHub issues: 13 as of 2026-07-19.
* The `/archiv/` and `/tags/` feature milestone (issues #903-#917) is most of
  the way done: #903-#909 and #912 are closed (docs, Vitest setup, month-name
  utility, accordion primitive, DESIGN.md color scale, `/archiv/` main page,
  `/archiv/[year]/`, and `/tags/` are all shipped). Four implementation issues
  (#910, #911, #913, #914) are now unblocked and ready to pick up, with two
  review/pass issues (#915, #916) and one close-out issue (#917) still gated
  on those.
* [#887](https://github.com/davidsneighbour/samui-samui.de/issues/887)
  (Giscus theme tokens) is closed; its previous roadmap entry is removed.
* No unprocessed scratchpad notes remain in `TODO.md`.
* Local health checks on 2026-07-19:
  * `npm run check` passes: Biome format/lint and markdownlint report no errors.
  * `npm run astro:check` passes with 0 errors, 0 warnings, and 57 existing
    `ts(6385)` Zod deprecation hints in `src/content.config.ts` (up from 42
    previously, tracking pace with the archive feature's growing content
    schema - not itself a tracked issue).

## Security and dependencies

* [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747) chore(deps):
  outdated markdown-it/linkify-it/js-yaml pins in markdownlint toolchain
  (`prio:high`, `status:confirmed`) - highest-priority open item. Tracks four
  GHSA advisories in the markdownlint tooling chain (devDependency only, not
  shipped to the deployed site).
* [#750](https://github.com/davidsneighbour/samui-samui.de/issues/750) chore(deps):
  brace-expansion DoS via wireit's pinned range (`prio:medium`,
  `status:confirmed`) - dependency-security follow-up for Wireit's transitive
  range; likely an `accepted` risk if no upstream fix path exists.

## Archive & tags feature milestone (#903-#917)

* [#910](https://github.com/davidsneighbour/samui-samui.de/issues/910) Decide &
  implement month-level archive routes `/archiv/[year]/[month]/` (`prio:medium`,
  `status:unconfirmed`) - unblocked (#909 closed); needs a build-vs-skip
  decision recorded in `documentation/archiv.md` before implementation.
* [#911](https://github.com/davidsneighbour/samui-samui.de/issues/911) Add
  breadcrumb component + `BreadcrumbList` JSON-LD (`prio:medium`,
  `status:confirmed`) - unblocked; first breadcrumb implementation site-wide,
  wired into archive/tag detail pages.
* [#913](https://github.com/davidsneighbour/samui-samui.de/issues/913) Add
  Pagefind facets (year/tag filters) to `/suche/` (`prio:low`,
  `status:confirmed`) - independently shippable; adds `data-pagefind-filter`
  attributes and `PagefindUI` filter config.
* [#914](https://github.com/davidsneighbour/samui-samui.de/issues/914)
  Cross-link blog listing, archive, and tags in navigation (`prio:medium`,
  `status:confirmed`) - unblocked (#912 closed); adds `/tags/` to `Header.astro`
  nav and a deep-pagination prompt toward `/archiv/`.
* [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915) SEO pass:
  robots.txt, sitemap filtering, canonical strategy (`prio:medium`,
  `status:confirmed`) - depends on #903 (closed) and on #910's decision.
* [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916)
  Accessibility & responsive review of archive feature (`prio:high`,
  `status:confirmed`) - depends on #906, #907, #908, #909 (all closed) and
  #911 (open); broad a11y pass across `/archiv/`, year/month pages, `/tags/`.
* [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917) Final
  visual review, screenshots, and milestone close-out (`prio:low`,
  `status:confirmed`) - depends on every other issue in this milestone;
  closes the milestone once done.

## Content and design

* [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
  Implement optional post cover media system (`prio:medium`,
  `status:in-progress`) - refactor to let posts define cover frontmatter for
  local images, YouTube, or Vimeo, with rendering and a migration path for
  historical posts.
* [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926) Recreate
  Garuda Footer (`prio:medium`, `status:confirmed`) - the old design's footer
  Garuda graphic disappeared in the redesign; needs either art rework of
  `public/assets/images/garuda.png` or a layout change so it can hold up the
  last section or the whole page. Note: an untracked
  `public/assets/images/garuda-upscaled.png` is already present in the working
  tree, suggesting in-progress asset work toward this issue.

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
* [#910](https://github.com/davidsneighbour/samui-samui.de/issues/910) - decide
  whether to build real `/archiv/[year]/[month]/` routes or keep month anchors
  on the year page as the sole implementation.
* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) - decide
  migration scope (all comments vs. curated subset) and attribution approach
  for re-posted historical comments.

## Recommended next steps

1. Handle [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747)
   first because it is the only high-priority open security issue.
2. Then handle [#750](https://github.com/davidsneighbour/samui-samui.de/issues/750)
   as the remaining medium-priority security/dependency issue.
3. Pick up the now-unblocked archive milestone work:
   [#910](https://github.com/davidsneighbour/samui-samui.de/issues/910),
   [#911](https://github.com/davidsneighbour/samui-samui.de/issues/911),
   [#913](https://github.com/davidsneighbour/samui-samui.de/issues/913), and
   [#914](https://github.com/davidsneighbour/samui-samui.de/issues/914) - these
   have no remaining open dependencies.
4. Follow with [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915)
   (needs #910's decision) and
   [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916) (needs
   #911), then close out the milestone with
   [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917).
5. Continue [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
   (already in progress) and decide the visual approach for
   [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926) given
   the in-progress upscaled asset already in the working tree.
6. Decide the scope for
   [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) before
   implementation, because the right fix depends on whether this should happen in
   the editor, pre-commit flow, or a content-cleanup script.
7. Resume [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717)
   once the comment platform setup and migration/import plan are unblocked.
