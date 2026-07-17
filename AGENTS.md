<!-- markdownlint-disable-next-line title-case-style -->
# AGENTS.md

Instructions for any AI coding agent working in this repository. Terminology follows
[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119): MUST/MUST NOT are absolute
requirements, SHOULD/SHOULD NOT are strong recommendations that MAY be overridden with
a documented reason, MAY is optional.

## Current phase

This repository is an Astro static site (`output: 'static'`). It was a Hugo site
until 2026-07-17, when the Astro foundation was landed on `main` and Hugo was
removed entirely (issue #690) — by explicit user decision, since Hugo no longer
needed to be deployed and there was no reason to keep it around during the
migration. `HUGO-COMPATIBILITY.md` is kept as historical record only.

* **All migration work happens directly on `main`.** By explicit user decision,
  this project does NOT use a separate `migration` branch, overriding the
  `dnb-astro-migration-project` skill's default convention. There MUST NOT be
  long-lived feature branches for routine or migration work.
* `legacy/hugo` is a frozen copy of `main` taken before the migration effort — the
  only place the old Hugo source (`content/`, `layouts/`, `config/`, etc.) still
  exists in the working tree. Use it to look something up; MUST NOT be used for new
  work.
* Migration operating rules live in `MIGRATION.md`; route/system progress lives in
  `MIGRATION.status.md`; project context and the decision log live in `PROJECT.md`.
  An agent doing migration work MUST read all three (plus `ROADMAP.md`/`TODO.md`)
  before editing implementation files — see `MIGRATION.md`'s Agent Startup Checklist.
* The Astro foundation came from a prior rewrite (`origin/recovered-astro-main`)
  that was recovered after an earlier accidental force-push, reviewed, and adopted
  (see `PROJECT.md`'s decision log). It has content for `posts`/`leute`/`tags`
  fully migrated, but **no page routes for any collection yet** — building those is
  the current Content Parity work (see `MIGRATION.status.md`).
* The live site is [https://samui-samui.de](https://samui-samui.de) — since the
  Hugo source is gone from `main`, this (or `legacy/hugo`) is the parity reference
  now, not local Hugo output. When a change's effect is unclear from reading code
  alone, agents SHOULD compare local output against the live site rather than
  guessing.
* Styling uses Tailwind CSS v4 (`@tailwindcss/vite`) — no Bootstrap/SCSS remains.
* Astro is pinned to **6.4.8**, not 7.x, per explicit user decision — at the time
  of the migration some integrations (e.g. `@astrojs/mdx`) hadn't caught up to
  Astro 7's peer dependency requirements yet. Do not bump to an Astro 7.x line
  without checking that integration compatibility has actually caught up.
* `astro.config.ts` (TypeScript), not `.mjs` — per explicit user preference.

## Change tracking

* Every change MUST be committed. Uncommitted work MUST NOT be left behind as the
  end state of a task.
* Every commit MUST reference the GitHub issue it addresses (e.g. `closes #123`,
  `see #123`) and explain *why* the change was made, not just what changed.
* Every open point of work — bug, follow-up, decision, question — MUST be tracked as
  a GitHub issue. Ideas that are not yet actionable MAY live in `TODO.md` instead
  (see below) until they are refined enough to become an issue.
* Issues MUST use this repository's existing label taxonomy rather than inventing new
  labels ad hoc:

  | Group | Labels | Purpose |
  | --- | --- | --- |
  | `type:*` | `bug`, `enhancement`, `dependencies`, `documentation`, `refactor`, `data`, `tests`, `chore` | What kind of work this is. |
  | `status:*` | `unconfirmed`, `confirmed`, `in-progress`, `blocked`, `review`, `done` | Where the issue is in its lifecycle. |
  | `prio:*` | `critical`, `high`, `medium`, `low` | Priority. |
  | `resolution:*` | `duplicate`, `invalid`, `wont-fix`, `completed` | Why an issue was closed. |
  | `meta:*` | `question`, `help-wanted`, `keep-open` | Cross-cutting notes on the issue itself. |

  Every issue SHOULD carry at least one `type:*` label and one `status:*` label.

* When an agent shows an issue number in its output or summaries to the user (not
  in commit messages, where `#123` is sufficient), it MUST link to the issue online,
  e.g. `[#123](https://github.com/davidsneighbour/samui-samui.de/issues/123)`, rather
  than printing a bare number.

* `ROADMAP.md` MUST reflect the current set of open GitHub issues (a generated index,
  not hand-maintained prose) and `TODO.md` MUST stay a scratchpad for notes that are
  not yet actionable GitHub issues. The `dnb-project-task-triage` skill governs
  reconciling these two files against GitHub Issues — use it rather than
  hand-editing `ROADMAP.md`.

* Editor/workspace configuration changes (e.g. `.vscode/settings.json`, including
  ones VS Code generates automatically such as `explorer.fileNesting.patterns`
  entries) MUST be committed like any other change rather than left as stray
  uncommitted diffs — same issue-linkage rule applies.

## Commands

```bash
npm install               # install dependencies; also installs git hooks (see below)
npm run dev                # astro dev --verbose
npm run build               # astro check && astro build --verbose, then pagefind indexing
npm run preview              # astro preview
npm run astro:check          # astro check (typecheck) on its own
npm run check                # non-mutating quality gate: format:check + lint (Biome + markdownlint)
npm run lint:fix              # apply safe autofixes: Biome + markdownlint
npm run compile:package        # regenerate package.json from src/packages/**/*.jsonc fragments, then npm install
npm run release                # release-it --config .release-it.ts --ci
npm run release:dry             # release-it dry run, no git/GitHub side effects
```

**`package.json` is generated, not hand-edited.** It's rebuilt from
`src/packages/**/*.jsonc` fragment files by `src/packages/generate-package.ts`
(invoked via `npm run compile:package`), which preserves only a fixed set of
identity fields (name/description/version/author/etc.) from the existing
`package.json` and rebuilds everything else — `dependencies`, `scripts`,
`simple-git-hooks`, `lint-staged`, all of it — purely from the fragments. If you
add a dependency or script, add or edit the relevant fragment under
`src/packages/{build,linting,site}/*.jsonc` and regenerate; do not hand-edit
`package.json` directly, it will be overwritten. Fragment processing order isn't
strictly alphabetical (glob-determined) — if two fragments define the same
`scripts`/`devDependencies` key, whichever is processed later silently wins, so
check for key collisions across fragments before adding one (this bit us once:
`dnbhq.jsonc`'s `check` script silently overwrote `astro.jsonc`'s `astro check`,
since `check`/`build` are common names — resolved by renaming the astro one to
`astro:check`).

The `lint-staged` JSON pattern is `**/!(package-lock|.vscode/**).json`, not the
simpler `**/!(package-lock).json` you'd expect: `biome.jsonc` intentionally
excludes `.vscode/**` from linting, and if `lint-staged` hands `biome check
--write` an explicit path that resolves to zero processable files, Biome treats
that as a hard error ("No files were processed") rather than a no-op — so any
staged `.vscode/*.json` change would otherwise always fail the pre-commit hook.

`check`/`lint` cover Biome (`lint:code*`, `format*`) and Markdown
(`lint:markdown*`) via `@dnbhq/biome-config` and `@dnbhq/markdownlint-config`.
`biome.jsonc` extends `@dnbhq/biome-config` — keep its `$schema` version in sync
with the installed `@biomejs/biome` version, or `biome check` hard-fails on
version mismatch (run `biome migrate --write` after bumping Biome). Markdownlint
is intentionally scoped away from `src/content/**` via the local
`.markdownlint-cli2.jsonc`'s `ignores` — the 20-year blog archive predates (and
isn't held to) the doc-oriented ruleset. `lint:spell` (cspell) is a separate,
non-blocking script — it is not wired into `check`, pre-commit, or pre-push,
because content has ~191k "unknown word" hits and isn't in scope to fix as part
of routine work.

`simple-git-hooks` installs a `pre-commit` hook (`lint-staged`: Biome + markdownlint
against staged files only) and a `pre-push` hook (`npm run check`, full-repo) via the
`prepare` script, which `npm install` runs automatically.

## Architecture

### Astro foundation

Static output (`output: 'static'`) via `astro.config.ts`. Integrations: `@astrojs/mdx`,
`@astrojs/sitemap`, `@astrojs/rss`, `astro-icon`, a hand-rolled `pagefind` build
integration (`src/scripts/integrations/pagefind.ts`), and `@tailwindcss/vite` for
styling. Path aliases (`@assets`, `@components`, `@config`, `@content`, `@data`,
`@layouts`, `@packages`, `@pages`, `@scripts`, `@styles`, `@test`, `@utils`, `@/*`)
are defined in `tsconfig.json`.

### Content collections

Defined in `src/content.config.ts`: `posts` (`src/content/posts/**/index.md`,
2,049 posts, oldest from 2005), `leute` ("people",
`src/content/leute/**/_index.md`), `tags` (`src/content/tags/**/_index.md`). Content
for all three is migrated and front-matter-clean, but **no page routes render any
of them yet** — see `MIGRATION.status.md` for what's still missing (individual
post/leute/tag pages, archive, kontakt/suche/datenschutzerklaerung). `src/content/`
also holds a few standalone pages (`datenschutzerklaerung.md`, `kontakt.md`,
`suche.md`) and non-collection content (`feiertage/`, `sitewide/`) whose route
treatment is still an open question (see `MIGRATION.status.md`'s Open Inventory
Questions).

### Pages (current state)

`src/pages/index.astro` (paginated home/blog-list), `src/pages/about.astro`,
`src/pages/seite/[seite].astro` (pagination), `src/pages/rss.xml.js`. That's it —
everything else is still to be built.

### Deployment

Hugo-era `netlify.toml` was removed along with the rest of the Hugo tooling; there
is currently no deployment config for the Astro site. Tracked as issue #709 — needs
a fresh Astro-appropriate Netlify config, not a revival of the old one (which was
already stale/broken before removal).
