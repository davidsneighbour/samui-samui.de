<!-- markdownlint-disable-next-line title-case-style -->
# samui-samui.de

[![Netlify](https://img.shields.io/netlify/49963b4d-bb9f-411f-a9b8-521a5e3a2b42?color=%2300AD9F&logo=netlify&style=for-the-badge)](https://app.netlify.com/sites/samui-samui-de/deploys)[![GitHub issues](https://img.shields.io/github/issues-raw/davidsneighbour/samui-samui.de?logo=github&style=for-the-badge)](https://github.com/davidsneighbour/samui-samui.de/issues) ![LasCHanges](https://img.shields.io/github/last-commit/davidsneighbour/samui-samui.de?color=%23ff7700&logo=github&style=for-the-badge) [![Codacy Badge](https://img.shields.io/codacy/grade/1aa52a19ae5b42efa80f04157a29ae8d?logo=codacy&style=for-the-badge)](https://www.codacy.com/gh/davidsneighbour/samui-samui.de/dashboard) ![License](https://img.shields.io/github/license/davidsneighbour/samui-samui.de?logo=github&style=for-the-badge) [![Gitter Chatroom](https://img.shields.io/gitter/room/dnb-org/community?color=%23ed1965&logo=gitter&style=for-the-badge)](https://gitter.im/dnb-org/community) ![Latest Version](https://img.shields.io/github/v/tag/davidsneighbour/samui-samui.de?color=%23ed1965&label=Release&logoColor=%23ffffff&sort=semver&style=for-the-badge)

Website and content for [samui-samui.de](https://samui-samui.de).

* [Architecture](#architecture)
* [Setup](#setup)
  * [Local `.env`](#local-env)
  * [Netlify deployment, DNS, and functions](#netlify-deployment-dns-and-functions)
  * [Turnstile captcha](#turnstile-captcha)
  * [Resend email sending](#resend-email-sending)
  * [Giscus comments](#giscus-comments)
* [Local commands](#local-commands)
  * [Astro and site commands](#astro-and-site-commands)
  * [Quality gates](#quality-gates)
  * [Content helpers](#content-helpers)
  * [Generated package maintenance](#generated-package-maintenance)
  * [Release commands](#release-commands)
  * [Lifecycle scripts](#lifecycle-scripts)

## Architecture

This is a quiet, sturdy little static site: [Astro 7](https://astro.build/)
builds the pages, [Tailwind CSS 4](https://tailwindcss.com/) carries the design
system, and [Netlify](https://www.netlify.com/) hosts the production site,
deploy previews, headers, DNS, and serverless functions.

The content layer is Astro content collections, with long-form posts in
Markdown and [MDX](https://mdxjs.com/) where richer components are useful.
[React 19](https://react.dev/) is available for interactive islands and email
templates, while icons come from [Lucide](https://lucide.dev/) and
[Iconify](https://iconify.design/). Search is generated at build time with
[Pagefind](https://pagefind.app/), comments are handled by
[Giscus](https://giscus.app/), contact-form bot protection uses
[Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/), and mail
delivery goes through [Resend](https://resend.com/).

The maintenance tools are intentionally boring in the best possible way:
[Biome](https://biomejs.dev/) for code formatting and linting,
[markdownlint](https://github.com/DavidAnson/markdownlint) for Markdown,
[cspell](https://cspell.org/) for optional spell checks,
[Wireit](https://github.com/google/wireit) for generated-package maintenance,
and [release-it](https://github.com/release-it/release-it) for releases.

## Setup

This site is a static Astro build with one Netlify Function for the contact
form. Complete the manual setup below before a production deploy through
Netlify, the Netlify CLI, or any future `npm run deploy` wrapper. The current
`package.json` does not define a `deploy` script.

### Local `.env`

Create a local `.env` file for contact-form testing. The file is ignored by Git
and must never be committed. Mirror the same keys in the Netlify dashboard for
production and deploy previews that should send real email.

Required variables:

| Variable | Used by | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | Netlify Function | Secret token from the [Resend API Keys dashboard](https://resend.com/api-keys). Use a sending-scoped key when possible. |
| `CONTACT_EMAIL_FROM` | Netlify Function | Verified sender address in Resend, usually on the `samui-samui.de` sending domain. |
| `CONTACT_EMAIL_TO` | Netlify Function | Recipient address for contact form submissions. |
| `TURNSTILE_SECRET` | Netlify Function | Private secret from the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile). |
| `TURNSTILE_SITE_KEY` | Astro build | Public site key from the same Turnstile widget. Astro renders it into the contact form. |

Optional variables:

| Variable | Default | Notes |
| --- | --- | --- |
| `CONTACT_EMAIL_BCC` | none | Comma-separated BCC recipients. |
| `CONTACT_EMAIL_SUBJECT_PREFIX` | `Samui? Samui!` | Prefix for contact notification subjects. |
| `CONTACT_EMAIL_TIMEZONE` | `Asia/Bangkok` | IANA time zone for timestamps in notification emails. |

Use `npm run dev` for the static Astro site. Use Netlify CLI's `netlify dev`
when the contact form itself needs to run locally with the Netlify Function.

### Netlify deployment, DNS, and functions

The connected Netlify site is
[samui-samui-de](https://app.netlify.com/sites/samui-samui-de/overview). The
checked-in `netlify.toml` defines the production build:

* Build command: `npm run build`
* Publish directory: `dist`
* Functions directory: `netlify/functions`

Manual Netlify checks before production deploys:

1. Link the local checkout to the existing Netlify site with `netlify link`, or
   authenticate the CLI with `netlify login`. For non-interactive use, create a
   Netlify personal access token under
   [Applications > Personal access tokens](https://app.netlify.com/user/applications#personal-access-tokens)
   and expose it locally as `NETLIFY_AUTH_TOKEN`.
2. Confirm deploy settings in the
   [Netlify deploys dashboard](https://app.netlify.com/sites/samui-samui-de/deploys)
   and keep them aligned with `netlify.toml`.
3. Configure production domains, DNS records, HTTPS, and redirects in
   [Netlify domain management](https://app.netlify.com/sites/samui-samui-de/domain-management).
   If using Netlify DNS, copy existing records such as mail records before
   delegating nameservers.
4. Add the environment variables in
   [Netlify environment variables](https://app.netlify.com/sites/samui-samui-de/configuration/env).
   `TURNSTILE_SITE_KEY` must be available to Builds. `RESEND_API_KEY`,
   `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`, `TURNSTILE_SECRET`, and the optional
   contact-email variables must be available to Functions. If the UI does not
   require explicit scopes, using all scopes is fine.
5. After changing environment variables, trigger a fresh deploy so the build-time
   site key and runtime function secrets are both current.
6. Inspect the
   [Netlify Functions dashboard](https://app.netlify.com/sites/samui-samui-de/functions)
   after deployment and submit one real contact-form test from `/kontakt/`.

### Turnstile captcha

Create one Turnstile widget in the
[Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
for `samui-samui.de`. Use Managed mode unless there is a specific reason to
change it, add the production hostname, and add preview/local hostnames only if
those environments need end-to-end form tests. Copy the widget's site key to
`TURNSTILE_SITE_KEY` and its secret key to `TURNSTILE_SECRET`.

The contact form loads Turnstile only when `TURNSTILE_SITE_KEY` exists. The
Netlify Function still requires `TURNSTILE_SECRET` and rejects submissions whose
Turnstile token cannot be verified.

### Resend email sending

Set up the sending domain or sender identity in the
[Resend dashboard](https://resend.com/domains), then create the production API
key in the [Resend API Keys dashboard](https://resend.com/api-keys). The sender
configured as `CONTACT_EMAIL_FROM` must be allowed by Resend, and
`CONTACT_EMAIL_TO` should be the mailbox that receives site enquiries.
If Resend asks for DNS records to verify the sending domain, add them in Netlify
DNS or the current authoritative DNS provider before deploying.

After the first production deploy with these variables, send one contact-form
message and verify both the browser success state and the delivered email.

### Giscus comments

`giscus.json` contains the allowed server names/origins where Giscus may load
for this repository, including the production domain and the local development
hostnames used by this project.

Manual Giscus checks before production deploys:

1. Enable GitHub Discussions for `davidsneighbour/samui-samui.de`.
2. Create or confirm the dedicated `Kommentare` discussion category. It must be
   its own category with the category type set to `Announcements`.
3. Install or confirm the [giscus GitHub App](https://github.com/apps/giscus) for
   `davidsneighbour/samui-samui.de`.
4. Confirm `src/components/Giscus.astro` still matches the public repository,
   `Kommentare` category, category ID, and pathname mapping expected by the
   widget.
5. Keep `giscus.json` aligned with the production and local hostnames that
   should be allowed to load comments.

## Local commands

Run `npm install` once after cloning, changing Node versions, or updating
dependencies. The install also runs `prepare`, which installs the Git hooks.
`package.json` is generated from `src/packages/**/*.jsonc`, so add or change
scripts in those fragments and regenerate rather than hand-editing the root
manifest.

There is currently no `npm run deploy` script. Production deploys go through
Netlify's connected build or the Netlify CLI once the setup above is complete.

### Astro and site commands

| Command | Details |
| --- | --- |
| `npm run astro -- <args>` | Direct Astro CLI passthrough for ad hoc subcommands. |
| `npm run astro:check` | Type/content diagnostics only; no build output. |
| `npm run dev` | Starts Astro dev with `--verbose`, so it is chattier than plain `astro dev`. |
| `npm run dev:verbose` | Adds `DEBUG_FRONTMATTER=true` to the already verbose dev server. |
| `npm run build` | Runs `astro check` first, then `astro build --verbose`; the build integration also creates the Pagefind index. |
| `npm run preview` | Serves the built `dist` output locally. |
| `npm run upgrade` | Interactive Astro upgrade helper; respect the Astro version constraints in `AGENTS.md`. |

### Quality gates

| Command | Details |
| --- | --- |
| `npm run check` | Non-mutating full gate: formatting check, code lint, and Markdown lint. |
| `npm run format:check` | Biome formatting check only; no writes. |
| `npm run format` | Writes Biome formatting changes across the repo. |
| `npm run lint` | Non-mutating code and Markdown lint. |
| `npm run lint:code` | Biome lint only; no writes. |
| `npm run lint:code:fix` | Applies Biome's safe lint fixes. |
| `npm run lint:markdown` | Markdownlint with the shared `@dnbhq` config; excludes `CHANGELOG.md` and configured archive/output paths. |
| `npm run lint:markdown:fix` | Applies automatic Markdown fixes. |
| `npm run lint:fix` | Applies both code and Markdown autofixes. |
| `npm run lint:spell` | Cspell content check; separate from `check`, pre-commit, and pre-push. |
| `npm run lint:staged` | Staged-file gate used by the pre-commit hook. |

### Content helpers

| Command | Details |
| --- | --- |
| `npm run blog:new` | Prompts for title/tags, creates `src/content/posts/YYYY/<slug>/index.md`, and opens VS Code unless `--no-open` is passed. |
| `npm run publisher -- <command>` | Manages repo-internal `publisher.*` frontmatter queues; `set`/`unset` require an explicit filter. |

### Generated package maintenance

| Command | Details |
| --- | --- |
| `npm run compile:package` | Regenerates `package.json` from `src/packages/**/*.jsonc`, then runs install/fixpack. |
| `npm run compile:package:install` | Wireit install phase; writes `node_modules` and can update `package-lock.json`. |
| `npm run compile:package:update` | Syncs dependency versions into `src/packages/**/*.jsonc` and reports script/Wireit drift. |
| `npm run compile:fixpack` | Normalizes package metadata during generation with tolerated fixpack failures. |
| `npm run clean` | Removes Astro/build caches through the internal `clean:astro` target. |
| `npm run clean:full` | Removes `node_modules`, `package-lock.json`, `.wireit`, and Astro/build caches. |
| `npm run icons:sync` | Currently fails because `src/scripts/create-icon-types.ts` is missing. |

### Release commands

| Command | Details |
| --- | --- |
| `npm run release` | Real `release-it` flow with changelog, version/tag, GitHub, and package metadata side effects. |
| `npm run release:dry` | Preview release output without Git/GitHub side effects. |
| `npm run release:force` | Release flow without a version increment. |
| `npm run release:major` | Forces a major version bump. |
| `npm run release:minor` | Forces a minor version bump. |
| `npm run release:patch` | Forces a patch version bump. |

### Lifecycle scripts

These scripts are normally run by npm or Git hooks rather than by hand:

| Command | Details |
| --- | --- |
| `npm run prepare` | Installs pre-commit and pre-push hooks from `package.json`. |
| `npm run postinstall:icons` | Runs `icons:sync`, so it currently inherits the missing helper-script failure. |

See `AGENTS.md` for the full command/architecture reference.
