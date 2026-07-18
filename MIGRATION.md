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
  migrated, Tailwind v4 + Biome tooling). **Adopted as the Astro Foundation
  base** (decision recorded in `PROJECT.md`, issue #689 closed). Its
  foundation builds cleanly, but it has no page routes for any content
  collection yet — that gap is scoped into issue #690. Do not treat the
  recovered branch as ready to deploy; it is a starting point, not a
  finished site.

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

## Manual setup required before deployment

These are operational steps outside the codebase — nothing here is committed
code, and none of it blocks continued migration work. Track completion by
checking items off directly in this file.

### Contact form (issue #702)

The Netlify Function at `netlify/functions/contact.mjs` is code-complete but
needs these Netlify environment variables set before it can send real mail:

* [ ] `RESEND_API_KEY` — from a [Resend](https://resend.com) account with a
      verified sending domain for `samui-samui.de`.
* [ ] `CONTACT_EMAIL_FROM` — the verified sending address (must be on the
      domain verified with Resend above).
* [ ] `CONTACT_EMAIL_TO` — where contact form submissions should land.
* [ ] `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SITE_SECRET` — a
      [reCAPTCHA v3](https://www.google.com/recaptcha/admin) key pair
      registered for `samui-samui.de`. The site key is public (embedded
      client-side in `ContactForm.astro`); the secret is server-only.
* [ ] Optional: `CONTACT_EMAIL_BCC` (comma-separated), `CONTACT_EMAIL_SUBJECT_PREFIX`,
      `CONTACT_EMAIL_TIMEZONE` (defaults to `Asia/Bangkok`).

Until these are set, the function responds with a clear error to submitters
rather than failing silently (see `envReady()` in `contact.mjs`).

### Comments / giscus (issue #704)

`src/components/Giscus.astro` is code-complete and wired into every post via
`BlogPost.astro`, adapted from `davidsneighbour/kollitsch.dev`'s reference
component. It is preconfigured for this repo:

* Repo: `davidsneighbour/samui-samui.de` (`repoId`
  `MDEwOlJlcG9zaXRvcnkxNjI5NzM3MTA=`).
* Category: `Kommentare` (`categoryId` `DIC_kwDOCbbIDs4DBbj1`).
* Mapping: `pathname` with strict matching disabled (`data-strict="0"`), so there
  is one discussion per post URL.
* Widget options: reactions enabled, emitted metadata enabled, input at the
  bottom, English UI, lazy loading, and the custom giscus theme URL generated by
  `giscus.app`.
* Origin allow-list: `giscus.json` permits `https://samui-samui.de` plus
  localhost/127.0.0.1 Astro dev origins on port 4321.

GitHub Discussions has been enabled on this repo (done, as part of this
work). What's still outside the codebase and requires the user's own GitHub
authorization:

* [ ] Install the [giscus GitHub App](https://github.com/apps/giscus) on
      `davidsneighbour/samui-samui.de`. Until this is done, the widget renders
      but giscus shows its own "app not installed" notice instead of a
      comment thread — it does not error or break the page.
* [x] Verified the repo/category IDs against [giscus.app](https://giscus.app/)
      and updated the local component to match the generated setup values.
* Deferred, tracked separately in `TODO.md`: migrating the existing Disqus
  comment export (`scratch/samui-samui-de-*-all.xml.gz`) into giscus
  discussions — not required for parity, since the old site's comments were
  never rendered as part of the static page content.

### Netlify deployment (issue #709)

`netlify.toml` currently only declares the build command and the functions
directory. No site has been connected/deployed yet as far as this repo's
tracking can tell — confirm the Netlify site itself still points at this repo
and deploys from `main`, and revisit whether headers/CSP are wanted (the
`thaicookingclass-samui.com` reference used for the contact form has an
example under its own `netlify.toml`, but its policy is specific to that
site's third-party scripts and shouldn't be copied verbatim).

## Tracking file review

Every material migration change MUST include a review of whether
`MIGRATION.md`, `MIGRATION.status.md`, `PROJECT.md`, `ROADMAP.md`, `TODO.md`,
`AGENTS.md`, or GitHub Issues need updates.
