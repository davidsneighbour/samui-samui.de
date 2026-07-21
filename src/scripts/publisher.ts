/**
 * CLI for managing the repo-internal `publisher.*` frontmatter block on blog
 * posts (src/content/posts/**\/index.md). This metadata is never rendered on
 * the site -- it exists purely so a human or an AI agent can mark posts (e.g.
 * `status: need-work`) and later query "everything marked X" as a work queue.
 *
 * Usage:
 *   node src/scripts/publisher.ts set <key> <value> <filter...> [--dry-run]
 *   node src/scripts/publisher.ts unset <key> <filter...> [--dry-run]
 *   node src/scripts/publisher.ts list [filter...]
 *
 * Filters (set/unset require at least one, to prevent accidental blanket
 * writes; list works with none, meaning "everything"):
 *   --all              every post
 *   --year=2005        posts under src/content/posts/2005/
 *   --path=<glob>      glob relative to src/content/posts, e.g. "2005/**"
 *   --status=<value>   only posts whose current publisher.status equals this
 *   --thema=<thema>    only posts whose `themen` frontmatter includes this topic
 *   --tag=<tag>        deprecated alias for --thema
 *
 * Values for `set` are auto-coerced: "true"/"false" -> boolean, a bare
 * number -> number, anything else stays a string.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { isMap, parseDocument } from 'yaml';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '../..');
const postsBase = path.join(projectRoot, 'src/content/posts');

interface Filters {
  all: boolean;
  year?: string;
  path?: string;
  status?: string;
  thema?: string;
}

interface ParsedFrontmatter {
  raw: string;
  body: string;
  fmText: string;
  fmStart: number;
  fmEnd: number;
}

function splitFrontmatter(raw: string): ParsedFrontmatter | null {
  const lines = raw.split('\n');
  if (lines[0]?.trim() !== '---') return null;
  let endLine = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      endLine = i;
      break;
    }
  }
  if (endLine === -1) return null;
  const fmText = lines.slice(1, endLine).join('\n');
  const body = lines.slice(endLine + 1).join('\n');
  return { body, fmEnd: endLine, fmStart: 1, fmText, raw };
}

function coerceValue(value: string): string | number | boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function parseArgs(argv: string[]) {
  const [command, ...rest] = argv;
  const positional: string[] = [];
  const filters: Filters = { all: false };
  let dryRun = false;

  for (const arg of rest) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--all') {
      filters.all = true;
    } else if (arg.startsWith('--year=')) {
      filters.year = arg.slice('--year='.length);
    } else if (arg.startsWith('--path=')) {
      filters.path = arg.slice('--path='.length);
    } else if (arg.startsWith('--status=')) {
      filters.status = arg.slice('--status='.length);
    } else if (arg.startsWith('--thema=')) {
      filters.thema = arg.slice('--thema='.length);
    } else if (arg.startsWith('--tag=')) {
      filters.thema = arg.slice('--tag='.length);
    } else {
      positional.push(arg);
    }
  }

  return { command, dryRun, filters, positional };
}

async function findCandidateFiles(filters: Filters): Promise<string[]> {
  const pattern = filters.year
    ? `${filters.year}/**/index.md`
    : filters.path
      ? `${filters.path.replace(/\/index\.md$/, '')}/index.md`.replace(
          /\*\*\/index\.md$/,
          '**/index.md',
        )
      : '**/index.md';

  const files = await glob(pattern, { absolute: true, cwd: postsBase });
  return files.sort();
}

function hasFilter(filters: Filters): boolean {
  return Boolean(
    filters.all ||
      filters.year ||
      filters.path ||
      filters.status ||
      filters.thema,
  );
}

function matchesPostLevelFilters(
  frontmatter: Record<string, unknown>,
  filters: Filters,
): boolean {
  if (filters.status !== undefined) {
    const publisher = frontmatter.publisher as
      | Record<string, unknown>
      | undefined;
    if ((publisher?.status ?? undefined) !== filters.status) return false;
  }
  if (filters.thema !== undefined) {
    const themen = frontmatter.themen;
    if (!Array.isArray(themen) || !themen.includes(filters.thema)) {
      return false;
    }
  }
  return true;
}

function loadFrontmatter(file: string) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = splitFrontmatter(raw);
  if (!parsed) return null;
  const doc = parseDocument(parsed.fmText);
  const data = (doc.toJS() ?? {}) as Record<string, unknown>;
  return { data, doc, parsed };
}

function writeFrontmatter(
  file: string,
  parsed: ParsedFrontmatter,
  doc: ReturnType<typeof parseDocument>,
) {
  const newFmText = doc.toString({ lineWidth: 0 }).replace(/\n$/, '');
  const out = `---\n${newFmText}\n---\n${parsed.body}`;
  fs.writeFileSync(file, out, 'utf8');
}

async function runSet(
  key: string,
  rawValue: string,
  filters: Filters,
  dryRun: boolean,
) {
  if (!hasFilter(filters)) {
    console.error(
      'Refusing to run `set` with no filter -- pass --all or a scoping filter (--year, --path, --status, --thema).',
    );
    process.exitCode = 1;
    return;
  }
  const value = coerceValue(rawValue);
  const files = await findCandidateFiles(filters);
  let changed = 0;

  for (const file of files) {
    const loaded = loadFrontmatter(file);
    if (!loaded) continue;
    const { parsed, doc, data } = loaded;
    if (!matchesPostLevelFilters(data, filters)) continue;

    doc.setIn(['publisher', key], value);
    changed++;

    if (dryRun) {
      console.log(
        `[dry-run] ${path.relative(projectRoot, file)}: publisher.${key} = ${JSON.stringify(value)}`,
      );
    } else {
      writeFrontmatter(file, parsed, doc);
    }
  }

  console.log(
    `${dryRun ? '[dry-run] would set' : 'Set'} publisher.${key} = ${JSON.stringify(value)} on ${changed} post(s).`,
  );
}

async function runUnset(key: string, filters: Filters, dryRun: boolean) {
  if (!hasFilter(filters)) {
    console.error(
      'Refusing to run `unset` with no filter -- pass --all or a scoping filter (--year, --path, --status, --thema).',
    );
    process.exitCode = 1;
    return;
  }
  const files = await findCandidateFiles(filters);
  let changed = 0;

  for (const file of files) {
    const loaded = loadFrontmatter(file);
    if (!loaded) continue;
    const { parsed, doc, data } = loaded;
    if (!matchesPostLevelFilters(data, filters)) continue;
    const publisher = data.publisher as Record<string, unknown> | undefined;
    if (!publisher || !(key in publisher)) continue;

    doc.deleteIn(['publisher', key]);
    const remaining = doc.get('publisher', true);
    if (!isMap(remaining) || remaining.items.length === 0) {
      doc.delete('publisher');
    }
    changed++;

    if (dryRun) {
      console.log(
        `[dry-run] ${path.relative(projectRoot, file)}: unset publisher.${key}`,
      );
    } else {
      writeFrontmatter(file, parsed, doc);
    }
  }

  console.log(
    `${dryRun ? '[dry-run] would unset' : 'Unset'} publisher.${key} on ${changed} post(s).`,
  );
}

async function runList(filters: Filters) {
  const files = await findCandidateFiles(filters);
  let matched = 0;

  for (const file of files) {
    const loaded = loadFrontmatter(file);
    if (!loaded) continue;
    const { data } = loaded;
    if (!matchesPostLevelFilters(data, filters)) continue;
    matched++;
    const publisher = data.publisher as Record<string, unknown> | undefined;
    const rel = path.relative(projectRoot, file);
    console.log(`${rel}\t${publisher ? JSON.stringify(publisher) : '(none)'}`);
  }

  console.log(`\n${matched} post(s) matched.`);
}

async function main() {
  const { command, positional, filters, dryRun } = parseArgs(
    process.argv.slice(2),
  );

  switch (command) {
    case 'set': {
      const [key, value] = positional;
      if (!key || value === undefined) {
        console.error('Usage: publisher set <key> <value> <filter...>');
        process.exitCode = 1;
        return;
      }
      await runSet(key, value, filters, dryRun);
      break;
    }
    case 'unset': {
      const [key] = positional;
      if (!key) {
        console.error('Usage: publisher unset <key> <filter...>');
        process.exitCode = 1;
        return;
      }
      await runUnset(key, filters, dryRun);
      break;
    }
    case 'list':
      await runList(filters);
      break;
    default:
      console.error(
        'Usage:\n  publisher set <key> <value> <filter...> [--dry-run]\n  publisher unset <key> <filter...> [--dry-run]\n  publisher list [filter...]',
      );
      process.exitCode = 1;
  }
}

main();
