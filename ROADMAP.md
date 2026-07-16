# Roadmap

Generated index of open GitHub issues for this repository. This file is a cache of
issue-tracker state, not the source of truth — GitHub Issues are authoritative.
Regenerate via the `dnb-project-task-triage` skill rather than hand-editing.

## Project state

- Current stack: Hugo v0.140.2 (extended), pinned — see `HUGO-COMPATIBILITY.md`.
- Migration target: Astro (not yet started — see `TODO.md`).
- Open GitHub issues: **none** at time of writing.
- Label taxonomy (`type:*`, `status:*`, `prio:*`, `resolution:*`, `meta:*`) is set up
  and ready for use — see `AGENTS.md` for the full table.

## Known gaps not yet filed as issues

- `netlify.toml` pins a stale toolchain (`HUGO_VERSION = "0.101.0"`,
  `NODE_VERSION = "16.8.0"`) that does not match the repo's actual pinned Hugo
  version, and its build command points at `bin/netlify.sh`, which is unreachable
  because the `bin/` submodule reference is orphaned (`.gitmodules` was removed
  without removing the gitlink). The Netlify build path should be assumed broken
  until this is reconciled and filed as an issue.

## Suggested order of work

1. Decide whether to fix or remove the `bin/` submodule and reconcile
   `netlify.toml`, and file that as an issue.
2. Continue routine content/bugfix work directly on `main` per `AGENTS.md`.
3. Kick off the Astro migration (`dnb-astro-migration-project` skill) when ready;
   `TODO.md` currently marks this at "Step 4."

## Open clarification questions

- None currently.
