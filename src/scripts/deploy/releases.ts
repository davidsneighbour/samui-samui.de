// npm run deploy:releases                       -- list releases, then choose what to delete
// npm run deploy:releases -- --list             -- list only
// npm run deploy:releases -- --delete-inactive  -- delete every release except the live one
// npm run deploy:releases -- --delete=<release> -- delete specific releases (repeatable)
//   add --yes to skip the confirmation (required without a terminal)
//
// Manages the release directories on DreamHost
// (documentation/hosting/deployment.md#managing-releases). The live release
// can never be deleted. Deploys already keep only the newest
// DREAMHOST_KEEP_RELEASES releases; this is for cleaning up by hand.
import { createInterface } from 'node:readline/promises';
import { dreamhostConfig } from './lib/config.ts';
import {
  releaseCommit,
  releaseDate,
  releasesDiskUsage,
  remoteState,
  removeRelease,
} from './lib/dreamhost.ts';
import { confirm, exitWithError, flagValues, hasFlag } from './lib/process.ts';
import { parseSelection } from './lib/release-selection.ts';

function formatDate(date: Date | null): string {
  if (!date) {
    return 'unknown date';
  }
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    timeZoneName: 'short',
    year: 'numeric',
  });
}

async function ask(question: string): Promise<string> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return await readline.question(question);
  } finally {
    readline.close();
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const config = dreamhostConfig();
  if (config.strategy !== 'atomic') {
    throw new Error(
      'Release management needs DREAMHOST_DEPLOY_STRATEGY=atomic.',
    );
  }

  const state = await remoteState(config);
  // Newest first: the order people think in ("the last deploy").
  const releases = [...state.releases].reverse();
  const liveIndex = state.current ? releases.indexOf(state.current) + 1 : null;
  // The newest release older than the live one: what a plain rollback uses.
  const rollbackTarget = state.current
    ? state.releases[state.releases.indexOf(state.current) - 1]
    : undefined;

  console.log(
    `Releases in ${config.sshTarget}:${config.releasesDir} (disk use ${await releasesDiskUsage(config)})\n`,
  );
  if (releases.length === 0) {
    console.log('No releases.');
    return;
  }
  releases.forEach((release, position) => {
    const index = position + 1;
    const commit = releaseCommit(release);
    const notes = [
      release === state.current ? 'LIVE' : '',
      release === rollbackTarget ? 'rollback target' : '',
      release.endsWith('-adopted') ? 'original web directory' : '',
      release.includes('-dirty') ? 'uncommitted changes' : '',
    ].filter(Boolean);
    console.log(
      `${String(index).padStart(3)}  ${release === state.current ? '*' : ' '} ${formatDate(releaseDate(release)).padEnd(26)} ${(commit ?? '').padEnd(8)} ${release}${notes.length ? `  (${notes.join(', ')})` : ''}`,
    );
  });

  if (hasFlag(argv, '--list')) {
    return;
  }

  let toDelete: string[] = [];
  const named = flagValues(argv, '--delete');
  if (hasFlag(argv, '--delete-inactive')) {
    toDelete = releases.filter((release) => release !== state.current);
  } else if (named.length > 0) {
    for (const name of named) {
      if (!releases.includes(name)) {
        throw new Error(`Release "${name}" does not exist.`);
      }
      if (name === state.current) {
        throw new Error(`"${name}" is the live release and cannot be deleted.`);
      }
    }
    toDelete = named;
  } else {
    if (!process.stdin.isTTY) {
      throw new Error(
        'No terminal: use --list, --delete-inactive, or --delete=<release> with --yes.',
      );
    }
    const answer = await ask(
      '\nDelete which releases? "a" = all except live, numbers/ranges like "2,4" or "3-5", Enter = none: ',
    );
    const selection = parseSelection(answer, releases.length, liveIndex);
    if (selection.kind === 'invalid') {
      throw new Error(selection.reason);
    }
    if (selection.kind === 'none') {
      console.log('Nothing deleted.');
      return;
    }
    toDelete = selection.indexes.map((index) => releases[index - 1] as string);
  }

  if (toDelete.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  console.log(`\nWill delete ${toDelete.length} release(s):`);
  for (const release of toDelete) {
    console.log(`  ${release}`);
  }
  if (rollbackTarget && toDelete.includes(rollbackTarget)) {
    console.log(
      '\nWarning: this includes the rollback target. `npm run deploy:site:rollback` needs at least one release besides the live one.',
    );
  }

  if (
    !hasFlag(argv, '--yes') &&
    !(await confirm('\nDelete them permanently?'))
  ) {
    console.log('Nothing deleted.');
    return;
  }

  for (const release of toDelete) {
    await removeRelease(config, release);
    console.log(`deleted ${release}`);
  }
  console.log(`\nDisk use now ${await releasesDiskUsage(config)}.`);
}

main().catch(exitWithError);
