#!/usr/bin/env node

import { stat as fsStat, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

interface NormalizeConfig {
  extensions: string[];
  replacements: Record<string, string>;
}

interface CliOptions {
  check: boolean;
  configPath: string | undefined;
  paths: string[];
  write: boolean;
}

type ProcessMode = 'check' | 'write';

interface Occurrence {
  column: number;
  context: string;
  file: string;
  line: number;
  match: string;
  replacement: string;
}

interface ProcessResult {
  changed: boolean;
  filename: string;
  occurrences: Occurrence[];
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '../..');
const defaultScopePaths = ['src/content'];

const DEFAULT_CONFIG: NormalizeConfig = {
  extensions: ['.md', '.mdx', '.astro'],
  replacements: {
    '&#196;': 'Ä',
    '&#214;': 'Ö',
    '&#220;': 'Ü',
    '&#223;': 'ß',
    '&#228;': 'ä',
    '&#246;': 'ö',
    '&#252;': 'ü',
    '&Auml;': 'Ä',
    '&auml;': 'ä',
    '&Ouml;': 'Ö',
    '&ouml;': 'ö',
    '&szlig;': 'ß',
    '&Uuml;': 'Ü',
    '&uuml;': 'ü',
  },
};

/**
 * Parse supported CLI flags.
 *
 * @param argv - CLI arguments.
 * @returns Parsed CLI options.
 */
function parseArguments(argv: string[]): CliOptions {
  const options: CliOptions = {
    check: false,
    configPath: undefined,
    paths: [],
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === undefined) {
      continue;
    }

    if (argument === '--help') {
      printHelp();
      process.exit(0);
    }

    switch (argument) {
      case '--check':
        options.check = true;
        break;

      case '--write':
        options.write = true;
        break;

      case '--config': {
        const configPath = argv[index + 1];

        if (!configPath) {
          throw new Error('Für --config fehlt ein Dateipfad.');
        }

        options.configPath = configPath;
        index += 1;
        break;
      }

      default:
        if (argument.startsWith('--')) {
          throw new Error(`Unbekannte Option: ${argument}`);
        }

        options.paths.push(argument);
    }
  }

  if (options.check === options.write) {
    throw new Error('Verwende entweder --check oder --write.');
  }

  if (options.paths.length === 0) {
    options.paths = [...defaultScopePaths];
  }

  return options;
}

/**
 * Print CLI usage information.
 *
 * @returns Nothing.
 */
function printHelp(): void {
  console.log(`
Normalisiert deutsche HTML-Entities in Textdateien.

Verwendung:
  node src/scripts/normalize-german-characters.ts --check [Pfade...]
  node src/scripts/normalize-german-characters.ts --write [Pfade...]

Optionen:
  --check          Prüfen, ohne Dateien zu verändern (zeigt Fundstellen)
  --write          Ersetzungen durchführen
  --config <Pfad>  Alternative Konfigurationsdatei verwenden
  --help           Diese Hilfe anzeigen

Ohne Pfadangabe wird rekursiv "${defaultScopePaths.join(', ')}" durchsucht.

Beispiele:
  node src/scripts/normalize-german-characters.ts --check
  node src/scripts/normalize-german-characters.ts --write src/content/post.md
`);
}

/**
 * Load the replacement configuration, merging an optional file with defaults.
 *
 * @param configPath - Optional path to a JSON configuration file.
 * @returns Resolved configuration.
 */
async function loadConfig(
  configPath: string | undefined,
): Promise<NormalizeConfig> {
  if (!configPath) {
    return DEFAULT_CONFIG;
  }

  const absolutePath = path.resolve(configPath);

  try {
    const source = await readFile(absolutePath, 'utf8');
    const parsed = JSON.parse(source) as Partial<NormalizeConfig>;

    return {
      extensions: parsed.extensions ?? DEFAULT_CONFIG.extensions,
      replacements: {
        ...DEFAULT_CONFIG.replacements,
        ...(parsed.replacements ?? {}),
      },
    };
  } catch (error: unknown) {
    throw new Error(
      `Konfiguration konnte nicht gelesen werden: ${absolutePath}`,
      {
        cause: error,
      },
    );
  }
}

function toRepositoryPath(absolutePath: string): string {
  return path.relative(projectRoot, absolutePath).split(path.sep).join('/');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function buildMatcher(replacements: Record<string, string>): RegExp {
  const alternatives = Object.keys(replacements)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp);

  return new RegExp(alternatives.join('|'), 'g');
}

/**
 * Recursively collect files under a path that match the configured extensions.
 *
 * @param inputPath - Absolute file or directory path.
 * @param extensions - Extensions (with leading dot) to include.
 * @returns Absolute paths of matching files.
 */
async function collectFiles(
  inputPath: string,
  extensions: string[],
): Promise<string[]> {
  const stats = await fsStat(inputPath);

  if (stats.isFile()) {
    return extensions.includes(path.extname(inputPath)) ? [inputPath] : [];
  }

  if (!stats.isDirectory()) {
    return [];
  }

  const entries = await readdir(inputPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      collectFiles(path.join(inputPath, entry.name), extensions),
    ),
  );

  return files.flat();
}

/**
 * Find every entity occurrence in a file's content, with line/column position.
 *
 * @param file - Repository-relative file path, for reporting.
 * @param content - File content.
 * @param replacements - Map of source entity to replacement character.
 * @returns Occurrences in reading order.
 */
function findOccurrences(
  file: string,
  content: string,
  replacements: Record<string, string>,
): Occurrence[] {
  const matcher = buildMatcher(replacements);
  const lines = content.split(/\r\n|\r|\n/);
  const occurrences: Occurrence[] = [];

  lines.forEach((lineText, lineIndex) => {
    for (const match of lineText.matchAll(matcher)) {
      const source = match[0];
      const replacement = replacements[source];

      if (replacement === undefined || match.index === undefined) {
        continue;
      }

      occurrences.push({
        column: match.index + 1,
        context: lineText.trim(),
        file,
        line: lineIndex + 1,
        match: source,
        replacement,
      });
    }
  });

  return occurrences;
}

function formatOccurrence(occurrence: Occurrence): string {
  return `${occurrence.file}:${occurrence.line}:${occurrence.column}  ${occurrence.match} -> ${occurrence.replacement}  |  ${occurrence.context}`;
}

/**
 * Apply all configured replacements to a string.
 *
 * @param content - Original file content.
 * @param replacements - Map of source entity to replacement character.
 * @returns Normalised content.
 */
function normalizeContent(
  content: string,
  replacements: Record<string, string>,
): string {
  let normalized = content;

  for (const [source, replacement] of Object.entries(replacements)) {
    normalized = normalized.replaceAll(source, replacement);
  }

  return normalized;
}

/**
 * Normalise a single file, optionally writing the result back to disk.
 *
 * @param absolutePath - Absolute path to the file.
 * @param config - Resolved configuration.
 * @param mode - Whether to check or write changes.
 * @returns Outcome of processing the file.
 */
async function processFile(
  absolutePath: string,
  config: NormalizeConfig,
  mode: ProcessMode,
): Promise<ProcessResult> {
  const repoPath = toRepositoryPath(absolutePath);
  const original = await readFile(absolutePath, 'utf8');
  const occurrences =
    mode === 'check'
      ? findOccurrences(repoPath, original, config.replacements)
      : [];
  const normalized =
    mode === 'write'
      ? normalizeContent(original, config.replacements)
      : original;
  const changed =
    mode === 'write' ? normalized !== original : occurrences.length > 0;

  if (changed && mode === 'write') {
    await writeFile(absolutePath, normalized, 'utf8');
  }

  return {
    changed,
    filename: repoPath,
    occurrences,
  };
}

/**
 * Main CLI entry point.
 *
 * @returns Nothing.
 */
async function main(): Promise<void> {
  try {
    const options = parseArguments(process.argv.slice(2));
    const config = await loadConfig(options.configPath);
    const mode: ProcessMode = options.write ? 'write' : 'check';

    const collected = await Promise.all(
      options.paths.map((inputPath) =>
        collectFiles(path.resolve(projectRoot, inputPath), config.extensions),
      ),
    );

    const files = [...new Set(collected.flat())].sort();

    if (files.length === 0) {
      console.log('Keine passenden Dateien gefunden.');
      return;
    }

    const results = await Promise.all(
      files.map((filename) => processFile(filename, config, mode)),
    );

    const changedResults = results.filter((result) => result.changed);

    if (mode === 'write') {
      for (const result of changedResults) {
        console.log(`Normalisiert: ${result.filename}`);
      }

      console.log(
        `${changedResults.length} von ${results.length} Datei(en) normalisiert.`,
      );
      return;
    }

    const occurrences = changedResults.flatMap((result) => result.occurrences);

    if (occurrences.length === 0) {
      console.log(`${results.length} Datei(en) geprüft. Keine Fundstellen.`);
      return;
    }

    console.error(
      `${occurrences.length} Fundstelle(n) in ${changedResults.length} Datei(en):`,
    );

    for (const occurrence of occurrences) {
      console.error(formatOccurrence(occurrence));
    }

    console.error(
      'Ausführen mit --write (oder `npm run lint:umlauts:fix`), um automatisch zu ersetzen.',
    );

    process.exitCode = 1;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`Fehler: ${message}`);

    if (error instanceof Error && error.cause instanceof Error) {
      console.error(`Ursache: ${error.cause.message}`);
    }

    process.exitCode = 1;
  }
}

const entrypoint = process.argv[1] ? path.resolve(process.argv[1]) : undefined;

if (entrypoint === fileURLToPath(import.meta.url)) {
  await main();
}

export { DEFAULT_CONFIG, findOccurrences, formatOccurrence, normalizeContent };
