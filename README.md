<!-- markdownlint-disable-next-line title-case-style -->
# samui-samui.de

Website source and long-running content archive for [samui-samui.de](https://samui-samui.de), Patrick Kollitsch's German-language site about life on Koh Samui and Thailand. The project is built as a static Astro site, with small focused tools for archive maintenance, content validation, search indexing, and Netlify deployment, so old posts can keep working while the site can still be changed with confidence.

* **Static by default.** Astro builds the public site to `dist/`, and Netlify serves it with checked-in headers, redirects, and one contact-form function.
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

* `src/content/leute/**/_index.md`
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
* Root files in [`documentation/`](documentation/) document repository processes such as deployment, link checking, local development, and quality gates.

When a feature changes, update the matching documentation file in the same change set.

---

## Deployment

Production is hosted on Netlify at [samui-samui.de](https://samui-samui.de). The checked-in [`netlify.toml`](netlify.toml) defines the build command, publish directory, functions directory, and security headers.

`npm run deploy` is the production deployment command. It prints production warnings, shows the current Netlify account, optionally runs `netlify switch`, runs checks, releases when local commits exist after the latest local tag, builds, and then runs `netlify deploy --prod --open`.

Read [Deployment](documentation/deployment.md) before using the deployment command. A production deploy can publish the current branch to the live website.

The contact form needs Resend and Cloudflare Turnstile environment variables. Keep secrets out of committed files.

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
* `npm run deploy` runs the guarded production Netlify deployment sequence.

See [Quality gates](documentation/quality-gates.md), [Link checking](documentation/link-checking.md), and [Deployment](documentation/deployment.md) for the longer explanations.
