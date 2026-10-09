// npm run deploy        -- full production deployment
// npm run deploy:site   -- same, without the Worker step
//
//   1. quality checks (npm run check)       --skip-checks
//   2. optional release (release-it)        --release
//   3. Astro build (npm run build)          --skip-build
//   4. validate dist/
//   5. upload dist/ to DreamHost (rsync)    --skip-site, --dry-run, --adopt-docroot
//   6. deploy the /api/* Worker if changed  --skip-worker, --force-worker
//   7. purge the Cloudflare cache           --purge=auto|html|urls|everything|none
//   8. smoke tests                          --no-smoke
//   9. warm a few high-value pages          --no-warm
//  10. report
//
// Builds exactly once, locally or in CI, and ships that dist/. DreamHost
// never builds anything. Architecture and reasoning:
// documentation/hosting/architecture.md and documentation/hosting/deployment.md.

import { HIGH_VALUE_PATHS, warm } from './cache-warm.ts';
import { CloudflareClient } from './lib/cloudflare.ts';
import {
  cloudflareConfig,
  DIST_DIR,
  dreamhostConfig,
  env,
  loadEnv,
  siteUrl,
} from './lib/config.ts';
import { validateDist } from './lib/dist.ts';
import {
  activateRelease,
  adoptDocroot,
  pruneReleases,
  releaseName,
  remoteState,
  removeRelease,
  uploadDirect,
  uploadRelease,
  verifyRelease,
} from './lib/dreamhost.ts';
import {
  confirm,
  exitWithError,
  flagValue,
  formatBytes,
  hasFlag,
  heading,
  run,
} from './lib/process.ts';
import {
  type ChangeSet,
  DEFAULT_HTML_URL_LIMIT,
  type PurgeMode,
  type PurgePlan,
  planPurge,
} from './lib/purge-plan.ts';
import { runSmokeTests } from './lib/smoke.ts';
import { deployWorker } from './lib/worker.ts';

const PURGE_MODES: PurgeMode[] = ['auto', 'html', 'urls', 'everything', 'none'];
// Pages warmed after a selective (content) deploy, on top of HIGH_VALUE_PATHS.
const MAX_WARM_CHANGED_PAGES = 30;

interface Report {
  [key: string]: string;
}

async function gitInfo(): Promise<{ sha: string; dirty: boolean }> {
  const sha = (
    await run('git', ['rev-parse', '--short=7', 'HEAD'], { capture: true })
  ).stdout.trim();
  const status = (
    await run('git', ['status', '--porcelain'], { capture: true })
  ).stdout.trim();
  return { dirty: status.length > 0, sha };
}

async function hasChangesSinceLatestTag(): Promise<boolean> {
  const latestTag = await run('git', ['describe', '--tags', '--abbrev=0'], {
    allowFailure: true,
    capture: true,
  });
  if (latestTag.code !== 0) {
    return true;
  }
  const commits = await run(
    'git',
    ['log', `${latestTag.stdout.trim()}..HEAD`, '--oneline'],
    {
      capture: true,
    },
  );
  return commits.stdout.trim().length > 0;
}

async function deploySite(
  argv: string[],
  dryRun: boolean,
  fileList: string[],
  report: Report,
): Promise<ChangeSet> {
  const config = dreamhostConfig();
  report['origin'] =
    `${config.sshTarget}:${config.docroot} (${config.strategy})`;

  if (config.strategy === 'direct') {
    heading(`Upload dist/ to ${config.sshTarget}:${config.docroot} (direct)`);
    const result = await uploadDirect(config, DIST_DIR, dryRun);
    report['files uploaded'] = String(result.transferred);
    return result.changes;
  }

  heading(`Inspect ${config.sshTarget}`);
  let state = await remoteState(config);
  console.log(
    `web directory: ${state.docroot}; live release: ${state.current ?? 'none'}; releases: ${state.releases.length}`,
  );

  if (state.docroot === 'directory') {
    if (!hasFlag(argv, '--adopt-docroot')) {
      throw new Error(
        `${config.docroot} is a plain directory. Run once with --adopt-docroot to move it into ${config.releasesDir}/ and replace it with a symlink (documentation/hosting/deployment.md#first-deployment).`,
      );
    }
    if (dryRun) {
      console.log(
        'Dry run: would adopt the existing web directory as a release.',
      );
    } else {
      const adopted = `${releaseName(new Date(), '0000000', false)}-adopted`;
      await adoptDocroot(config, adopted);
      console.log(`Adopted existing web directory as release ${adopted}.`);
      state = await remoteState(config);
    }
  } else if (state.docroot === 'other') {
    throw new Error(
      `${config.docroot} exists but is neither a directory nor a symlink; refusing to touch it.`,
    );
  }

  const { dirty, sha } = await gitInfo();
  const release = releaseName(new Date(), sha, dirty);
  heading(`Upload release ${release}`);
  console.log(
    state.current
      ? `unchanged files are hard-linked from ${state.current}`
      : 'first release: full upload',
  );

  let uploaded = false;
  try {
    const result = await uploadRelease(
      config,
      DIST_DIR,
      fileList,
      release,
      state.current,
      dryRun,
    );
    uploaded = !dryRun;
    report['files uploaded'] = String(result.transferred);
    report['files deleted'] = String(result.changes.deleted.length);

    if (dryRun) {
      console.log(`Dry run: ${result.transferred} file(s) would be uploaded.`);
      return result.changes;
    }

    await verifyRelease(config, release, fileList.length);
    heading('Activate release');
    await activateRelease(config, release);
    report['release'] = `${release} (previous: ${state.current ?? 'none'})`;
    console.log(`${config.docroot} -> releases/${release}`);

    const removed = await pruneReleases(
      config,
      [...state.releases, release],
      release,
    );
    if (removed.length > 0) {
      console.log(`Pruned ${removed.length} old release(s).`);
    }
    return result.changes;
  } catch (error) {
    if (uploaded) {
      const live = (await remoteState(config)).current;
      if (live !== release) {
        console.error(
          `Removing incomplete release ${release}; the live site was not changed.`,
        );
        await removeRelease(config, release).catch(() => undefined);
      }
    }
    throw error;
  }
}

async function purge(plan: PurgePlan, dryRun: boolean): Promise<void> {
  heading(`Purge Cloudflare cache: ${plan.mode}`);
  console.log(plan.reason);
  if (plan.mode === 'none') {
    return;
  }
  console.log(
    `tags: ${plan.tags.join(', ') || '-'}; URLs: ${plan.urls.length}`,
  );
  if (dryRun) {
    console.log('Dry run: nothing purged.');
    return;
  }
  const client = new CloudflareClient();
  if (plan.mode === 'everything') {
    await client.purgeEverything();
    return;
  }
  if (plan.tags.length > 0) {
    await client.purgeTags(plan.tags);
  }
  if (plan.urls.length > 0) {
    await client.purgeUrls(plan.urls);
  }
}

async function main() {
  loadEnv();
  const argv = process.argv.slice(2);
  const dryRun = hasFlag(argv, '--dry-run');
  const skipSite = hasFlag(argv, '--skip-site');
  const skipWorker = hasFlag(argv, '--skip-worker');
  const purgeMode = (flagValue(argv, '--purge') ??
    env('DEPLOY_PURGE_MODE') ??
    'auto') as PurgeMode;
  if (!PURGE_MODES.includes(purgeMode)) {
    throw new Error(`--purge must be one of ${PURGE_MODES.join(', ')}.`);
  }
  const report: Report = {};
  const started = Date.now();

  console.log(`Deploy to ${siteUrl()}${dryRun ? ' (dry run)' : ''}`);

  // Fail before anything is built or uploaded, not after the site is live.
  if (!skipSite) {
    dreamhostConfig();
  }
  if (!dryRun && (purgeMode !== 'none' || !skipWorker)) {
    cloudflareConfig();
  }

  if (!hasFlag(argv, '--skip-checks')) {
    heading('Quality checks');
    await run('npm', ['run', 'check']);
  }

  if (hasFlag(argv, '--release') && !dryRun) {
    heading('Release');
    if (await hasChangesSinceLatestTag()) {
      await run('npm', ['run', 'release']);
    } else {
      console.log('No commits after the latest tag. Skipping release.');
    }
  }

  if (!skipSite) {
    if (!hasFlag(argv, '--skip-build')) {
      heading('Build');
      await run('npm', ['run', 'build']);
    }
    heading('Validate dist/');
    const stats = validateDist(DIST_DIR);
    report['generated files'] =
      `${stats.files.length} (${stats.htmlFiles} HTML)`;
    report['generated size'] = formatBytes(stats.totalBytes);
    console.log(`${report['generated files']}, ${report['generated size']}`);

    if (!dryRun && !hasFlag(argv, '--yes')) {
      if (!(await confirm('\nPublish this build to the live website?'))) {
        throw new Error(
          'Deployment cancelled (use --yes in non-interactive runs).',
        );
      }
    }

    const changes = await deploySite(argv, dryRun, stats.files, report);
    const plan = planPurge(changes, {
      htmlUrlLimit: Number(
        env('CACHE_PURGE_HTML_URL_LIMIT') ?? DEFAULT_HTML_URL_LIMIT,
      ),
      mode: purgeMode,
      siteUrl: siteUrl(),
    });
    report['changed HTML pages'] = String(plan.htmlUrls.length);
    report['cache invalidation'] = `${plan.mode}: ${plan.reason}`;
    report['purged'] =
      `${plan.tags.length} tag(s) [${plan.tags.join(', ')}], ${plan.urls.length} URL(s)`;

    if (!skipWorker) {
      heading('Worker');
      const worker = await deployWorker({
        dryRun,
        force: hasFlag(argv, '--force-worker'),
      });
      report['worker'] = `${worker.result} (${worker.hash})`;
    }

    await purge(plan, dryRun);

    if (!dryRun && !hasFlag(argv, '--no-smoke')) {
      heading('Smoke tests');
      const ok = await runSmokeTests({
        baseUrl: siteUrl(),
        expectCloudflare: true,
        expectWorker: true,
      });
      report['smoke tests'] = ok ? 'passed' : 'FAILED';
      if (!ok) {
        process.exitCode = 1;
      }
    }

    if (!dryRun && !hasFlag(argv, '--no-warm')) {
      heading('Warm high-value pages');
      const base = siteUrl();
      const urls = [
        ...HIGH_VALUE_PATHS.map((urlPath) => `${base}${urlPath}`),
        ...(plan.mode === 'selective'
          ? plan.htmlUrls.slice(0, MAX_WARM_CHANGED_PAGES)
          : []),
      ];
      const { failures } = await warm([...new Set(urls)]);
      report['warmed'] = `${urls.length} URL(s), ${failures.length} failure(s)`;
    }
  } else if (!skipWorker) {
    heading('Worker');
    const worker = await deployWorker({
      dryRun,
      force: hasFlag(argv, '--force-worker'),
    });
    report['worker'] = `${worker.result} (${worker.hash})`;
  }

  report['duration'] = `${Math.round((Date.now() - started) / 1000)} s`;
  heading('Deployment report');
  for (const [key, value] of Object.entries(report)) {
    console.log(`${key.padEnd(20)} ${value}`);
  }
}

main().catch(exitWithError);
