import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const REMOTE_SRC_PATTERN = /^(?:[a-z][a-z\d+.-]*:)?\/\//i;

export function isRemoteSrc(src: string): boolean {
  return REMOTE_SRC_PATTERN.test(src);
}

export function isSvgSrc(src: string): boolean {
  return /\.svg(?:[?#]|$)/i.test(src);
}

/**
 * Resolves an `<img src>` from post content to an on-disk path, or
 * `undefined` when the source is remote (or otherwise unresolvable) and
 * therefore cannot be probed or processed at build time.
 *
 * - Root-relative paths (`/wp-content/...`) are resolved against `public/`,
 *   mirroring how Astro serves that directory unprocessed.
 * - Relative paths (`./cover.jpg`) are resolved against the directory of the
 *   Markdown file that referenced them.
 */
export function resolveImageFsPath(
  src: string,
  fromDir: string | undefined,
): string | undefined {
  if (isRemoteSrc(src) || src.startsWith('data:')) return undefined;

  const cleanSrc = src.split(/[?#]/)[0];
  if (!cleanSrc) return undefined;

  if (cleanSrc.startsWith('/')) {
    return path.join(process.cwd(), 'public', cleanSrc);
  }

  if (!fromDir) return undefined;
  return path.join(fromDir, cleanSrc);
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/** Reads intrinsic pixel dimensions from a local file, or `undefined` if it can't be read. */
export async function probeImageDimensions(
  fsPath: string,
): Promise<ImageDimensions | undefined> {
  try {
    if (!existsSync(fsPath)) return undefined;
    const metadata = await sharp(fsPath).metadata();
    if (!metadata.width || !metadata.height) return undefined;
    return { height: metadata.height, width: metadata.width };
  } catch {
    return undefined;
  }
}

/**
 * Generates a tiny, unblurred derivative of the source image, base64-inlined
 * as a data URI. Blur itself is applied via CSS (`filter: blur(...)`) rather
 * than baked into the pixels, so the same derivative works for any
 * configured `blurRadius`.
 */
export async function buildTinyDerivativeDataUri(
  fsPath: string,
  targetWidth: number,
): Promise<string | undefined> {
  try {
    const buffer = await sharp(fsPath)
      .resize({ width: targetWidth })
      .webp({ quality: 60 })
      .toBuffer();
    return `data:image/webp;base64,${buffer.toString('base64')}`;
  } catch {
    return undefined;
  }
}
