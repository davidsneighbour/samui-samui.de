import { type ChildProcess, spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'dev:site']],
  ['npm', ['run', 'dev:docs']],
] as const;

const children = new Set<ChildProcess>();
let shuttingDown = false;

function stopChildren(signal: NodeJS.Signals = 'SIGTERM'): void {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const [command, args] of commands) {
  const child = spawn(command, args, {
    env: process.env,
    stdio: 'inherit',
  });

  children.add(child);

  child.on('exit', (code, signal) => {
    children.delete(child);

    if (!shuttingDown) {
      if (code && code !== 0) {
        stopChildren();
        process.exitCode = code;
      } else if (signal) {
        stopChildren();
        process.exitCode = 1;
      } else if (children.size === 0) {
        process.exitCode = 0;
      }
    }
  });
}

process.on('SIGINT', () => {
  stopChildren('SIGINT');
});

process.on('SIGTERM', () => {
  stopChildren('SIGTERM');
});
