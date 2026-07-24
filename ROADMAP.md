# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth. GitHub Issues are authoritative.
Regenerate this file with the `dnb-project-task-triage` skill instead of
hand-editing it.

## Project state

* The Astro migration is complete. The site is now a static Astro project
  deployed on Netlify at [https://samui-samui.de](https://samui-samui.de).
* Open GitHub issues: 14 as of 2026-07-24 (up from 5 on 2026-07-20).
* **Map onboarding closed out this session.** [#1227](https://github.com/davidsneighbour/samui-samui.de/issues/1227)
  (onboard MapLibre/OpenFreeMap) and [#1228](https://github.com/davidsneighbour/samui-samui.de/issues/1228)
  (adapt contact map to a visible mapcn-style section) were both verified
  fully implemented and closed: `src/components/ui/map.tsx` (mapcn
  primitives), `src/config/maps.ts` (centralized OpenFreeMap config),
  `src/data/map-points.json`/`.ts` (JSON point registry), `ContactMap.tsx`
  rendering the DNB HQ marker visibly on `/kontakt/` via `client:visible`,
  CSP allowing `tiles.openfreemap.org`, privacy wording in
  `kleingedrucktes/datenschutzerklaerung.mdx`, and architecture notes in
  AGENTS.md § Interactive maps.
* **Quality-gate and schema cleanup closed out this session.**
  [#1231](https://github.com/davidsneighbour/samui-samui.de/issues/1231)
  (npm script taxonomy) and
  [#1232](https://github.com/davidsneighbour/samui-samui.de/issues/1232)
  (Astro content schema deprecation warnings) were verified already done:
  `check` is the documented non-mutating umbrella
  (`format:check && lint && validate && test`,
  `documentation/quality-gates.md`), and `src/content.config.ts` imports
  `z` from `astro/zod` with `.loose()` replacing the deprecated
  `.passthrough()` call -- `npm run validate:content` now reports 0
  errors/warnings/hints (down from the 57 `ts(6385)` hints noted last
  session).
* **Turnstile disclaimer styling closed out this session.**
  [#1230](https://github.com/davidsneighbour/samui-samui.de/issues/1230) --
  `ContactForm.astro`'s `.turnstile-disclaimer a` already uses
  `var(--color-link)`, matching the site's link token.
* **[#927](https://github.com/davidsneighbour/samui-samui.de/issues/927)
  updated, left open.** `main` is now on TypeScript `6.0.3` (the interim
  bump this issue proposed), and `npm ci`/`astro check` succeed cleanly.
  Dependabot has rebased PR #920 to "bump typescript from 6.0.3 to 7.0.2";
  it stays blocked by `@astrojs/check@0.9.9`'s `^5.0.0 || ^6.0.0` peer
  dependency until upstream ships TS 7 support.
* **Eight new issues filed from TODO.md notes this session**
  ([#1648](https://github.com/davidsneighbour/samui-samui.de/issues/1648)-[#1655](https://github.com/davidsneighbour/samui-samui.de/issues/1655),
  see Content and design / Analytics and tracking / Maintenance sections
  below). `TODO.md` is now empty of processed notes.
* **[#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229)**
  (Dropbox drop address) needs the replacement URL from the site owner before
  it's actionable -- clarification comment added.
* An "Analytics is loaded last from `Footer.astro`, tracking-loss-on-navigation
  is an accepted tradeoff" note from `TODO.md` was written directly into
  AGENTS.md § Analytics (assistant-instruction item, not GitHub-issue
  material, per the "add instructions immediately" marker in `TODO.md`).
* Local health checks on 2026-07-24: `npm run check` passes (Biome
  format/lint, markdownlint, `astro check` -- 0 errors/warnings/hints --,
  taxonomy validation, and 121 Vitest tests across 16 files, all green).
  `npm audit --omit=dev` reports 0 vulnerabilities. `npm outdated` shows
  only `typescript` (6.0.3 installed vs. 7.0.2 latest, held back by
  `@astrojs/check`, see #927).
* Three open Dependabot security alerts remain, all tracked by
  [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747):
  `linkify-it` (high), `js-yaml` (high), `markdown-it` (medium) -- all in
  the markdownlint devDependency chain, not shipped to the deployed site.

## Security and dependencies

* [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747) chore(deps):
  outdated markdown-it/linkify-it/js-yaml pins in markdownlint toolchain
  (`prio:high`, `status:confirmed`) - highest-priority open item. Tracks
  three open Dependabot advisories (two high, one medium) in the
  markdownlint tooling chain (devDependency only, not shipped to the
  deployed site).
* [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927) chore(deps):
  typescript 7.0.2 blocked by `@astrojs/check` peer dependency (`prio:medium`) -
  interim bump to 6.0.3 already landed on `main`; PR #920 stays open and
  blocked until `@astrojs/check` supports TypeScript 7.

## Content and design

* [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
  Implement optional post cover media system (`prio:medium`,
  `status:in-progress`) - refactor to let posts define cover frontmatter for
  local images, YouTube, or Vimeo, with rendering and a migration path for
  historical posts. Active: several related cover-rendering fixes have
  landed recently (single-post cover corner/frame fixes, legacy-image
  presentation system).
* [#1652](https://github.com/davidsneighbour/samui-samui.de/issues/1652)
  Redesign archive year view: single-line header and per-year month
  coloring (`type:enhancement`, new) - collapse each year row to one line,
  add a calendar icon to the months dropdown, larger dots with a
  hover-reveal month name, remove inter-year divider lines, switch to a
  grid layout, and scale month-dot color per-year instead of against the
  full 21-year archive max. Builds on the closed `/archiv/` milestone
  (#903-#917, #928); reuse the real-browser contrast-check methodology
  from #916 rather than checking against the wrong background layer.
* [#1649](https://github.com/davidsneighbour/samui-samui.de/issues/1649)
  Add legal navigation to the footer (`type:enhancement`, new) - surface
  Impressum, Datenschutzerklärung, and Kommentarpolicy as a footer nav
  group via `src/data/navigation/footer.json`.
* [#1650](https://github.com/davidsneighbour/samui-samui.de/issues/1650)
  Move sound on/off toggle title into a tooltip (`type:enhancement`, new) -
  replace the native `title` attribute with the existing shadcn Tooltip
  primitive, opening above the icon on hover/focus.
* [#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229)
  Update contact Dropbox drop address (unlabeled, new) - blocked on the
  replacement URL; clarification comment posted.

## Analytics and tracking

* [#1653](https://github.com/davidsneighbour/samui-samui.de/issues/1653)
  Add Matomo tracking documentation links (`type:documentation`, new) -
  link the three official Matomo tracking-API docs near `Analytics.astro`
  so future tracking work has a reference.
* [#1654](https://github.com/davidsneighbour/samui-samui.de/issues/1654)
  Add Matomo internal search tracking (`type:enhancement`, new) - wire
  `trackSiteSearch` into `/suche/`, respecting the existing
  Footer-loaded/best-effort analytics strategy; may need a privacy-wording
  update.

## Comments and community

* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) Migrate
  historical Disqus comments into Giscus/GitHub Discussions (`prio:low`,
  `status:blocked`) - data migration remains blocked until the import approach,
  attribution handling, and Giscus production setup are ready.

## Data and content migration

* [#1234](https://github.com/davidsneighbour/samui-samui.de/issues/1234)
  Research legacy Textpattern link and footnote tags (`type:data`, new) -
  review posts with `publisher.textpattern: true` for unresolvable
  `<txp:gho_permalink>`/`<txp:permlink>` tags (manual source research) and
  `<txp:footnote>` tags (possibly migratable to Markdown footnotes).

## Editorial tooling

* [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745)
  Auto-replace HTML entity umlauts (`&uuml;` etc.) with proper characters on
  save/commit (`prio:low`, `status:unconfirmed`, `meta:question`) - needs a
  scope decision before implementation.

## Maintenance and DX

* [#1648](https://github.com/davidsneighbour/samui-samui.de/issues/1648)
  Ignore root UPPERCASE markdown files in local dev watcher
  (`type:enhancement`, new) - extend the existing Vite
  `watch.ignored: ['**/scratch/**']` pattern (from closed #1351) to cover
  `README.md`/`TODO.md`/`ROADMAP.md`/etc. so routine project-file edits
  stop triggering dev-server reloads.
* [#1651](https://github.com/davidsneighbour/samui-samui.de/issues/1651)
  Document `.text-box-balanced` CSS class and translate hack
  (`type:documentation`, new) - explain the Firefox-specific vertical-balance
  workaround in `theme.css` before someone "cleans it up" and reintroduces
  the bug it fixes.
* [#1655](https://github.com/davidsneighbour/samui-samui.de/issues/1655)
  Evaluate tweakCN for theme fine-tuning (`type:chore`, new) - spike on
  whether the tweakcn.com visual token editor is worth adopting for this
  project's shadcn/Tailwind theme; decide adopt/visualize-only/reject.

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
* [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) - decide
  migration scope (all comments vs. curated subset) and attribution approach
  for re-posted historical comments.

## Project health indicators

* `npm run check` (format:check + lint + validate + test): **passing** --
  Biome format/lint clean, markdownlint clean (60 files), `astro check` 0
  errors/0 warnings/0 hints (127 files), taxonomy references valid, 121
  Vitest tests passing across 16 files.
* `npm audit --omit=dev`: **0 vulnerabilities**.
* `npm outdated`: only `typescript` behind (6.0.3 installed, 7.0.2 latest --
  intentionally held back, see #927).
* Dependabot security alerts: **3 open**, all tracked by #747
  (linkify-it/high, js-yaml/high, markdown-it/medium; devDependency-only).
* Full `npm run build` not re-run this session; last confirmed clean
  2026-07-20 (2374 pages, sitemap + Pagefind index).

## Recommended next steps

1. Handle [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747)
   as the only remaining open security issue (3 Dependabot advisories in the
   markdownlint chain).
2. Supply the replacement address for
   [#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229) so
   the Dropbox link can be updated.
3. Continue [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)
   (already in progress).
4. Pick up the small, self-contained new issues opportunistically:
   [#1648](https://github.com/davidsneighbour/samui-samui.de/issues/1648)
   (dev-watcher ignore), [#1651](https://github.com/davidsneighbour/samui-samui.de/issues/1651)
   (`.text-box-balanced` docs), and
   [#1653](https://github.com/davidsneighbour/samui-samui.de/issues/1653)
   (Matomo doc links) are all low-risk, low-effort.
5. Decide the scope for
   [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) before
   implementation, because the right fix depends on whether this should happen in
   the editor, pre-commit flow, or a content-cleanup script.
6. Resume [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717)
   once the comment platform setup and migration/import plan are unblocked.
