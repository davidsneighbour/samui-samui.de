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
* Astro is pinned to the **7.1.x** line. Do not bump to a newer Astro major
  without checking that integrations such as `@astrojs/mdx`, `@astrojs/react`,
  `@astrojs/check`, and `@astrojs/markdown-remark` support it.
* TypeScript is pinned to the latest 6.x line supported by `@astrojs/check`.
  TypeScript 7 is not currently supported by `@astrojs/check@0.9.9`, whose peer
  dependency is `typescript@^5.0.0 || ^6.0.0`.
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
* Agents MUST treat every `impeccable` hook finding as authoritative by
  default and fix it, unless the flagged pattern is already documented as an
  accepted exception in `DESIGN.md` (e.g. the "warnings MAY be accepted with a
  documented reason" carve-out above) or another committed, explicit override.
  A finding is NOT something an agent may wave off in the moment on its own
  judgment — "this predates my change," "it matches another component," or
  "it looks intentional" are not documented overrides. If a flagged pattern
  really is intentional going forward, that MUST be captured as a durable
  exception (a `DESIGN.md` entry, or an `/impeccable hooks ignore-*` config
  change made after the user explicitly confirms it) rather than left as a
  silent one-off judgment call in the response.

## Documentation

* Feature and topic documentation MUST live in `documentation/`. Add or update one
  focused Markdown file per feature or topic rather than mixing unrelated notes into
  a catch-all document.
* When adding or editing a feature, agents MUST update the matching
  `documentation/` file in the same change set. If no matching document exists yet,
  create one as part of the feature work so behavior, configuration, and operating
  notes do not drift away from the implementation.
* Documentation prose under `documentation/` MUST be written in English. Literal
  German UI labels, slugs, frontmatter values, data examples, or quoted content MAY
  appear when they document the website's real German-language surface.
* [`documentation/content/frontmatter-variables.md`](documentation/content/frontmatter-variables.md)
  MUST stay the index of every supported content frontmatter property. Any change
  that adds, removes, renames, or changes the meaning/default/type of a
  frontmatter property MUST update that index in the same change set and link to
  the focused documentation that owns the detailed contract.
* Keep the documentation tree sorted by topic:
  * `documentation/components/` contains reusable component and rendering-surface
    notes, including YouTube, Vimeo, notices, tooltips, post covers, legacy image
    presentation, and blog-list preview components.
  * `documentation/features/` contains user-facing website features such as search,
    archive browsing, maps, and the contact form.
  * `documentation/content/` contains editorial content contracts, frontmatter
    models, taxonomy rules, citations, post paths, post dates, and migration notes.
  * Keep repository process or assistant-operation notes directly in
    `documentation/` when they do not belong to one of those subcategories.
* `documentation/index.md` MUST list every documentation file with a short sentence
  about its purpose whenever files are added, moved, renamed, or removed.
* Source citations in posts SHOULD use named Markdown footnotes following
  [`documentation/content/source-citations.md`](documentation/content/source-citations.md).
  Prefer semantic `[^src-...]` identifiers over numeric `[^1]` identifiers for
  external source citations.

## Repo-local assistant skills

* Samui-specific assistant skills live in `ai/skills/` and use the `ss-*` prefix.
  Every direct child folder matching `ai/skills/ss-*/SKILL.md` MUST be treated as
  available to assistant conversations in this repository.
* `ai/config.toml` MUST keep repo-local skill registration pattern-based
  (`available = ["ai/skills/ss-*"]`) rather than listing individual skill folders.
  Adding a new `ai/skills/ss-*` folder with `SKILL.md` should autoregister it for
  future agents.
* Each `ss-*` skill's frontmatter `name` MUST match its folder name, and prompt
  helpers in that folder SHOULD invoke the same `ss-*` name. See
  [`documentation/repo-local-skills.md`](documentation/repo-local-skills.md).

## Taxonomies

The blog uses four separate German-named taxonomies:

* `leute`: concrete people.
* `orte`: concrete geographic places.
* `ereignisse`: concrete named events.
* `themen`: general topics and editorial keywords.

Every value in `leute`, `orte`, and `ereignisse` MUST have a physical entry in
the matching content collection. `themen` is the only open taxonomy. Topics MAY
be used without their own collection entry.

Use only canonical IDs in posts:

```yaml
leute:
  - thaksin-shinawatra
orte:
  - bangkok
ereignisse:
  - militaerputsch-2006
themen:
  - politik
```

People, places, and events MUST NOT also be added as topics. New entities MAY
start as minimal `_index.md` files. Do not invent descriptions, life dates,
coordinates, or other facts. Do not create event entries for every passing prose
mention, do not infer places from prose without being asked, do not use display
names as references, and use public copy `Themen`, never `Tags`. After
taxonomy-related content changes, run `npm run validate:taxonomies`. The full
rules live in
[`documentation/content/taxonomies.md`](documentation/content/taxonomies.md).

## Change tracking

* Every change MUST be committed. Uncommitted work MUST NOT be left behind as the
  end state of a task. This repository has a single developer (the repo owner) —
  agents MUST commit finished work autonomously, without pausing to ask for
  confirmation before the commit itself; there is no second party whose work could
  be clobbered by an unreviewed commit landing on `main`.
* Every commit MUST reference the GitHub issue it addresses (e.g. `closes #123`,
  `see #123`) and explain *why* the change was made, not just what changed.
* Every commit message MUST use the Conventional Commits format consumed by
  release-it/conventional-changelog:
  `<type>(optional-scope): <imperative summary>`. Use the type that matches the
  release/changelog meaning of the change, not a generic fallback. Common local
  types include `content`, `feat`, `fix`, `instructions`, `docs`, `test`,
  `refactor`, and `chore`. Examples:
  `content(fix): mark Textpattern review queue` and
  `instructions: require conventional commit messages`.
* Every open point of work — bug, follow-up, decision, question — MUST be tracked as
  a GitHub issue. Ideas that are not yet actionable MAY live in `TODO.md` instead
  (see below) until they are refined enough to become an issue.
* Issues MUST use this repository's existing label taxonomy rather than inventing new
  labels ad hoc:

  | Group | Labels | Purpose |
  | --- | --- | --- |
  | `type:*` | `bug`, `enhancement`, `dependencies`, `documentation`, `refactor`, `data`, `tests`, `chore`, `security`, `performance`, `accessibility`, `design`, `content` | What kind of work this is. |
  | `status:*` | `unconfirmed`, `confirmed`, `in-progress`, `blocked`, `review`, `done` | Where the issue is in its lifecycle. |
  | `prio:*` | `critical`, `high`, `medium`, `low` | Priority. |
  | `resolution:*` | `duplicate`, `invalid`, `wont-fix`, `cancelled`, `superseded`, `completed` | Why an issue was closed. |
  | `meta:*` | `question`, `help-wanted`, `keep-open` | Cross-cutting notes on the issue itself. |

  The `dnb-github-label-classifier` skill owns the canonical taxonomy and applies it
  when creating, triaging, or closing issues.

  Every open issue MUST carry exactly one `type:*`, one `status:*`, and one `prio:*`
  label (default `prio:low` when no higher priority is justified), plus zero or more
  `meta:*` labels, and no `resolution:*` label. Every closed issue MUST carry exactly
  one `type:*` and one `resolution:*` label, with no `status:*`, `prio:*`, or `meta:*`
  labels.

* Every time an agent writes an issue number, it MUST link to the issue online, e.g.
  `[#123](https://github.com/davidsneighbour/samui-samui.de/issues/123)`, rather than
  printing a bare number. This applies everywhere: chat output and summaries to the
  user, GitHub issue bodies/comments, `ROADMAP.md`, and other documentation. The only
  exception is commit messages, where bare `#123` is sufficient — GitHub auto-links it
  there, whereas a markdown link renders as literal text in `git log`.

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
npm run build               # validate:content, astro build --verbose, then pagefind indexing
npm run preview              # astro preview
npm run validate             # strict project/content/type contracts
npm run validate:content     # astro check on its own
npm run check                # non-mutating quality gate: format:check + lint + validate + test
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
check for key collisions across fragments before adding one. Quality-gate names
follow `documentation/quality-gates.md`: `check` is the non-mutating umbrella,
`lint` is static analysis, `validate` is strict contracts, `test` is behavioural
correctness, and mutating commands use explicit names such as `format`,
`lint:*:fix`, `*:write`, or `*:update`.

The `lint-staged` JSON pattern excludes `package.json` and `package-lock.json`
(`**/!(package|package-lock).json`) rather than sending those manifests through
Biome: `package.json` ordering is owned by fixpack during package generation, and
the lockfile should stay npm-owned. `biome.jsonc` also intentionally excludes
`.vscode/**` from linting, and if `lint-staged` hands `biome check --write` an
explicit path that resolves to zero processable files, Biome treats that as a hard
error ("No files were processed") rather than a no-op — so keep staged JSON globs
aligned with Biome's file exclusions when broadening them.

`check` covers `format:check`, `lint`, `validate`, and `test`. `lint` covers
Biome (`lint:code*`) and Markdown (`lint:markdown*`) via
`@dnbhq/biome-config` and `@dnbhq/markdownlint-config`; `validate:content` runs
`astro check`; `test` runs Vitest.
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

Every page uses Astro's `<ClientRouter />` (view transitions), so navigation
between pages is client-side DOM swapping, not a full page reload. This has a
sharp edge: a bare `<script is:inline>` that does its setup work (reading
`localStorage`, attaching a click listener, etc.) only reliably runs on the
very first page load of a session. After a later view-transition navigation,
Astro does not re-run it, so any element it wired up "goes dead" (listeners
missing) or reverts to its default state (e.g. a dismissed banner
reappearing) on the swapped-in page — even though the exact same markup
worked fine on a hard refresh. Any `is:inline` script that touches per-page
DOM (not just a one-time global side effect) MUST add `data-astro-rerun` so
it re-executes after every transition. See
[docs.astro.build/en/guides/view-transitions/#script-re-execution](https://docs.astro.build/en/guides/view-transitions/#script-re-execution).
Likewise, CSS needed by a client-side custom element belongs in a component's
frontmatter (a normal Astro stylesheet import Astro tracks and waits on
during a swap), not inside a `<script>` tag's side-effect import — the latter
only runs once and isn't part of what the view-transition swap waits to load,
so it can render unstyled for a moment after navigating.

### Content collections

Defined in `src/content.config.ts`: `posts` (`src/content/posts/**/index.md`,
2,049 posts, oldest from 2005), `leute` ("people",
`src/content/leute/**/_index.md`), `orte` (`src/content/orte/**/_index.md`),
`ereignisse` (`src/content/ereignisse/**/_index.md`), and `themen`
(`src/content/themen/**/_index.md`).
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

### Post date and time model

All post calendar logic MUST use Thailand time (`Asia/Bangkok`, UTC+07:00, no
daylight saving time). This includes permalink year/month calculation, archive
year/month grouping, displayed publication/update dates, Pagefind year metadata,
and content-folder migration checks. Do not use the build machine timezone or
raw UTC getters for post calendar decisions.

`src/utils/dates.ts` is the source of truth for post date handling:

* use `getPostDateParts(date)` for post calendar `year`, `month`, and `day`
* use `formatDate(date)` for visible German dates
* use `formatPostTimestamp(date)` when serialising post frontmatter timestamps

New or edited post frontmatter `date` and `lastmod` values MUST use this exact
fixed format:

```text
YYYY-MM-DDTHH:mm:ss+07:00
```

The format is zero-padded, 24-hour time, seconds required, no milliseconds, and
an explicit `+07:00` offset. Preserve the actual instant when normalising a
legacy timestamp: for example, `2012-01-24T17:31:43+00:00` becomes
`2012-01-25T00:31:43+07:00`, not `2012-01-24T17:31:43+07:00`.

Existing legacy timestamps with other offsets MAY remain when they are not being
edited, but agents MUST interpret them through the Bangkok helpers above.

### Pages

`src/pages/` has a route for every content type: `index.astro` (paginated
home/blog-list), `[...slug].astro` (individual posts), `leute/[slug].astro`,
`orte/[slug].astro`, `ereignisse/[slug].astro`, `themen/[slug].astro`,
`archiv/[year].astro` + `archiv/index.astro`,
`feiertage.astro`, `kontakt.astro`, `suche.astro`, `datenschutzerklaerung.astro`,
`404.astro`, `seite/[seite].astro` (pagination), `rss.xml.js`,
`opensearch.xml.ts`.

### Interactive maps

The selected mapping stack is MapLibre GL JS as the open-source renderer and
OpenFreeMap as the initial MapLibre-compatible vector style/tile provider. These
are separate concerns: MapLibre renders maps in the browser, while OpenFreeMap
supplies the hosted style document, tiles, sprites, glyphs, fonts, and related
assets. Open-source rendering does not make a hosted tile provider free,
private, unlimited, or production-suitable by default.

Do not use Google Maps, Google Maps APIs, Mapbox, Google-hosted map assets,
CDN-loaded map JavaScript/CSS, API-key-dependent map services, or
`tile.openstreetmap.org` as an assumed unlimited production tile CDN for this
stack. Leaflet remains valid for future simple raster-map needs, but it is not
the selected initial stack because this site needs full control over vector map
styling. OpenLayers is also not selected for the initial stack because its GIS
surface area is unnecessary for the current website requirements.

Central map settings MUST live in `src/config/maps.ts`. Reusable point data MUST
live in `src/data/map-points.json` and be read through `src/data/map-points.ts`;
do not scatter coordinate literals through page templates. Each point MUST have
`slug`, `latitude`, `longitude`, `title`, `description`, and `tags` fields, with
`zoom` optional. Remember that MapLibre coordinate arrays use
`[longitude, latitude]` order even when component APIs accept named `latitude`
and `longitude` props.

The initial OpenFreeMap setup requires no Google dependency, Mapbox token,
account, or application API key. It still makes external requests to
`tiles.openfreemap.org`, disclosing ordinary connection metadata such as visitor
IP address to that external host. Do not describe this as fully self-hosted,
anonymous, completely private, or GDPR-compliant merely because MapLibre is open
source. The long-term privacy and independence path is MapLibre GL JS with a
locally hosted style document, local sprites/fonts where required, and a
self-hosted regional Protomaps PMTiles file; do not implement PMTiles until a
future requirement asks for full self-hosting.

Map UI SHOULD use the local mapcn-style React primitive in
`src/components/ui/map.tsx` when the surface needs an interactive MapLibre map.
Astro pages should hydrate map islands only when needed (for example
`client:visible` for below-the-fold maps). Map components MUST import MapLibre
CSS through the module graph, validate finite latitude/longitude/zoom values,
render local accessible HTML/SVG markers, build popups with React/DOM-rendered
escaped text rather than `innerHTML`, support multiple instances without global
IDs or `window` state, respect reduced-motion preferences for future camera
animations, and clean up map instances/listeners when components unmount. Map UI
MUST adapt existing DESIGN.md tokens instead of inventing one-off colors,
radii, or spacing. When CSP changes are required, document the exact directives
and hosts being added.

### Deployment

Netlify, configured via `netlify.toml`: build command, functions directory
(`src/netlify/functions/contact.mjs` for the contact form), security headers, and a
resource-audited Content-Security-Policy covering Matomo, Giscus, YouTube/Vimeo
embeds, Cloudflare Turnstile, and Pagefind's WASM search index.

### Analytics

`Analytics.astro` (Matomo) is rendered from `Footer.astro`, intentionally last in
the page, so it never delays anything the visitor is there for. Tracking on this
site exists for technical reasons only, not marketing, so losing a "track" when a
visitor leaves before the script loads is an accepted tradeoff in exchange for not
blocking page rendering or interaction. Do not move the analytics include earlier
in the document to "fix" this without discussing the tradeoff first.
