// npm run test:smoke [-- --base-url=URL] [--no-cloudflare] [--no-worker]
//
// Checks the live site (or another base URL, e.g. a local Apache serving
// dist/) after a deployment. See documentation/hosting/deployment.md#smoke-tests.
import { siteUrl } from './lib/config.ts';
import { exitWithError, flagValue, hasFlag } from './lib/process.ts';
import { runSmokeTests } from './lib/smoke.ts';

const argv = process.argv.slice(2);
const baseUrl = flagValue(argv, '--base-url') ?? siteUrl();
const isProductionHost = new URL(baseUrl).hostname === 'samui-samui.de';

runSmokeTests({
  baseUrl,
  expectCloudflare: isProductionHost && !hasFlag(argv, '--no-cloudflare'),
  expectWorker: !hasFlag(argv, '--no-worker'),
})
  .then((ok) => {
    process.exit(ok ? 0 : 1);
  })
  .catch(exitWithError);
