// npm run cache:warm [-- --url=/path ...] [--from-file=urls.txt] [--sitemap]
//                    [--concurrency=2] [--delay-ms=100]
//
// Requests a few high-value pages so the Cloudflare data centre nearest to
// *this machine* has them cached. It does not warm every Cloudflare location;
// visitors elsewhere still trigger one origin fetch per location.
//
// --sitemap crawls every URL in the sitemap. Treat that as an occasional
// integrity/link check that happens to warm one location -- not as a step
// after every deploy (documentation/hosting/caching.md#cache-warming).
import fs from 'node:fs';
import { siteUrl } from './lib/config.ts';
import { mapLimit, probe, sitemapUrls } from './lib/http.ts';
import {
  exitWithError,
  flagValue,
  flagValues,
  hasFlag,
} from './lib/process.ts';

export const HIGH_VALUE_PATHS = [
  '/',
  '/archiv/',
  '/seite/2/',
  '/kontakt/',
  '/suche/',
];

export async function warm(urls: string[], concurrency = 2, delayMs = 100) {
  const results = await mapLimit(
    urls,
    concurrency,
    async (url) => {
      try {
        const result = await probe(url, { readBody: false });
        return {
          cache: result.headers.get('cf-cache-status') ?? '-',
          status: result.status,
          url,
        };
      } catch (error) {
        return {
          cache: '-',
          error: error instanceof Error ? error.message : String(error),
          status: 0,
          url,
        };
      }
    },
    delayMs,
  );
  const failures = results.filter(
    (result) => result.status >= 400 || result.status === 0,
  );
  return { failures, results };
}

async function main() {
  const argv = process.argv.slice(2);
  const base = siteUrl();
  const toUrl = (value: string) =>
    value.startsWith('http') ? value : `${base}${value}`;
  let urls = flagValues(argv, '--url').map(toUrl);

  const file = flagValue(argv, '--from-file');
  if (file) {
    urls.push(
      ...fs
        .readFileSync(file, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
        .map(toUrl),
    );
  }

  if (hasFlag(argv, '--sitemap')) {
    const index = await (await fetch(`${base}/sitemap-index.xml`)).text();
    for (const sitemap of sitemapUrls(index)) {
      urls.push(...sitemapUrls(await (await fetch(sitemap)).text()));
    }
  }

  if (urls.length === 0) {
    urls = HIGH_VALUE_PATHS.map(toUrl);
  }

  // Conservative by default; DreamHost is shared hosting.
  const concurrency = Math.min(
    4,
    Number(flagValue(argv, '--concurrency') ?? 2),
  );
  const delayMs = Number(flagValue(argv, '--delay-ms') ?? 100);
  console.log(`Warming ${urls.length} URL(s), concurrency ${concurrency}.`);

  const { failures, results } = await warm(urls, concurrency, delayMs);
  const byCache = new Map<string, number>();
  for (const result of results) {
    byCache.set(result.cache, (byCache.get(result.cache) ?? 0) + 1);
  }
  console.log(
    `Cache status before warming: ${[...byCache].map(([key, count]) => `${key} ${count}`).join(', ')}`,
  );
  for (const failure of failures) {
    console.log(`FAIL ${failure.status} ${failure.url}`);
  }
  if (failures.length > 0) {
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch(exitWithError);
}
