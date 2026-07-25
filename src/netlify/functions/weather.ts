// Same-origin weather proxy -- see documentation/features/weather-widget.md
// for the full architecture. The browser only ever calls /api/weather
// (rewritten to this function by netlify.toml); this function is the only
// thing that talks to Open-Meteo.
//
// Relative imports on purpose: unlike Astro components (which resolve
// tsconfig path aliases through Vite), this file is bundled standalone by
// Netlify's function bundler, and relying on esbuild's tsconfig-path
// resolution inside that separate bundling step is an unnecessary risk for
// a two-directory relative import. Mirrors the existing
// src/netlify/functions/contact.mjs, which colocates its helpers under
// src/netlify/functions/lib/ rather than importing from src/utils.
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

function buildUpstreamUrl(): string {
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

interface WeatherErrorBody {
  error: { code: string; message: string };
}

const GENERIC_UNAVAILABLE_MESSAGE = 'Wetterdaten sind derzeit nicht verfügbar.';

function jsonError(status: number, code: string): Response {
  const body: WeatherErrorBody = {
    error: { code, message: GENERIC_UNAVAILABLE_MESSAGE },
  };
  return Response.json(body, {
    // Never cache an error at the CDN -- a transient Open-Meteo outage
    // should not pin every visitor to a failure for two hours.
    headers: { 'Cache-Control': 'no-store' },
    status,
  });
}

export default async function handler(): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    OPEN_METEO_REQUEST_TIMEOUT_MILLISECONDS,
  );

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(buildUpstreamUrl(), {
      signal: controller.signal,
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error(
      `[weather] Open-Meteo request failed${isTimeout ? ' (timeout)' : ''}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return jsonError(504, 'upstream_unreachable');
  } finally {
    clearTimeout(timeoutId);
  }

  if (upstreamResponse.status === 429) {
    console.warn('[weather] Open-Meteo rate limit (429) hit.');
    return jsonError(429, 'upstream_rate_limited');
  }

  if (!upstreamResponse.ok) {
    console.error(
      `[weather] Open-Meteo responded with HTTP ${upstreamResponse.status}.`,
    );
    return jsonError(502, 'upstream_error');
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
    return jsonError(502, 'upstream_invalid_json');
  }

  try {
    const snapshot = normaliseOpenMeteoResponse(raw, WEATHER_LOCATION);

    return Response.json(snapshot, {
      headers: {
        // Short/no browser HTTP cache -- the widget's own localStorage
        // cache (see src/utils/weather/browser-cache.ts) owns freshness on
        // the client, so every revalidation should cheaply hit the shared
        // CDN cache below rather than linger in a private browser cache
        // with its own independent expiry.
        'Cache-Control': 'public, max-age=0, must-revalidate',
        // Netlify's shared CDN cache -- the actual "at most one Open-Meteo
        // refresh per two hours" enforcement. A module-level variable would
        // only be a per-instance cache and Netlify can run many function
        // instances concurrently, so this header (not an in-memory object)
        // is the real cache. See
        // documentation/features/weather-widget.md#server-cdn-cache-behaviour.
        'Netlify-CDN-Cache-Control': `public, s-maxage=${WEATHER_CDN_CACHE_SECONDS}, stale-while-revalidate=${WEATHER_CDN_STALE_WHILE_REVALIDATE_SECONDS}`,
      },
    });
  } catch (error) {
    const message =
      error instanceof WeatherValidationError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    console.error(
      `[weather] Open-Meteo response failed validation: ${message}`,
    );
    return jsonError(502, 'upstream_invalid_shape');
  }
}
