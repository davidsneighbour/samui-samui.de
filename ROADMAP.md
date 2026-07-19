# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth. GitHub Issues are authoritative.
Regenerate this file with the `dnb-project-task-triage` skill instead of
hand-editing it.

## Project state

* The Astro migration is complete. The site is now a static Astro project
  deployed on Netlify at [https://samui-samui.de](https://samui-samui.de).
* Open GitHub issues: 9 as of 2026-07-19 (down from 13).
* The `/archiv/` and `/tags/` feature milestone (issues #903-#917) is nearly
  done: #903-#914 are all closed. The four issues that were unblocked
  (#910, #911, #913, #914) shipped in this session:
  * [#914](https://github.com/davidsneighbour/samui-samui.de/issues/914) -
    `/tags/` added to header nav, deep-pagination prompt toward `/archiv/`.
  * [#913](https://github.com/davidsneighbour/samui-samui.de/issues/913) -
    Pagefind year/tag facets on `/suche/`.
  * [#910](https://github.com/davidsneighbour/samui-samui.de/issues/910) -
    decided against separate `/archiv/[year]/[month]/` routes; documented in
    `documentation/archiv.md` (year-page month anchors are the retained
    implementation).
  * [#911](https://github.com/davidsneighbour/samui-samui.de/issues/911) -
    new `Breadcrumbs.astro` component + `BreadcrumbList` JSON-LD, wired into
    `/archiv/`, `/archiv/[year]/`, and `/tags/[slug]/`.
  * Only [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915)
    (SEO pass), [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916)
    (a11y review), and [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917)
    (close-out) remain, all now unblocked on their dependencies.
* No unprocessed scratchpad notes remain in `TODO.md`.
* Local health checks on 2026-07-19:
  * `npm run check` passes: Biome format/lint and markdownlint report no errors.
  * `npm run astro:check` passes with 0 errors, 0 warnings, and 58 existing
    `ts(6385)` Zod deprecation hints in `src/content.config.ts`.

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
* [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926) Recreate
  Garuda Footer (`prio:medium`, `status:confirmed`) - the old design's footer
  Garuda graphic disappeared in the redesign; needs either art rework of
  `public/assets/images/garuda.png` or a layout change so it can hold up the
  last section or the whole page. Note: an untracked
  `public/assets/images/garuda-upscaled.png` is still present in the working
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
* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) - decide
  migration scope (all comments vs. curated subset) and attribution approach
  for re-posted historical comments.

## Recommended next steps

1. Handle [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747)
   first because it is the only high-priority open security issue.
2. Then handle [#750](https://github.com/davidsneighbour/samui-samui.de/issues/750)
   as the remaining medium-priority security/dependency issue.
3. Finish the archive milestone: [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915)
   and [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916)
   are both unblocked now, then close out with
   [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917).
4. Continue [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
   (already in progress) and decide the visual approach for
   [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926) given
   the in-progress upscaled asset already in the working tree.
5. Decide the scope for
   [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) before
   implementation, because the right fix depends on whether this should happen in
   the editor, pre-commit flow, or a content-cleanup script.
6. Resume [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717)
   once the comment platform setup and migration/import plan are unblocked.
