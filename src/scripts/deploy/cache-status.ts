// npm run cache:status -- <url-or-path> [...] [--repeat=3]
//
// Requests each URL a few times and prints what Cloudflare did: the first
// request after a purge should be MISS (DreamHost answered), the following
// ones HIT (served from the edge). TTFB is measured from this machine, so
// compare MISS against HIT rather than reading absolute numbers.
import { siteUrl } from './lib/config.ts';
import { probe } from './lib/http.ts';
import { exitWithError, flagValue } from './lib/process.ts';

const HEADERS = [
  'cf-cache-status',
  'age',
  'cache-control',
  'x-weather-cache',
  'cf-ray',
  'server',
];

async function main() {
  const argv = process.argv.slice(2);
  const repeat = Number(flagValue(argv, '--repeat') ?? 3);
  const targets = argv.filter(
    (arg) => !arg.startsWith('--') && !/^\d+$/.test(arg),
  );
  if (targets.length === 0) {
    targets.push('/');
  }

  for (const target of targets) {
    const url = target.startsWith('http')
      ? target
      : `${siteUrl()}${target.startsWith('/') ? '' : '/'}${target}`;
    console.log(`\n${url}`);
    for (let attempt = 1; attempt <= repeat; attempt += 1) {
      const result = await probe(url, { readBody: false });
      const fields = HEADERS.map(
        (name) => [name, result.headers.get(name)] as const,
      )
        .filter(([, value]) => value !== null)
        .map(([name, value]) => `${name}: ${value}`);
      console.log(
        `  #${attempt} ${result.status}  ttfb ${result.ttfbMs.toFixed(0)} ms  ${fields.join('  |  ')}`,
      );
    }
  }
}

main().catch(exitWithError);
