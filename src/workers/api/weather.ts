// GET /api/weather -- same-origin weather proxy (see
// documentation/features/weather-widget.md). The browser only ever calls
// this route; this module is the only thing that talks to Open-Meteo.
//
// Caching: the Worker runs *before* the Cloudflare zone cache, so the zone
// Cache Rules never see these responses. Instead the Worker keeps two copies
// in the data centre's Cache API:
//
// * "fresh" for WEATHER_CDN_CACHE_SECONDS (2 h) -- the "at most one
//   Open-Meteo refresh per two hours" rule from the Netlify version, now
//   enforced per Cloudflare data centre;
// * "stale" for WEATHER_CDN_STALE_WHILE_REVALIDATE_SECONDS (24 h) -- served
//   only when Open-Meteo fails, so a short upstream outage does not blank
//   the widget.
//
// Errors are never cached.
import {
  OPEN_METEO_REQUEST_TIMEOUT_MILLISECONDS,
  WEATHER_CDN_CACHE_SECONDS,
  WEATHER_CDN_STALE_WHILE_REVALIDATE_SECONDS,
  WEATHER_LOCATION,
} from '../../config/weather';
import {
  normaliseOpenMeteoResponse,
  WeatherValidationError,
} from '../../utils/weather/normalise-open-meteo';

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// Only the fields the compact widget and its 12h look-ahead actually need --
// see documentation/features/weather-widget.md#api-request-fields.
const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'rain',
  'weather_code',
  'cloud_cover',
  'wind_speed_10m',
  'is_day',
].join(',');

const HOURLY_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'rain',
  'weather_code',
].join(',');

// Short/no browser HTTP cache -- the widget's own localStorage cache (see
// src/utils/weather/browser-cache.ts) owns freshness on the client.
const BROWSER_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

const GENERIC_UNAVAILABLE_MESSAGE = 'Wetterdaten sind derzeit nicht verfügbar.';

export function buildUpstreamUrl(): string {
  const url = new URL(OPEN_METEO_FORECAST_URL);
  url.searchParams.set('latitude', String(WEATHER_LOCATION.latitude));
  url.searchParams.set('longitude', String(WEATHER_LOCATION.longitude));
  url.searchParams.set('current', CURRENT_FIELDS);
  url.searchParams.set('hourly', HOURLY_FIELDS);
  url.searchParams.set('timezone', WEATHER_LOCATION.timezone);
  // 2 days (today + tomorrow) is enough headroom for the 12h look-ahead
  // window even when the widget loads late in the evening.
  url.searchParams.set('forecast_days', '2');
  // Prefer a land grid cell over open water for a coastal location.
  url.searchParams.set('cell_selection', 'land');
  return url.toString();
}

function jsonError(status: number, code: string): Response {
  return Response.json(
    { error: { code, message: GENERIC_UNAVAILABLE_MESSAGE } },
    { headers: { 'Cache-Control': 'no-store' }, status },
  );
}

// Cache API keys. Query strings and the visitor's own request headers never
// reach the key, so every visitor shares the same two entries.
function cacheKey(origin: string, kind: 'fresh' | 'stale'): Request {
  return new Request(`${origin}/api/weather/__cache/${kind}`);
}

function toVisitorResponse(cached: Response, state: string): Response {
  const response = new Response(cached.body, cached);
  response.headers.set('Cache-Control', BROWSER_CACHE_CONTROL);
  response.headers.set('X-Weather-Cache', state);
  return response;
}

type UpstreamResult =
  | { ok: true; body: string }
  | { ok: false; status: number; code: string };

async function fetchSnapshot(fetcher: typeof fetch): Promise<UpstreamResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    OPEN_METEO_REQUEST_TIMEOUT_MILLISECONDS,
  );

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetcher(buildUpstreamUrl(), {
      signal: controller.signal,
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error(
      `[weather] Open-Meteo request failed${isTimeout ? ' (timeout)' : ''}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return { code: 'upstream_unreachable', ok: false, status: 504 };
  } finally {
    clearTimeout(timeoutId);
  }

  if (upstreamResponse.status === 429) {
    console.warn('[weather] Open-Meteo rate limit (429) hit.');
    return { code: 'upstream_rate_limited', ok: false, status: 429 };
  }

  if (!upstreamResponse.ok) {
    console.error(
      `[weather] Open-Meteo responded with HTTP ${upstreamResponse.status}.`,
    );
    return { code: 'upstream_error', ok: false, status: 502 };
  }

  let raw: unknown;
  try {
    raw = await upstreamResponse.json();
  } catch (error) {
    console.error(
      `[weather] Open-Meteo response was not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return { code: 'upstream_invalid_json', ok: false, status: 502 };
  }

  try {
    const snapshot = normaliseOpenMeteoResponse(raw, WEATHER_LOCATION);
    return { body: JSON.stringify(snapshot), ok: true };
  } catch (error) {
    const message =
      error instanceof WeatherValidationError || error instanceof Error
        ? error.message
        : String(error);
    console.error(
      `[weather] Open-Meteo response failed validation: ${message}`,
    );
    return { code: 'upstream_invalid_shape', ok: false, status: 502 };
  }
}

export interface WeatherDependencies {
  cache: Cache;
  fetcher: typeof fetch;
  waitUntil: (promise: Promise<unknown>) => void;
}

export async function handleWeather(
  request: Request,
  { cache, fetcher, waitUntil }: WeatherDependencies,
): Promise<Response> {
  const { origin } = new URL(request.url);

  const fresh = await cache.match(cacheKey(origin, 'fresh'));
  if (fresh) {
    return toVisitorResponse(fresh, 'HIT');
  }

  const result = await fetchSnapshot(fetcher);

  if (!result.ok) {
    const stale = await cache.match(cacheKey(origin, 'stale'));
    if (stale) {
      return toVisitorResponse(stale, 'STALE');
    }
    return jsonError(result.status, result.code);
  }

  const store = (seconds: number) =>
    new Response(result.body, {
      headers: {
        'Cache-Control': `public, max-age=${seconds}`,
        'Content-Type': 'application/json',
      },
    });

  waitUntil(
    Promise.all([
      cache.put(cacheKey(origin, 'fresh'), store(WEATHER_CDN_CACHE_SECONDS)),
      cache.put(
        cacheKey(origin, 'stale'),
        store(WEATHER_CDN_STALE_WHILE_REVALIDATE_SECONDS),
      ),
    ]),
  );

  return toVisitorResponse(store(WEATHER_CDN_CACHE_SECONDS), 'MISS');
}
