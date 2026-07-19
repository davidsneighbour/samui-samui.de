# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth. GitHub Issues are authoritative.
Regenerate this file with the `dnb-project-task-triage` skill instead of
hand-editing it.

## Project state

* The Astro migration is complete. The site is now a static Astro project
  deployed on Netlify at [https://samui-samui.de](https://samui-samui.de).
* Open GitHub issues: 5 as of 2026-07-19. The previous roadmap entries for
  [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720),
  [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721),
  [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722), and
  [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723) are now
  closed and have been removed from the open-work index.
* One TODO scratchpad note was converted into
  [#887](https://github.com/davidsneighbour/samui-samui.de/issues/887), leaving no
  unprocessed notes in `TODO.md`.
* Local health checks on 2026-07-19:
  * `npm run check` passes: Biome format/lint and markdownlint report no errors.
  * `npm run astro:check` passes with 0 errors, 0 warnings, and 42 existing
    `ts(6385)` Zod deprecation hints in `src/content.config.ts`.

## Security and dependencies

* [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747) chore(deps):
  outdated markdown-it/linkify-it/js-yaml pins in markdownlint toolchain
  (`prio:high`, `status:confirmed`) - highest-priority open item. This tracks
  four GHSA advisories in the markdownlint tooling chain.
* [#750](https://github.com/davidsneighbour/samui-samui.de/issues/750) chore(deps):
  brace-expansion DoS via wireit's pinned range (`prio:medium`,
  `status:confirmed`) - dependency-security follow-up for Wireit's transitive
  range.

## Comments and community

* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) Migrate
  historical Disqus comments into Giscus/GitHub Discussions (`prio:low`,
  `status:blocked`) - data migration remains blocked until the import approach,
  attribution handling, and Giscus production setup are ready.
* [#887](https://github.com/davidsneighbour/samui-samui.de/issues/887) Adapt
  Giscus comment theme to SamuiSamui design tokens (`prio:low`,
  `status:confirmed`) - new issue converted from `TODO.md`; keep `DESIGN.md` and
  README setup notes in sync if theme hosting or configuration changes.

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

## Recommended next steps

1. Handle [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747)
   first because it is the only high-priority open security issue.
2. Then handle [#750](https://github.com/davidsneighbour/samui-samui.de/issues/750)
   as the remaining medium-priority security/dependency issue.
3. Decide the scope for
   [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) before
   implementation, because the right fix depends on whether this should happen in
   the editor, pre-commit flow, or a content-cleanup script.
4. Work on [#887](https://github.com/davidsneighbour/samui-samui.de/issues/887)
   after Giscus production setup is stable enough to verify the theme locally and
   in production.
5. Resume [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717)
   once the comment platform setup and migration/import plan are unblocked.
