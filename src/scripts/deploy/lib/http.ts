// HTTP probing helpers shared by smoke tests, cache-status, and cache warming.

export interface Probe {
  url: string;
  status: number;
  headers: Headers;
  body: string;
  /** Milliseconds until response headers arrived (time to first byte, roughly). */
  ttfbMs: number;
  totalMs: number;
}

export const USER_AGENT =
  'samui-samui-deploy-check/1.0 (+https://samui-samui.de/)';

export async function probe(
  url: string,
  init: { method?: string; readBody?: boolean; headers?: HeadersInit } = {},
): Promise<Probe> {
  const started = performance.now();
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, ...init.headers },
    method: init.method ?? 'GET',
    redirect: 'manual',
  });
  const ttfbMs = performance.now() - started;
  const body = init.readBody === false ? '' : await response.text();
  if (init.readBody === false) {
    await response.body?.cancel();
  }
  return {
    body,
    headers: response.headers,
    status: response.status,
    totalMs: performance.now() - started,
    ttfbMs,
    url,
  };
}

/** Runs `task` over `items` with at most `concurrency` in flight. */
export async function mapLimit<T, R>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<R>,
  delayMs = 0,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await task(items[index] as T);
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  };
  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(concurrency, items.length)) },
      worker,
    ),
  );
  return results;
}

export function sitemapUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    (match[1] as string).trim(),
  );
}
