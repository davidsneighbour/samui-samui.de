// npm run cache:purge -- <mode> [--dry-run]
//
//   --all-html             purge the "html" cache tag (every page + redirect)
//   --tag=<tag>            purge a cache tag (html, static, immutable)
//   --url=<url-or-path>    purge one URL (repeatable)
//   --from-file=<file>     purge URLs/paths listed one per line (# comments)
//   --everything --yes     purge the whole zone (last resort)
//
// Normal deploys purge automatically (src/scripts/deploy/deploy.ts); this is
// for manual fixes. See documentation/hosting/caching.md#cache-invalidation.
import fs from 'node:fs';
import { CloudflareClient } from './lib/cloudflare.ts';
import { siteUrl } from './lib/config.ts';
import {
  exitWithError,
  flagValue,
  flagValues,
  hasFlag,
} from './lib/process.ts';

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = hasFlag(argv, '--dry-run');
  const base = siteUrl();
  const toUrl = (value: string) =>
    value.startsWith('http')
      ? value
      : `${base}${value.startsWith('/') ? '' : '/'}${value}`;

  const tags = flagValues(argv, '--tag');
  if (hasFlag(argv, '--all-html')) {
    tags.push('html');
  }
  const urls = flagValues(argv, '--url').map(toUrl);
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
  const everything = hasFlag(argv, '--everything');

  if (!everything && tags.length === 0 && urls.length === 0) {
    throw new Error(
      'Nothing to purge. Use --all-html, --tag, --url, --from-file, or --everything --yes.',
    );
  }
  if (everything && !hasFlag(argv, '--yes')) {
    throw new Error(
      '--everything also drops immutable assets and sends every next request to DreamHost; add --yes to confirm.',
    );
  }

  console.log(
    everything
      ? 'Purge: everything'
      : `Purge: ${tags.length} tag(s) [${tags.join(', ')}], ${urls.length} URL(s)`,
  );
  for (const url of urls.slice(0, 20)) {
    console.log(`  ${url}`);
  }
  if (urls.length > 20) {
    console.log(`  ... and ${urls.length - 20} more`);
  }
  if (dryRun) {
    console.log('Dry run: nothing purged.');
    return;
  }

  const client = new CloudflareClient();
  if (everything) {
    await client.purgeEverything();
  } else {
    if (tags.length > 0) {
      await client.purgeTags(tags);
    }
    if (urls.length > 0) {
      await client.purgeUrls(urls);
    }
  }
  console.log('Purged.');
}

main().catch(exitWithError);
