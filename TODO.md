# ToDo's

This file is the scratchpad inbox for rough, unclear, or intentionally unprocessed
notes. GitHub Issues are the source of truth for actionable work; see `ROADMAP.md`
for the generated issue index and `MIGRATION.md`/`MIGRATION.status.md` for the
Astro migration specifically.

## Migration

Astro foundation landed on `main`, Hugo removed entirely (issues #689, #690, #707
closed). Route-building for posts/leute/tags/archive/top-level pages is the
current work — see `ROADMAP.md` for open issues and next steps.

## Note

Several long-standing notes below were reconciled into GitHub Issues or found
already implemented during the 2026-07-18 triage pass:

* giscus commenting — already implemented (`src/components/Giscus.astro`, #704).
* shadcn/ui onboarding, theme preset, component list — folded into #716
  (including the "don't implement the theme preset without explicit
  go-ahead" instruction, added as a comment on that issue).
* dev server listening on all interfaces — already done
  (`astro.config.ts`'s `server: { host: true }`).
* cspell with English (repo) / German (content) split — already implemented
  (`src/config/cspell/cspell.en.jsonc` + `cspell.de.jsonc`).
* package upgrades — handled by the existing Dependabot automation (4 open
  PRs as of this triage: #674 pagefind, #677 nanoid, #681 postcss, #714
  npm_and_yarn group); the "keep TypeScript on v6 unless Astro supports v7"
  constraint is already documented in `AGENTS.md`, not a separate task.
* disqus → giscus comment migration — now tracked as #717.
* dev server HTTPS — now tracked as #718.
