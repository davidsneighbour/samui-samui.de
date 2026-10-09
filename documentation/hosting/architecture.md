# Hosting architecture

This document explains where each request to samui-samui.de runs, what gets cached, and why the hosting is built this way. Commands and configuration are in [Deployment](deployment.md), the cache policy in [Caching and invalidation](caching.md), and the DNS cutover from Netlify in [Migration from Netlify](migration.md).

```text
                               +------------------------+
                               | Cloudflare             |
visitor ---------------------->| DNS + CDN/cache        |
                               |                        |
                               | /api/* -> Worker       |
                               | everything else ->     |
                               | cached DreamHost site  |
                               +-----------+------------+
                                           |
                                           | cache miss
                                           v
                               +------------------------+
                               | DreamHost              |
                               | static Astro dist/     |
                               +------------------------+
```

## Where does a request execute?

| Request | Runs on | Cached? | Configured in |
| --- | --- | --- | --- |
| Any page (`/`, `/2005/01/connectivity/`, `/archiv/themen/politik/`, …) | Cloudflare edge; DreamHost Apache on a cache miss | Yes, at the edge (HTML edge TTL, see [caching](caching.md)) | `public/.htaccess` (headers), Cache Rule `samui_static_site_cache` |
| Fingerprinted build output (`/assets/<name>.<hash>.css` etc.) | Cloudflare edge; DreamHost on a miss | Yes, one year, `immutable` | `public/.htaccess` |
| Other static files (images, fonts, feeds, Pagefind index) | Cloudflare edge; DreamHost on a miss | Yes, 30 days at the edge, 1 day in browsers | `public/.htaccess` |
| Legacy redirects (`/tags/*`, `/leute/*`, `/taglines/`, …) and trailing-slash redirects | DreamHost Apache (`mod_rewrite`, `mod_dir`), then cached at the edge | Yes, 1 day at the edge | `public/.htaccess` |
| `/api/weather`, `/api/contact`, `/api/version` | Cloudflare Worker `samui-samui-api` | Not by the zone cache; the Worker caches weather data itself | `wrangler.jsonc`, `src/workers/api/` |
| `www.samui-samui.de/*` | Cloudflare redirect rule → `https://samui-samui.de/*` | — | `src/scripts/deploy/cache-rules.ts` |

DreamHost never executes code for visitors. It serves files from the `dist/` directory that `astro build` produced locally or in CI. The Worker never serves pages. Static and dynamic paths are separate, and each has a single owner.

## The three layers

**Origin (DreamHost).** The single source of the static site. It holds complete releases of `dist/` and serves them with Apache. The origin decides *what a response is* (status, body, redirects, security headers) and *how long it may be cached* (`Cache-Control` for browsers, `Cloudflare-CDN-Cache-Control` for the edge, `Cache-Tag` for purging), because those headers live in `public/.htaccess`, versioned with the site.

**CDN cache (Cloudflare).** Stores origin responses in Cloudflare data centres near visitors. A cache hit never reaches DreamHost. The Cache Rules only decide *that* the static site (including HTML) is eligible for caching; the TTLs come from the origin headers.

**Worker (Cloudflare Workers).** A small program that answers `/api/*` itself. It runs in front of the cache for its route, so the zone cache never stores API responses. It handles the contact form (Turnstile + Resend) and the weather proxy (Open-Meteo, cached per data centre with the Workers Cache API).

<!-- markdownlint-disable-next-line dnb-title-case-style -->
## Why Netlify was replaced

Netlify worked well technically: static pages were served close to visitors from its CDN. The problem was its credit-based pricing and this site's deployment volume. samui-samui.de has two decades of archive (about 2,800 HTML pages, 7,600 files, 590 MB of build output), and site-wide development regularly changes shared components (header, footer, layouts, metadata). Each such change rebuilds essentially every page, and each production deploy cost credits.

<!-- markdownlint-disable-next-line dnb-title-case-style -->
## Why DreamHost is the static origin

DreamHost is already paid for and is conventional filesystem hosting: no file-count ceiling, no per-deploy cost, and rsync over SSH works. Cloudflare Workers Static Assets was considered and rejected for this site because the archive keeps growing and it would depend on the Workers Static Assets file-count limit. Smaller sites can use it; this one should not.

The cost is origin latency: one shared-hosting server (the server name `iad1-shared-e1-08.dreamhost.com` suggests the Ashburn, Virginia data centre) answers more slowly than Netlify's edge, especially for visitors in Europe and Asia. Cloudflare HTML caching hides that latency.

<!-- markdownlint-disable-next-line dnb-title-case-style -->
## Why Cloudflare caches HTML

Without a Cache Rule, Cloudflare caches only static file extensions (images, CSS, JS) and passes every HTML request through to DreamHost. Putting Cloudflare DNS in front of DreamHost alone would therefore make every page view pay DreamHost latency. Because the whole site is pre-rendered, HTML is as safe to cache as any asset. Edge-caching HTML is therefore a requirement of this architecture:

```text
browser
  -> Cloudflare edge
       -> cache HIT: return immediately
       -> cache MISS: fetch from DreamHost
                         -> cache response
                         -> return response
```

A cold cache shows DreamHost latency once per page per Cloudflare data centre. A warm cache behaves like conventional CDN hosting.

<!-- markdownlint-disable-next-line dnb-title-case-style -->
## Why `/api/*` is a Worker

The two dynamic features (contact form, weather) need secrets and server-side logic, which a static origin cannot provide. A Worker route (`samui-samui.de/api/*`) handles exactly these paths while every other path keeps going to the cache and DreamHost. The Worker is deliberately *not* the origin for the whole site: putting every page request through a Worker would add cost and a failure point without benefit.

<!-- markdownlint-disable-next-line dnb-title-case-style -->
## What gets deployed when you change X

| You change… | Built | Uploaded to DreamHost | Worker | Cache invalidation |
| --- | --- | --- | --- | --- |
| One post | Yes | Only changed files (rsync checksums) | Skipped (hash unchanged) | Selective: the changed pages (post, home, pagination, archive, taxonomies, feeds, sitemap) by URL |
| Header/footer/layout/typography/metadata | Yes | Nearly every HTML file | Skipped | Broad: one purge of the `html` cache tag; `/assets/` stays cached |
| `public/.htaccess` (headers, redirects, TTLs) | Yes | `.htaccess` | Skipped | Broad: `html` and `static` tags |
| `src/workers/api/**` or `wrangler.jsonc` | Use `npm run deploy:worker` | Nothing | Deployed | None needed (the zone cache never stores API responses) |

## Development phase and steady state

**Current phase (heavy site-wide development).** Many deploys change shared templates, so most deploys purge the `html` tag and many pages are cold afterwards. The first visitor to a rarely read archive page then waits for DreamHost once. This is accepted: the current priority is simple, predictable deploys, not keeping every page warm. The HTML edge TTL is one day.

**Steady state (mostly content deploys).** Deploys change one post and its listing pages; the automatic purge planner purges only those URLs, and everything else stays warm. Raise the HTML edge TTL in `public/.htaccess` to seven days and optionally warm the changed pages. Moving to the steady state is a configuration change (`.htaccess` TTL, `DEPLOY_PURGE_MODE`, `CACHE_PURGE_HTML_URL_LIMIT`), not another migration.

## Known constraints

* **Cloudflare plan limits.** Purge requests: up to 100 URLs or tags per request; tag/prefix/everything purges are limited to 5 requests per minute on the Free plan, URL purges to 800 URLs per second. The deploy tooling batches accordingly.
* **Per-data-centre caches.** Cloudflare caches are per data centre, and so is the Worker's Cache API. One warming crawl warms only the data centre nearest to the machine that runs it.
* **DreamHost shared hosting.** No Node at runtime (not needed), Apache 2.4 with `.htaccess`, SSH key authentication for the site user. The web directory must be a symlink for atomic releases (verified on a Debian Apache 2.4 + `SymLinksIfOwnerMatch` simulation; confirm on DreamHost during the first deployment).
* **Deterministic builds.** Selective purging needs unchanged pages to build to identical bytes. Components must not emit random or time-based values into HTML (see [caching](caching.md#deterministic-builds)).
* **Direct access to the origin (accepted risk).** DreamHost does not restrict who may connect. A request to the bare IP (`https://173.236.199.86/`) without a matching host name gets DreamHost's shared "Site not found" page. A request that sends `Host: samui-samui.de` to that IP (for example `curl --resolve samui-samui.de:443:173.236.199.86 …`) gets the real site straight from DreamHost, bypassing the Cloudflare cache, WAF, and rate limits (checked 2026-10-09). This is accepted because the origin serves only public static files, holds no secrets, and never sees `/api/*`. The remaining risk is extra load on DreamHost from someone who knows the IP. If that ever becomes a problem, there are two options: Cloudflare Authenticated Origin Pulls (DreamHost would have to require the Cloudflare client certificate, which needs Apache configuration that shared hosting may not allow), or an `.htaccess` allow-list of Cloudflare's IP ranges (needs updating when Cloudflare changes its ranges, and blocks the `curl --resolve` origin checks in the runbook).
* **Worker scope.** Worker logs are in the Cloudflare dashboard (Workers → `samui-samui-api` → Logs) or `npx wrangler tail`.
