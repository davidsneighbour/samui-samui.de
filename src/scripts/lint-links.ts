import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// Relative imports only: this script runs via plain `node`, not Vite, so
// `@utils/*` path aliases aren't resolved here.
import { getPostDateParts } from '../utils/dates.ts';
import { readYamlFrontmatter } from '../utils/taxonomies/frontmatter.ts';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '../..');
const contentRoot = path.join(projectRoot, 'src/content');
const lycheeConfigPath = path.join(projectRoot, 'src/config/lychee.toml');
const markdownExtensions = new Set(['.md', '.mdx']);

type Options = {
  staged: boolean;
  paths: string[];
};

function usage() {
  console.log(`Usage: npm run lint:links -- [src/content/path ...]

Checks Markdown and MDX links in src/content with lychee.

Examples:
  npm run lint:links
  npm run lint:links -- src/content/posts/2005
  npm run lint:links -- src/content/posts/2005/01/example/index.md`);
}

function parseArgs(argv: string[]): Options {
  const paths: string[] = [];
  let staged = false;

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    }

    if (arg === '--staged') {
      staged = true;
      continue;
    }

    paths.push(arg);
  }

  return { paths, staged };
}

function toRepositoryPath(absolutePath: string): string {
  return path.relative(projectRoot, absolutePath).split(path.sep).join('/');
}

function isInContent(absolutePath: string): boolean {
  const relative = path.relative(contentRoot, absolutePath);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
}

function resolveInputPath(inputPath: string): string {
  return path.resolve(projectRoot, inputPath);
}

async function collectMarkdownFiles(inputPath: string): Promise<string[]> {
  const stat = await fs.stat(inputPath);

  if (stat.isFile()) {
    return markdownExtensions.has(path.extname(inputPath)) ? [inputPath] : [];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  const entries = await fs.readdir(inputPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) =>
      collectMarkdownFiles(path.join(inputPath, entry.name)).catch(
        (error: unknown) => {
          console.error(
            `Could not read ${toRepositoryPath(path.join(inputPath, entry.name))}: ${String(error)}`,
          );
          process.exitCode = 1;
          return [];
        },
      ),
    ),
  );

  return files.flat();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Posts documented in documentation/content/post-paths.md's "date-free
 * folder form" (`src/content/posts/YYYY/slug/`, no `MM` subfolder) still
 * get a `/YYYY/MM/slug/` permalink (from `src/utils/posts.ts`'s
 * `getPostUrl`, mirrored here since that module needs `astro:content`
 * types this plain-`node` script doesn't have). The generic
 * `(\d{4})/(\d{2})/([^/#?]+)` route rule below assumes the URL's `MM`
 * segment is also the folder name, which is false for these -- so a local
 * link using the public permalink form (e.g. a post's own PDF copy,
 * `/2026/08/some-slug/some.pdf`) would otherwise remap to a folder that
 * doesn't exist. Emitted as specific rules ahead of the generic one so
 * lychee's first-match-wins picks these over it.
 */
async function findDateFreePostRemaps(rootFileUrl: string): Promise<string[]> {
  const postsRoot = path.join(contentRoot, 'posts');
  const yearEntries = await fs.readdir(postsRoot, { withFileTypes: true });
  const remaps: string[] = [];

  for (const yearEntry of yearEntries) {
    if (!yearEntry.isDirectory() || !/^\d{4}$/.test(yearEntry.name)) continue;
    const yearDir = path.join(postsRoot, yearEntry.name);
    const slugEntries = await fs.readdir(yearDir, { withFileTypes: true });

    for (const slugEntry of slugEntries) {
      if (!slugEntry.isDirectory() || /^\d{2}$/.test(slugEntry.name)) continue;
      const indexFile = path.join(yearDir, slugEntry.name, 'index.md');
      let data: Record<string, unknown>;
      try {
        data = readYamlFrontmatter(indexFile);
      } catch {
        continue;
      }

      const url =
        typeof data['url'] === 'string' ? data['url'].trim() : undefined;
      let prefix: string;
      if (url) {
        prefix = url.replace(/^\//, '').replace(/\/$/, '');
      } else {
        const date =
          typeof data['date'] === 'string' ? new Date(data['date']) : undefined;
        if (!date || Number.isNaN(date.valueOf())) continue;
        const { monthPadded, year } = getPostDateParts(date);
        prefix = `${year}/${monthPadded}/${slugEntry.name}`;
      }

      const target = `${rootFileUrl}src/content/posts/${yearEntry.name}/${slugEntry.name}/`;
      remaps.push(`${escapeRegex(prefix)}/?(?:[#?].*)? ${target}`);
    }
  }

  return remaps;
}

async function routeRemaps(): Promise<string[]> {
  const rootFileUrl = pathToFileURL(`${projectRoot}/`).href;
  const escapedRootFileUrl = escapeRegex(rootFileUrl);
  const samuiDomainUrl = String.raw`https?://(?:www\.)?samui-samui\.de`;
  const routeSources = [`${escapedRootFileUrl}`, `${samuiDomainUrl}/`];
  const dateFreePostRemaps = (
    await findDateFreePostRemaps(rootFileUrl)
  ).flatMap((rule) => routeSources.map((source) => `${source}${rule}`));
  const routeRules = [
    [
      String.raw`(\d{4})/(\d{2})/([^/#?]+)/?(?:[#?].*)?`,
      `${rootFileUrl}src/content/posts/$1/$2/$3/`,
    ],
    [
      String.raw`(leute|orte|ereignisse|themen)/([^/#?]+)/?(?:[#?].*)?`,
      `${rootFileUrl}src/content/$1/$2/`,
    ],
    [
      String.raw`(kontakt|suche)/?(?:[#?].*)?`,
      `${rootFileUrl}src/pages/$1.mdx`,
    ],
    [
      String.raw`(?:kleingedrucktes/)?(datenschutzerklaerung)/?(?:[#?].*)?`,
      `${rootFileUrl}src/pages/kleingedrucktes/$1.mdx`,
    ],
    [
      String.raw`archiv/?(?:[#?].*)?`,
      `${rootFileUrl}src/pages/archiv/index.astro`,
    ],
    [
      String.raw`feiertage/?(?:[#?].*)?`,
      `${rootFileUrl}src/content/feiertage/`,
    ],
    [String.raw`(wp-content|assets)/(.+)`, `${rootFileUrl}public/$1/$2`],
  ];

  return [
    ...dateFreePostRemaps,
    ...routeSources.flatMap((source) =>
      routeRules.map(([from, to]) => `${source}${from} ${to}`),
    ),
    `${samuiDomainUrl}/?(?:[#?].*)? ${rootFileUrl}src/pages/index.astro`,
    `${samuiDomainUrl}/(.+) ${rootFileUrl}$1`,
  ];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPaths = options.paths.length > 0 ? options.paths : ['src/content'];
  const validInputPaths: string[] = [];

  for (const inputPath of inputPaths) {
    const absolutePath = resolveInputPath(inputPath);

    if (!isInContent(absolutePath)) {
      if (options.staged) {
        continue;
      }

      console.error(
        `Refusing to link-check ${inputPath}: lint:links is limited to src/content for now.`,
      );
      process.exit(1);
    }

    validInputPaths.push(absolutePath);
  }

  const collectedFiles = await Promise.all(
    validInputPaths.map((inputPath) =>
      collectMarkdownFiles(inputPath).catch((error: NodeJS.ErrnoException) => {
        if (options.staged && error.code === 'ENOENT') {
          return [];
        }

        console.error(
          `Could not read ${toRepositoryPath(inputPath)}: ${error.message}`,
        );
        process.exit(1);
      }),
    ),
  );

  const files = [...new Set(collectedFiles.flat())]
    .map((filePath) => toRepositoryPath(filePath))
    .sort();

  if (files.length === 0) {
    console.log(
      'Link check scope: 0 content Markdown/MDX files. Nothing to check.',
    );
    return;
  }

  console.log(
    `Link check scope: ${files.length} content Markdown/MDX file(s).`,
  );
  console.log('Lychee reports aggregate link totals below.');
  console.log(`Lychee config: ${toRepositoryPath(lycheeConfigPath)}`);

  const remapArgs = (await routeRemaps()).flatMap((remap) => [
    '--remap',
    remap,
  ]);
  const lycheeArgs = [
    '--config',
    lycheeConfigPath,
    '--root-dir',
    projectRoot,
    ...remapArgs,
    '--files-from',
    '-',
  ];

  const child = spawn('lychee', lycheeArgs, {
    cwd: projectRoot,
    stdio: ['pipe', 'inherit', 'inherit'],
  });

  child.stdin.end(`${files.join('\n')}\n`);

  const exitCode = await new Promise<number>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') {
      console.error(
        'Could not find lychee. Install lycheeverse/lychee before running lint:links.',
      );
      return 1;
    }

    console.error(String(error));
    return 1;
  });

  process.exit(exitCode);
}

await main();
