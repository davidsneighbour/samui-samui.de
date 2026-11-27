#!/usr/bin/env -S node

/**
 * Download local copies of YouTube/Vimeo video thumbnails referenced
 * anywhere in the post archive (frontmatter `cover: { type: youtube|vimeo,
 * video: <id> }`, and raw `<dnb-youtube videoid="...">` / `<dnb-vimeo
 * videoid="...">` tags dropped directly into post bodies).
 *
 * Thumbnails are saved to
 * `src/assets/images/video-thumbnails/<youtube|vimeo>/<id>.jpg` so
 * `src/utils/video-thumbnails.ts` can serve an `astro:assets`-processed
 * local poster instead of ever contacting the provider for one at
 * build/dev/runtime — see documentation/content/video-thumbnail-cache.md.
 *
 * Ported from the equivalent YouTube-only script in the sibling
 * kollitsch.dev repository (src/scripts/content/fetch-youtube-thumbnails.ts),
 * extended to also cover Vimeo.
 *
 * Usage:
 *   node src/scripts/content/fetch-video-thumbnails.ts               → fetch missing thumbnails for every id found in the project
 *   node src/scripts/content/fetch-video-thumbnails.ts <videoId>      → fetch (or refresh) a single video id, skipping the project scan (provider is auto-detected: numeric ids are Vimeo, 11-character ids are YouTube)
 *   node src/scripts/content/fetch-video-thumbnails.ts --force        → re-fetch all
 *   node src/scripts/content/fetch-video-thumbnails.ts <videoId> --force → re-fetch just that one id
 *   node src/scripts/content/fetch-video-thumbnails.ts --verify       → check every known id is still live/reachable (no download); exits 1 for persistent review candidates
 *
 * --verify exists because a video can go dead *after* its thumbnail was
 * already downloaded successfully -- the normal (non-verify) run only ever
 * looks at ids that don't have a local thumbnail yet, so it can't catch
 * that drift. It's meant for an occasional/scheduled audit (see
 * .github/workflows/check-video-thumbnails.yml), not every commit.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import {
  availabilityFromStatus,
  type MediaCache,
  type MediaHistory,
  updateMediaHistory,
} from '../../utils/media-history.ts';
import {
  detectVideoProvider,
  getVideoReferences,
} from '../../utils/video-references.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const POSTS_ROOT = path.join(PROJECT_ROOT, 'src/content/posts');
const OUTPUT_ROOT = path.join(
  PROJECT_ROOT,
  'src/assets/images/video-thumbnails',
);

type Provider = 'vimeo' | 'youtube';

// Real YouTube 404 responses for missing thumbnail sizes return a tiny
// 120x90 grey placeholder image instead of an HTTP error.
const PLACEHOLDER_MAX_BYTES = 2000;

const cliArgs = process.argv.slice(2);
const force = cliArgs.includes('--force');
const verify = cliArgs.includes('--verify');
// lint-staged always appends the staged file paths to this command, which
// this script's default (no-arg) full-project scan doesn't need -- ignore
// path-like arguments instead of misreading one as an explicit video id.
const explicitId = cliArgs.find(
  (arg) => !arg.startsWith('--') && !arg.includes('/') && !arg.includes('\\'),
);

let explicitProvider: Provider | null = null;
if (explicitId) {
  explicitProvider = detectVideoProvider(explicitId);
  if (!explicitProvider) {
    console.error(
      `"${explicitId}" is not a valid YouTube (11-character) or Vimeo (numeric) video id.`,
    );
    process.exit(1);
  }
}

const logPath = (filePath: string) =>
  path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');

const referenceUrls = new Map<string, string>();

/** Collect current references; historical metadata remains in the cache. */
async function collectVideoRefs(): Promise<Map<string, Set<string>>> {
  const refsToFiles = new Map<string, Set<string>>();
  const files = await glob('**/*.md', { absolute: true, cwd: POSTS_ROOT });
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    for (const ref of getVideoReferences(content)) {
      const key = `${ref.provider}:${ref.id}`;
      const references = refsToFiles.get(key) ?? new Set<string>();
      references.add(logPath(file));
      refsToFiles.set(key, references);
      if (!referenceUrls.has(key) || ref.url.split('/').length > 4)
        referenceUrls.set(key, ref.url);
    }
  }
  return refsToFiles;
}

// JPEG magic number (FF D8 FF). Network data is written to disk below, so
// this confirms the response body is actually a JPEG before it's trusted as
// one — mirrors kollitsch.dev's CodeQL js/http-to-file-access (CWE-434/
// CWE-912) mitigation for the same download-and-save pattern.
function isJpeg(buffer: Buffer): boolean {
  return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

async function fetchYoutubeThumbnail(videoId: string): Promise<Buffer> {
  const candidates = ['maxresdefault.jpg', 'sddefault.jpg', 'hqdefault.jpg'];

  let lastBuffer: Buffer | null = null;
  for (const candidate of candidates) {
    const url = `https://i.ytimg.com/vi/${videoId}/${candidate}`;
    const response = await fetch(url);
    if (!response.ok) continue;

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) continue;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (!isJpeg(buffer)) continue;

    if (buffer.byteLength > PLACEHOLDER_MAX_BYTES) {
      return buffer;
    }
    lastBuffer = buffer;
  }

  // hqdefault should always exist for a valid video id; fall back to
  // whatever was last received even if it looked like a placeholder.
  if (lastBuffer) return lastBuffer;
  throw new Error(`No thumbnail available for YouTube video id "${videoId}"`);
}

async function fetchVimeoThumbnail(videoId: string): Promise<Buffer> {
  const apiUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
    referenceUrls.get(`vimeo:${videoId}`) ?? `https://vimeo.com/${videoId}`,
  )}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(
      `Vimeo oEmbed lookup failed for video id "${videoId}" (HTTP ${response.status})`,
    );
  }

  const json = (await response.json()) as { thumbnail_url?: string };
  const thumbnailUrl = json.thumbnail_url;
  if (!thumbnailUrl) {
    throw new Error(
      `No thumbnail_url in Vimeo oEmbed response for "${videoId}"`,
    );
  }

  const imageResponse = await fetch(thumbnailUrl);
  if (!imageResponse.ok) {
    throw new Error(
      `Failed to download Vimeo thumbnail for "${videoId}" (HTTP ${imageResponse.status})`,
    );
  }

  const contentType = imageResponse.headers.get('content-type');
  if (!contentType?.startsWith('image/')) {
    throw new Error(`Vimeo thumbnail for "${videoId}" was not an image`);
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  if (!isJpeg(buffer)) {
    throw new Error(`Vimeo thumbnail for "${videoId}" was not a JPEG`);
  }

  return buffer;
}

const historyPath = path.join(PROJECT_ROOT, 'src/data/video-media.json');
let history: MediaCache = JSON.parse(await fs.readFile(historyPath, 'utf8'));

async function checkMedia(key: string, files: Set<string>) {
  const [provider, id] = key.split(':') as ['youtube' | 'vimeo', string];
  const url =
    referenceUrls.get(key) ??
    history[key]?.url ??
    (provider === 'youtube'
      ? `https://www.youtube.com/watch?v=${id}`
      : `https://vimeo.com/${id}`);
  const endpoint =
    provider === 'youtube'
      ? 'https://www.youtube.com/oembed'
      : 'https://vimeo.com/api/oembed.json';
  const observation: MediaHistory = {
    availability: 'unknown',
    consecutiveFailures: 0,
    files: [...files],
    id,
    lastChecked: new Date().toISOString(),
    provider,
    url,
  };
  try {
    const response = await fetch(
      `${endpoint}?url=${encodeURIComponent(url)}&format=json`,
      { signal: AbortSignal.timeout(15000) },
    );
    observation.availability = availabilityFromStatus(response.status);
    if (response.ok) {
      const data = (await response.json()) as Record<string, unknown>;
      for (const [field, remote] of [
        ['title', 'title'],
        ['description', 'description'],
        ['author', 'author_name'],
        ['published', 'upload_date'],
      ] as const) {
        if (typeof data[remote] === 'string') observation[field] = data[remote];
      }
    }
  } catch {
    // Network failures, timeouts, and invalid API responses are inconclusive.
    observation.availability = 'unknown';
  }
  const thumbnail = path.join(OUTPUT_ROOT, provider, `${id}.jpg`);
  if (
    await fs
      .access(thumbnail)
      .then(() => true)
      .catch(() => false)
  )
    observation.thumbnail = path.relative(PROJECT_ROOT, thumbnail);
  history[key] = updateMediaHistory(history[key], observation);
  return history[key];
}

async function saveHistory() {
  await fs.writeFile(
    historyPath,
    `${JSON.stringify(Object.fromEntries(Object.entries(history).sort(([a], [b]) => a.localeCompare(b))), null, 2)}\n`,
  );
}

async function runVerify(refsToFiles: Map<string, Set<string>>) {
  let candidates = 0;
  for (const [key, files] of [...refsToFiles.entries()].sort()) {
    const entry = await checkMedia(key, files);
    const candidate =
      entry.availability === 'unavailable' && entry.consecutiveFailures >= 2;
    if (candidate) candidates++;
    console.log(
      `${key}: ${entry.availability}; consecutive failures: ${entry.consecutiveFailures}${candidate ? ' — editorial review candidate' : ''}`,
    );
    for (const file of files) console.log(`    ${file}`);
  }
  await saveHistory();
  console.log(
    'Automated observations only. No editorial classification or source deletion performed.',
  );
  if (candidates > 0) process.exitCode = 1;
}

async function main() {
  const refsToFiles = explicitId
    ? new Map([[`${explicitProvider}:${explicitId}`, new Set<string>()]])
    : await collectVideoRefs();

  if (verify) {
    await runVerify(refsToFiles);
    return;
  }

  const keys = [...refsToFiles.keys()].sort();
  console.log(
    explicitId
      ? `Fetching thumbnail for ${explicitProvider}:${explicitId}.`
      : `Found ${keys.length} unique video reference(s) in the project.`,
  );

  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (const key of keys) {
    const [provider, id] = key.split(':') as [Provider, string];
    const destDir = path.join(OUTPUT_ROOT, provider);
    const destPath = path.join(destDir, `${id}.jpg`);

    if (!force) {
      const exists = await fs
        .access(destPath)
        .then(() => true)
        .catch(() => false);
      if (exists) {
        skipped++;
        continue;
      }
    }

    await checkMedia(key, refsToFiles.get(key) ?? new Set());
    try {
      const buffer =
        provider === 'youtube'
          ? await fetchYoutubeThumbnail(id)
          : await fetchVimeoThumbnail(id);
      await fs.mkdir(destDir, { recursive: true });
      await fs.writeFile(destPath, buffer);
      console.log(
        `✔ fetched: ${logPath(destPath)} (${buffer.byteLength} bytes)`,
      );
      const entry = history[key];
      if (entry) entry.thumbnail = path.relative(PROJECT_ROOT, destPath);
      fetched++;
    } catch (error) {
      console.error(`✘ failed: ${key} — ${(error as Error).message}`);
      failed++;
    }
  }

  await saveHistory();
  console.log(
    `\nDone. Fetched ${fetched}, skipped ${skipped} (already present), failed ${failed}.`,
  );

  // A single explicit id is a deliberate request — a failure should be loud.
  // A full project scan runs unattended (e.g. via lint-staged on every blog
  // commit); a stale/deleted video elsewhere in the archive shouldn't block
  // unrelated commits forever, so only warn there.
  if (failed > 0 && explicitId) process.exit(1);
}

await main();
