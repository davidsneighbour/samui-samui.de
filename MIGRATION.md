# Astro migration operating instructions

This file defines the working rules for migrating `samui-samui.de` to Astro.

The terms MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are used as described in
[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## Current decision summary

* Target platform: Astro (static output, `output: 'static'`).
* Site output: static unless an issue records why SSR is required.
* Source of truth for the current website: the Hugo source on `main`
  (`content/`, `layouts/`, `config/`), cross-checked against
  [https://samui-samui.de](https://samui-samui.de) when local rendering is ambiguous.
* First milestone: visual, behavioral, content, metadata, URL, asset, form, and
  redirect parity.
* Progress tracker: `MIGRATION.status.md`.
* Project task source of truth: GitHub Issues.
* Generated project overview: `ROADMAP.md`, managed by `dnb-project-task-triage`.
* Scratchpad inbox: `TODO.md`, managed by `dnb-project-task-triage`.
* **A prior Astro rewrite was recovered and backed up to
  `origin/recovered-astro-main`** (21 commits, all 2,049 posts already
  migrated, Tailwind v4 + Biome tooling). Its adoption is undecided — see
  issue #689. Do not build new Astro scaffolding that ignores this without
  first checking that issue's status.

## Agent startup checklist

Before making migration changes, an agent MUST:

1. Read this file.
2. Read `MIGRATION.status.md`.
3. Read `ROADMAP.md`.
4. Read `TODO.md`.
5. Inspect relevant GitHub Issues (milestones: "Migration: Inventory",
   "Migration: Astro Foundation", "Migration: Content Parity",
   "Migration: Visual Parity", "Migration: Cleanup",
   "Migration: Post-Parity Improvements").
6. Confirm the current Git branch is `main` (this migration works directly on
   `main`, by explicit user decision — there is no separate `migration`
   branch).
7. Confirm the intended work has one or more GitHub Issues.

If any check fails, the agent MUST stop and ask one clarification question or
create the missing tracking issue before editing implementation files.

## Source preservation

Before replacing the current source-of-truth artifact, preserve it under
`backup/`. Do not overwrite existing backups. (The recovered prior attempt is
already preserved as the `origin/recovered-astro-main` branch rather than a
`backup/` directory — that satisfies this rule for that specific artifact.)

## Migration goal

Recreate the current public website in Astro with the same visible design,
content, behavior, metadata, URL surface, assets, forms, redirects, and
deployment behavior, except where a GitHub Issue records an accepted removal
or disparity (e.g. issue #708, dropping the unused `/admin` CMS route).

## GitHub issue tracking

Every migration task, blocker, disparity, improvement idea, and scope
decision MUST have a GitHub Issue. Commits MUST reference relevant issue
numbers.

## ROADMAP.Md and TODO.Md

GitHub Issues are authoritative. `ROADMAP.md` is a generated project index.
`TODO.md` is a scratchpad inbox. Do not hand-maintain either outside the
`dnb-project-task-triage` workflow.

## Tracking file review

Every material migration change MUST include a review of whether
`MIGRATION.md`, `MIGRATION.status.md`, `PROJECT.md`, `ROADMAP.md`, `TODO.md`,
`AGENTS.md`, or GitHub Issues need updates.
