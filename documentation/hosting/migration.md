<!-- markdownlint-disable-next-line dnb-title-case-style -->
# Migration from Netlify

Runbook for moving production from Netlify to the DreamHost origin behind Cloudflare ([#1783](https://github.com/davidsneighbour/samui-samui.de/issues/1783)). It records the state before the move, the cutover order, verification, rollback, and the Netlify clean-up that may only happen afterwards.

## Component map

| Netlify | Replacement |
| --- | --- |
| Static hosting (`publish = "dist"`) | DreamHost Apache, atomic releases via rsync over SSH ([deployment](deployment.md)) |
| Netlify Edge CDN | Cloudflare proxy + Cache Rules; edge TTLs from origin headers ([caching](caching.md)) |
| `[[headers]]` for `/*` (CSP, Permissions-Policy, Referrer-Policy, `nosniff`, `X-Frame-Options`), HSTS | `public/.htaccess` (`Header always set`) |
| `[[headers]]` giscus CORS for `/assets/styles/giscus-samui-*.css` and `/assets/webfonts/*` | `public/.htaccess` |
| `[[redirects]]` 301s: `/taglines/`, `/tags/*`, `/themen/*`, `/leute/*`, `/orte/*`, `/ereignisse/*` | `public/.htaccess` `RewriteRule … [R=301]` (all kept) |
| Astro `redirects` (`src/data/redirects.json`, meta-refresh pages) | Unchanged; they are files in `dist/` |
| `/api/weather` → `/.netlify/functions/weather` | Worker route `samui-samui.de/api/*` → `src/workers/api/weather.ts` |
| `/.netlify/functions/contact` | Worker `POST /api/contact` (`src/workers/api/contact.ts`); form action changed to `/api/contact` |
| Netlify environment variables | Worker secrets; `TURNSTILE_SITE_KEY` in `.env` |
| `Netlify-CDN-Cache-Control` for weather | Workers Cache API in the Worker |
| www → apex redirect | Cloudflare Single Redirect `samui_www_to_apex` |
| `netlify deploy` (`npm run deploy[:production]`) | `npm run deploy`, `deploy:site`, `deploy:worker`; legacy commands renamed `deploy:netlify[:production]` |

One behavioural change is intentional. On Netlify, files that Astro generates for `src/data/redirects.json` (for example `dist/tags/index.html`, a meta-refresh page) shadowed the `netlify.toml` 301 rules, so `/tags/`, `/leute/`, and `/themen/politik/` answered **200** with a meta refresh. Apache applies the rewrite first, so these URLs now answer with a real **301** to the same destinations. Search engines treat a 301 more reliably than a meta refresh.

Trailing-slash behaviour is unchanged and verified on Apache 2.4: `/kontakt` → 301 `/kontakt/`, `/index.html` → 200, unknown URLs → 404 with `404.html`.

## State before the cutover (2026-10-09)

* Nameservers: Cloudflare (`dante.ns.cloudflare.com`, `simone.ns.cloudflare.com`).
* `samui-samui.de`: CNAME `apex-loadbalancer.netlify.com` (flattened at the apex by Cloudflare, so it resolves to `75.2.60.5` and `99.83.231.61`), **DNS only** (checked through the Cloudflare API; no `cf-ray` header, `server: Netlify`).
* `www.samui-samui.de` CNAME `samui-samui-de.netlify.app`, DNS only. Netlify redirects www to the apex.
* Zone `e1305aff1713d1c3acb9d97852ee4565`, Free plan. SSL/TLS mode **Full** (not strict), **Always Use HTTPS** off, no Cache Rules, no Worker routes.
* Records that must stay untouched: MX (Google Workspace), `send.samui-samui.de` (Resend/Amazon SES), the proxied `links.samui-samui.de` CNAME (Resend link tracking), and the TXT records (SPF, DKIM, DMARC, site verifications). The Cache Rules match only the host `samui-samui.de`, so they do not affect `links.samui-samui.de`.
* Netlify sent `cache-control: public,max-age=0,must-revalidate` for HTML and assets.
* Response times measured from the maintainer's machine: `/` 0.34–0.35 s TTFB, `/2005/01/connectivity/` 0.57–0.69 s, `/archiv/themen/politik/` 0.38–1.22 s (Netlify edge misses included).

## Target

* `samui-samui.de` A record → the DreamHost web IP of the site, `173.236.199.86` (answer of `ns1.dreamhost.com` for `samui-samui.de` and `www` on 2026-10-09; check it again before the switch). This is not the SSH server's IP (`173.236.193.42`). **Proxied** (orange cloud). Cache Rules, the Worker route, and the redirect rule only apply to proxied traffic.
* `www.samui-samui.de` → proxied (A record to the same IP, or CNAME to `samui-samui.de`). The Cloudflare redirect rule answers it, so it never reaches DreamHost.
* No AAAA record unless DreamHost provides IPv6 for the site. The Netlify apex CNAME is replaced, not kept beside the A record.
* SSL/TLS mode **Full (strict)**: Cloudflare connects to DreamHost over HTTPS and validates the certificate. Never use Flexible: it would send all traffic from Cloudflare to the origin over plain HTTP.
* **Always Use HTTPS** on (SSL/TLS → Edge Certificates).

<!-- markdownlint-disable-next-line dnb-title-case-style -->
### Certificate at DreamHost

Full (strict) needs a certificate on DreamHost that is valid for `samui-samui.de` and `www.samui-samui.de`. Recommended: a **Cloudflare Origin CA certificate** (SSL/TLS → Origin Server → Create Certificate, RSA, both hostnames, 15 years), installed in the DreamHost panel as a custom (manually provided) certificate for the site: paste the certificate and the private key. It is independent of where DNS points, so it can be installed before the cutover. The alternative, a DreamHost Let's Encrypt certificate, needs HTTP validation of the domain at DreamHost, which conflicts with DNS still pointing at Netlify. An Origin CA certificate is trusted only by Cloudflare. That is acceptable, because visitors never connect to DreamHost directly.

## Cutover sequence

Every step before 7 can be done and verified while Netlify still serves production. No downtime is expected.

1. **DreamHost site.** In the DreamHost panel, make sure `samui-samui.de` is hosted with web directory `/home/samuisamui/samui-samui.de/public`, HTTPS enabled, and no PHP-specific redirects. SSH access with the local `samuisamui` alias works (checked 2026-10-09).
2. **Origin certificate.** Install the Cloudflare Origin CA certificate as described above.
3. **Local configuration.** Fill in `.env` from `.env.example` (DreamHost values, Cloudflare token, account ID, zone ID, Turnstile site key).
4. **First deploy to the origin** (not live yet): `npm run deploy:site -- --adopt-docroot --purge=none --no-smoke --no-warm`.
5. **Verify the origin directly**, bypassing DNS (`-k` because the Origin CA certificate is only trusted by Cloudflare):

   ```bash
   IP=<dreamhost-site-ip>
   curl -skI --resolve samui-samui.de:443:$IP https://samui-samui.de/ | grep -iE 'HTTP|cache-control|cloudflare-cdn|cache-tag|content-security'
   curl -skI --resolve samui-samui.de:443:$IP https://samui-samui.de/kontakt | grep -iE 'HTTP|location'
   curl -skI --resolve samui-samui.de:443:$IP https://samui-samui.de/tags/ | grep -iE 'HTTP|location'
   ```

   Expect `200` with `Cloudflare-CDN-Cache-Control` and `Cache-Tag: html`, then `301` to `https://samui-samui.de/kontakt/`, then `301` to `/archiv/themen/`.
6. **Cloudflare preparation:**
   * Worker (first time): Wrangler 4 refuses to create a Worker whose required secrets are missing, and `wrangler secret put` needs an existing Worker. Deploy once with all secrets in a temporary file (`chmod 600`, JSON or `NAME=value` lines; delete it afterwards): `npx wrangler deploy --secrets-file <file>`. Later secret changes use `npx wrangler secret put <NAME>`, and later deploys use `npm run deploy:worker`. The route exists from then on, but it only applies to proxied traffic. Done on 2026-10-09.
   * Rules: `npm run cache:rules`, then `npm run cache:rules:update`.
   * SSL/TLS mode **Full (strict)**, **Always Use HTTPS** on.
7. **DNS switch** (Cloudflare → DNS): delete the apex CNAME `apex-loadbalancer.netlify.com` and create an A record `samui-samui.de` → `173.236.199.86`, **Proxied**; change `www` to CNAME `samui-samui.de`, **Proxied**. Proxied records use a short TTL, so the switch takes effect within minutes.
8. **Verify production:** `npm run test:smoke`, then a contact-form test submission on `/kontakt/`, then the measurements below.
9. **Purge after the switch:** `npm run cache:purge -- --all-html` (removes anything cached during the switch).
10. **Privacy policy.** Update `src/pages/kleingedrucktes/datenschutzerklaerung.mdx`, which still names Netlify as host and as the weather-function platform, to DreamHost (hosting) and Cloudflare (CDN, Workers, Turnstile). This is legal text and must be reviewed by the site owner. Deploy.
11. **Observe for a few days**, then remove Netlify ([clean-up](#netlify-clean-up)).

## Verification and measurements

**Cutover done on 2026-10-09** (about 17:00 Bangkok time): apex A `173.236.199.86` and `www` CNAME `samui-samui.de`, both proxied; SSL/TLS Full (strict); Always Use HTTPS on; Origin CA certificate (valid until 2041-10-05) at DreamHost. `npm run test:smoke` passed 49 of 49 checks. Measured from Bangkok (Cloudflare BKK):

| Request | First request after purge (MISS, DreamHost) | Following requests (HIT) |
| --- | --- | --- |
| `/` | 641 ms TTFB | 23–25 ms |
| `/2005/01/connectivity/` | 585 ms | 22–23 ms |
| `/archiv/themen/politik/` | 662 ms | 21–23 ms |
| `/assets/BaseHead.C1ksrdDe.css` | — (stayed HIT through the `html` purge) | 18–78 ms |
| `/api/version`, `/api/weather` (Worker) | — | 18–21 ms |

For comparison, Netlify answered the same pages in 0.34–1.22 s from the same machine. A cache hit is about 15–50 times faster than before; a cold page costs one DreamHost round trip of about 0.6 s.

Run these after step 8 and record the results in [#1783](https://github.com/davidsneighbour/samui-samui.de/issues/1783):

```bash
# Warm HTML: the first request may be MISS, then HIT with increasing age.
npm run cache:status -- / /2005/01/connectivity/ --repeat=4

# Cold origin penalty: purge one URL, then measure MISS vs HIT.
npm run cache:purge -- --url=/2005/01/connectivity/
npm run cache:status -- /2005/01/connectivity/ --repeat=3

# Static assets: immutable, HIT, not affected by an HTML purge.
npm run cache:status -- "$(curl -s https://samui-samui.de/ | grep -oE '/assets/[^"]+\.css' | head -1)"

# API: answered by the Worker, never cached by the zone.
npm run cache:status -- /api/version /api/weather
```

Expected: HTML `cf-cache-status: HIT` after the first request; `Cache-Tag` and `Cloudflare-CDN-Cache-Control` not visible; assets `HIT` with `immutable`; `/api/version` returns `{"worker":"samui-samui-api"}` and no `cf-cache-status: HIT`.

## Rollback

* **Before the DNS switch:** nothing to roll back; Netlify serves production.
* **After the DNS switch:** replace the apex A record with the CNAME `apex-loadbalancer.netlify.com` again and set `www` back to CNAME `samui-samui-de.netlify.app`, both **DNS only**. Netlify still has the last deploy, including its `netlify.toml` rewrites of `/api/contact` and `/api/weather` to the Netlify Functions, so the form keeps working there. The repository no longer contains these files (see [Netlify clean-up](#netlify-clean-up)), so this path only restores the last Netlify deploy; it cannot deploy new changes to Netlify. It stops working when the Netlify site is deleted. The Worker route goes idle as soon as the records are not proxied.
* **A bad deploy after the move:** `npm run deploy:site:rollback` ([deployment](deployment.md#rollback)), `npx wrangler rollback` for the Worker.

## Netlify clean-up

Done in the repository on 2026-10-09 ([#1784](https://github.com/davidsneighbour/samui-samui.de/issues/1784)), after the cutover and a passing smoke test:

* deleted `netlify.toml`, `.netlify/state.json`, and the `.netlify` lines in `.gitignore`;
* moved `spam.mjs` and `email.mjs` to `src/workers/api/lib/` and `contact-notification.tsx` to `src/workers/api/emails/`, then deleted `src/netlify/`;
* deleted `src/packages/site/netlify.jsonc` (`netlify-cli`, `deploy:netlify*`) and `src/scripts/deploy/netlify.ts`, and regenerated `package.json` (this also removed `node-forge`, see [dependency security](../dependency-security.md));
* removed the transitional Netlify notes in `README.md`, `AGENTS.md`, and the feature and deployment documentation.

Still to do by hand:

* delete the unused GitHub Actions secret `NETLIFY_BUILD_HOOK` (`gh secret delete NETLIFY_BUILD_HOOK`);
* once production has run on DreamHost + Cloudflare without problems for some time, delete or archive the Netlify site in the Netlify dashboard.

The Netlify site's environment variables contain the old secrets. Deleting it removes the DNS rollback path described in [Rollback](#rollback).

## Open items

* **Cloudflare token.** None exists yet for this project. Create it as described in [deployment](deployment.md#cloudflare-api-token).
* **Checked on DreamHost (2026-10-09, read-only):** the server runs Apache; `rsync` 3.2.7, GNU `find` 4.9, and GNU `mv` 9.4 (`mv -T`) are installed. The web directory `public/` contains only DreamHost's placeholders: two empty favicons and a root-owned symlink `.dh-diag -> /dh/web/diag` (DreamHost's PHP diagnostics). The deploy scripts keep `.dh-diag` in both strategies. HTTPS on the origin currently serves DreamHost's default `sni.dreamhost.com` certificate, so **Full (strict) fails until the Origin CA certificate is installed**.
* **Still not verified on DreamHost:** whether Apache serves a symlinked web directory (the first `--adopt-docroot` deploy shows this; use `DREAMHOST_DEPLOY_STRATEGY=direct` if it does not), the Apache version and `mod_headers` expression support (verified on Apache 2.4.69 locally), and the disk quota for releases.
