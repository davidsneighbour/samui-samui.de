import { parse } from 'yaml';

export type VideoProvider = 'youtube' | 'vimeo';
export interface VideoReference {
  id: string;
  provider: VideoProvider;
  url: string;
}
export function detectVideoProvider(id: string): VideoProvider | null {
  if (/^[A-Za-z0-9_-]{11}$/.test(id)) return 'youtube';
  if (/^\d+$/.test(id)) return 'vimeo';
  return null;
}
/** Shared by ingestion and editorial candidate reporting; never rewrites sources. */
export function getVideoReferences(source: string): VideoReference[] {
  const refs: VideoReference[] = [];
  const add = (
    provider: string | undefined,
    value: unknown,
    hash?: unknown,
  ) => {
    const id = String(value ?? '').trim();
    if (
      (provider !== 'youtube' && provider !== 'vimeo') ||
      detectVideoProvider(id) !== provider
    )
      return;
    const url =
      provider === 'youtube'
        ? `https://www.youtube.com/watch?v=${id}`
        : `https://vimeo.com/${id}${typeof hash === 'string' && hash.trim() ? `/${encodeURIComponent(hash.trim())}` : ''}`;
    refs.push({ id, provider, url });
  };
  try {
    const data = parse(/^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? '') as {
      cover?: { type?: string; video?: unknown; hash?: unknown };
    } | null;
    add(data?.cover?.type, data?.cover?.video, data?.cover?.hash);
  } catch {
    // Content validation owns invalid YAML. Body references are still inspectable.
  }
  for (const match of source.matchAll(/<dnb-(youtube|vimeo)\b([^>]*)>/gi)) {
    const attrs = match[2] ?? '';
    add(
      match[1]?.toLowerCase(),
      /\bvideoid=["']([^"']+)["']/i.exec(attrs)?.[1],
      /\bvideohash=["']([^"']+)["']/i.exec(attrs)?.[1],
    );
  }
  return refs;
}
