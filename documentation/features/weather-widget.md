# Weather widget

A compact, editorial-style weather note rendered between the main page
content and the site footer on every normal content page. It shows the
current temperature, a German-language summary, and Bangkok-local times for
a single fixed Koh Samui location -- never the visitor's own location.

```text
30 °C im Westen von Koh Samui
Teilweise bewölkt. Gegen Abend sind Schauer möglich.
Gefühlt 35 °C
Wetterstand 17:45 Uhr · Ortszeit 18:03 Uhr
Wetterdaten: Open-Meteo · zusammengefasst · Lizenz CC BY 4.0
```

## Architecture

```text
Browser                Netlify edge/CDN         Netlify Function          Open-Meteo
--------                -----------------         ----------------          ----------
<dnb-weather-widget>
  IntersectionObserver
  localStorage cache
        |
        | fetch /api/weather
        v
                        rewrite (netlify.toml)
                        /api/weather ->
                        /.netlify/functions/weather
                                |
                                | cache miss/expired
                                v
                                                  weather.ts
                                                  - builds Open-Meteo URL
                                                  - AbortController timeout
                                                  - validates HTTP status
                                                  - normalises response
                                                          |
                                                          | GET /v1/forecast
                                                          v
                                                                            Open-Meteo
                                                                            forecast API
                                <-------------------------------------------
                        <-- Netlify-CDN-Cache-Control:
                            s-maxage=7200 (2h)
        <-- WeatherSnapshot JSON
```

Four separate layers, matching `src/utils/weather/` and
`src/components/weather/`:

1. **Provider integration** -- `src/netlify/functions/weather.ts` builds the
   Open-Meteo request URL and fetches it. Provider-specific knowledge stops
   here.
2. **Internal model** -- `src/utils/weather/types.ts` (`WeatherSnapshot`,
   `WeatherForecastHour`) and `src/utils/weather/normalise-open-meteo.ts`
   (raw response -> internal model, with validation). Everything downstream
   only ever sees this shape.
3. **Interpretation** -- `src/utils/weather/summarise-weather.ts` (German
   summary) and `src/utils/weather/weather-codes.ts` (WMO code -> category /
   label / icon).
4. **Presentation** -- `src/components/weather/WeatherWidget.astro` (markup,
   server-rendered but inert) and
   `src/components/weather/WeatherWidgetClient.ts` (lazy-load lifecycle,
   fetch, cache, DOM updates).

A provider swap should only ever touch layer 1 (and, if the new provider
uses a different code table, `weather-codes.ts`). The component and summary
logic never parse a raw provider response.

## Open-Meteo as the initial provider

Open-Meteo was chosen as the initial provider because it needs no API key or
account for non-commercial use, has a generous free tier for a single low
-traffic location refreshed at most every two hours, and returns the WMO
weather-interpretation-code table this widget's summary rules are built
around. Its licence (CC BY 4.0) requires visible attribution, which the
widget provides (see "Attribution and licence" below).

**Constraint:** the free Open-Meteo endpoint has no account-based usage
dashboard for this website and is rate-limited through Open-Meteo's own
infrastructure, not an API key issued to this site. There is nothing to
monitor on Open-Meteo's side; the only thing bounding upstream call volume
is *our* architecture -- specifically the Netlify shared CDN cache described
below, which caps requests to roughly one per two hours regardless of how
much visitor traffic the site gets. If that cache is ever removed or
misconfigured, upstream call volume would scale with visitor traffic
instead of staying flat.

## Fixed location

```ts
// src/config/weather.ts
export const WEATHER_LOCATION = {
  id: 'koh-samui-west',
  label: 'Westen von Koh Samui',
  latitude: 9.578488,
  longitude: 99.958293,
  timezone: 'Asia/Bangkok',
};
```

This is a fixed coordinate, never derived from a visitor. Open-Meteo returns
**modelled** weather for this coordinate/grid cell (`cell_selection=land`),
not a reading from a physical weather station -- the widget's copy
("Wetterdaten: Open-Meteo · zusammengefasst") deliberately avoids implying
otherwise.

`WEATHER_LOCATION_UTC_OFFSET` (`+07:00`) sits next to it. Asia/Bangkok never
observes DST, so this fixed offset is safe today; see "Time handling" below
for why it exists and what a DST-observing future location would need
instead.

## API request fields

Requested via `GET https://api.open-meteo.com/v1/forecast`:

| Param | Value |
| --- | --- |
| `latitude`, `longitude` | `WEATHER_LOCATION` |
| `current` | `temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,is_day` |
| `hourly` | `temperature_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code` |
| `timezone` | `Asia/Bangkok` |
| `forecast_days` | `2` |
| `cell_selection` | `land` |

Built in `src/netlify/functions/weather.ts`'s `buildUpstreamUrl()`.

## Raw provider format

```jsonc
{
  "latitude": 9.58, "longitude": 99.96, "timezone": "Asia/Bangkok",
  "current_units": { /* unit strings per field */ },
  "current": {
    "time": "2026-07-25T17:45", "interval": 900,
    "temperature_2m": 30, "apparent_temperature": 35,
    "relative_humidity_2m": 78, "precipitation": 0, "rain": 0,
    "weather_code": 2, "cloud_cover": 60, "wind_speed_10m": 9, "is_day": 1
  },
  "hourly_units": { /* unit strings per field */ },
  "hourly": {
    "time": ["2026-07-25T18:00", "..."],
    "temperature_2m": [29, "..."], "apparent_temperature": [34, "..."],
    "precipitation_probability": [40, "..."], "precipitation": [0.1, "..."],
    "rain": [0.1, "..."], "weather_code": [61, "..."]
  }
}
```

Notably: `is_day` is `0`/`1`, not a boolean, and every `current`/`hourly`
timestamp is a **local wall-clock string with no UTC offset** (because a
`timezone` param was requested) -- see "Time handling".

## Internal normalised format

```ts
// src/utils/weather/types.ts
interface WeatherSnapshot {
  schemaVersion: 1;
  location: WeatherLocation;
  current: {
    observedAt: string; // "Wetterstand" -- provider's current.time
    temperatureCelsius: number;
    apparentTemperatureCelsius: number | null;
    relativeHumidityPercent: number | null;
    precipitationMillimetres: number | null;
    rainMillimetres: number | null;
    cloudCoverPercent: number | null;
    windSpeedKilometresPerHour: number | null;
    weatherCode: number;
    isDay: boolean;
  };
  hourly: WeatherForecastHour[];
  generatedAt: string; // when the function built this snapshot
  provider: { id: 'open-meteo'; label: 'Open-Meteo' };
}
```

`normaliseOpenMeteoResponse()` (`src/utils/weather/normalise-open-meteo.ts`)
builds this from the raw response and treats it as untrusted input
throughout:

* **Required** fields (`temperature_2m`, `weather_code`, `is_day`,
  `time`/`hourly.time`) missing or the wrong type/non-finite ->
  `WeatherValidationError`, the whole response is rejected.
* **Optional** fields (`apparent_temperature`, `relative_humidity_2m`,
  `precipitation`, `rain`, `cloud_cover`, `wind_speed_10m`, and their hourly
  equivalents) that are **absent** become `null`. If **present but the
  wrong type or non-finite**, the whole response is still rejected -- a
  present-but-corrupt value is a stronger signal of a broken payload than a
  field the provider simply omitted, and malformed values are never
  silently coerced into a plausible number.
* Hourly arrays must all exist and share `time`'s length, or the response is
  rejected.
* An unrecognised `weather_code` does **not** invalidate the response --
  see "Weather-code mapping" for the safe fallback.

## Weather-code mapping

`src/utils/weather/weather-codes.ts` maps the WMO weather-interpretation
codes ("WW", 0-99) that Open-Meteo documents at
[open-meteo.com/en/docs](https://open-meteo.com/en/docs) to a category, a
German label, and a day/night icon:

```ts
interface WeatherCodeDefinition {
  category: 'clear' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle'
    | 'rain' | 'snow' | 'showers' | 'thunderstorm' | 'unknown';
  GermanLabel: string;
  dayIcon: WeatherIconName;
  nightIcon: WeatherIconName;
}
```

Any code not in the table (or a future provider's equivalent code) falls
back to `category: 'unknown'` with a neutral cloud icon and label -- it
never throws. Koh Samui never receives snow, so the snow/snow-shower codes
(71-77, 85-86) intentionally reuse the plain "cloud" icon rather than adding
a snow-specific icon that would only ever render in a test.

## Forecast-summary rules

```ts
// src/config/weather.ts
export const WEATHER_FORECAST_RULES = {
  heavyRainMillimetres: 2,
  likelyRainProbabilityPercent: 60,
  lookAheadHours: 12,
  notableRainMillimetres: 0.2,
  possibleRainProbabilityPercent: 40,
};
```

`summariseWeather()` (`src/utils/weather/summarise-weather.ts`) is a pure,
deterministic function of a `WeatherSnapshot`. No AI service is involved and
no raw English provider text is ever shown. Two sentences:

1. **Current condition** -- `Es regnet.` if it's currently raining (rain
   category, or `rainMillimetres >= notableRainMillimetres`); `Schwül und
   bewölkt.` if humidity >= 80% and the sky is cloudy/partly cloudy;
   otherwise the code's German label (with day/night wording for clear
   sky -- "Sonnig"/"Klarer Himmel").
2. **Outlook**, scanning `hourly` for the first entry within
   `lookAheadHours` that has a thunderstorm code, or
   `precipitationProbabilityPercent >= possibleRainProbabilityPercent`, or
   `notableRainMillimetres`+ of rain:
   * If it's currently raining: "anhält" if a future hour still qualifies,
     otherwise "lässt nach" with a time-of-day phrase.
   * A qualifying thunderstorm hour always wins: "Später sind Gewitter
     möglich."
   * `>= likelyRainProbabilityPercent`: "Ab etwa {hour} ist Regen
     wahrscheinlich."
   * Showers category: "sind (kräftige) Schauer möglich", "kräftige" only
     when the amount reaches `heavyRainMillimetres`.
   * Otherwise: "kann es regnen."
   * No qualifying hour and not currently raining: "bleibt es
     voraussichtlich trocken."

All five numbers above are the single place to retune sensitivity; see
`src/test/weather-summarise.test.ts` for the boundary behaviour at 39/40/59/60%.

## Netlify proxy architecture

The browser only ever calls the same-origin `/api/weather`. `netlify.toml`
rewrites that (status `200`, not a redirect) to
`/.netlify/functions/weather`, so the browser never sees the function's
implementation path and never connects to Open-Meteo directly.

`src/netlify/functions/weather.ts`:

* builds the upstream URL and fetches it with an `AbortController` timeout
  (`OPEN_METEO_REQUEST_TIMEOUT_MILLISECONDS`, 8s);
* returns a stable `{ error: { code, message } }` JSON body with an
  appropriate status for every failure mode (network/timeout -> 504, HTTP
  429 -> 429, other non-2xx -> 502, invalid JSON -> 502, failed validation
  -> 502) -- the visitor-facing `message` is always the same generic German
  sentence; no stack trace or upstream body ever reaches the browser;
* logs a concise, non-personal diagnostic (`console.error`/`console.warn`)
  distinguishing upstream failures from validation failures -- no IP
  address, user agent, or other visitor data is logged, since none is
  collected for this endpoint in the first place;
* on success, returns the `WeatherSnapshot` JSON with the cache headers
  described next.

Relative imports (`../../config/weather`, `../../utils/weather/...`) are
used deliberately instead of the `@config`/`@utils` tsconfig path aliases --
this file is bundled standalone by Netlify's function bundler, separately
from the Astro/Vite build that resolves those aliases for the rest of the
app, and a two-directory relative import removes any doubt about whether
that bundling step also honours `tsconfig.json` `paths`.

## Server/CDN cache behaviour

```text
Cache-Control: public, max-age=0, must-revalidate
Netlify-CDN-Cache-Control: public, s-maxage=7200, stale-while-revalidate=86400
```

* `Netlify-CDN-Cache-Control` is the real cache: Netlify's shared edge/CDN
  reads it (and strips it before the response reaches the browser),
  caching the response for `s-maxage=7200` seconds (2h) with an additional
  24h `stale-while-revalidate` window. This is what actually bounds
  Open-Meteo calls to roughly once per two hours for this location,
  **regardless of how many function instances Netlify runs concurrently or
  how much visitor traffic hits `/api/weather`** -- a module-level variable
  inside `weather.ts` would only be a per-instance cache and is explicitly
  not relied on here.
* `Cache-Control` (the plain header, seen by the browser) intentionally
  does *not* tell the browser's own HTTP cache to hold onto the response --
  freshness on the client is owned entirely by the localStorage layer below
  instead, so every revalidation request cheaply hits the CDN cache rather
  than living in two independent caches with two independent expiry clocks.
* Error responses always get `Cache-Control: no-store` so a transient
  Open-Meteo outage can't pin every visitor to a cached failure for two
  hours.

Verify against a real deploy preview (`curl -I` the `/api/weather` URL)
before assuming a given Netlify plan/runtime honours
`Netlify-CDN-Cache-Control` exactly as documented here.

## Browser cache behaviour

Second cache layer, in `localStorage`, keyed by
`WEATHER_BROWSER_CACHE_STORAGE_KEY` (`samui-weather:v1:koh-samui-west` --
versioned by schema + location id):

```ts
export const WEATHER_BROWSER_CACHE = {
  freshForMilliseconds: 2 * 60 * 60 * 1000,  // 2h
  staleForMilliseconds: 24 * 60 * 60 * 1000, // 24h
};
```

Implemented in `src/utils/weather/browser-cache.ts`:

* **< 2h old**: render immediately, no request.
* **2h-24h old**: render the stale snapshot immediately, then quietly
  revalidate via `/api/weather`; a failed revalidation just leaves the
  stale render on screen.
* **> 24h old**, or the entry fails schema-version/shape validation, or
  `JSON.parse` throws, or `localStorage` itself throws (private mode, quota,
  disabled) -- all treated identically as "no usable cache": fetch fresh,
  same as a first visit.
* Every `localStorage` call is wrapped in `try/catch`; a storage failure
  never breaks the widget, it just doesn't persist.

## Lazy-loading lifecycle

`src/components/weather/WeatherWidgetClient.ts` defines
`<dnb-weather-widget>`, a small custom element -- the same
`IntersectionObserver` + custom-element pattern already used by
`src/components/Giscus.astro`, not a new pattern invented for this widget.

```ts
export const WEATHER_WIDGET_OBSERVER_OPTIONS = {
  root: null,
  rootMargin: '400px 0px',
  threshold: 0,
};
```

* `connectedCallback()` registers the element with a **class-level shared**
  `IntersectionObserver` (one observer instance for every widget on the
  page, not one per instance) and immediately unobserves once triggered.
* Browsers without `IntersectionObserver` fall back to
  `requestIdleCallback` (or a 200ms `setTimeout` if that's also missing) --
  a low-priority trigger, not a primary fixed timeout.
* A `data-initialised` attribute guards against double-initialisation if
  `connectedCallback` ever fires again for the same element.
* `disconnectedCallback()` unobserves and clears the "Ortszeit" clock
  interval -- no leaked timers or observers across Astro view-transition
  navigations.
* The markup starts with an `inert` attribute (not `hidden`) and no
  skeleton/spinner, collapsed to a zero-size box by CSS. `hidden` was tried
  first and rejected: it maps to `display: none` (Tailwind's preflight even
  forces this with `!important`), and an element with no geometry can never
  intersect the viewport, so `IntersectionObserver` would never fire and the
  widget would never lazy-load. `inert` removes the subtree from the
  accessibility tree and makes it unfocusable -- including the attribution
  links inside, avoiding a "focusable descendant of an aria-hidden ancestor"
  violation that plain `aria-hidden` would have caused -- while keeping real
  layout geometry. `inert` is only removed once real data (fresh cache,
  stale cache, or a successful fetch) is available to render; a failed
  fetch with nothing cached leaves it `inert` permanently for that page
  view.
* Icons are pre-rendered for every possible `WeatherIconName` (statically
  imported Lucide components, see "Lucide icons" below) and toggled via a
  `data-active-icon` attribute + CSS, so no icon is ever fetched or
  imported dynamically at runtime.
* The "Ortszeit" clock (`WEATHER_LOCAL_CLOCK_INTERVAL_MILLISECONDS`, 60s)
  only starts once the widget has actually rendered -- never before.

## Time handling

Three distinct timestamps, never conflated:

* **Wetterstand** -- `current.observedAt`, the provider's current-reading
  time, formatted with `formatWeatherClockTime()`.
* **Ortszeit** -- live Koh Samui clock via `formatKohSamuiTime(new Date(),
  timezone)`, refreshed once a minute while the widget is visible.
* **generatedAt** -- when the Netlify function built the snapshot; kept on
  the model for diagnostics/caching only, never shown to visitors.

All formatting goes through `Intl.DateTimeFormat` with an explicit
`timeZone`, exactly like `src/utils/dates.ts`'s existing pattern for post
dates -- never the visitor's own local timezone.

**Parsing pitfall this widget specifically guards against:** Open-Meteo
returns `current.time`/`hourly.time` as **local wall-clock strings with no
UTC offset** (e.g. `"2026-07-25T17:45"`) when a `timezone` param is
requested. Handing that straight to `new Date(string)` is a latent bug --
per the ECMA-262 Date Time String Format, an offset-less date-time string is
parsed as local time *in the runtime executing the code*, which is UTC on
the Netlify function and whatever zone the visitor's browser is in on the
client, essentially never actually Bangkok. `parseWeatherTimestamp()`
(`src/utils/weather/format-weather-time.ts`) fixes this by appending the
fixed `WEATHER_LOCATION_UTC_OFFSET` (`+07:00`) before parsing whenever the
string doesn't already carry an offset. Every weather timestamp (current
and hourly, on both the summary generator and the formatters) goes through
this function rather than a bare `new Date(...)`. See
`src/test/weather-time.test.ts`'s "is unaffected by the runtime not being
in Bangkok time" case.

This fixed-offset approach only works because Asia/Bangkok never observes
DST. A future location in a DST-observing timezone would need real
timezone-database math (e.g. resolving the correct offset per date) instead
of a single constant.

## Privacy

No browser geolocation is ever requested, no visitor location is derived or
transmitted, and the browser never connects to Open-Meteo directly -- only
to this site's own `/api/weather`. No cookies and no tracking are added.
Server-side logging in `weather.ts` never includes an IP address, user
agent, or any other visitor data (none is collected for this endpoint to
begin with).

Documented in
[`src/pages/kleingedrucktes/datenschutzerklaerung.mdx`](../../src/pages/kleingedrucktes/datenschutzerklaerung.mdx)
under "Wetterdaten".

## Attribution and licence

Open-Meteo's data is CC BY 4.0 and requires attribution. The widget renders,
close to the data itself:

```text
Wetterdaten: Open-Meteo · zusammengefasst · Lizenz CC BY 4.0
```

`Open-Meteo` links to [open-meteo.com](https://open-meteo.com), `CC BY 4.0`
links to the licence text at
[creativecommons.org/licenses/by/4.0](https://creativecommons.org/licenses/by/4.0/).
"· zusammengefasst" ("summarised") makes clear the visible German sentence is
this site's own derived summary, not raw text from Open-Meteo, and nothing
in the widget implies Open-Meteo endorses the site. The line is styled with
the existing `text-muted-foreground`/`text-link` tokens -- visually
subordinate to the weather content itself, but always legible.

## Error handling and fallbacks

| Failure | Server (`weather.ts`) | Client (`WeatherWidgetClient.ts`) |
| --- | --- | --- |
| Network timeout | `AbortController` -> 504, generic message, logged | Falls through to cache/inert behaviour below |
| Non-2xx upstream | 502, generic message, logged with the real status | same |
| HTTP 429 | 429, generic message, logged as a rate-limit warning | same |
| Malformed JSON | 502, generic message, logged | same |
| Invalid response shape | 502, generic message, `WeatherValidationError` logged | same |
| Missing hourly values | Rejected during normalisation (see above) | same |
| Unknown weather code | Not an error -- safe fallback | Renders with the neutral fallback icon/label |
| Browser offline | n/a | `fetch` rejects, same as any other request failure |
| `localStorage` unavailable | n/a | Every call wrapped in `try/catch`; widget still works, just without persistence |
| Fetch fails, stale cache present | n/a | Stale render stays on screen |
| Fetch fails, no cache | n/a | Widget stays `inert`; no error is ever shown to the visitor |

The client never lets a rejected promise go unhandled -- `fetchAndRender()`
catches internally, and both call sites (`load()`'s cache branches and the
`IntersectionObserver` callback) invoke it without needing an external
`try/catch`. A dev-only `console.warn` is the only diagnostic surfaced, and
only when `import.meta.env.DEV`.

## Accessibility

* All information in the widget (temperature, summary, times, attribution)
  is plain text; icons are supplementary, never the sole carrier of
  information.
* Every icon variant is rendered with `aria-hidden="true"` since the
  adjacent text already states the same condition.
* No live region is used at all (`aria-live` is never set on any part of
  the widget) -- content simply appears once loaded, and the once-a-minute
  "Ortszeit" update is a plain text change with no announcement semantics,
  so neither the initial load nor the clock ticking over produces a
  disruptive assistive-technology announcement.
* `prefers-reduced-motion` is respected implicitly: the widget has no
  animation of its own (no skeleton, no fade-in) to guard in the first
  place.
* Attribution links (`Open-Meteo`, `CC BY 4.0`) have descriptive,
  understandable link text and use the same `text-link` token as body
  links, so contrast follows the existing design system.
* Layout uses relative units and Tailwind's flex/wrap utilities, so it
  holds up at 200% zoom without overflow.

## Configuration points

Every tunable constant lives in `src/config/weather.ts`:
`WEATHER_LOCATION`, `WEATHER_LOCATION_UTC_OFFSET`, `WEATHER_ENDPOINT_PATH`,
`WEATHER_CDN_CACHE_SECONDS`, `WEATHER_CDN_STALE_WHILE_REVALIDATE_SECONDS`,
`OPEN_METEO_REQUEST_TIMEOUT_MILLISECONDS`, `WEATHER_FORECAST_RULES`,
`WEATHER_BROWSER_CACHE_STORAGE_KEY`, `WEATHER_BROWSER_CACHE`,
`WEATHER_WIDGET_OBSERVER_OPTIONS`, `WEATHER_LOCAL_CLOCK_INTERVAL_MILLISECONDS`.

## Testing instructions

```bash
npm run test -- weather        # the four weather-*.test.ts files
npm run check                  # full quality gate (format/lint/validate/test)
```

Covered by `src/test/weather-normalise.test.ts`,
`weather-summarise.test.ts`, `weather-cache.test.ts`, and
`weather-time.test.ts`: provider-response validation (valid response,
malformed top-level, mismatched hourly arrays, missing required fields,
non-finite numbers, unknown weather code), summary generation (dry/rain/
thunderstorm/night/persistent/ending scenarios and the 39/40/59/60%
boundaries), browser-cache freshness classification (fresh/stale/expired/
wrong-schema/malformed-JSON/storage-exception), and time formatting
(Bangkok formatting, the midnight boundary, and a runtime not in Bangkok's
own timezone).

**Not covered by an automated test:** the `<dnb-weather-widget>` custom
element's own DOM lifecycle (observer wiring, fetch triggering, DOM
updates). This repo's Vitest setup runs in a plain Node environment with no
`jsdom`/`happy-dom` installed, so a full custom-element test would need a
new devDependency; the pure logic it calls into (cache classification,
summarisation, time formatting) is fully covered instead. See "Remaining
limitations".

Manual verification checklist:

* Widget appears between the last content block and the footer, on desktop
  and mobile, in both light and dark themes.
* Open browser devtools' Network tab: no request fires until the widget
  scrolls near the viewport, and there is never a request to
  `api.open-meteo.com` -- only to `/api/weather`.
* First load populates `localStorage['samui-weather:v1:koh-samui-west']`;
  reloading within 2h shows the widget with no new network request.
* Manually editing the cached `storedAt` to 3h ago shows the stale value
  immediately, then a background revalidation request.
* Simulating a failed `/api/weather` (e.g. via devtools request blocking)
  with no prior cache leaves the widget invisible, with no visible error.
* Attribution links resolve to open-meteo.com and the CC BY 4.0 licence
  text.
* "Wetterstand" and "Ortszeit" both show plausible Bangkok times regardless
  of the browser's own system timezone.

## Troubleshooting

* **Widget never appears**: check the Network tab for a `/api/weather`
  request. No request at all usually means the widget never crossed the
  `rootMargin: 400px` trigger (try scrolling further) or `hideWeather` is
  set on the page's layout (see "Placement" below). A request that fails
  with 502/504 means Open-Meteo itself is unreachable or returned something
  unexpected -- check the Netlify function logs for the specific
  `[weather]`-prefixed diagnostic.
* **Stale data never refreshes**: confirm the CDN cache headers on a real
  deploy preview (`curl -I https://<preview>/api/weather`) -- if
  `Netlify-CDN-Cache-Control` isn't being honoured as expected on the
  current plan, every request re-fetches from Open-Meteo without a hard
  failure, which is safe but defeats the caching intent.
* **Wrong-looking times**: confirm `WEATHER_LOCATION_UTC_OFFSET` is still
  correct (only fails if Bangkok ever adopted DST, which it hasn't) and that
  the timestamp went through `parseWeatherTimestamp()`/`readLocalHour()`
  rather than a bare `new Date(string)`.
* **Icon looks wrong for the described condition**: check
  `getWeatherCodeDefinition()` in `weather-codes.ts` for that specific WMO
  code -- especially codes in the 71-86 snow range, which intentionally
  fall back to the plain cloud icon.

## Placement

Rendered from `src/components/Footer.astro` (as the first thing before the
`<footer>` element itself), which every shared layout already includes --
`PageLayout.astro`, `BlogPost.astro`, `index.astro`, and
`seite/[seite].astro` -- so it appears on every normal content page without
each page needing to render it individually.

`Footer.astro` accepts a `hideWeather` prop (threaded through
`PageLayout.astro`'s own `hideWeather` prop) for pages that should
intentionally omit it. Currently used only by `404.astro`, since an error
page isn't really "content" the weather note belongs under. Other special
surfaces don't need the prop because they don't render `Footer.astro` at
all:

* `src/pages/timeline.astro` -- deliberately renders no site chrome
  whatsoever (no `Header`/`Footer`), by design (see
  [life-timeline.md](life-timeline.md)).
* `rss.xml.js`, `opensearch.xml.ts` -- feeds/API routes, not HTML pages.

`kleingedrucktes/*` (legal pages) and `kontakt.mdx`/`suche.mdx` render the
widget like any other `PageLayout` page; nothing about them is print-only,
embedded, or API-shaped, so they were not added to the exclusion list.

## Extension plan for a larger weather display

The architecture is deliberately layered so a future `/wetter/` page (or
similar) can be built by reusing every layer as-is:

* **Same provider adapter and endpoint** -- `/api/weather` already returns
  the full `WeatherSnapshot`, including all 48 hours of `hourly` data (only
  the compact widget's `summariseWeather()` call limits itself to the next
  `lookAheadHours`). A bigger page can call the exact same endpoint.
* **Same normalised model and code table** -- `WeatherSnapshot`,
  `WeatherForecastHour`, and `weather-codes.ts` are provider-independent by
  design; nothing about them is compact-widget-shaped.
* **Same formatting utilities** -- `format-weather-time.ts` and
  `WeatherIcon.astro` are already standalone, reusable pieces.
* **Same cache and attribution** -- the CDN cache, browser cache, and
  attribution copy/links are not duplicated per surface.

Documented but **not implemented** extension points for that later page:
a full 24-hour forecast strip, a multi-day forecast, a temperature graph, a
precipitation graph, humidity, wind, sunrise/sunset, multiple Koh Samui
locations (the `WeatherLocation`/`id` shape already supports more than one;
see `src/config/maps.ts`'s `MapPoint` for the sibling pattern this could
follow), and marine conditions.

## Provider migration procedure

To replace Open-Meteo with a different provider:

1. Write a new fetch/URL-building function alongside (or replacing)
   `buildUpstreamUrl()` in `weather.ts`.
2. Write a new `normalise<Provider>Response()` next to
   `normaliseOpenMeteoResponse()`, producing the exact same `WeatherSnapshot`
   shape -- this is the only function that needs to understand the new
   provider's raw format.
3. If the new provider uses a different weather-code system, add a mapping
   function that converts its codes to this file's `WeatherCodeCategory` /
   `WeatherIconName` -- or, if it already speaks WMO codes, reuse
   `weather-codes.ts` unchanged.
4. Update `provider: { id, label }` in the normaliser output and the
   attribution markup/links in `WeatherWidget.astro` (and this document's
   "Attribution and licence" section) to match the new provider's
   requirements.
5. `summariseWeather()`, `WeatherWidgetClient.ts`, and `WeatherWidget.astro`
   should need **no changes** -- that is the point of the layering above.

## Remaining limitations

* No automated test exercises the `<dnb-weather-widget>` custom element's
  actual DOM behaviour (see "Testing instructions").
* The fixed `+07:00` offset assumption only holds because Asia/Bangkok has
  no DST; a second location in a DST zone needs real timezone math.
* The Netlify shared CDN cache's exact behaviour depends on the hosting
  plan/runtime; this document states the intended headers, not a guarantee
  every Netlify tier honours them identically.
* The German summary is a small rule-based system, not a full meteorological
  narrative -- it deliberately covers only the documented scenarios above.
