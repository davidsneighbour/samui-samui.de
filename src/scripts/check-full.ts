#!/usr/bin/env node
/**
 * Run every quality check, including the archive-wide checks that are not
 * part of `npm run check`, and report all failures at the end instead of
 * stopping at the first one. Used to work through the archive baseline step
 * by step; see documentation/quality-gates.md.
 *
 * Usage: npm run check:full
 */
import { spawnSync } from 'node:child_process';

export const FULL_CHECKS = [
  'check',
  'lint:spell',
  'lint:orthography',
  'lint:grammar',
  'lint:german-dates',
  'lint:links',
];

const results = FULL_CHECKS.map((script) => {
  console.log(`\n▶ npm run ${script}`);
  const started = Date.now();
  const { status } = spawnSync('npm', ['run', '--silent', script], {
    stdio: 'inherit',
  });
  return { ok: status === 0, script, seconds: (Date.now() - started) / 1000 };
});

console.log('\nFull check summary:');
for (const { ok, script, seconds } of results)
  console.log(
    `  ${ok ? '✔' : '✖'} ${script.padEnd(18)} ${seconds.toFixed(1)} s`,
  );

const failed = results.filter(({ ok }) => !ok).length;
console.log(
  failed
    ? `${failed} of ${results.length} checks failed.`
    : `All ${results.length} checks passed.`,
);
if (failed) process.exitCode = 1;
