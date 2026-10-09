// npm run deploy:worker [-- --force] [--dry-run]
//
// Deploys the /api/* Worker without touching the static site. Skips the
// upload when the live Worker already runs the same bundle (see lib/worker.ts).
import { exitWithError, hasFlag } from './lib/process.ts';
import { deployWorker } from './lib/worker.ts';

const argv = process.argv.slice(2);
deployWorker({
  dryRun: hasFlag(argv, '--dry-run'),
  force: hasFlag(argv, '--force'),
})
  .then(({ hash, live, result }) => {
    console.log(
      `Worker ${result} (source ${hash}, live ${live ?? 'unknown'}).`,
    );
  })
  .catch(exitWithError);
