# Caching and invalidation

How samui-samui.de is cached at the Cloudflare edge and in browsers, how deploys invalidate that cache, and why the numbers are what they are. The overall picture is in [Hosting architecture](architecture.md).

## Policy

The origin sends every caching decision as headers from [`public/.htaccess`](../../public/.htaccess). Cloudflare reads `Cloudflare-CDN-Cache-Control` (and does not pass it on to visitors); browsers read `Cache-Control`. This keeps edge and browser lifetimes independent: a page can stay at the edge for a day while browsers revalidate on every visit.

| Response | Browser `Cache-Control` | Edge `Cloudflare-CDN-Cache-Control` | `Cache-Tag` |
| --- | --- | --- | --- |
| HTML pages (200) | `public, max-age=0, must-revalidate` | `public, max-age=86400, stale-while-revalidate=3600, stale-if-error=604800` | `html` |
| Redirects (3xx) | `public, max-age=3600` | `public, max-age=86400` | `html` |
| Errors (4xx/5xx, including the 404 page) | `public, max-age=0, must-revalidate` | `public, max-age=300` | `html` |
| `/assets/<file>` (Astro build output with content hash) | `public, max-age=31536000, immutable` | same | `immutable` |
| Other static files (images, fonts, feeds, sitemaps, Pagefind index, `/assets/<subdir>/…` from `public/`) | `public, max-age=86400` | `public, max-age=2592000` | `static` |
| Giscus theme CSS | `public, max-age=3600` | `public, max-age=2592000` | `static` |
| `/api/*` | Set by the Worker (weather: `max-age=0, must-revalidate`; errors and contact: `no-store`) | Never cached by the zone (Worker runs first; bypass rule as safety net) | — |

Before the migration, Netlify served every file, including fingerprinted assets, with `public, max-age=0, must-revalidate` (checked on 2026-10-09).

<!-- markdownlint-disable-next-line dnb-title-case-style -->
### Why these TTLs

* **HTML edge TTL: 1 day now, 7 days later.** Every deploy purges changed HTML, so the TTL is not what makes new content appear. It limits two things: how often DreamHost serves an unchanged page again, and how long a page can stay stale if a purge fails. During the current development phase, purges are frequent and broad, and one day keeps the effect of a missed purge small. In the steady state (content deploys with reliable selective purges), seven days keeps rarely read archive pages warm much longer. To change it, edit `max-age` in the HTML rule of `public/.htaccess`. Nothing in Cloudflare needs to change.
* **`stale-while-revalidate=3600`.** When a page's edge copy expires, Cloudflare can serve the expired copy for up to an hour while it fetches a fresh one, so visitors do not wait for DreamHost on expiry.
* **`stale-if-error=604800`.** If DreamHost is down or slow, Cloudflare keeps serving cached pages for up to a week.
* **Browser HTML: revalidate every time.** Browsers must never keep an old page by themselves after a deploy. Revalidation is cheap: Cloudflare answers the conditional request from its cache.
* **Redirects: 1 day at the edge, 1 hour in browsers.** They are stable, but a short browser lifetime lets a mistaken redirect be corrected. (Browsers may still cache `301` responses permanently.)
* **Errors: 5 minutes at the edge.** A URL that returns 404 now may be published later. A new post's URL is also purged explicitly on deploy.
* **`/assets/` build output: one year, immutable.** Astro puts a content hash in these file names, so a changed file always gets a new URL. They never need purging. Only top-level files in `/assets/` qualify; files from `public/assets/` sit in sub-directories and get the static policy.
* **Other static files: 30 days at the edge, 1 day in browsers.** They keep their URL when they change, so deploys purge changed ones by URL. Browsers may hold them for up to a day.

<!-- markdownlint-disable-next-line dnb-title-case-style -->
## Cloudflare Cache Rules

Defined as code in [`src/scripts/deploy/cache-rules.ts`](../../src/scripts/deploy/cache-rules.ts). Check them with `npm run cache:rules` (read-only diff) and apply them with `npm run cache:rules:update`. The rules this repository owns have a `ref` that starts with `samui_`. Rules created by hand in the dashboard are kept.

| Ref | Phase | Expression | Action |
| --- | --- | --- | --- |
| `samui_static_site_cache` | Cache Rules | `(http.host eq "samui-samui.de") and not starts_with(http.request.uri.path, "/api/")` | Eligible for cache; Edge TTL and Browser TTL: respect origin |
| `samui_api_bypass` | Cache Rules | `(http.host eq "samui-samui.de") and starts_with(http.request.uri.path, "/api/")` | Bypass cache |
| `samui_www_to_apex` | Single Redirects | `(http.host eq "www.samui-samui.de")` | 301 to `https://samui-samui.de` + path, query string kept |

Equivalent dashboard steps (if the script cannot be used): **Caching → Cache Rules → Create rule**, use the custom filter expressions above. For the site rule, set **Cache eligibility: Eligible for cache**, **Edge TTL: Use cache-control header if present, bypass cache if not**, and **Browser TTL: Respect origin TTL**. For the API rule, set **Bypass cache**. Order the API bypass rule last.

## Cache invalidation

Every site deploy runs `planPurge()` ([`src/scripts/deploy/lib/purge-plan.ts`](../../src/scripts/deploy/lib/purge-plan.ts)) on the exact list of files that rsync uploaded or removed. No hand-written dependency graph is needed: if a new post changes the home page, pagination, archive, taxonomy pages, feeds, and sitemap, those files changed and are in the list.

| Mode | When | What is purged |
| --- | --- | --- |
| `selective` | Automatic when at most `CACHE_PURGE_HTML_URL_LIMIT` (default 500) HTML pages changed; or `--purge=urls` | Each changed, new, or deleted HTML page by URL, plus changed or deleted non-fingerprinted static files by URL |
| `html-tag` | Automatic when more pages changed (a global template change), or `--purge=html` | The `html` tag (all pages, redirects, error pages) in one request, plus changed static files by URL |
| `html-tag` with `static` | Automatic when `.htaccess` changed | Tags `html` and `static` |
| `everything` | Only with `--purge=everything` | The whole zone, including immutable assets. Last resort. |
| `none` | `--purge=none` or nothing changed | Nothing |

Fingerprinted `/assets/` files are never purged by a deploy. Purge Everything is never the default, because it sends every following request, including all images and assets, back to DreamHost.

### After a global template change

A header change rewrites ~2,800 HTML files. The planner sees more than 500 changed pages and purges the `html` tag once. Immediately afterwards every page is cold. The first request for each page in each Cloudflare data centre goes to DreamHost (one slow response), and the following requests are cache hits. CSS, JS, images, and fonts stay cached. The deploy warms only a handful of high-value pages.

### After publishing one article

The new post's page plus the pages that list it change: home, `/seite/N/` pagination (every page shifts by one post, ~100 pages), the year and month archive, the taxonomy pages it is tagged with, `rss.xml`, the sitemap, and the Pagefind entry file. The planner purges exactly those URLs. The rest of the archive stays cached. The deploy warms the high-value pages and up to 30 of the changed pages.

### Manual invalidation

```bash
npm run cache:purge -- --url=/2026/10/neuer-post/ --url=/       # specific URLs or paths
npm run cache:purge -- --from-file=changed-urls.txt               # one URL or path per line
npm run cache:purge -- --all-html                                 # every page (tag "html")
npm run cache:purge -- --tag=static                               # all non-fingerprinted static files
npm run cache:purge -- --everything --yes                         # whole zone, last resort
npm run cache:purge -- --all-html --dry-run                       # show, do not purge
```

### Deterministic builds

Selective purging relies on unchanged pages building to identical bytes. Before this migration, `src/components/ui/tooltip.astro` generated a random id with `crypto.randomUUID()`, so two builds of the same source differed in 961 pages and every deploy looked like a global change. Tooltip ids are now derived from the tooltip text (`src/utils/tooltip/stable-id.ts`). Do not emit random values, build timestamps, or "time since" strings into HTML. To check, build twice and run `npm run deploy:site -- --skip-checks --skip-build --dry-run` after deploying the first build: it must report 0 changed HTML pages.

## Cache warming

Warming is optional and secondary. Deploys warm the pages in `HIGH_VALUE_PATHS` (`/`, `/archiv/`, `/seite/2/`, `/kontakt/`, `/suche/`) and, after a selective purge, up to 30 changed pages. A warming request fills only the Cloudflare data centre nearest to the machine that sends it. It does not warm the network globally.

```bash
npm run cache:warm                                   # high-value pages
npm run cache:warm -- --url=/archiv/2026/            # specific pages
npm run cache:warm -- --sitemap --concurrency=2      # every sitemap URL
```

The full sitemap crawl is an occasional integrity and link check that also warms one data centre. Do not run it after every deploy, and do not make "purge everything, then crawl everything" the deploy routine. During the development phase it is acceptable that rarely visited pages pay one cold DreamHost request after a purge.

## Inspecting cache status

```bash
npm run cache:status -- /                                   # three requests to the home page
npm run cache:status -- /2005/01/connectivity/ --repeat=5
npm run cache:status -- https://samui-samui.de/api/weather  # X-Weather-Cache from the Worker
```

The script prints `cf-cache-status` (`HIT`, `MISS`, `EXPIRED`, `REVALIDATED`, `BYPASS`, `DYNAMIC`), `age`, `cache-control`, and the time to first byte. Expect `MISS` on the first request after a purge and `HIT` afterwards. `DYNAMIC` on an HTML page means the Cache Rule is missing. Compare MISS and HIT times rather than reading absolute numbers: TTFB includes the distance from your machine to Cloudflare.

To measure the DreamHost penalty: `npm run cache:purge -- --url=/some/page/`, then `npm run cache:status -- /some/page/ --repeat=3`. The first line is the cold origin fetch, the others are edge hits.
