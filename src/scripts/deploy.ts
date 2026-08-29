import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const productionWarnings = [
  'This deploy goes to the live production website.',
  'Make sure the correct Netlify user for this website is logged in.',
];

type RunOptions = {
  allowFailure?: boolean;
  capture?: boolean;
};

type RunResult = {
  code: number;
  output: string;
};

function printHeader() {
  const line = '='.repeat(72);
  console.log(`\n${line}`);
  console.log('Production deploy');
  console.log(line);
  for (const warning of productionWarnings) {
    console.log(`WARNING: ${warning}`);
  }
  console.log(line);
}

function run(command: string, args: string[], options: RunOptions = {}) {
  return new Promise<RunResult>((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      shell: false,
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    let output = '';

    if (options.capture) {
      child.stdout?.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.stderr?.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      const result = { code: code ?? 1, output };
      if (result.code === 0 || options.allowFailure) {
        resolve(result);
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} exited with code ${result.code}`,
        ),
      );
    });
  });
}

async function askYesNo(question: string, defaultValue = false) {
  if (!process.stdin.isTTY) {
    return defaultValue;
  }

  const suffix = defaultValue ? '[Y/n]' : '[y/N]';
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await readline.question(`${question} ${suffix} `);
    const normalised = answer.trim().toLowerCase();

    if (normalised === '') {
      return defaultValue;
    }

    return normalised === 'y' || normalised === 'yes';
  } finally {
    readline.close();
  }
}

async function showNetlifyUser() {
  console.log('\nNetlify account status:');
  const status = await run('netlify', ['status'], {
    allowFailure: true,
    capture: true,
  });

  if (status.output.trim().length > 0) {
    console.log(status.output.trim());
  }

  if (status.code !== 0) {
    console.log('Netlify could not show a logged-in account.');
  }
}

async function maybeSwitchNetlifyUser() {
  if (process.env['NETLIFY_DEPLOY_SWITCH'] === '1') {
    await run('netlify', ['switch']);
    return;
  }

  await showNetlifyUser();

  const shouldSwitch = await askYesNo(
    '\nSwitch Netlify user before continuing?',
    false,
  );

  if (shouldSwitch) {
    await run('netlify', ['switch']);
  }
}

async function hasChangesSinceLatestTag() {
  const latestTag = await run('git', ['describe', '--tags', '--abbrev=0'], {
    allowFailure: true,
    capture: true,
  });

  if (latestTag.code !== 0) {
    return true;
  }

  const tag = latestTag.output.trim();
  const commits = await run('git', ['log', `${tag}..HEAD`, '--oneline'], {
    capture: true,
  });

  return commits.output.trim().length > 0;
}

async function releaseIfNeeded() {
  if (await hasChangesSinceLatestTag()) {
    await run('npm', ['run', 'release']);
    return;
  }

  console.log('\nNo commits after the latest tag. Skipping release.');
}

async function main() {
  printHeader();
  await maybeSwitchNetlifyUser();
  await run('npm', ['run', 'check']);
  await releaseIfNeeded();
  await run('npm', ['run', 'build']);
  await run('netlify', ['deploy', '--prod', '--open']);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nDeploy failed: ${message}`);
  process.exit(1);
});
