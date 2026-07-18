#!/usr/bin/env -S node

import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const config = {
  contentDirectory: 'src/content/posts',
  defaultCoverType: 'image',
} as const;

interface CliOptions {
  help: boolean;
  verbose: boolean;
  dryRun: boolean;
  force: boolean;
  noOpen: boolean;
}

interface CreatePostContentOptions {
  title: string;
  tags: string[];
  date: Date;
}

interface PostInput {
  title: string;
  tagInput: string;
}

/**
 * Print CLI usage information.
 *
 * @returns Nothing.
 */
function printHelp(): void {
  const command = path.basename(process.argv[1] ?? 'new-blog-post.ts');

  console.log(`Usage:
  node src/scripts/${command} [options]

Options:
  --help       Show this help message.
  --verbose    Print additional information.
  --dry-run    Print the target file and content without writing it.
  --force      Overwrite an existing post file.
  --no-open    Do not open the created file in VS Code.

Behaviour:
  - Asks for a blog post title.
  - Optionally asks for comma-separated tags.
  - Creates src/content/posts/YYYY/cleaned-title/index.md.
  - Leaves description and cover fields empty.
  - Opens the created file in VS Code via "code <path>".
`);
}

/**
 * Parse supported CLI flags.
 *
 * @param args - CLI arguments.
 * @returns Parsed CLI options.
 */
function parseArgs(args: string[]): CliOptions {
  return {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    help: args.includes('--help'),
    noOpen: args.includes('--no-open'),
    verbose: args.includes('--verbose'),
  };
}

/**
 * Convert a post title into a filesystem-safe slug.
 *
 * @param title - Human-readable post title.
 * @returns Cleaned lowercase slug.
 */
function slugifyTitle(title: string): string {
  const replacements = new Map<string, string>([
    ['ä', 'ae'],
    ['ö', 'oe'],
    ['ü', 'ue'],
    ['Ä', 'ae'],
    ['Ö', 'oe'],
    ['Ü', 'ue'],
    ['ß', 'ss'],
  ]);

  const replaced = [...title]
    .map((character) => replacements.get(character) ?? character)
    .join('');

  return replaced
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Convert a comma-separated tag input into a normalised tag list.
 *
 * @param input - Raw user input.
 * @returns Normalised tags.
 */
function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
}

/**
 * Escape a string for safe double-quoted YAML output.
 *
 * @param value - Raw value.
 * @returns YAML-safe string.
 */
function escapeYamlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Build the Markdown frontmatter content for a new post.
 *
 * @param options - Post content options.
 * @returns Markdown document content.
 */
function createPostContent(options: CreatePostContentOptions): string {
  const tags =
    options.tags.length > 0
      ? `tags:\n${options.tags.map((tag) => `  - ${tag}`).join('\n')}`
      : 'tags: []';

  return `---
title: "${escapeYamlString(options.title)}"
description: ""
summary: ""
${tags}
cover:
  src: ""
  type: ${config.defaultCoverType}
  title: ""
date: ${options.date.toISOString()}
---

`;
}

/**
 * Open a file in VS Code using the "code" command.
 *
 * @param filePath - File path to open.
 * @returns Nothing.
 */
async function openInVSCode(filePath: string): Promise<void> {
  try {
    await execFileAsync('code', [filePath]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(
      `Could not open VS Code with "code ${filePath}". ${message}`,
    );
  }
}

/**
 * Read post metadata from interactive prompts or piped stdin.
 *
 * @returns Raw title and tag input.
 */
async function readPostInput(): Promise<PostInput> {
  if (!process.stdin.isTTY) {
    const chunks: Buffer[] = [];

    for await (const chunk of process.stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const [title = '', tagInput = ''] = Buffer.concat(chunks)
      .toString('utf8')
      .split(/\r?\n/);

    return {
      tagInput: tagInput.trim(),
      title: title.trim(),
    };
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const title = (
      await rl.question('What should the new blog post be called? ')
    ).trim();
    const tagInput = (
      await rl.question('Tags, comma-separated, or leave empty: ')
    ).trim();

    return { tagInput, title };
  } finally {
    rl.close();
  }
}

/**
 * Create a new blog post file from interactive input.
 *
 * @param options - Runtime options.
 * @returns Nothing.
 */
async function createBlogPost(options: CliOptions): Promise<void> {
  const { tagInput, title } = await readPostInput();

  if (title.length === 0) {
    throw new Error('A title is required.');
  }

  const tags = parseTags(tagInput);
  const slug = slugifyTitle(title);

  if (slug.length === 0) {
    throw new Error('The title did not produce a valid slug.');
  }

  const date = new Date();
  const year = String(date.getFullYear());
  const postDirectory = path.join(config.contentDirectory, year, slug);
  const postFile = path.join(postDirectory, 'index.md');
  const content = createPostContent({
    date,
    tags,
    title,
  });

  if (options.verbose || options.dryRun) {
    console.log(`Target file: ${postFile}`);
  }

  if (options.dryRun) {
    console.log('\nGenerated content:\n');
    console.log(content);
    return;
  }

  await mkdir(postDirectory, { recursive: true });
  await writeFile(postFile, content, {
    encoding: 'utf8',
    flag: options.force ? 'w' : 'wx',
  });

  console.log(`Created ${postFile}`);

  if (!options.noOpen) {
    await openInVSCode(postFile);
  }
}

/**
 * Main CLI entry point.
 *
 * @returns Nothing.
 */
async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  try {
    await createBlogPost(options);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`Error: ${message}`);
    console.error('Run with --help to see available options.');
    process.exitCode = 1;
  }
}

await main();
