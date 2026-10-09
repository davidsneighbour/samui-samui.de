// Small child-process and console helpers shared by the deploy scripts.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

export interface RunOptions {
  allowFailure?: boolean;
  capture?: boolean;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  /** Called for each stdout line while the command runs (capture mode). */
  onLine?: (line: string) => void;
}

export interface RunResult {
  code: number;
  stderr: string;
  stdout: string;
}

export function run(
  command: string,
  args: string[],
  options: RunOptions = {},
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      shell: false,
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    let stdout = '';
    let stderr = '';
    let pending = '';

    child.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      if (options.onLine) {
        pending += text;
        const lines = pending.split('\n');
        pending = lines.pop() ?? '';
        for (const line of lines) {
          options.onLine(line);
        }
      }
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (options.onLine && pending) {
        options.onLine(pending);
      }
      const result = { code: code ?? 1, stderr, stdout };
      if (result.code === 0 || options.allowFailure) {
        resolve(result);
        return;
      }
      const detail = stderr.trim() ? `\n${stderr.trim()}` : '';
      reject(
        new Error(
          `${command} ${args.join(' ')} exited with code ${result.code}${detail}`,
        ),
      );
    });
  });
}

export function hasFlag(argv: string[], flag: string): boolean {
  return argv.includes(flag);
}

/** Reads `--name=value` or `--name value`; repeated flags return all values. */
export function flagValues(argv: string[], name: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === name && argv[index + 1] !== undefined) {
      values.push(argv[index + 1] as string);
      index += 1;
    } else if (arg?.startsWith(`${name}=`)) {
      values.push(arg.slice(name.length + 1));
    }
  }
  return values;
}

export function flagValue(argv: string[], name: string): string | undefined {
  return flagValues(argv, name).at(-1);
}

export async function confirm(question: string): Promise<boolean> {
  if (!process.stdin.isTTY) {
    return false;
  }
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const answer = await readline.question(`${question} [y/N] `);
    return ['y', 'yes'].includes(answer.trim().toLowerCase());
  } finally {
    readline.close();
  }
}

export function heading(text: string): void {
  console.log(`\n== ${text}`);
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function exitWithError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nFailed: ${message}`);
  process.exit(1);
}
