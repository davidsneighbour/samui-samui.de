# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Full project instructions — architecture, commands, working rules, GitHub issue/label
conventions, and the Hugo version pin — live in [AGENTS.md](AGENTS.md). Read that
file first; it applies to every agent working in this repo, not just Claude Code.

## Claude Code specific notes

- The `dnb-astro-migration-project` skill governs the eventual Hugo → Astro
  migration referenced in `TODO.md`; do not start that migration ad hoc without
  invoking it.
- The `dnb-project-task-triage` skill governs `ROADMAP.md`/`TODO.md` reconciliation
  against GitHub Issues; use it instead of hand-editing `ROADMAP.md`.
- The `dnb-site-audit` skill is appropriate for launch-readiness / technical-SEO /
  accessibility review of https://samui-samui.de or a local preview.
