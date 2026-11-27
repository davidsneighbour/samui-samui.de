#!/usr/bin/env node
// commit-msg hook: a commit that adds a new post must use `content(new):`.
// Only `feat` and `content(new)` bump the minor version in .release-it.ts, so
// a new post committed as `content:` would silently ship as a patch release.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const NEW_POST = /^src\/content\/posts\/.+\/index\.mdx?$/;
const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?!?:/;

/**
 * Return an error message when the commit header does not fit the staged
 * changes, or null when it is fine.
 */
export function checkCommitType(
  header: string,
  addedFiles: string[],
): string | null {
  const newPosts = addedFiles.filter((file) => NEW_POST.test(file));
  if (newPosts.length === 0) return null;
  const match = HEADER.exec(header);
  // Merge, revert, fixup, and other non-conventional headers are not checked here.
  if (!match?.groups) return null;
  const { type, scope } = match.groups;
  if (type !== 'content' || scope === 'new') return null;
  return [
    `✖ This commit adds a new post but uses "${type}${scope ? `(${scope})` : ''}:".`,
    '  Use "content(new): <summary>" so the release bumps the minor version.',
    ...newPosts.map((file) => `  - ${file}`),
  ].join('\n');
}

function main(): void {
  const messageFile = process.argv[2];
  if (!messageFile) {
    console.error('✖ Usage: lint-commit-type.ts <commit-message-file>');
    process.exit(1);
  }
  const header =
    readFileSync(messageFile, 'utf8')
      .split('\n')
      .find((line) => line.trim() !== '' && !line.startsWith('#')) ?? '';
  const added = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=A'],
    { encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean);
  const error = checkCommitType(header, added);
  if (error) {
    console.error(error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
