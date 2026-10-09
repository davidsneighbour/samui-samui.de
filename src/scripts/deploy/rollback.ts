// npm run deploy:site:rollback [-- --to=<release>] [--list] [--yes] [--no-purge]
//
// Points the DreamHost web directory back at an earlier release (the one
// before the live release by default) and purges HTML and static files from
// the Cloudflare cache. Fingerprinted /assets/ files need no purge: the old
// release still contains the files its HTML references.
// See documentation/hosting/deployment.md#rollback.
import { CloudflareClient } from './lib/cloudflare.ts';
import { dreamhostConfig } from './lib/config.ts';
import { activateRelease, remoteState } from './lib/dreamhost.ts';
import { confirm, exitWithError, flagValue, hasFlag } from './lib/process.ts';

async function main() {
  const argv = process.argv.slice(2);
  const config = dreamhostConfig();
  if (config.strategy !== 'atomic') {
    throw new Error(
      'Rollback needs DREAMHOST_DEPLOY_STRATEGY=atomic (release directories).',
    );
  }
  const state = await remoteState(config);
  if (hasFlag(argv, '--list')) {
    for (const release of state.releases) {
      console.log(`${release === state.current ? '*' : ' '} ${release}`);
    }
    return;
  }
  if (!state.current) {
    throw new Error(
      'The web directory does not point at a release; nothing to roll back.',
    );
  }

  const requested = flagValue(argv, '--to');
  const target =
    requested ?? state.releases[state.releases.indexOf(state.current) - 1];
  if (!target || !state.releases.includes(target)) {
    throw new Error(
      `No release to roll back to (requested: ${requested ?? 'previous'}). Use --list.`,
    );
  }

  console.log(`Live: ${state.current}\nRollback to: ${target}`);
  if (!hasFlag(argv, '--yes') && !(await confirm('Switch the live site?'))) {
    throw new Error('Rollback cancelled.');
  }

  await activateRelease(config, target);
  console.log('Web directory switched.');
  if (hasFlag(argv, '--no-purge')) {
    console.log(
      'Cache not purged (--no-purge): visitors may see the old pages until the edge TTL expires.',
    );
    return;
  }
  await new CloudflareClient().purgeTags(['html', 'static']);
  console.log('Purged cache tags: html, static.');
}

main().catch(exitWithError);
