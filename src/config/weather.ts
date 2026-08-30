// Central configuration for the compact Koh Samui weather widget (see
// documentation/features/weather-widget.md). Every tunable constant used by
// the Netlify proxy, the summary generator, and the client controller lives
// here so a later provider swap or a bigger weather page can reuse the exact
// same numbers instead of redefining them.

export interface WeatherLocation {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// Fixed forecast point -- never derived from a visitor's location. Open-Meteo
// returns modelled data for this coordinate/grid cell, not a physical
// weather-station reading.
export const WEATHER_LOCATION: WeatherLocation = {
  id: 'koh-samui-west',
  label: 'Westen von Koh Samui',
  latitude: 9.578488,
  longitude: 99.958293,
  timezone: 'Asia/Bangkok',
} as const;

// Asia/Bangkok never observes DST, so its UTC offset is fixed. Open-Meteo
// returns local wall-clock timestamps with no offset suffix for the
// requested `timezone` param -- see
// src/utils/weather/format-weather-time.ts's parseWeatherTimestamp() for why
// this constant exists and what a DST-observing future location would need
// instead.
export const WEATHER_LOCATION_UTC_OFFSET = '+07:00';

// Same-origin route the browser is allowed to call. The Netlify redirect in
// netlify.toml rewrites this to the actual function at
// /.netlify/functions/weather so the browser never talks to Open-Meteo or
// exposes the function's implementation path.
export const WEATHER_ENDPOINT_PATH = '/api/weather';

// Upper bound on how often the Netlify function is allowed to refresh from
// Open-Meteo for this location -- enforced via shared CDN cache headers, not
// a module-level in-memory cache (see src/netlify/functions/weather.ts).
export const WEATHER_CDN_CACHE_SECONDS = 2 * 60 * 60;
export const WEATHER_CDN_STALE_WHILE_REVALIDATE_SECONDS = 24 * 60 * 60;
export const OPEN_METEO_REQUEST_TIMEOUT_MILLISECONDS = 8000;

// Rules the German summary generator uses to decide what to mention and how
// confidently to phrase it. Keep these adjustable in one place -- see
// documentation/features/weather-widget.md#forecast-summary-rules.
export const WEATHER_FORECAST_RULES = {
  heavyRainMillimetres: 2,
  likelyRainProbabilityPercent: 60,
  lookAheadHours: 12,
  notableRainMillimetres: 0.2,
  possibleRainProbabilityPercent: 40,
} as const;

export type WeatherForecastRules = typeof WEATHER_FORECAST_RULES;

// Second cache layer in the browser, on top of the Netlify shared CDN cache.
// Keyed by schema version + location id so a future location or response
// shape change can't be misread as a still-fresh entry for the old shape.
export const WEATHER_BROWSER_CACHE_SCHEMA_VERSION = 1;
export const WEATHER_BROWSER_CACHE_STORAGE_KEY = `samui-weather:v${WEATHER_BROWSER_CACHE_SCHEMA_VERSION}:${WEATHER_LOCATION.id}`;

export const WEATHER_BROWSER_CACHE = {
  freshForMilliseconds: 2 * 60 * 60 * 1000,
  staleForMilliseconds: 24 * 60 * 60 * 1000,
} as const;

export type WeatherBrowserCachePolicy = typeof WEATHER_BROWSER_CACHE;

// IntersectionObserver tuning for the lazy-load trigger -- see
// src/components/features/weather/WeatherWidgetClient.ts.
export const WEATHER_WIDGET_OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '400px 0px',
  threshold: 0,
} as const;

// How often the visible "Ortszeit" clock refreshes once the widget has
// loaded. Not started until the widget is populated -- see the client
// controller's render()/disconnectedCallback().
export const WEATHER_LOCAL_CLOCK_INTERVAL_MILLISECONDS = 60 * 1000;
