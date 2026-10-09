// Turns "which files changed in this deploy" into "what to purge from the
// Cloudflare cache". Pure logic, unit-tested in src/test/deploy-purge-plan.test.ts.
//
// The changed-file list comes from rsync, which compares checksums against
// the previous release -- so it is exact for whatever the build produced, and
// no hand-written dependency graph ("a new post touches the home page,
// pagination, taxonomy pages, feeds, ...") is needed: every HTML page whose
// bytes changed is in the list.
//
// Two modes, chosen automatically unless overridden:
//
// * selective -- purge the changed URLs one by one. Normal for content
//   deploys (one post changes a few hundred pages at most, mainly because
//   every /seite/N/ shifts by one).
// * html-tag -- purge the "html" cache tag (every HTML page and redirect).
//   Used when a global template change touched more pages than
//   htmlUrlLimit; one API call instead of thousands of URLs, and fingerprinted
//   /assets/ files stay cached because they carry the "immutable" tag.

export type PurgeMode = 'auto' | 'html' | 'urls' | 'everything' | 'none';

export interface ChangeSet {
  /** Files that exist in the new release with different content or are new. */
  changed: string[];
  /** Files that existed in the previous release but are gone now. */
  deleted: string[];
  /** Subset of `changed` that did not exist before (new pages, new hashes). */
  added: string[];
}

export interface PurgePlan {
  mode: 'selective' | 'html-tag' | 'everything' | 'none';
  /** Absolute URLs to purge individually. */
  urls: string[];
  /** Cache tags to purge. */
  tags: string[];
  reason: string;
  /** HTML page URLs affected by the deploy (useful for cache warming). */
  htmlUrls: string[];
}

export const DEFAULT_HTML_URL_LIMIT = 500;
export const DEFAULT_STATIC_URL_LIMIT = 2000;

/** Top-level files in /assets/ are Astro's fingerprinted build output. */
export function isImmutableAsset(file: string): boolean {
  return /^assets\/[^/]+$/.test(file);
}

function encodePath(file: string): string {
  return file
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/** Maps a file path inside dist/ to the public URL path that serves it. */
export function fileToUrlPath(file: string): string | null {
  if (file === '404.html') {
    // Served for every unknown URL; covered by the short 404 edge TTL and
    // by the "html" tag, not addressable as one URL.
    return null;
  }
  if (file === '.htaccess') {
    return null;
  }
  if (file === 'index.html') {
    return '/';
  }
  if (file.endsWith('/index.html')) {
    return `/${encodePath(file.slice(0, -'index.html'.length))}`;
  }
  return `/${encodePath(file)}`;
}

export interface PlanOptions {
  siteUrl: string;
  mode?: PurgeMode;
  htmlUrlLimit?: number;
  staticUrlLimit?: number;
}

export function planPurge(changes: ChangeSet, options: PlanOptions): PurgePlan {
  const mode = options.mode ?? 'auto';
  const htmlUrlLimit = options.htmlUrlLimit ?? DEFAULT_HTML_URL_LIMIT;
  const staticUrlLimit = options.staticUrlLimit ?? DEFAULT_STATIC_URL_LIMIT;
  const added = new Set(changes.added);
  const toUrl = (urlPath: string) => `${options.siteUrl}${urlPath}`;

  const htmlPaths = new Set<string>();
  const staticPaths = new Set<string>();

  for (const file of [...changes.changed, ...changes.deleted]) {
    const urlPath = fileToUrlPath(file);
    if (!urlPath) {
      continue;
    }
    if (file.endsWith('.html')) {
      // New pages are purged too: their URL may hold a cached 404.
      htmlPaths.add(urlPath);
    } else if (!isImmutableAsset(file) && !added.has(file)) {
      // New static files cannot be cached yet (beyond a 5-minute 404), and
      // fingerprinted assets never change in place.
      staticPaths.add(urlPath);
    }
  }

  const htmlUrls = [...htmlPaths].sort().map(toUrl);
  const staticUrls = [...staticPaths].sort().map(toUrl);
  const configChanged = changes.changed.includes('.htaccess');

  if (mode === 'none') {
    return {
      htmlUrls,
      mode: 'none',
      reason: 'purging disabled',
      tags: [],
      urls: [],
    };
  }
  if (mode === 'everything') {
    return {
      htmlUrls,
      mode: 'everything',
      reason: 'explicitly requested',
      tags: [],
      urls: [],
    };
  }

  // Header or redirect changes in .htaccess can affect every response.
  if (configChanged && mode === 'auto') {
    return {
      htmlUrls,
      mode: 'html-tag',
      reason: '.htaccess changed (headers/redirects may differ on every page)',
      tags: ['html', 'static'],
      urls: [],
    };
  }

  const useTag =
    mode === 'html' || (mode === 'auto' && htmlUrls.length > htmlUrlLimit);
  const staticByTag = staticUrls.length > staticUrlLimit;
  const tags = [
    ...(useTag ? ['html'] : []),
    ...(staticByTag ? ['static'] : []),
  ];
  const urls = [
    ...(useTag ? [] : htmlUrls),
    ...(staticByTag ? [] : staticUrls),
  ];

  if (tags.length === 0 && urls.length === 0) {
    return { htmlUrls, mode: 'none', reason: 'nothing changed', tags, urls };
  }

  return {
    htmlUrls,
    mode: useTag ? 'html-tag' : 'selective',
    reason: useTag
      ? mode === 'html'
        ? 'broad HTML purge requested'
        : `${htmlUrls.length} HTML pages changed (limit ${htmlUrlLimit}): likely a global template change`
      : `${htmlUrls.length} HTML pages and ${staticUrls.length} static files changed`,
    tags,
    urls,
  };
}
