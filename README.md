<!-- markdownlint-disable-next-line dnb-title-case-style -->
# samui-samui.de

Website source and long-running content archive for [samui-samui.de](https://samui-samui.de), Patrick Kollitsch's German-language site about life on Koh Samui and Thailand. The project is built as a static Astro site, with small focused tools for archive maintenance, content validation, search indexing, and deployment, so old posts can keep working while the site can still be changed with confidence.

* **Static by default.** Astro builds the public site to `dist/`. DreamHost serves it as a plain static origin behind the Cloudflare cache, and a small Cloudflare Worker handles `/api/*` (contact form, weather).
* **Archive-aware.** Posts live in `src/content/posts/**/index.md`, with separate collections for people, places, events, and topics.
* **Strict where it matters.** `npm run check` combines Biome formatting, Biome linting, markdownlint, content validation, taxonomy validation, and Vitest.
* **Documented operations.** Feature and process notes live under [`documentation/`](documentation/index.md), rather than being hidden in scripts.
* **Generated package manifest.** `package.json` is generated from `src/packages/**/*.jsonc`; edit fragments and run `npm run compile:package` instead of hand-editing the root manifest.

---

## Quick example

Create a new post, validate content, and run the full confidence gate:

```bash
npm run blog:new
npm run validate
npm run check
```

---

## Contents

* [Getting started](#getting-started)
* [Daily workflow](#daily-workflow)
* [Content model](#content-model)
* [Documentation](#documentation)
* [Deployment](#deployment)
* [Important commands](#important-commands)

---

## Getting started

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Start the site and the local documentation server:

   ```bash
   npm run dev
   ```

3. Open the local services:

   * Astro site: use the URL printed by `npm run dev`.
   * Documentation browser: [http://127.0.0.1:4322/](http://127.0.0.1:4322/).

4. Before handing off changes, run:

   ```bash
   npm run check
   ```

The install step also runs `prepare`, which installs the Git hooks used by this repository.

---

## Daily workflow

Use `npm run dev` for normal editing. It starts the Astro site and the lightweight documentation server together. Use `npm run dev:site` when only the public site is needed, and `npm run dev:docs` when only the documentation browser is needed.

Use `npm run build` to validate and build production output. Use `npm run preview` after a build to inspect the generated `dist/` output locally.

Use `npm run lint:markdown:fix` or `npm run lint:fix` only when a broad cleanup is intended. Markdown prose in this repository should stay on natural lines; it must not be hard-wrapped to 80 characters.

---

## Content model

Astro collections are defined in [`src/content.config.ts`](src/content.config.ts). Blog posts live as `src/content/posts/**/index.md`. People, places, events, and topics live in these German-named collections:

* `src/content/personen/**/_index.md`
* `src/content/orte/**/_index.md`
* `src/content/ereignisse/**/_index.md`
* `src/content/themen/**/_index.md`

Posts can use optional `publisher.*` frontmatter for internal editorial queues. Manage that metadata with `npm run publisher -- <command>` instead of hand-editing many files.

Post dates use Thailand time. New or edited `date` and `lastmod` values should use `YYYY-MM-DDTHH:mm:ss+07:00`.

See the focused content docs for details:

* [Frontmatter variables](documentation/content/frontmatter-variables.md)
* [Post paths](documentation/content/post-paths.md)
* [Post metadata](documentation/content/post-metadata.md)
* [Content taxonomies](documentation/content/taxonomies.md)
* [Publisher frontmatter](documentation/content/publisher-frontmatter.md)

---

## Documentation

The documentation tree is the operating manual for this site. Start with [`documentation/index.md`](documentation/index.md).

Main sections:

* [`documentation/components/`](documentation/components/) documents reusable rendering surfaces such as post covers, notices, embeds, tooltips, comments, and the masthead.
* [`documentation/content/`](documentation/content/) documents editorial contracts, frontmatter, post paths, citations, dates, and taxonomies.
* [`documentation/features/`](documentation/features/) documents user-facing features such as search, archive browsing, maps, the contact form, and the weather widget.
* [`documentation/hosting/`](documentation/hosting/) documents the hosting architecture, caching, deployment, and the migration from Netlify.
* Root files in [`documentation/`](documentation/) document repository processes such as link checking, local development, and quality gates.

When a feature changes, update the matching documentation file in the same change set.

---

## Deployment

Production runs on three layers: DreamHost serves the static `dist/` output, Cloudflare caches pages and assets in front of it, and the Cloudflare Worker `samui-samui-api` answers `/api/*`. [Hosting architecture](documentation/hosting/architecture.md) explains why.

`npm run deploy` runs checks, builds once, uploads the build to DreamHost as an atomic release (rsync over SSH), deploys the Worker only when its code changed, purges exactly the changed pages from the Cloudflare cache (or every page after a global template change), and runs smoke tests. `npm run deploy:site` skips the Worker, and `npm run deploy:worker` deploys only the Worker. Configuration and secrets live in a git-ignored `.env` (see `.env.example`) and in Worker secrets. They are never committed.

Production moved from Netlify to this setup on 9 October 2026; [Migration from Netlify](documentation/hosting/migration.md) records the cutover and the rollback path.

---

## Important commands

* `npm run dev` starts the site and documentation server for local editing.
* `npm run dev:site` starts only Astro.
* `npm run dev:docs` starts only the documentation browser.
* `npm run build` validates, builds the static site, creates Pagefind output, and writes the Ahrefs audit sample.
* `npm run preview` serves the built `dist/` output.
* `npm run check` runs the complete non-mutating quality gate.
* `npm run format:check` checks Biome formatting.
* `npm run format` applies Biome formatting.
* `npm run lint` runs Biome, markdownlint, and German umlaut entity checks.
* `npm run lint:markdown` checks Markdown with the shared DNBHQ markdownlint rules.
* `npm run lint:links` checks content links with the local Lychee wrapper.
* `npm run lint:umlauts` checks German umlaut HTML entities.
* `npm run test` runs Vitest.
* `npm run test:e2e` runs Playwright.
* `npm run validate` runs Astro content validation and taxonomy validation.
* `npm run publisher -- <command>` manages internal archive-maintenance metadata.
* `npm run covers -- <command>` audits or migrates post cover metadata.
* `npm run compile:package` regenerates `package.json` from package fragments and refreshes install state.
* `npm run deploy` runs the full DreamHost + Cloudflare deployment; `deploy:site` and `deploy:worker` deploy one part.
* `npm run cache:status -- <url>` shows how Cloudflare served a URL; `cache:purge` and `cache:warm` invalidate or warm pages manually.
* `npm run test:smoke` checks the live site's pages, redirects, assets, and API routes.

See [Quality gates](documentation/quality-gates.md), [Link checking](documentation/link-checking.md), and [Deployment](documentation/hosting/deployment.md) for the longer explanations.
