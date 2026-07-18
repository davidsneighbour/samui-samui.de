<!-- markdownlint-disable-next-line title-case-style -->
# AGENTS.md

Instructions for any AI coding agent working in this repository. Terminology follows
[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119): MUST/MUST NOT are absolute
requirements, SHOULD/SHOULD NOT are strong recommendations that MAY be overridden with
a documented reason, MAY is optional.

## Current phase

This repository is an Astro static site (`output: 'static'`), deployed to Netlify
at [https://samui-samui.de](https://samui-samui.de).

* Live site is the reference for expected behavior — when a change's effect is
  unclear from reading code alone, agents SHOULD compare local output against the
  live site rather than guessing.
* Styling uses Tailwind CSS v4 (`@tailwindcss/vite`) — no Bootstrap/SCSS.
* Astro is pinned to **6.4.8**, not 7.x — some integrations (e.g. `@astrojs/mdx`)
  haven't caught up to Astro 7's peer dependency requirements yet. Do not bump to
  an Astro 7.x line without checking that integration compatibility has actually
  caught up.
* `astro.config.ts` (TypeScript), not `.mjs` — per explicit user preference.

## Design system

* [DESIGN.md](DESIGN.md) is the single source of truth for design tokens
  (colors, typography, spacing, radii, component variants) — it follows the
  [design.md](https://github.com/google-labs-code/design.md) format. Agents
  MUST consult it before making any visual/design decision (choosing a color,
  a radius, a font weight, a spacing value, a new component variant) rather
  than picking values ad hoc or copying whatever a similar-looking component
  happens to use.
* Any change that adds, removes, or changes the value of a design token —
  editing `src/styles/theme.css`, `src/components/ui/button.astro`'s `cva`
  config, or any other token-bearing source — MUST update `DESIGN.md` in the
  same commit. A stale `DESIGN.md` is worse than no `DESIGN.md`.
* Before committing a `DESIGN.md` change, run
  `npx @google/design.md lint DESIGN.md` and address any `error`-level
  findings (warnings MAY be accepted with a documented reason, as several
  already are in the file's "Colors" section).
* If a design decision genuinely isn't covered by `DESIGN.md` (a wholly new
  pattern, not a variant of an existing token), treat that as a signal to
  extend `DESIGN.md` deliberately — not as license to invent an undocumented
  one-off value in component code.

## Change tracking

* Every change MUST be committed. Uncommitted work MUST NOT be left behind as the
  end state of a task. This repository has a single developer (the repo owner) —
  agents MUST commit finished work autonomously, without pausing to ask for
  confirmation before the commit itself; there is no second party whose work could
  be clobbered by an unreviewed commit landing on `main`.
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
`src/content/leute/**/_index.md`), `tags` (`src/content/tags/**/_index.md`).
`src/content/` also holds a few standalone pages (`datenschutzerklaerung.md`,
`kontakt.md`, `suche.md`) and non-collection content (`feiertage/`, `sitewide/` —
the latter is data-only, e.g. the author-bio footer wired into every post).

Posts also carry an optional `publisher` frontmatter block — repo-internal
editorial metadata (e.g. `status: need-work`), never rendered on the site. It
exists so a human or an agent can tag a subset of the 20-year archive as a
work queue ("go through everything tagged `need-work` and fix X") without
inventing an external tracker for content-only cleanup. Manage it with
`npm run publisher -- <command>` (`src/scripts/publisher.ts`) rather than
hand-editing frontmatter across many files:

```bash
npm run publisher -- set status need-work --year=2005   # tag a batch
npm run publisher -- list --status=need-work             # find the queue
npm run publisher -- unset status --year=2005            # clear it
```

`set`/`unset` refuse to run without an explicit filter (`--all`, `--year`,
`--path`, `--status`, `--tag`) — there is no accidental-blanket-write mode.
See the script's header comment for the full filter/flag reference.

### Pages

`src/pages/` has a route for every content type: `index.astro` (paginated
home/blog-list), `[...slug].astro` (individual posts), `leute/[slug].astro`,
`tags/[slug].astro`, `archiv/[year].astro` + `archiv/index.astro`,
`feiertage.astro`, `kontakt.astro`, `suche.astro`, `datenschutzerklaerung.astro`,
`404.astro`, `seite/[seite].astro` (pagination), `rss.xml.js`,
`opensearch.xml.ts`.

### Deployment

Netlify, configured via `netlify.toml`: build command, functions directory
(`netlify/functions/contact.mjs` for the contact form), security headers, and a
resource-audited Content-Security-Policy covering Matomo, Giscus, YouTube/Vimeo
embeds, reCAPTCHA, and Pagefind's WASM search index.
