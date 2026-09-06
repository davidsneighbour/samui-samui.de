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
 *   node src/scripts/content/fetch-video-thumbnails.ts --verify       → check every known id is still live/reachable (no download); exits 1 if any are dead
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
import { parse as parseYaml } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const POSTS_ROOT = path.join(PROJECT_ROOT, 'src/content/posts');
const OUTPUT_ROOT = path.join(
  PROJECT_ROOT,
  'src/assets/images/video-thumbnails',
);

type Provider = 'vimeo' | 'youtube';

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID_RE = /^\d+$/;
// Real YouTube 404 responses for missing thumbnail sizes return a tiny
// 120x90 grey placeholder image instead of an HTTP error.
const PLACEHOLDER_MAX_BYTES = 2000;

const cliArgs = process.argv.slice(2);
const force = cliArgs.includes('--force');
const verify = cliArgs.includes('--verify');
const explicitId = cliArgs.find((arg) => !arg.startsWith('--'));

function detectProvider(id: string): Provider | null {
  if (YOUTUBE_ID_RE.test(id)) return 'youtube';
  if (VIMEO_ID_RE.test(id)) return 'vimeo';
  return null;
}

let explicitProvider: Provider | null = null;
if (explicitId) {
  explicitProvider = detectProvider(explicitId);
  if (!explicitProvider) {
    console.error(
      `"${explicitId}" is not a valid YouTube (11-character) or Vimeo (numeric) video id.`,
    );
    process.exit(1);
  }
}

const logPath = (filePath: string) =>
  path.relative(process.cwd(), filePath).replace(/\\/g, '/');

interface VideoRef {
  id: string;
  provider: Provider;
}

/**
 * Maps each referenced (provider, id) pair to the project-relative file(s)
 * it was found in, so a dead-video report can point straight at the content
 * that needs fixing.
 */
async function collectVideoRefs(): Promise<Map<string, Set<string>>> {
  const refsToFiles = new Map<string, Set<string>>();

  const record = (ref: VideoRef, file: string) => {
    const key = `${ref.provider}:${ref.id}`;
    const existing = refsToFiles.get(key) ?? new Set<string>();
    existing.add(logPath(file));
    refsToFiles.set(key, existing);
  };

  const files = await glob('**/*.md', { absolute: true, cwd: POSTS_ROOT });

  const youtubeTagPattern =
    /<dnb-youtube\b[^>]*\bvideoid=["']([A-Za-z0-9_-]{11})["']/g;
  const vimeoTagPattern = /<dnb-vimeo\b[^>]*\bvideoid=["'](\d+)["']/g;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');

    const frontmatterMatch = /^---\n([\s\S]*?)\n---/.exec(content);
    if (frontmatterMatch?.[1]) {
      try {
        const frontmatter = parseYaml(frontmatterMatch[1]) as {
          cover?: { type?: string; video?: string | number };
        };
        const cover = frontmatter.cover;
        if (
          (cover?.type === 'youtube' || cover?.type === 'vimeo') &&
          cover.video !== undefined
        ) {
          const id = String(cover.video).trim();
          if (id) record({ id, provider: cover.type }, file);
        }
      } catch {
        // Malformed frontmatter is validated elsewhere (astro check); skip.
      }
    }

    for (const match of content.matchAll(youtubeTagPattern)) {
      const id = match[1];
      if (id && YOUTUBE_ID_RE.test(id))
        record({ id, provider: 'youtube' }, file);
    }
    for (const match of content.matchAll(vimeoTagPattern)) {
      const id = match[1];
      if (id && VIMEO_ID_RE.test(id)) record({ id, provider: 'vimeo' }, file);
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

/**
 * Checks whether a YouTube video still exists. `hqdefault.jpg` is available
 * for essentially every real video regardless of source resolution, and —
 * unlike the youtube.com watch page, which returns HTTP 200 with a
 * client-rendered "video unavailable" message — genuinely returns a real
 * 404 once a video has been deleted or made private.
 */
async function isYoutubeVideoLive(videoId: string): Promise<boolean> {
  const response = await fetch(
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    { method: 'HEAD' },
  );
  return response.ok;
}

async function isVimeoVideoLive(videoId: string): Promise<boolean> {
  const apiUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
    `https://vimeo.com/${videoId}`,
  )}`;
  const response = await fetch(apiUrl);
  return response.ok;
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
    `https://vimeo.com/${videoId}`,
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

async function runVerify(refsToFiles: Map<string, Set<string>>) {
  const keys = [...refsToFiles.keys()].sort();
  console.log(
    `Verifying ${keys.length} unique video reference(s) are still live/reachable…`,
  );

  const dead: string[] = [];
  for (const key of keys) {
    const [provider, id] = key.split(':') as [Provider, string];
    const live =
      provider === 'youtube'
        ? await isYoutubeVideoLive(id)
        : await isVimeoVideoLive(id);
    console.log(
      `${live ? '✔' : '✘'} ${provider}:${id}${live ? '' : ' — no longer available'}`,
    );
    if (!live) dead.push(key);
  }

  if (dead.length === 0) {
    console.log(`\nAll ${keys.length} video(s) are still live.`);
    return;
  }

  console.log(
    `\n${dead.length} of ${keys.length} video(s) are no longer available:\n`,
  );
  for (const key of dead) {
    const files = [...(refsToFiles.get(key) ?? [])].sort();
    console.log(`- ${key}`);
    for (const file of files) console.log(`    ${file}`);
  }
  process.exit(1);
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
      fetched++;
    } catch (error) {
      console.error(`✘ failed: ${key} — ${(error as Error).message}`);
      failed++;
    }
  }

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
