# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth. GitHub Issues are authoritative.
Regenerate this file with the `dnb-project-task-triage` skill instead of
hand-editing it.

## Project state

* The Astro migration is complete. The site is now a static Astro project
  deployed on Netlify at [https://samui-samui.de](https://samui-samui.de).
* Open GitHub issues: 15 as of 2026-07-25 (was 14 on 2026-07-24).
* **New issue since last regen:** [#1657](https://github.com/davidsneighbour/samui-samui.de/issues/1657)
  (add a lazily loaded Koh Samui weather widget, Open-Meteo via a Netlify
  Function proxy/cache; `status:in-progress`) - see
  `documentation/features/weather-widget.md` for the architecture.
* **[#717](https://github.com/davidsneighbour/samui-samui.de/issues/717)
  removed from this roadmap -- confirmed complete and closed.** All 802
  Disqus discussion threads / 1,868 comments were imported into GitHub
  Discussions and verified live via giscus; the stale reference in the
  previous roadmap version has been reconciled.
* [#1656](https://github.com/davidsneighbour/samui-samui.de/issues/1656)
  (experimental `/timeline/` life-timeline map) was also closed since the
  last regen -- no roadmap change needed, it was never listed here.
* **Label taxonomy note:** most open issues (all except #1657) currently
  carry only a `type:*` label -- the `prio:*`/`status:*` labels the previous
  roadmap version quoted for #747, #927, #898, and #1229 are no longer
  present on those issues. This roadmap now reflects the issues' actual
  current labels rather than carrying the old ones forward; re-labelling is
  outside this skill's scope (see `dnb-github-label-classifier`).
* Local health checks on 2026-07-25: `npm run check` passes (Biome
  format/lint, markdownlint, `astro check` -- 0 errors/warnings/hints --,
  taxonomy validation, and 202 Vitest tests across 24 files, all green --
  up from 121 tests/16 files on 2026-07-24). `npm audit --omit=dev` reports
  0 vulnerabilities.
* Two open clarification questions remain unresolved: the replacement
  Dropbox address for [#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229),
  and scope decisions for [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745)
  and [#1655](https://github.com/davidsneighbour/samui-samui.de/issues/1655).

## Features in progress

* [#1657](https://github.com/davidsneighbour/samui-samui.de/issues/1657)
  Add lazily loaded Koh Samui weather widget (`type:enhancement`,
  `status:in-progress`, `prio:medium`) - editorial-style weather note
  between page content and footer; Open-Meteo proxied/cached through a
  Netlify Function so the browser never talks to Open-Meteo directly or
  leaks visitor location. Full design in
  `documentation/features/weather-widget.md`.

## Security and dependencies

* [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747) chore(deps):
  outdated markdown-it/linkify-it/js-yaml pins in markdownlint toolchain
  (`type:security`) - tracks four open GHSA advisories in the markdownlint
  tooling chain (devDependency only, not shipped to the deployed site).
* [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927) chore(deps):
  typescript 7.0.2 blocked by `@astrojs/check` peer dependency
  (`type:dependencies`) - interim bump to 6.0.3 already landed on `main`;
  PR #920 stays open and blocked until `@astrojs/check` supports
  TypeScript 7.

## Content and design

* [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
  Implement optional post cover media system (`type:enhancement`) -
  refactor to let posts define cover frontmatter for local images, YouTube,
  or Vimeo, with rendering and a migration path for historical posts.
* [#1652](https://github.com/davidsneighbour/samui-samui.de/issues/1652)
  Redesign archive year view: single-line header and per-year month
  coloring (`type:enhancement`) - collapse each year row to one line, add
  a calendar icon to the months dropdown, larger dots with a hover-reveal
  month name, remove inter-year divider lines, switch to a grid layout,
  and scale month-dot color per-year instead of against the full 21-year
  archive max. Builds on the closed `/archiv/` milestone (#903-#917, #928).
* [#1649](https://github.com/davidsneighbour/samui-samui.de/issues/1649)
  Add legal navigation to the footer (`type:enhancement`) - surface
  Impressum, Datenschutzerklärung, and Kommentarpolicy as a footer nav
  group via `src/data/navigation/footer.json`.
* [#1650](https://github.com/davidsneighbour/samui-samui.de/issues/1650)
  Move sound on/off toggle title into a tooltip (`type:enhancement`) -
  replace the native `title` attribute with the existing shadcn Tooltip
  primitive, opening above the icon on hover/focus.
* [#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229)
  Update contact Dropbox drop address (unlabeled) - blocked on the
  replacement URL; clarification comment posted.

## Analytics and tracking

* [#1653](https://github.com/davidsneighbour/samui-samui.de/issues/1653)
  Add Matomo tracking documentation links (`type:documentation`) - link
  the three official Matomo tracking-API docs near `Analytics.astro` so
  future tracking work has a reference.
* [#1654](https://github.com/davidsneighbour/samui-samui.de/issues/1654)
  Add Matomo internal search tracking (`type:enhancement`) - wire
  `trackSiteSearch` into `/suche/`, respecting the existing
  Footer-loaded/best-effort analytics strategy; may need a privacy-wording
  update.

## Data and content migration

* [#1234](https://github.com/davidsneighbour/samui-samui.de/issues/1234)
  Research legacy Textpattern link and footnote tags (`type:data`) -
  review posts with `publisher.textpattern: true` for unresolvable
  `<txp:gho_permalink>`/`<txp:permlink>` tags (manual source research) and
  `<txp:footnote>` tags (possibly migratable to Markdown footnotes).

## Editorial tooling

* [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745)
  Auto-replace HTML entity umlauts (`&uuml;` etc.) with proper characters
  on save/commit (`type:enhancement`) - needs a scope decision before
  implementation.

## Maintenance and DX

* [#1648](https://github.com/davidsneighbour/samui-samui.de/issues/1648)
  Ignore root UPPERCASE markdown files in local dev watcher
  (`type:enhancement`) - extend the existing Vite
  `watch.ignored: ['**/scratch/**']` pattern (from closed #1351) to cover
  `README.md`/`TODO.md`/`ROADMAP.md`/etc. so routine project-file edits
  stop triggering dev-server reloads.
* [#1651](https://github.com/davidsneighbour/samui-samui.de/issues/1651)
  Document `.text-box-balanced` CSS class and translate hack
  (`type:documentation`) - explain the Firefox-specific vertical-balance
  workaround in `theme.css` before someone "cleans it up" and reintroduces
  the bug it fixes.
* [#1655](https://github.com/davidsneighbour/samui-samui.de/issues/1655)
  Evaluate tweakCN for theme fine-tuning (`type:chore`) - spike on whether
  the tweakcn.com visual token editor is worth adopting for this project's
  shadcn/Tailwind theme; decide adopt/visualize-only/reject.

## Open clarification questions

* [#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229) -
  what is the replacement Dropbox drop address?
* [#1655](https://github.com/davidsneighbour/samui-samui.de/issues/1655) -
  is the tweakCN goal pure theme visualization, or active token
  editing/generation?
* [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) - decide
  whether this should be an editor-level transform, a pre-commit/content hook, or
  a one-time cleanup plus future guard; also decide whether an archive-wide bulk
  replacement is in scope.
* [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927) - decide
  whether to keep waiting for `@astrojs/check` to support TypeScript 7, or
  close PR #920 outright now that the safe interim bump (6.0.3) has landed.

## Project health indicators

* `npm run check` (format:check + lint + validate + test): **passing** --
  Biome format/lint clean, markdownlint clean (63 files), `astro check` 0
  errors/0 warnings/0 hints (165 files), taxonomy references valid, 202
  Vitest tests passing across 24 files.
* `npm audit --omit=dev`: **0 vulnerabilities**.
* `npm outdated`: `typescript` (6.0.3 installed, 7.0.2 latest -- held back
  intentionally, see #927) and `@playwright/test` (1.61.1 installed, 1.62.0
  latest -- minor, unblocked).
* Dependabot security alerts: tracked by #747 (markdownlint toolchain
  advisories, devDependency-only, not shipped to the deployed site).
* Full `npm run build` not re-run this session; last confirmed clean
  2026-07-20 (2374 pages, sitemap + Pagefind index).

## Recommended next steps

1. Continue [#1657](https://github.com/davidsneighbour/samui-samui.de/issues/1657)
   (weather widget, already in progress).
2. Handle [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747)
   as the remaining open security-tagged item (markdownlint toolchain
   advisories).
3. Supply the replacement address for
   [#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229) so
   the Dropbox link can be updated.
4. Continue [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
   opportunistically -- cover-rendering fixes have been landing piecemeal.
5. Pick up the small, self-contained new issues opportunistically:
   [#1648](https://github.com/davidsneighbour/samui-samui.de/issues/1648)
   (dev-watcher ignore), [#1651](https://github.com/davidsneighbour/samui-samui.de/issues/1651)
   (`.text-box-balanced` docs), and
   [#1653](https://github.com/davidsneighbour/samui-samui.de/issues/1653)
   (Matomo doc links) are all low-risk, low-effort.
6. Decide the scope for
   [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) before
   implementation, because the right fix depends on whether this should happen in
   the editor, pre-commit flow, or a content-cleanup script.
