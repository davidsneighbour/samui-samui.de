#!/usr/bin/env node

import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

interface NormalizeConfig {
  extensions: string[];
  replacements: Record<string, string>;
}

interface CliOptions {
  check: boolean;
  configPath: string | undefined;
  files: string[];
  write: boolean;
}

type ProcessMode = 'check' | 'write';

interface ProcessResult {
  changed: boolean;
  filename: string;
  skipped: boolean;
}

const DEFAULT_CONFIG: NormalizeConfig = {
  extensions: ['.md', '.mdx', '.astro'],
  replacements: {
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
    files: [],
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

        options.files.push(argument);
    }
  }

  if (options.check === options.write) {
    throw new Error('Verwende entweder --check oder --write.');
  }

  if (options.files.length === 0) {
    throw new Error('Es wurden keine Dateien angegeben.');
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
  node src/scripts/normalize-german-characters.ts --write [Optionen] <Dateien...>
  node src/scripts/normalize-german-characters.ts --check [Optionen] <Dateien...>

Optionen:
  --write          Ersetzungen durchführen
  --check          Prüfen, ohne Dateien zu verändern
  --config <Pfad>  Alternative Konfigurationsdatei verwenden
  --help           Diese Hilfe anzeigen

Beispiele:
  node src/scripts/normalize-german-characters.ts --write src/content/post.md
  node src/scripts/normalize-german-characters.ts --check src/content/**/*.md
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
 * @param filename - Path to the file, as given on the command line.
 * @param config - Resolved configuration.
 * @param mode - Whether to check or write changes.
 * @returns Outcome of processing the file.
 */
async function processFile(
  filename: string,
  config: NormalizeConfig,
  mode: ProcessMode,
): Promise<ProcessResult> {
  const absolutePath = path.resolve(filename);
  const extension = path.extname(absolutePath).toLowerCase();

  if (!config.extensions.includes(extension)) {
    return {
      changed: false,
      filename,
      skipped: true,
    };
  }

  try {
    await access(absolutePath);
  } catch {
    throw new Error(`Datei existiert nicht oder ist nicht lesbar: ${filename}`);
  }

  const original = await readFile(absolutePath, 'utf8');
  const normalized = normalizeContent(original, config.replacements);
  const changed = normalized !== original;

  if (changed && mode === 'write') {
    await writeFile(absolutePath, normalized, 'utf8');
  }

  return {
    changed,
    filename,
    skipped: false,
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

    const results = await Promise.all(
      options.files.map((filename) => processFile(filename, config, mode)),
    );

    const changedFiles = results.filter((result) => result.changed);
    const skippedFiles = results.filter((result) => result.skipped);

    if (mode === 'write') {
      for (const result of changedFiles) {
        console.log(`Normalisiert: ${result.filename}`);
      }
    } else if (changedFiles.length > 0) {
      console.error(
        'Folgende Dateien enthalten ersetzbare deutsche HTML-Entities:',
      );

      for (const result of changedFiles) {
        console.error(`- ${result.filename}`);
      }

      process.exitCode = 1;
    }

    if (skippedFiles.length > 0) {
      console.log(
        `${skippedFiles.length} nicht unterstützte Dateien übersprungen.`,
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`Fehler: ${message}`);

    if (error instanceof Error && error.cause instanceof Error) {
      console.error(`Ursache: ${error.cause.message}`);
    }

    process.exitCode = 1;
  }
}

await main();
