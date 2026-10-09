# Deployment

How samui-samui.de is built and published to DreamHost, Cloudflare, and the API Worker. Background and reasoning are in [Hosting architecture](architecture.md) and [Caching and invalidation](caching.md).

## Commands

| Command | What it does |
| --- | --- |
| `npm run deploy` | Full deploy: checks, build, validate `dist/`, upload to DreamHost, Worker (only if changed), cache purge, smoke tests, warming, report. |
| `npm run deploy:site` | Same without the Worker step. |
| `npm run deploy:worker` | Deploys only the `/api/*` Worker, and only if its bundle or `wrangler.jsonc` changed (`--force` to deploy anyway). |
| `npm run deploy:releases` | Lists release directories on DreamHost (date, commit, live, rollback target) and deletes all non-live or selected ones ([managing releases](#managing-releases)). |
| `npm run deploy:site:rollback` | Switches the live site back to the previous release and purges `html` + `static` (`--list`, `--to=<release>`, `--no-purge`). |
| `npm run test:smoke` | Smoke tests against the live site (`--base-url=…`, `--no-cloudflare`, `--no-worker`). |
| `npm run cache:purge` | Manual purge, see [caching](caching.md#manual-invalidation). |
| `npm run cache:status -- <url>` | Shows `cf-cache-status`, `age`, `cache-control`, and TTFB for repeated requests. |
| `npm run cache:warm` | Warms high-value pages (`--url`, `--from-file`, `--sitemap`). |
| `npm run cache:rules` / `cache:rules:update` | Shows or applies the Cloudflare Cache Rules and the www redirect. |
| `npm run dev:worker` | Runs the Worker locally with `wrangler dev` (reads secrets from `.env`; the contact form then sends real email). |
| `npm run deploy:netlify[:production]` | Legacy Netlify deploy, kept only until the cutover is complete ([migration](migration.md)). |

Useful `deploy` flags: `--dry-run` (rsync dry run, nothing activated, purged, or deployed), `--yes` (no confirmation prompt; required in CI), `--skip-checks`, `--skip-build` (deploy the existing `dist/`), `--skip-worker`, `--force-worker`, `--purge=auto|html|urls|everything|none`, `--no-smoke`, `--no-warm`, `--release` (run `npm run release` first when there are commits after the latest tag), and `--adopt-docroot` (first deployment only).

## Pipeline

1. `npm run check` (format, lint, validate including the Worker types, tests).
2. `npm run build` (Astro, Pagefind, Ahrefs sample). The build runs exactly once, locally or in CI. DreamHost never builds.
3. Validate `dist/`: required files (`index.html`, `404.html`, `.htaccess`, `rss.xml`, `sitemap-index.xml`, Pagefind entry), at least 1,000 HTML pages, and a production canonical URL on the home page. A partial build is never uploaded.
4. Upload to DreamHost (see [atomic releases](#atomic-releases)).
5. Worker: bundle with `wrangler deploy --dry-run`, hash bundle + `wrangler.jsonc`, compare with the live `/api/version`, deploy only on a difference.
6. Purge the Cloudflare cache from the exact rsync change list ([modes](caching.md#cache-invalidation)).
7. Smoke tests ([below](#smoke-tests)). A failure sets a non-zero exit code; the site stays deployed so you can inspect it or roll back.
8. Warm high-value pages.
9. Report: generated file count and size, files uploaded and deleted, release, Worker deployed or skipped, invalidation mode and reason, purged tags and URLs, smoke-test result, duration.

Configuration is checked before anything is built: a missing `DREAMHOST_*` value or Cloudflare token stops the run at once, not after the site is already live.

## Atomic releases

The DreamHost web directory is a symlink to a complete release:

```text
/home/samuisamui/samui-samui.de/
  releases/
    20261009T083000Z-1aaaef2/
    20261010T101500Z-5d6e7f8/
  public -> releases/20261010T101500Z-5d6e7f8
```

Each deploy uploads into a new release directory with `rsync --checksum --link-dest=<live release>`. Unchanged files become hard links (no transfer, no extra disk space), so a content deploy transfers only a few files even though each release is complete. After the upload is verified (required files present, file count equals `dist/`), one `rename(2)` of a temporary symlink switches the site. During a deploy visitors never get HTML that refers to assets that are not uploaded yet. If anything fails before the switch, the new release directory is removed and the live site is unchanged. The newest `DREAMHOST_KEEP_RELEASES` (default 5) releases are kept for rollback.

Why atomic instead of rsync directly into the web directory: direct `rsync --delete` changes the live directory file by file for the length of the transfer (up to minutes for a template change), deletes old fingerprinted assets that cached HTML still references, and has no rollback. Hard-linked releases remove all three problems at almost no cost. `DREAMHOST_DEPLOY_STRATEGY=direct` is kept as a fallback if DreamHost ever refuses a symlinked web directory. The release mechanics (adopt, hard links, switch, prune, rollback) were tested end-to-end against a Debian container with sshd, rsync 3.5, and Apache 2.4 (`SymLinksIfOwnerMatch`), not yet against DreamHost itself.

DreamHost places a root-owned symlink `.dh-diag -> /dh/web/diag` (its PHP diagnostics) in the web directory. Atomic deploys recreate it in every new release, and direct deploys protect it from `--delete` (`PRESERVED_HOST_ENTRIES` in `src/scripts/deploy/lib/dreamhost.ts`).

Safety rules in the code: `DREAMHOST_PATH` must look like `/home/<user>/<site>/<web-dir>` (absolute, at least four levels, only `[A-Za-z0-9._/-]`, inside the configured user's home); release names must match `YYYYMMDDTHHMMSSZ-<sha>`; only directories with such names are ever removed.

Uploads use `--checksum` and `--no-times`: rsync decides by content, and unchanged files keep their previous modification time. File times must not be preserved. `--link-dest` only hard-links a file when all preserved attributes match, and every Astro build gives every file a new modification time, so preserving times turned each release into a full copy (about 600 MB each on DreamHost before this was fixed on 2026-10-09).

### Managing releases

```bash
npm run deploy:releases                                   # list, then choose interactively
npm run deploy:releases -- --list                         # list only
npm run deploy:releases -- --delete-inactive --yes        # delete everything except the live release
npm run deploy:releases -- --delete=20261009T092222Z-a236e80 --yes
```

The list shows each release newest first, with the upload time (local time zone), the git commit, and markers for the **LIVE** release, the **rollback target** (the release `deploy:site:rollback` would switch to), the adopted original web directory, and builds with uncommitted changes. It also shows the disk use of the whole releases directory, with hard links counted once. In the interactive prompt, answer `a` for every release except the live one, numbers or ranges such as `2,4` or `3-5`, or press Enter to delete nothing. The live release can never be deleted. Deleting the rollback target prints a warning, because rollback then has no previous release. Deploys already prune automatically to the newest `DREAMHOST_KEEP_RELEASES`; this command is for cleaning up by hand.

### First deployment

On a fresh DreamHost site, the web directory is a plain directory. The first deploy refuses to touch it unless you pass `--adopt-docroot`, which moves the existing directory to `releases/<timestamp>-adopted` (nothing is deleted) and replaces it with a symlink:

```bash
npm run deploy:site -- --adopt-docroot --purge=none
```

### Rollback

```bash
npm run deploy:site:rollback -- --list        # * marks the live release
npm run deploy:site:rollback                  # previous release, asks for confirmation
npm run deploy:site:rollback -- --to=20261009T083000Z-1aaaef2 --yes
```

Rollback switches the symlink and purges the `html` and `static` tags. Fingerprinted assets need no purge, because the old release contains the assets its HTML references. To roll back the Worker, use `npx wrangler rollback` (Wrangler keeps previous versions). To roll back the whole hosting move, see [migration](migration.md#rollback).

## Secrets and configuration

Local values live in a git-ignored `.env` in the project root (template: [`.env.example`](../../.env.example)); the deploy scripts load it automatically. Nothing secret or machine-specific is committed.

| Name | Where | Purpose |
| --- | --- | --- |
| `DREAMHOST_HOST` | `.env` | Server name or SSH config alias (locally `samuisamui`). |
| `DREAMHOST_USER` | `.env` | SSH user (empty when the alias sets it). |
| `DREAMHOST_PATH` | `.env` | Web directory, `/home/samuisamui/samui-samui.de/public`. |
| `DREAMHOST_DEPLOY_STRATEGY`, `DREAMHOST_KEEP_RELEASES`, `DREAMHOST_SSH_CONFIG` | `.env` (optional) | Strategy, retention, alternative ssh_config. |
| `CLOUDFLARE_API_TOKEN` | `.env` | Deploy token, see below. |
| `CLOUDFLARE_ACCOUNT_ID` | `.env` | Account for `wrangler deploy`. |
| `CLOUDFLARE_ZONE_ID` | `.env` (optional) | Skips the zone lookup (then Zone:Read is not needed). |
| `TURNSTILE_SITE_KEY` | `.env` | Public site key, rendered into the contact form at build time. |
| `DEPLOY_PURGE_MODE`, `CACHE_PURGE_HTML_URL_LIMIT` | `.env` (optional) | Invalidation defaults. |
| `RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_BCC` | Worker secrets | Set once with `npx wrangler secret put <NAME>`; `wrangler.jsonc` lists the required ones. |

### Cloudflare API token

Create one custom token (**My Profile → API Tokens → Create Token → Custom token**) restricted to the account and to the zone `samui-samui.de`:

* Zone → Cache Purge → Purge
* Zone → SSL and Certificates → Edit (only to create the Origin CA certificate)
* Zone → Cache Rules → Edit
* Zone → Single Redirect → Edit
* Zone → Workers Routes → Edit
* Zone → Zone → Read
* Account → Workers Scripts → Edit
* Account → Account Rulesets → Edit
* Account → Account Filter Lists → Edit

The Workers permissions are a minimal subset of Cloudflare's **Edit Cloudflare Workers** token template. This subset is not yet verified against a real `wrangler deploy`. If Wrangler reports a missing permission, add **Account → Account Settings → Read** and **User → Memberships → Read** from that template. The Cache Rules and Single Redirect permissions are only needed for `npm run cache:rules:update`. You can keep them in a separate token that you use only when you change rules. For the MCP server, see [Cloudflare MCP](cloudflare-mcp.md).

## Where deploys run

Deploys run from the maintainer's terminal only. There is no CI deployment: the GitHub Actions workflow drafted during the migration was removed on 2026-10-09, because a second deploy path would need its own SSH key and Cloudflare token for no practical gain. Builds happen exactly once, locally, and DreamHost never builds.

## Smoke tests

`npm run test:smoke` (also run after every deploy) checks:

* home, newest post (from `rss.xml`), oldest post, `/archiv/`, `/archiv/2005/`, `/seite/2/`, a taxonomy page, and `/kontakt/`: status 200, `text/html`, canonical URL equals the request URL, CSP and `nosniff` present, and (in production) `cf-ray` and `cf-cache-status` present but `Cache-Tag` and `Cloudflare-CDN-Cache-Control` not visible to visitors;
* a random missing URL returns the 404 page with status 404;
* `rss.xml` and `sitemap-index.xml` return XML;
* the CSS and JS from `/assets/` that the home page references return 200 with `immutable`, plus an image;
* trailing-slash and historical redirects (`/kontakt` → `/kontakt/`, `/taglines/` → `/iumas/`, `/tags/` → `/archiv/themen/`, `/themen/politik/` → `/archiv/themen/politik/`, `/leute/` → `/archiv/personen/`) are 301 with the expected target and scheme;
* `/api/version` is answered by the Worker (JSON `worker: samui-samui-api`), `/api/weather` returns JSON, and `GET /api/contact` returns 405 with `Allow: POST`. This proves `/api/*` does not reach DreamHost.

To check an origin directly, for example a local Apache serving `dist/`: `npm run test:smoke -- --base-url=http://127.0.0.1:8090 --no-worker`.
