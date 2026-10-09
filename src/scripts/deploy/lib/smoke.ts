// Post-deployment smoke tests: does the live site behave like the long-lived
// samui-samui.de URL structure expects, and does each request execute where
// the architecture says it should (static pages via Cloudflare from
// DreamHost, /api/* in the Worker)?
import fs from 'node:fs';
import path from 'node:path';
import { DIST_DIR } from './config.ts';
import { type Probe, probe } from './http.ts';

export interface SmokeOptions {
  baseUrl: string;
  /** Expect Cloudflare in front (cf-cache-status, cf-ray). */
  expectCloudflare: boolean;
  /** Expect the API Worker on /api/*. */
  expectWorker: boolean;
}

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

const CANONICAL_PATTERN = /<link rel="canonical" href="([^"]+)"/;

function firstDir(dir: string): string | null {
  if (!fs.existsSync(dir)) {
    return null;
  }
  return (
    fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()[0] ?? null
  );
}

/** Picks representative URLs from the build, with stable fallbacks. */
export function representativePaths(
  distDir = DIST_DIR,
): Record<string, string> {
  const paths: Record<string, string> = {
    archive: '/archiv/',
    contact: '/kontakt/',
    home: '/',
    oldPost: '/2005/01/connectivity/',
    pagination: '/seite/2/',
    taxonomy: '/archiv/themen/politik/',
    yearArchive: '/archiv/2005/',
  };

  const year = firstDir(distDir);
  const month = year ? firstDir(path.join(distDir, year)) : null;
  const slug = year && month ? firstDir(path.join(distDir, year, month)) : null;
  if (year && /^\d{4}$/.test(year) && month && slug) {
    paths['oldPost'] = `/${year}/${month}/${slug}/`;
  }

  const topic = firstDir(path.join(distDir, 'archiv', 'themen'));
  if (topic) {
    paths['taxonomy'] = `/archiv/themen/${encodeURIComponent(topic)}/`;
  }

  const rss = path.join(distDir, 'rss.xml');
  if (fs.existsSync(rss)) {
    const links = [
      ...fs.readFileSync(rss, 'utf8').matchAll(/<link>([^<]+)<\/link>/g),
    ];
    const newest = links[1]?.[1];
    if (newest) {
      paths['newestPost'] = new URL(newest).pathname;
    }
  }

  return paths;
}

export async function runSmokeTests(options: SmokeOptions): Promise<boolean> {
  const base = options.baseUrl.replace(/\/+$/, '');
  const checks: Check[] = [];
  const add = (name: string, ok: boolean, detail = '') =>
    checks.push({ detail, name, ok });

  const get = async (
    urlPath: string,
    method = 'GET',
  ): Promise<Probe | null> => {
    try {
      return await probe(`${base}${urlPath}`, { method });
    } catch (error) {
      add(
        `${method} ${urlPath}`,
        false,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  };

  const expectPage = async (label: string, urlPath: string) => {
    const response = await get(urlPath);
    if (!response) {
      return null;
    }
    const type = response.headers.get('content-type') ?? '';
    const canonical = CANONICAL_PATTERN.exec(response.body)?.[1];
    const expectedCanonical = `https://samui-samui.de${urlPath}`;
    add(
      `${label} ${urlPath}`,
      response.status === 200 &&
        type.startsWith('text/html') &&
        canonical === expectedCanonical,
      `status ${response.status}, ${type}, canonical ${canonical ?? 'missing'}`,
    );
    if (options.expectCloudflare) {
      add(
        `${label} served through Cloudflare`,
        Boolean(response.headers.get('cf-ray')) &&
          Boolean(response.headers.get('cf-cache-status')),
        `cf-cache-status ${response.headers.get('cf-cache-status') ?? 'missing'}`,
      );
      add(
        `${label} keeps CDN-only headers private`,
        !response.headers.has('cache-tag') &&
          !response.headers.has('cloudflare-cdn-cache-control'),
        'Cache-Tag / Cloudflare-CDN-Cache-Control must not reach visitors',
      );
    }
    add(
      `${label} has security headers`,
      Boolean(response.headers.get('content-security-policy')) &&
        response.headers.get('x-content-type-options') === 'nosniff',
    );
    return response;
  };

  const expectRedirect = async (from: string, to: string) => {
    const response = await get(from);
    if (!response) {
      return;
    }
    const location = response.headers.get('location') ?? '';
    const resolved = location ? new URL(location, `${base}${from}`) : null;
    add(
      `redirect ${from} -> ${to}`,
      response.status === 301 &&
        resolved?.pathname === to &&
        resolved.protocol === new URL(base).protocol,
      `status ${response.status}, location ${location || 'missing'}`,
    );
  };

  const paths = representativePaths();

  // Pages
  const home = await expectPage('home', paths['home'] as string);
  for (const key of [
    'newestPost',
    'oldPost',
    'archive',
    'yearArchive',
    'pagination',
    'taxonomy',
    'contact',
  ]) {
    if (paths[key]) {
      await expectPage(key, paths[key] as string);
    }
  }

  // 404
  const missing = await get(`/smoke-test-missing-${Date.now()}/`);
  if (missing) {
    add(
      '404 page',
      missing.status === 404 && missing.body.includes('<html'),
      `status ${missing.status}`,
    );
  }

  // Feeds and sitemap
  for (const feed of ['/rss.xml', '/sitemap-index.xml']) {
    const response = await get(feed);
    if (response) {
      add(
        `feed ${feed}`,
        response.status === 200 &&
          response.body.trimStart().startsWith('<?xml'),
        `status ${response.status}`,
      );
    }
  }

  // Fingerprinted CSS/JS referenced by the home page, plus a plain image.
  const assetPaths = [
    ...new Set(
      [
        ...(home?.body ?? '').matchAll(
          /(?:href|src)="(\/assets\/[^"/]+\.(?:css|js))"/g,
        ),
      ].map((match) => match[1] as string),
    ),
  ].slice(0, 4);
  add(
    'home page references /assets/ CSS/JS',
    assetPaths.length > 0,
    assetPaths.join(', '),
  );
  for (const asset of assetPaths) {
    const response = await get(asset);
    if (response) {
      add(
        `asset ${asset}`,
        response.status === 200 &&
          (response.headers.get('cache-control') ?? '').includes('immutable'),
        `status ${response.status}, cache-control ${response.headers.get('cache-control')}`,
      );
    }
  }
  const image = await get('/icon-192x192.png');
  if (image) {
    add(
      'image /icon-192x192.png',
      image.status === 200,
      `status ${image.status}`,
    );
  }

  // URL structure: trailing slashes and historical redirects.
  await expectRedirect('/kontakt', '/kontakt/');
  await expectRedirect('/taglines/', '/iumas/');
  await expectRedirect('/tags/', '/archiv/themen/');
  await expectRedirect('/themen/politik/', '/archiv/themen/politik/');
  await expectRedirect('/leute/', '/archiv/personen/');

  // API: must be answered by the Worker, never by DreamHost.
  if (options.expectWorker) {
    const version = await get('/api/version');
    if (version) {
      let worker = '';
      try {
        worker = (JSON.parse(version.body) as { worker?: string }).worker ?? '';
      } catch {
        // Not JSON: DreamHost or another origin answered.
      }
      add(
        '/api/version answered by the Worker',
        version.status === 200 && worker === 'samui-samui-api',
        `status ${version.status}`,
      );
    }
    const weather = await get('/api/weather');
    if (weather) {
      add(
        '/api/weather',
        weather.status === 200 &&
          (weather.headers.get('content-type') ?? '').includes(
            'application/json',
          ),
        `status ${weather.status}, x-weather-cache ${weather.headers.get('x-weather-cache') ?? 'missing'}`,
      );
    }
    const contact = await get('/api/contact');
    if (contact) {
      add(
        '/api/contact rejects GET',
        contact.status === 405 && contact.headers.get('allow') === 'POST',
        `status ${contact.status}`,
      );
    }
  }

  const failed = checks.filter((check) => !check.ok);
  for (const check of checks) {
    console.log(
      `${check.ok ? 'ok  ' : 'FAIL'} ${check.name}${check.detail && !check.ok ? ` -- ${check.detail}` : ''}`,
    );
  }
  console.log(
    `\nSmoke tests: ${checks.length - failed.length}/${checks.length} passed.`,
  );
  return failed.length === 0;
}
