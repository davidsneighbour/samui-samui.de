// Deploys the /api/* Worker only when its bundled code or configuration
// changed, so a content deploy never publishes a new Worker version.
//
// Change detection: bundle with `wrangler deploy --dry-run`, hash the bundle
// plus wrangler.jsonc, and compare with the hash the live Worker reports at
// /api/version (set on deploy via `--var WORKER_SOURCE_HASH:<hash>`).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { loadEnv, PROJECT_ROOT, siteUrl } from './config.ts';
import { run } from './process.ts';

const BUNDLE_DIR = path.join(PROJECT_ROOT, '.wrangler', 'deploy-check');

export async function workerSourceHash(): Promise<string> {
  fs.rmSync(BUNDLE_DIR, { force: true, recursive: true });
  await run(
    'npx',
    ['wrangler', 'deploy', '--dry-run', '--outdir', BUNDLE_DIR],
    {
      capture: true,
      cwd: PROJECT_ROOT,
    },
  );
  const hash = createHash('sha256');
  for (const file of fs
    .readdirSync(BUNDLE_DIR)
    .filter((name) => name.endsWith('.js'))
    .sort()) {
    hash.update(file);
    hash.update(fs.readFileSync(path.join(BUNDLE_DIR, file)));
  }
  hash.update(fs.readFileSync(path.join(PROJECT_ROOT, 'wrangler.jsonc')));
  return hash.digest('hex').slice(0, 16);
}

export async function liveWorkerHash(): Promise<string | null> {
  try {
    const response = await fetch(`${siteUrl()}/api/version`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { hash?: string; worker?: string };
    return body.worker === 'samui-samui-api' ? (body.hash ?? null) : null;
  } catch {
    return null;
  }
}

export type WorkerDeployResult = 'deployed' | 'skipped' | 'dry-run';

export async function deployWorker(
  options: { force?: boolean; dryRun?: boolean } = {},
): Promise<{ result: WorkerDeployResult; hash: string; live: string | null }> {
  loadEnv();
  const hash = await workerSourceHash();
  const live = await liveWorkerHash();
  if (live === hash && !options.force) {
    return { hash, live, result: 'skipped' };
  }
  if (options.dryRun) {
    return { hash, live, result: 'dry-run' };
  }
  await run(
    'npx',
    ['wrangler', 'deploy', '--var', `WORKER_SOURCE_HASH:${hash}`],
    {
      cwd: PROJECT_ROOT,
    },
  );
  return { hash, live, result: 'deployed' };
}
