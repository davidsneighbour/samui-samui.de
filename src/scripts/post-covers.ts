#!/usr/bin/env -S node

/**
 * Audit and migrate post cover frontmatter.
 *
 * Usage:
 *   node src/scripts/post-covers.ts audit [--all|--year=YYYY|--path=glob] [--summary]
 *   node src/scripts/post-covers.ts migrate [--all|--year=YYYY|--path=glob] [--dry-run] [--review] [--mark-missing]
 *
 * `migrate` only applies clear single-media cases:
 * - one local Markdown image (`![alt](./file.jpg)`)
 * - one standalone `<dnb-youtube>` or `<dnb-vimeo>` embed
 * - one Hugo `resources` image and no body media
 *
 * `--review` also migrates ambiguous posts that have at least one usable
 * candidate. It prefers the first Hugo `resources` image, keeps body media in
 * place, and marks the post with `publisher.covermigration: true`.
 *
 * `--mark-missing` can be combined with `--review` to mark posts that have no
 * usable cover candidate. It does not create fake/empty covers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { parseDocument, YAMLMap } from 'yaml';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '../..');
const postsBase = path.join(projectRoot, 'src/content/posts');

type CoverType = 'image' | 'youtube' | 'vimeo';

interface Filters {
  all: boolean;
  path?: string;
  summary: boolean;
  year?: string;
}

interface ParsedFrontmatter {
  body: string;
  fmText: string;
}

interface Candidate {
  caption: string | undefined;
  index: number;
  remove: RegExp | undefined;
  review: boolean;
  source: 'body-image' | 'body-video' | 'resources';
  src: string | undefined;
  type: CoverType;
  video: string | undefined;
}

interface LoadedPost {
  data: Record<string, unknown>;
  doc: ReturnType<typeof parseDocument>;
  file: string;
  parsed: ParsedFrontmatter;
}

type Classification =
  | Candidate
  | 'covered'
  | 'covered:review'
  | 'review:marked:no-candidate'
  | 'review:no-candidate';

const imageExtensionPattern = /\.(avif|gif|jpe?g|png|webp)$/i;
const localImagePathPattern = /^\.\/([^/\\]+)$/;
const markdownImagePattern =
  /^[ \t]*(?:\[[ \t]*)?!\[([^\]]*)\]\((\.\/[^)\s]+)\)(?:\][^\n]*)?[ \t]*$/gm;
const youtubePattern =
  /^[ \t]*<dnb-youtube\b(?=[^>]*\bvideoid="([^"]+)")(?=[^>]*(?:\bvideotitle="([^"]*)")?)[^>]*><\/dnb-youtube>[ \t]*$/gm;
const vimeoPattern =
  /^[ \t]*<dnb-vimeo\b(?=[^>]*\bvideoid="([^"]+)")(?=[^>]*(?:\bvideotitle="([^"]*)")?)[^>]*><\/dnb-vimeo>[ \t]*$/gm;
const anyMediaPattern =
  /!\[[^\]]*\]\([^)]+\)|<img\b|<dnb-youtube\b|<dnb-vimeo\b/gi;

function splitFrontmatter(raw: string): ParsedFrontmatter | null {
  const lines = raw.split('\n');
  if (lines[0]?.trim() !== '---') return null;

  let endLine = -1;
  for (let index = 1; index < lines.length; index++) {
    if (lines[index]?.trim() === '---') {
      endLine = index;
      break;
    }
  }

  if (endLine === -1) return null;

  return {
    body: lines.slice(endLine + 1).join('\n'),
    fmText: lines.slice(1, endLine).join('\n'),
  };
}

function parseArgs(argv: string[]) {
  const [command, ...rest] = argv;
  const filters: Filters = { all: false, summary: false };
  let dryRun = false;
  let markMissing = false;
  let migrateReview = false;

  for (const arg of rest) {
    if (arg === '--all') {
      filters.all = true;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--summary') {
      filters.summary = true;
    } else if (arg === '--review') {
      migrateReview = true;
    } else if (arg === '--mark-missing') {
      markMissing = true;
    } else if (arg.startsWith('--path=')) {
      filters.path = arg.slice('--path='.length);
    } else if (arg.startsWith('--year=')) {
      filters.year = arg.slice('--year='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return { command, dryRun, filters, markMissing, migrateReview };
}

function hasFilter(filters: Filters): boolean {
  return Boolean(filters.all || filters.path || filters.year);
}

async function findCandidateFiles(filters: Filters): Promise<string[]> {
  const pattern = filters.year
    ? `${filters.year}/**/index.md`
    : filters.path
      ? `${filters.path.replace(/\/index\.md$/, '')}/index.md`
      : '**/index.md';

  const files = await glob(pattern, { absolute: true, cwd: postsBase });
  return files.sort();
}

function loadPost(file: string): LoadedPost | null {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = splitFrontmatter(raw);
  if (!parsed) return null;

  const doc = parseDocument(parsed.fmText);
  const data = (doc.toJS() ?? {}) as Record<string, unknown>;
  return { data, doc, file, parsed };
}

function writePost(file: string, loaded: LoadedPost, body: string): void {
  const frontmatter = loaded.doc.toString({ lineWidth: 0 }).replace(/\n$/, '');
  fs.writeFileSync(file, `---\n${frontmatter}\n---\n${body}`, 'utf8');
}

function collectRegexMatches(body: string, pattern: RegExp): RegExpExecArray[] {
  pattern.lastIndex = 0;
  return [...body.matchAll(pattern)];
}

function readAttribute(markup: string, name: string): string | undefined {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(markup);
  return match?.[1]?.trim() || undefined;
}

function collectBodyImageCandidates(body: string): Candidate[] {
  return collectRegexMatches(body, markdownImagePattern)
    .map((match): Candidate | undefined => {
      const [, alt = '', src = ''] = match;
      const localMatch = localImagePathPattern.exec(src);
      if (!localMatch || !imageExtensionPattern.test(src)) return undefined;
      const fileName = localMatch[1];
      if (!fileName) return undefined;

      return {
        caption: alt.trim() || undefined,
        index: match.index,
        remove: new RegExp(`\\n?${escapeRegExp(match[0])}\\n?`, 'm'),
        review: false,
        source: 'body-image',
        src: fileName,
        type: 'image',
        video: undefined,
      } satisfies Candidate;
    })
    .filter((candidate): candidate is Candidate => Boolean(candidate));
}

function collectBodyVideoCandidates(body: string): Candidate[] {
  const youtube = collectRegexMatches(body, youtubePattern)
    .map((match): Candidate | undefined => {
      const video = readAttribute(match[0], 'videoid') ?? match[1];
      if (!video) return undefined;

      return {
        caption: readAttribute(match[0], 'videotitle'),
        index: match.index,
        remove: new RegExp(`\\n?${escapeRegExp(match[0])}\\n?`, 'm'),
        review: false,
        source: 'body-video',
        src: undefined,
        type: 'youtube',
        video,
      } satisfies Candidate;
    })
    .filter((candidate): candidate is Candidate => Boolean(candidate));
  const vimeo = collectRegexMatches(body, vimeoPattern)
    .map((match): Candidate | undefined => {
      const video = readAttribute(match[0], 'videoid') ?? match[1];
      if (!video) return undefined;

      return {
        caption: readAttribute(match[0], 'videotitle'),
        index: match.index,
        remove: new RegExp(`\\n?${escapeRegExp(match[0])}\\n?`, 'm'),
        review: false,
        source: 'body-video',
        src: undefined,
        type: 'vimeo',
        video,
      } satisfies Candidate;
    })
    .filter((candidate): candidate is Candidate => Boolean(candidate));

  return [...youtube, ...vimeo].sort((a, b) => a.index - b.index);
}

function collectResourceCandidates(
  data: Record<string, unknown>,
  postDirectory: string,
): Candidate[] {
  const resources = data['resources'];
  if (!Array.isArray(resources)) return [];

  return resources
    .map((resource, index): Candidate | undefined => {
      if (!resource || typeof resource !== 'object') return undefined;

      const record = resource as Record<string, unknown>;
      const src = typeof record['src'] === 'string' ? record['src'].trim() : '';
      if (!src || src.includes('/') || !imageExtensionPattern.test(src)) {
        return undefined;
      }
      if (!fs.existsSync(path.join(postDirectory, src))) {
        return undefined;
      }

      const title =
        typeof record['title'] === 'string' ? record['title'].trim() : '';

      return {
        caption: title || undefined,
        index,
        remove: undefined,
        review: false,
        source: 'resources',
        src,
        type: 'image',
        video: undefined,
      } satisfies Candidate;
    })
    .filter((candidate): candidate is Candidate => Boolean(candidate));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function firstReviewCandidate(
  bodyCandidates: Candidate[],
  resources: Candidate[],
): Candidate | undefined {
  const resourceCandidate = resources[0];
  if (resourceCandidate) {
    return { ...resourceCandidate, review: true };
  }

  const bodyCandidate = [...bodyCandidates].sort(
    (a, b) => a.index - b.index,
  )[0];
  if (!bodyCandidate) return undefined;

  return { ...bodyCandidate, remove: undefined, review: true };
}

function hasCoverMigrationMarker(data: Record<string, unknown>): boolean {
  const publisher = data['publisher'];
  if (!publisher || typeof publisher !== 'object') return false;

  return (publisher as Record<string, unknown>)['covermigration'] === true;
}

function classifyPost(loaded: LoadedPost): Classification {
  const marked = hasCoverMigrationMarker(loaded.data);

  if (loaded.data['cover']) return marked ? 'covered:review' : 'covered';

  const body = loaded.parsed.body;
  const bodyImages = collectBodyImageCandidates(body);
  const bodyVideos = collectBodyVideoCandidates(body);
  const resources = collectResourceCandidates(
    loaded.data,
    path.dirname(loaded.file),
  );
  const allMediaCount = (body.match(anyMediaPattern) ?? []).length;
  const bodyCandidates = [...bodyImages, ...bodyVideos].sort(
    (a, b) => a.index - b.index,
  );

  if (bodyCandidates.length === 1 && allMediaCount === 1) {
    return bodyCandidates[0] ?? 'review:no-candidate';
  }

  if (
    bodyCandidates.length === 0 &&
    allMediaCount === 0 &&
    resources.length === 1
  ) {
    return resources[0] ?? 'review:no-candidate';
  }

  const reviewCandidate = firstReviewCandidate(bodyCandidates, resources);
  if (reviewCandidate) return reviewCandidate;

  return marked ? 'review:marked:no-candidate' : 'review:no-candidate';
}

function setCover(loaded: LoadedPost, candidate: Candidate): void {
  const cover = new YAMLMap();

  cover.set('type', candidate.type);
  if (candidate.type === 'image') {
    cover.set('src', candidate.src ?? '');
  } else {
    cover.set('video', candidate.video ?? '');
  }
  if (candidate.caption) {
    cover.set('caption', candidate.caption);
  }

  loaded.doc.set('cover', cover);

  if (candidate.review) {
    setPublisherCoverMigration(loaded);
  }

  if (!candidate.review && candidate.remove) {
    loaded.parsed.body = loaded.parsed.body
      .replace(candidate.remove, '\n')
      .replace(/^\n+/, '')
      .replace(/\n{3,}/g, '\n\n');
  }
}

function setPublisherCoverMigration(loaded: LoadedPost): void {
  const currentPublisher = loaded.doc.get('publisher', true);
  const publisher =
    currentPublisher instanceof YAMLMap ? currentPublisher : new YAMLMap();

  publisher.set('covermigration', true);
  loaded.doc.set('publisher', publisher);
}

async function runAudit(filters: Filters): Promise<void> {
  const files = await findCandidateFiles(filters);
  const counts = new Map<string, number>();

  for (const file of files) {
    const loaded = loadPost(file);
    if (!loaded) continue;

    const rel = path.relative(projectRoot, file);
    const classification = classifyPost(loaded);
    const status =
      typeof classification === 'string'
        ? classification
        : classification.review
          ? `review:has-candidate:${classification.source}:${classification.type}`
          : `candidate:${classification.source}:${classification.type}`;

    counts.set(status, (counts.get(status) ?? 0) + 1);
    if (!filters.summary) {
      console.log(`${status}\t${rel}`);
    }
  }

  console.log('\nSummary');
  for (const [status, count] of [...counts].sort()) {
    console.log(`${status}\t${count}`);
  }
}

async function runMigrate(
  filters: Filters,
  dryRun: boolean,
  markMissing: boolean,
  migrateReview: boolean,
): Promise<void> {
  if (!hasFilter(filters)) {
    throw new Error(
      'Refusing to migrate without --all, --year=YYYY, or --path=glob.',
    );
  }

  const files = await findCandidateFiles(filters);
  let changed = 0;
  let markedMissing = 0;

  for (const file of files) {
    const loaded = loadPost(file);
    if (!loaded) continue;

    const candidate = classifyPost(loaded);
    if (candidate === 'review:no-candidate' && migrateReview && markMissing) {
      setPublisherCoverMigration(loaded);
      markedMissing++;

      const rel = path.relative(projectRoot, file);
      console.log(
        `${dryRun ? '[dry-run] would mark' : 'marked'}\tno-candidate\t${rel}`,
      );

      if (!dryRun) {
        writePost(file, loaded, loaded.parsed.body);
      }

      continue;
    }

    if (typeof candidate === 'string') continue;
    if (candidate.review && !migrateReview) continue;

    setCover(loaded, candidate);
    changed++;

    const rel = path.relative(projectRoot, file);
    console.log(
      `${dryRun ? '[dry-run] would migrate' : 'migrated'}\t${candidate.source}:${candidate.type}\t${rel}`,
    );

    if (!dryRun) {
      writePost(file, loaded, loaded.parsed.body);
    }
  }

  console.log(
    `\n${dryRun ? '[dry-run] would migrate' : 'Migrated'} ${changed} post(s).`,
  );
  if (migrateReview && markMissing) {
    console.log(
      `${dryRun ? '[dry-run] would mark' : 'Marked'} ${markedMissing} post(s) without a cover candidate.`,
    );
  }
}

async function main(): Promise<void> {
  try {
    const { command, dryRun, filters, markMissing, migrateReview } = parseArgs(
      process.argv.slice(2),
    );

    switch (command) {
      case 'audit':
        await runAudit(filters);
        break;
      case 'migrate':
        await runMigrate(filters, dryRun, markMissing, migrateReview);
        break;
      default:
        throw new Error(
          'Usage: post-covers audit|migrate [--all|--year=YYYY|--path=glob] [--dry-run] [--review] [--mark-missing]',
        );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

main();
