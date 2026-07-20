---
name: ss-refactor
description: Orchestrate the long-term manual rework of all samui-samui.de posts. Build work queues from publisher markers or chronology, run ss-review one post at a time, maintain resume state under ai/reports/contentrework, and prepare batch commit summaries.
---

<!-- markdownlint-disable title-case-style -->

# ss-refactor

Manage the long-running, manual content rework programme for `samui-samui.de`.

This is an orchestration skill. It discovers and prioritises posts, invokes
`ss-review` for exactly one post at a time, and records resumable batch
progress. It does not replace the detailed review rules in `ss-review`.

## Core model

* `ss-review` reviews and optionally fixes one post.
* `ss-refactor` selects the next post and manages queues, state, batches, and
  commit summaries.
* `publisher.*` properties represent unresolved work.
* `ai/reports/contentrework` stores resume data for the finite global content
  rework.
* The user remains in control of each post and each manual decision.

## Supported requests

Examples:

* work on all Flickr issues
* fix all posts, oldest first
* continue the current content-rework batch
* review posts from 2005
* work on cover migration issues
* recover original Flickr images
* review five posts with tag issues
* show content-rework statistics
* prepare the content rework commit
* resume the last blocked post
* find the next unreviewed post

## Repository preparation

Ensure this structure exists at the path configured in `ai/config.toml`,
currently:

```text
ai/reports/contentrework/
├── README.md
├── state.json
├── posts.jsonl
├── batches/
│   └── <batch-id>.json
├── reports/
│   └── <post-id>.md
└── tags.json
```

This directory is not required for ordinary one-off post reviews. Use it only
when running or resuming the global rework of all posts.

Generated files may be ignored by Git when repository policy requires it. The
skill definitions and durable editorial rules should remain tracked.

## State principles

* Rebuildable inventory and durable human decisions must be distinguishable.
* Never infer "reviewed" from missing publisher markers.
* Never clear all markers in bulk merely because a script completed.
* Record the SEO ruleset version used for every completed review.
* Retain blocked and deferred outcomes.
* Preserve an append-only per-post review history in `posts.jsonl`.
* Update aggregate `state.json` from repository content plus history.

See `resources/state-format.md`.

## Post path normalisation

Canonical post URLs are metadata-driven, not directory-name-driven. The route
uses the preserved frontmatter `url` when present and otherwise computes
`/:year/:month/:slug/` from frontmatter `date` plus `slug`.

Treat date prefixes in historical post folder names as legacy export artefacts.
When moving, creating, or otherwise normalising a post during refactor work,
prefer:

```text
src/content/posts/YYYY/MM/slug/index.md
```

over:

```text
src/content/posts/YYYY/MM/YYYY-MM-DD-slug/index.md
```

Before a path migration, check for same-month slug collisions after removing
the `YYYY-MM-DD-` prefix, update any same-folder assets with the post, and run a
build or the narrowest route check that proves the generated permalink stayed
unchanged. Do not change `url`, `date`, or `slug` frontmatter merely to match a
filesystem move.

## Queue selection

Build a deterministic queue using `resources/work-queues.md`.

Before starting, report:

* queue definition
* total matching posts
* already reviewed under the current ruleset
* unresolved matching posts
* blocked posts
* next selected post

Unless the user specifies a batch size, process one post and then stop for
review. The user explicitly wants a manual post-by-post workflow.

## Workflow

### 1. Refresh inventory

Scan all `src/content/posts/**/index.md`.

Collect:

* path
* slug
* title
* date
* lastmod
* tags
* cover presence/type
* publisher markers and values
* Flickr references detectable from source
* Flickr photo IDs, titles, image URLs, and local image candidates
* image counts
* review history
* latest ruleset reviewed

Do not modify posts during inventory.

### 2. Resolve the queue

Use explicit user scope first.

Examples:

* "all Flickr issues":
  * `publisher.flickr` present
  * legacy top-level `flickr` frontmatter present
  * optionally include newly detected Flickr references not yet marked
* "oldest first":
  * chronological ascending
  * apply any requested marker or year filter
* "all posts":
  * all posts not completed under the requested/current review policy
* "cover issues":
  * `publisher.cover` or `publisher.covermigration` present
* "unreviewed":
  * no successful review record under the requested ruleset

Show newly detected discrepancies separately before changing markers.

### 3. Select one post

Select deterministically. Default tie-break order:

1. publication date
2. repository path

Do not skip a blocked post silently. Either:

* surface it for a decision
* select the next actionable post while keeping the block visible
* follow an explicit user instruction to defer it

### 4. Invoke `ss-review`

Pass:

* exact post path
* audit or fix mode
* queue reason
* current tag registry
* current SEO ruleset
* previous review record
* known unresolved decisions

`ss-review` remains authoritative for post-level acceptance criteria.

### 5. Recover Flickr originals

When the post has `publisher.flickr` or legacy `flickr` frontmatter, follow
`resources/flickr-backup-recovery.md`.

The goal is to replace remote Flickr embeds or reduced Flickr derivatives with
the verified original image copied from the local Flickr backup into the post's
content folder. Leave the marker unresolved when the original cannot be matched
without manual judgement.

### 6. Present and apply work

For manual mode:

1. present the post review
2. identify proposed edits
3. apply edits when authorised by the user's request
4. show remaining decisions
5. update markers only from actual review results

Do not automatically continue to another post in the same response unless the
user explicitly requested a numeric batch and the work can still remain
meaningfully reviewable.

### 7. Update resume state

Write resume state only for the global content rework. Do not create or update
`ai/reports/contentrework` for ordinary single-post reviews.

When the global rework is active, write:

* detailed report
* append-only history record
* aggregate counts
* Flickr backup matches and unresolved manual candidates
* tag registry changes
* batch record
* changed paths
* blocked/deferred items

### 8. Continue or finish batch

A batch is a group of reviewed posts intended for one commit.

A batch remains open until:

* user requests commit preparation
* configured batch size is reached
* user ends the session
* a blocking repository issue prevents safe continuation

At the start of a long content-rework session, ask whether the user wants:

1. one bulk commit when they finish the session, or
2. smaller commits after a configured number of reviewed posts.

Default to one bulk commit when the user does not choose. This explicitly
overrides the repository's "commit every finished change" policy for active
content-rework sessions, because the user wants hours of related content fixes
to land as one or a few coherent commits.

Do not commit after every post unless the user chooses that mode.

## Marker maintenance

The per-post review decides markers.

The orchestrator may add a newly detected marker only when:

* the detection is reliable
* the marker semantics are defined
* the change is logged
* the post has not been falsely represented as fully reviewed

Do not remove markers based on inventory heuristics.

Apply any marker change spanning more than one post through
`npm run publisher -- set <key> <value> <filter...>` / `unset` (see
`AGENTS.md` and `src/scripts/publisher.ts`), not by hand-editing frontmatter
across files. `set`/`unset` refuse to run without an explicit filter
(`--all`, `--year`, `--path`, `--status`, `--tag`) and support `--dry-run`;
scope `--path` to exactly the posts confirmed by inventory. A single post's
markers may still be edited directly as part of `ss-review`'s own edit to
that post.

## Tag governance

Follow `ai/skills/ss-review/resources/tag-rules.md` for canonical-tag matching,
alias detection, and the central registry.

`ss-refactor` additionally maintains the generated registry snapshot at
`ai/reports/contentrework/tags.json` and owns cross-post decisions:

* ask for a taxonomy decision when ambiguity spans multiple posts
* when merging tags, update posts only through an explicit scoped batch

## SEO ruleset maintenance

The detailed rules live in `ai/skills/ss-review/resources/seo-rules.md`.

When asked to update SEO guidance:

1. consult current primary sources
2. record source review date
3. update the ruleset version
4. describe material changes
5. do not automatically invalidate every old review
6. mark reviews for recheck only when changed rules materially affect them

A commercial external SEO skill may be used as a secondary diagnostic only. It
must not override the repository's rules or primary-source guidance.

## Batch commit preparation

Use `resources/commit-workflow.md`.

Default commit subject:

```text
content(refactor): content rework
```

The body must list every reworked post and a compact summary.

Do not include posts only inspected but not changed unless the commit also
intentionally adds their review-state files.

## Required session output

After each invocation, report:

* queue and filter
* overall counts
* selected post
* review result
* files changed
* markers added/kept/removed
* unresolved work
* current batch size
* suggested next post
