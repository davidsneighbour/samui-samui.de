#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import type { Nodes } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const months: Record<string, string> = {
  apr: 'April',
  april: 'April',
  aug: 'August',
  august: 'August',
  dec: 'Dezember',
  december: 'Dezember',
  dez: 'Dezember',
  dezember: 'Dezember',
  feb: 'Februar',
  februar: 'Februar',
  february: 'Februar',
  jan: 'Januar',
  januar: 'Januar',
  january: 'Januar',
  jul: 'Juli',
  juli: 'Juli',
  july: 'Juli',
  jun: 'Juni',
  june: 'Juni',
  juni: 'Juni',
  mai: 'Mai',
  mar: 'März',
  march: 'März',
  may: 'Mai',
  mär: 'März',
  märz: 'März',
  nov: 'November',
  november: 'November',
  oct: 'Oktober',
  october: 'Oktober',
  okt: 'Oktober',
  oktober: 'Oktober',
  sep: 'September',
  sept: 'September',
  september: 'September',
};
const monthPattern = Object.keys(months)
  .sort((a, b) => b.length - a.length)
  .join('|');
const datePattern = new RegExp(
  `\\b(?:(?<day>\\d{1,2})(?<dot>\\.)?\\s+(?<month>${monthPattern})(?<abbrDot>\\.)?|(?<firstMonth>${monthPattern})\\.?\\s+(?<firstDay>\\d{1,2})(?:st|nd|rd|th)?)(?![\\p{L}\\d])(?:,?\\s+(?<year>\\d{4}))?`,
  'giu',
);

export interface DateFinding {
  line: number;
  column: number;
  text: string;
  suggestion: string;
}

/** Inspect citation prose, excluding literal source titles, URLs, and code. */
export function findGermanDateIssues(source: string): DateFinding[] {
  const findings: DateFinding[] = [];
  const sourceLines = source.split(/\r?\n/);
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/, (yaml) =>
    yaml.replace(/[^\r\n]/g, ' '),
  );
  const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
  function inspect(node: Nodes, inFootnote = false): void {
    if (
      [
        'link',
        'linkReference',
        'image',
        'imageReference',
        'code',
        'inlineCode',
        'html',
        'blockquote',
      ].includes(node.type)
    )
      return;
    const inCitation = inFootnote || node.type === 'footnoteDefinition';
    if (node.type === 'text' && inCitation) {
      for (const match of node.value.matchAll(datePattern)) {
        const groups = match.groups;
        if (!groups) continue;
        const rawMonth = groups['month'] ?? groups['firstMonth'] ?? '';
        const month = months[rawMonth.toLowerCase()];
        const day = Number(groups['day'] ?? groups['firstDay']);
        if (!month || day < 1 || day > 31) continue;
        if (groups['day'] && groups['dot'] && rawMonth === month) continue;
        const suggestion = `${day}. ${month}${groups['year'] ? ` ${groups['year']}` : ''}`;
        const before = node.value.slice(0, match.index);
        const lines = before.split('\n');
        const line = (node.position?.start.line ?? 1) + lines.length - 1;
        const approximateColumn =
          lines.length === 1
            ? (node.position?.start.column ?? 1) + match.index
            : (lines.at(-1)?.length ?? 0) + 1;
        // Markdown removes indentation from continued footnote text.
        const originalIndex =
          sourceLines[line - 1]?.indexOf(match[0], approximateColumn - 1) ?? -1;
        findings.push({
          column: originalIndex >= 0 ? originalIndex + 1 : approximateColumn,
          line,
          suggestion,
          text: match[0],
        });
      }
    }
    if ('children' in node)
      for (const child of node.children) inspect(child, inCitation);
  }
  inspect(tree);
  return findings;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const files = args.length
    ? args
    : await glob('src/content/**/*.{md,mdx}', { nodir: true });
  let count = 0;
  for (const file of files) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const findings = findGermanDateIssues(await readFile(file, 'utf8'));
    for (const finding of findings)
      console.error(
        `${file}:${finding.line}:${finding.column}  ${finding.text} -> ${finding.suggestion}`,
      );
    count += findings.length;
  }
  console.log(
    `German citation dates: ${count} finding(s) in ${files.length} file(s).`,
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
