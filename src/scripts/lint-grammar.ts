#!/usr/bin/env node
/**
 * German grammar check for content Markdown through a local LanguageTool
 * server. Only prose is sent as text; frontmatter, code, HTML, quotes, and
 * footnote definitions are sent as markup, so LanguageTool reports offsets in
 * the original source without a shadow copy.
 *
 * LanguageTool is the grammar layer only. Spelling belongs to CSpell and the
 * house orthography to Vale (see
 * documentation/content/german-orthography-and-grammar.md), so rules that
 * enforce modern spelling variants are disabled or filtered here.
 *
 * Usage:
 *   npm run languagetool:start
 *   npm run lint:grammar -- [paths...]
 *
 * When the default server is not reachable, the script starts it through
 * `npm run languagetool:start` (Docker) and waits until it answers, so the
 * pre-commit hook and `npm run check:full` work without a manual step.
 *
 * Environment:
 *   LANGUAGETOOL_URL  server base URL (default http://127.0.0.1:8010); a
 *                     custom URL is never started automatically
 */
import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import type { Nodes } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { applyReplacements, DASH_REPLACEMENTS } from './remark/typography.ts';

export type AnnotationPart =
  | { text: string }
  | { markup: string; interpretAs?: string };

export interface LanguageToolMatch {
  message: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule: { id: string; category: { id: string } };
}

export interface GrammarFinding {
  line: number;
  column: number;
  ruleId: string;
  message: string;
  text: string;
  suggestion?: string;
}

/** Spelling is checked by CSpell (`npm run lint:spell`). */
export const DISABLED_RULES = ['GERMAN_SPELLER_RULE'];

/**
 * Modern-variant recommendations (Graphik → Grafik, Potential → Potenzial)
 * contradict the house spelling, which Vale enforces.
 */
export const DISABLED_CATEGORIES = ['EMPFOHLENE_RECHTSCHREIBUNG'];

/**
 * Proper names (film titles, brands) whose official spelling LanguageTool
 * flags. A match is dropped when its exact text is listed here, like
 * `TokenIgnores` in `.vale.ini`.
 */
export const IGNORED_TEXTS = ['Kung Fu'];

/**
 * Per-post exceptions for intentional informal style, for example
 * `<!-- grammar-ignore ERSTE_PERSON_SIN_OHNE_E bastel -->`. A match is dropped
 * only when both its rule ID and its exact text are listed in the same post,
 * like a file-level `cspell:ignore` comment. HTML comments are markup, so the
 * comment itself is never checked.
 */
const LOCAL_IGNORE = /<!--\s*grammar-ignore\s+([A-Z0-9_]+)\s+(.+?)\s*-->/g;

export function localIgnores(source: string): Set<string> {
  return new Set(
    Array.from(
      source.matchAll(LOCAL_IGNORE),
      ([, ruleId, text]) => `${ruleId} ${text}`,
    ),
  );
}

/** Mdast nodes whose content is not the author's checkable prose. */
const SKIPPED_NODES = new Set([
  'blockquote',
  'code',
  'definition',
  'footnoteDefinition',
  'html',
  'image',
  'imageReference',
  'yaml',
]);

/** Mdast nodes that start a separate paragraph for LanguageTool. */
const BLOCK_NODES = new Set(['heading', 'paragraph', 'tableCell']);

interface Range {
  start: number;
  end: number;
  block: number;
  /** Parsed text, set for prose text nodes. */
  value?: string;
  /** Set for markup inside prose, for example inline code. */
  interpretAs?: string;
}

const collapse = (value: string): string => value.replace(/\s+/g, ' ');

/**
 * Legacy Textpattern tags such as `<txp:gho_permalink id="1">` are not valid
 * CommonMark HTML (tag names cannot contain colons), so remark keeps them in
 * text nodes.
 */
const NAMESPACED_TAG = /^<\/?[a-z][\w-]*:[^>]*>$/i;

/**
 * Split a text node into prose, dash shortcuts rendered by typography.ts, and
 * legacy namespaced tags.
 */
function textParts(slice: string, value: string): AnnotationPart[] {
  // Escapes and character references differ from their source; keep them
  // as markup so offsets stay exact.
  if (collapse(slice) !== collapse(value))
    return [
      {
        interpretAs: applyReplacements(value, DASH_REPLACEMENTS),
        markup: slice,
      },
    ];
  return slice
    .split(/(---|--|<\/?[a-z][\w-]*:[^>]*>)/i)
    .filter((part) => part !== '')
    .map((part) => {
      if (part === '---' || part === '--')
        return {
          interpretAs: applyReplacements(part, DASH_REPLACEMENTS),
          markup: part,
        };
      return NAMESPACED_TAG.test(part) ? { markup: part } : { text: part };
    });
}

/** Convert Markdown into LanguageTool annotated text covering every character. */
export function toAnnotation(source: string): AnnotationPart[] {
  // Blank the frontmatter but keep its length so offsets stay exact.
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/, (yaml) =>
    yaml.replace(/[^\r\n]/g, ' '),
  );
  const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
  const ranges: Range[] = [];
  let blockCount = 0;

  function walk(node: Nodes, block: number): void {
    if (SKIPPED_NODES.has(node.type)) return;
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (node.type === 'text' && start !== undefined && end !== undefined) {
      if (block >= 0) ranges.push({ block, end, start, value: node.value });
      return;
    }
    if (
      node.type === 'inlineCode' &&
      start !== undefined &&
      end !== undefined
    ) {
      if (block >= 0)
        ranges.push({ block, end, interpretAs: node.value, start });
      return;
    }
    if (node.type === 'break' && start !== undefined && end !== undefined) {
      if (block >= 0) ranges.push({ block, end, interpretAs: '\n', start });
      return;
    }
    const childBlock = BLOCK_NODES.has(node.type) ? blockCount++ : block;
    if ('children' in node)
      for (const child of node.children) walk(child, childBlock);
  }
  walk(tree, -1);

  const parts: AnnotationPart[] = [];
  let cursor = 0;
  let previousBlock = -1;
  for (const range of ranges) {
    if (range.start > cursor) {
      const gap = source.slice(cursor, range.start);
      parts.push(
        previousBlock >= 0 && range.block !== previousBlock
          ? { interpretAs: '\n\n', markup: gap }
          : { markup: gap },
      );
    } else if (previousBlock >= 0 && range.block !== previousBlock) {
      parts.push({ interpretAs: '\n\n', markup: '' });
    }
    const slice = source.slice(range.start, range.end);
    parts.push(
      ...(range.value === undefined
        ? [{ interpretAs: range.interpretAs ?? '', markup: slice }]
        : textParts(slice, range.value)),
    );
    cursor = range.end;
    previousBlock = range.block;
  }
  if (cursor < source.length) parts.push({ markup: source.slice(cursor) });
  return parts;
}

/**
 * Drop matches that contradict the house orthography. OLD_SPELLING_RULE is
 * kept only for pre-reform ß forms (daß → dass), because the archive uses
 * reformed ß/ss spelling but traditional loanword spellings (Photo, Graphik).
 */
export function isRelevantMatch(
  match: LanguageToolMatch,
  source: string,
  ignores: Set<string> = localIgnores(source),
): boolean {
  const text = source.slice(match.offset, match.offset + match.length);
  if (DISABLED_RULES.includes(match.rule.id)) return false;
  if (DISABLED_CATEGORIES.includes(match.rule.category.id)) return false;
  if (IGNORED_TEXTS.includes(text)) return false;
  if (ignores.has(`${match.rule.id} ${text}`)) return false;
  if (match.rule.id === 'OLD_SPELLING_RULE') return text.includes('ß');
  return true;
}

/** Map LanguageTool matches to 1-based source lines and columns. */
export function toFindings(
  matches: LanguageToolMatch[],
  source: string,
): GrammarFinding[] {
  const lineStarts = [0];
  for (let index = 0; index < source.length; index++)
    if (source[index] === '\n') lineStarts.push(index + 1);
  const ignores = localIgnores(source);
  return matches
    .filter((match) => isRelevantMatch(match, source, ignores))
    .map((match) => {
      let line = lineStarts.length;
      while ((lineStarts[line - 1] ?? 0) > match.offset) line--;
      const finding: GrammarFinding = {
        column: match.offset - (lineStarts[line - 1] ?? 0) + 1,
        line,
        message: match.message,
        ruleId: match.rule.id,
        text: source.slice(match.offset, match.offset + match.length),
      };
      const suggestion = match.replacements[0]?.value;
      if (suggestion !== undefined) finding.suggestion = suggestion;
      return finding;
    });
}

export async function checkGrammar(
  annotation: AnnotationPart[],
  baseUrl: string,
  timeoutMs = 60_000,
): Promise<LanguageToolMatch[]> {
  const body = new URLSearchParams({
    data: JSON.stringify({ annotation }),
    disabledCategories: DISABLED_CATEGORIES.join(','),
    disabledRules: DISABLED_RULES.join(','),
    language: 'de-DE',
  });
  const response = await fetch(`${baseUrl}/v2/check`, {
    body,
    method: 'POST',
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`LanguageTool returned HTTP ${response.status}: ${detail}`);
  }
  const data = (await response.json()) as { matches?: unknown };
  if (!Array.isArray(data.matches))
    throw new Error('Invalid LanguageTool response: missing matches array');
  return data.matches as LanguageToolMatch[];
}

async function collectFiles(args: string[]): Promise<string[]> {
  const targets = args.length ? args : ['src/content'];
  const files: string[] = [];
  for (const target of targets) {
    if ((await stat(target)).isDirectory())
      files.push(...(await glob(`${target}/**/*.md`, { nodir: true })));
    else if (target.endsWith('.md')) files.push(target);
  }
  return files.sort();
}

const DEFAULT_URL = 'http://127.0.0.1:8010';

async function isReachable(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/v2/languages`, {
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Start the local Docker server and wait until it answers (max. 2 minutes). */
async function startServer(baseUrl: string): Promise<boolean> {
  console.log('LanguageTool is not running; starting it with Docker.');
  try {
    execFileSync('npm', ['run', '--silent', 'languagetool:start'], {
      stdio: ['ignore', 'ignore', 'inherit'],
    });
  } catch {
    return false;
  }
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (await isReachable(baseUrl)) {
      console.log(
        'LanguageTool started. Stop it with `npm run languagetool:stop`.',
      );
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  return false;
}

async function main(): Promise<void> {
  const baseUrl = (process.env['LANGUAGETOOL_URL'] ?? DEFAULT_URL).replace(
    /\/$/,
    '',
  );
  if (
    !(await isReachable(baseUrl)) &&
    !(baseUrl === DEFAULT_URL && (await startServer(baseUrl)))
  ) {
    console.error(
      `LanguageTool is not reachable at ${baseUrl}. Start it with \`npm run languagetool:start\` (needs Docker) or set LANGUAGETOOL_URL.`,
    );
    process.exitCode = 2;
    return;
  }

  const files = await collectFiles(process.argv.slice(2));
  const queue = [...files];
  let count = 0;
  async function worker(): Promise<void> {
    for (let file = queue.shift(); file; file = queue.shift()) {
      const source = await readFile(file, 'utf8');
      const matches = await checkGrammar(toAnnotation(source), baseUrl);
      for (const finding of toFindings(matches, source)) {
        const suggestion = finding.suggestion
          ? ` -> ${finding.suggestion}`
          : '';
        console.error(
          `${file}:${finding.line}:${finding.column}  ${finding.ruleId}  ${finding.text}${suggestion}  (${finding.message})`,
        );
        count++;
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  console.log(
    `German grammar: ${count} finding(s) in ${files.length} file(s).`,
  );
  if (count) process.exitCode = 1;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
