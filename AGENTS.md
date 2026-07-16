# AGENTS.md

Instructions for any AI coding agent working in this repository. Terminology follows
[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119): MUST/MUST NOT are absolute
requirements, SHOULD/SHOULD NOT are strong recommendations that MAY be overridden with
a documented reason, MAY is optional.

## Current phase

This repository is a Hugo static site today, and an Astro migration is now actively
underway (bootstrapped via the `dnb-astro-migration-project` skill).

- **All migration work happens directly on `main`.** By explicit user decision,
  this project does NOT use a separate `migration` branch, overriding that skill's
  default convention. There MUST NOT be long-lived feature branches for routine or
  migration work.
- `legacy/hugo` is a frozen copy of `main` taken before the migration effort and MUST
  NOT be used for new work.
- Migration operating rules live in `MIGRATION.md`; route/system progress lives in
  `MIGRATION.status.md`; project context and the decision log live in `PROJECT.md`.
  An agent doing migration work MUST read all three (plus `ROADMAP.md`/`TODO.md`)
  before editing implementation files — see `MIGRATION.md`'s Agent Startup Checklist.
- A prior Astro rewrite (21 commits, all 2,049 posts already migrated, Tailwind v4 +
  Biome) was recovered after an earlier accidental force-push and is backed up at
  `origin/recovered-astro-main`. Its adoption is undecided — see the tracking issue
  linked from `PROJECT.md`'s decision log. Do not build new Astro scaffolding without
  checking that issue's status first.
- The live site is https://samui-samui.de. When a change's effect is unclear from
  reading code alone, agents SHOULD compare local output against the live site rather
  than guessing.
- New styling work for the Astro migration SHOULD prefer Tailwind CSS v4+. The
  current site itself still runs on `@davidsneighbour/bootstrap-config` and
  hand-written SCSS (`assets/scss/`) — that MUST NOT be reworked to Tailwind piecemeal
  while the site is still Hugo-based; Tailwind applies to the migration target, not to
  retrofits of the current SCSS.

## Hugo version

This repository MUST be built and served with **Hugo v0.140.2 (extended)**, not
whatever version happens to be installed. See `HUGO-COMPATIBILITY.md` for the full
list of things that break on newer Hugo (deprecated config keys, a `html/template`
escaper failure in the vendored `schema` module, a `partials/`-prefix double-include
bug in the vendored `hooks` and `netlification` modules, and Hugo's Node
`--permission` sandboxing rejecting PostCSS/browserslist's directory walk). None of
that SHOULD be fixed forward for newer Hugo versions, since the project is migrating
away from Hugo entirely — pin the version instead of chasing compatibility.

## Change tracking

- Every change MUST be committed. Uncommitted work MUST NOT be left behind as the
  end state of a task.
- Every commit MUST reference the GitHub issue it addresses (e.g. `closes #123`,
  `see #123`) and explain *why* the change was made, not just what changed.
- Every open point of work — bug, follow-up, decision, question — MUST be tracked as
  a GitHub issue. Ideas that are not yet actionable MAY live in `TODO.md` instead
  (see below) until they are refined enough to become an issue.
- Issues MUST use this repository's existing label taxonomy rather than inventing new
  labels ad hoc:

  | Group | Labels | Purpose |
  |---|---|---|
  | `type:*` | `bug`, `enhancement`, `dependencies`, `documentation`, `refactor`, `data`, `tests`, `chore` | What kind of work this is. |
  | `status:*` | `unconfirmed`, `confirmed`, `in-progress`, `blocked`, `review`, `done` | Where the issue is in its lifecycle. |
  | `prio:*` | `critical`, `high`, `medium`, `low` | Priority. |
  | `resolution:*` | `duplicate`, `invalid`, `wont-fix`, `completed` | Why an issue was closed. |
  | `meta:*` | `question`, `help-wanted`, `keep-open` | Cross-cutting notes on the issue itself. |

  Every issue SHOULD carry at least one `type:*` label and one `status:*` label.

- When an agent shows an issue number in its output or summaries to the user (not
  in commit messages, where `#123` is sufficient), it MUST link to the issue online,
  e.g. `[#123](https://github.com/davidsneighbour/samui-samui.de/issues/123)`, rather
  than printing a bare number.

- `ROADMAP.md` MUST reflect the current set of open GitHub issues (a generated index,
  not hand-maintained prose) and `TODO.md` MUST stay a scratchpad for notes that are
  not yet actionable GitHub issues. The `dnb-project-task-triage` skill governs
  reconciling these two files against GitHub Issues — use it rather than
  hand-editing `ROADMAP.md`.

- Editor/workspace configuration changes (e.g. `.vscode/settings.json`, including
  ones VS Code generates automatically such as `explorer.fileNesting.patterns`
  entries) MUST be committed like any other change rather than left as stray
  uncommitted diffs — same issue-linkage rule applies.

## Commands

```bash
npm install               # install dependencies
npm run server            # wireit: hugo server -D -E -F --disableFastRender --tlsAuto (dumps config to data/dnb/samuisamui/config.json first)
npm run build              # wireit: hugo --gc --minify, then pagefind indexing
npm run deploy              # wireit: build, then netlify deploy --prod --open
npm run release             # wireit: commit-and-tag-version, then ./bin/repo/release/postrelease
```

There is no lint/test script wired into `package.json` beyond the tool configs
declared inline (`eslintConfig`, `stylelint`, `remarkConfig`, `browserslist`, all
extending `@davidsneighbour/*-config` shared packages). Pre-commit hooks are defined
in `.pre-commit-config.yaml` (JSON/TOML/YAML validation, merge-conflict markers,
private-key detection, etc.) — install with `pre-commit install` (see
`DEVNOTES.md`).

Running `hugo` directly (not via wireit) works for quick checks; `hugo server` holds
a `.hugo_build.lock` for its lifetime, so a second `hugo`/`hugo server` invocation
while one is already running will hang waiting on that lock rather than erroring.

## Architecture

### Hugo Modules, not a vendored theme

There is no local `theme/` directory. Nearly all layout/partial logic comes from
Go-module dependencies under `github.com/davidsneighbour/hugo-modules/modules/*`
(imported in `config/_default/module.toml`), each one a separately versioned
repository owned by the same author: `debug`, `hooks`, `functions`, `modder`,
`auditor`, `feeds`, `giscus`, `head`, `headerimage`, `icons`, `netlification`,
`opensearch`, `pictures`, `publisher`, `pwa`, `renderhooks`, `robots`, `schema`,
`security`, `shortcodes`, `sitemap`, `social`, `youtube`, plus a few standalone
modules (`hugo-icons`, `hugo-icon-pack-lucide`, `hugo-robots`, `hugo-netlification`,
`hugo-shortcodes`). Local `layouts/` only holds this site's own overrides
(`_default/`, `posts/`, `archive/`, `partials/`, `shortcodes/`) — a local file at the
same relative path as a module's file always wins, which is the supported way to
patch a module's template without editing vendor code.

Module source is cached under `~/.cache/hugo_cache/modules/filecache/...`, not the
regular Go module cache — that is where to look when a module's actual template
source needs to be read for debugging.

### Hooks system

Layout injection points (`head-start`, `head-end`, `body-start`, `content-start`,
`content-end`, `sidebar-start`, `sidebar-end`, `container-start`, `container-end`,
`body-end` — documented in `DEVNOTES.md`) are wired through the `hooks` module and
configured under `[dnb.hooks]` in `config/_default/params.toml` /
`config/development/params.toml`, keyed by hook name and pointing at a partial in
`layouts/partials/hooks/`.

### Config is split by concern, per environment

`config/_default/*.toml` holds one file per Hugo config concern (build, hugo,
imaging, languages, markup, mediatypes, menus, module, outputformats, outputs,
pagination, params, permalinks, privacy, related, sitemap, taxonomies).
`config/development/` overrides a subset of these for local dev. There is a single
language (`de`).

### Content

`content/posts/<year>/...` holds blog posts (oldest content dates back to 2005).
`content/leute/` ("people") and `content/tags/` are additional content sections.
`content/archive/<year>.md` provides year-based archive pages. `content/sitewide/`
holds cross-page snippets (e.g. `authorfooter`). `content/feiertage/` (holidays) and
`content/datenschutzerklaerung.md`/`kontakt.md`/`suche.md` are standalone pages.

### Deployment

Netlify is the deploy target (`netlify.toml`), but `netlify.toml` currently pins a
long-stale toolchain (`HUGO_VERSION = "0.101.0"`, `NODE_VERSION = "16.8.0"`) that
does not match this repo's actual pinned Hugo version (0.140.2), and its build
`command` (`./bin/netlify.sh`) points at the `bin/` submodule, which is currently an
orphaned Git submodule reference with no content checked out (`.gitmodules` was
removed without also removing the submodule's gitlink entry). Anyone acting on the
Netlify build path SHOULD treat this as broken until reconciled, not as working
prior art.

### Styling

SCSS under `assets/scss/`, organized ITCSS-style (`01-settings`, `02-mixins`,
`03-components`, `04-prose`, `05-plugins`, `09-templates`), built through
`@davidsneighbour/postcss-config`'s PostCSS pipeline (`postcss.config.cjs`:
`doiuse`, `autoprefixer`, `postcss-preset-env`, `cssnano`) and
`@davidsneighbour/bootstrap-config`. This is the current, Bootstrap-based system —
see "Current phase" above for why it is not being migrated to Tailwind in place.
