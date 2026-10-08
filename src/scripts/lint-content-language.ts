#!/usr/bin/env node
/**
 * Pre-commit language check for staged content Markdown: spelling (CSpell),
 * house orthography (Vale), and grammar (LanguageTool). All three run even
 * when one fails, so every finding in an edited post is visible at once;
 * lint-staged would otherwise stop the remaining tasks after the first
 * failure. See documentation/content/german-orthography-and-grammar.md.
 *
 * Usage: node src/scripts/lint-content-language.ts <files...>
 */
import { spawnSync } from 'node:child_process';

const files = process.argv.slice(2).filter((file) => file.endsWith('.md'));

const checks: [string, string[]][] = [
  [
    'node_modules/.bin/cspell',
    ['--no-progress', '--no-summary', '--no-must-find-files'],
  ],
  ['node_modules/.bin/vale', []],
  [process.execPath, ['src/scripts/lint-grammar.ts']],
];

if (files.length) {
  const failed = checks.filter(
    ([command, args]) =>
      spawnSync(command, [...args, ...files], { stdio: 'inherit' }).status !==
      0,
  ).length;
  if (failed) process.exitCode = 1;
}
