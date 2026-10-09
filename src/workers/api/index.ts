// Cloudflare Worker for samui-samui.de/api/*. Configured in wrangler.jsonc;
// architecture in documentation/hosting/architecture.md.
//
// The Worker route only matches /api/*, so ordinary page requests never
// execute this code -- they go to the Cloudflare cache and, on a miss, to the
// DreamHost origin.
import { type ContactEnv, handleContact } from './contact';
import { handleWeather } from './weather';

// The runtime `Env` (secrets + vars) is generated from wrangler.jsonc into
// worker-configuration.d.ts by `npx wrangler types`. The router only needs
// this subset, which keeps it testable with a plain object.
export interface RouteEnv extends ContactEnv {
  WORKER_SOURCE_HASH?: string;
}

function notFound(): Response {
  return Response.json(
    { error: { code: 'not_found', message: 'Not found' } },
    { headers: { 'Cache-Control': 'no-store' }, status: 404 },
  );
}

function methodNotAllowed(allow: string): Response {
  return new Response('Method Not Allowed', {
    headers: { Allow: allow, 'Cache-Control': 'no-store' },
    status: 405,
  });
}

export async function route(
  request: Request,
  env: RouteEnv,
  ctx: Pick<ExecutionContext, 'waitUntil'>,
  cache: Cache,
): Promise<Response> {
  const { pathname } = new URL(request.url);

  switch (pathname) {
    case '/api/weather':
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return methodNotAllowed('GET, HEAD');
      }
      return handleWeather(request, {
        cache,
        fetcher: fetch,
        waitUntil: (promise) => ctx.waitUntil(promise),
      });

    case '/api/contact':
      return handleContact(request, { env, fetcher: fetch });

    // Used by the deploy script to decide whether the Worker needs to be
    // re-deployed, and by the smoke tests to prove /api/* reaches the Worker
    // rather than DreamHost.
    case '/api/version':
      return Response.json(
        {
          hash: env.WORKER_SOURCE_HASH ?? 'unknown',
          worker: 'samui-samui-api',
        },
        { headers: { 'Cache-Control': 'no-store' } },
      );

    default:
      return notFound();
  }
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const response = await route(request, env, ctx, caches.default);
    // API responses are never meant to be indexed or framed.
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Robots-Tag', 'noindex');
    return new Response(response.body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  },
} satisfies ExportedHandler<Env>;
