# Life timeline map

An experimental, animated map at [`/timeline/`](../../src/pages/timeline.astro) that tells the story of one life from 1974 through the current year, using the site's existing MapLibre/OpenFreeMap stack (see [Interactive maps](maps.md)). It is intentionally **not** linked from the header navigation — reachable only by direct URL until the content is considered final.

This file covers architecture, the data schema, and the playback/camera/ journey mechanics. For a practical, copy-paste-driven guide to actually filling in real content, see [Life timeline authoring guide](life-timeline-authoring.md).

## Architecture

* `src/pages/timeline.astro` — the route. Renders no site chrome at all — neither `PageLayout.astro`'s centered `max-w-4xl` card wrapper nor the `Header`/`Footer` components — so the map is a fully immersive, edge-to-edge experience contained to exactly one viewport (`h-svh`, no scroll), not "a page with a map on it". It hydrates the map island with `client:load`, since the whole page's purpose is this one interactive component.
* `src/components/features/life-timeline/LifeTimelineMap.tsx` — the top-level React component. Resolves the sparse data into one state per year, drives the playback controller, and composes the map canvas with the overlay UI.
* `src/components/features/life-timeline/` — supporting pieces:
  * `playback-controller.ts` — a framework-agnostic state machine (`LifeTimelinePlaybackController`) owning playback state and the auto-advance timer. Deliberately independent of React so it is unit testable with plain Vitest fake timers; `useLifeTimelinePlayback.ts` wraps one instance with `useSyncExternalStore`.
  * `LifeTimelineCamera.tsx` — the imperative MapLibre camera driver. Watches the active year and drives `jumpTo`/`easeTo`/`fitBounds`, or hands off to `journey-animation.ts` for the 2005 sequence. Renders nothing.
  * `journey-animation.ts` — the plane-journey animation: a GeoJSON `LineString` source/layer drawn progressively, plus an HTML marker moved along the curve via `requestAnimationFrame`.
  * `geo.ts` — small local geometry helpers (quadratic-bezier curve, bearing, bounding box) — deliberately not a geodesic library, per the project's "avoid a large geospatial dependency for one feature" guidance.
  * `LifeTimelineMarkers.tsx`, `YearDisplay.tsx`, `DescriptionPanel.tsx`, `PlaybackControls.tsx` — presentational pieces.
  * `useReducedMotion.ts` — `prefers-reduced-motion` media-query hook.

`ContactMap.tsx` is untouched; timeline-specific behavior lives entirely under `LifeTimelineMap.tsx`/`life-timeline/`, reusing only the shared `src/components/ui/map.tsx` primitives (`MapCanvas`, `MapMarker`, `MarkerContent`, `MarkerPopup`, `MapControls`).

## Data schema

Configuration/types live in `src/config/life-timeline.ts`; the authored data is `src/data/life-timeline.json`, loaded and validated by `src/data/life-timeline.ts`.

```ts
interface LifeTimelineEntry {
  year: number; // multiple entries MAY share a year — see "Multiple moments per year"
  endYear?: number; // period end (inclusive); see "Sparse years and periods"
  title?: string;
  description?: string;
  image?: string; // representative photo path; requires imageAlt
  imageAlt?: string;
  locations: LifeTimelineLocation[]; // { point: slug, label?, role? }
  duration?: number; // ms held during auto playback
  transitionDuration?: number; // ms camera transition
  pauseAfterTransition?: number;
  camera?: { zoom?; pitch?; bearing?; padding?: { top?; right?; bottom?; left? } };
  transition?: {
    type?: "jump" | "fly" | "multi-location" | "journey";
    showPreviousLocation?: boolean;
    route?: LifeTimelineJourney; // journey transitions only
  };
  currentLocation?: boolean; // marks the present-day finale (see below)
  allowFutureYear?: boolean; // escape hatch to author a not-yet-reached year
}
```

Locations reference **slugs** in `src/data/map-points.json` (`{ point: 'dnb-hq' }`), never raw coordinates — the loader resolves them via `getMapPointBySlug()`. `[longitude, latitude]` ordering only ever appears at the MapLibre API boundary (inside `LifeTimelineCamera.tsx` and `journey-animation.ts`); everywhere else, named `latitude`/`longitude`.

## Sparse years and periods

The map needs one visual state for every calendar year from 1974 through the current year, but the JSON only has to list the years that actually changed something. `buildLifeTimelineYears()` in `src/data/life-timeline.ts` expands the sparse entries into a dense `ResolvedLifeTimelineYear[]`, one per calendar year:

* A gap year (no entry of its own) inherits the most recently active entry's **location** and **camera**, but carries no title/description and advances at the fast `LIFE_TIMELINE_CONFIG.defaultYearDuration` pace.
* An entry with `endYear` stays "active" — keeping its title/description — for every year from `year` through `endYear` inclusive. This is the period mechanism; there is no separate `startYear`/`endYear`-only shape, to avoid two parallel ways of saying the same thing.
* An entry with `currentLocation: true` is a special case: its period is **implicitly open-ended through whatever the current year is at render time**, regardless of `endYear`. This is what lets the finale track the calendar without a yearly data edit — `getLifeTimelineCurrentYear()` reads `Asia/Bangkok` "now" (via the same `POST_TIME_ZONE` used by post dates) each time the page loads.
* Only the **anchor year** itself (the exact `year` an entry declares) uses the slower `duration`/`transitionDuration` — a multi-year period or an open-ended `currentLocation` entry doesn't hold every subsequent year at that same deliberate pace, it just keeps showing the same text while ticking at the normal gap-year speed.
* A camera/location transition (`transition`, and the "previous location still visible" marker) only fires on the year the active location set actually changes — `ResolvedLifeTimelineYear.locationsChanged` — so re-visiting the same place across several years never re-triggers a pointless animation.

## Multiple moments per year

The resolver distinguishes two kinds of entries:

* **Period entries** — set `endYear` and/or `currentLocation`. They own a *range* of years and, per the validator in `src/utils/life-timeline-validation.ts`, may not overlap another period's range.
* **Moment entries** — a plain one-off entry with neither `endYear` nor `currentLocation`. Any number of moment entries **may share the exact same `year`**, and each becomes its own step in the story, played in the order they appear in `life-timeline.json` (array order — there is no separate `order` field, since JS's stable sort already preserves file order for same-year entries). This is what lets, say, a 1975 birth and a later-that- year naming ceremony play as two distinct steps instead of being merged or rejected as duplicates.
* A moment entry may also sit **inside** an ongoing period's range — a one-off event interrupting an otherwise continuous period (e.g. a single documented trip during six years of school). The period's own location/camera/text automatically resume on the very next year; the resolver re-derives a within-period gap year's location fresh from the period entry itself rather than trusting whatever a moment last set, so the "snap back" happens without any extra authoring.

`ResolvedLifeTimelineYear` is one entry per **step**, not strictly one per calendar year — the exported name kept its original meaning ("year" as in "a year's worth of state") for continuity, but the year number on consecutive steps can repeat.

The current sample data (`src/data/life-timeline.json`) intentionally has **only two authored entries** — 1974 and 2005 — per the "do not invent biographical facts, city names, or relocation dates" constraint this feature was built under. Everything else is honestly represented as inherited state, not fabricated history.

## Placeholders still requiring real values

* `todo-birthplace` (`src/data/map-points.json`) — a placeholder map point at Null Island (0°N 0°O), explicitly marked as `TODO_ORIGIN_BEFORE_THAILAND` in its title/description. Replace its `latitude`/`longitude` with the real origin once known — no other file needs to change, since the timeline only references it by slug.
* The 2005 entry's `currentLocation: true` reuses the existing `dnb-hq` map point (tagged `menow` — "me, now" — in `map-points.json`) as both the Thailand arrival point and the present-day finale, since no later relocation is documented. If a later move is ever authored, add a new entry and move `currentLocation: true` to it.

## Camera configuration

`camera.zoom`/`pitch`/`bearing`/`padding` are all per-entry and merge onto the previous resolved camera (unset fields inherit, so an entry only has to specify what changed). `LIFE_TIMELINE_CONFIG` in `src/config/life-timeline.ts` documents indicative zoom levels (`worldZoom`, `regionZoom`, `countryZoom`, `cityZoom`) as a reference scale for authors, not an enforced enum. `camera.padding` is data-authored extra padding (e.g. for a deliberately off-center composition); it's merged with the runtime UI padding (`LifeTimelineMap.tsx`'s `useUiPadding()`, which avoids the description panel/controls/year overlay) rather than replacing it.

Multi-location entries (`locations.length > 1`) automatically compute a `fitBounds()` covering all active locations instead of an `easeTo()`/ `jumpTo()` toward a single point.

## The 2005 plane journey

`transition: { type: 'journey', route: { from, to, transport: 'plane', curve, duration, lineStyle, followVehicle } }` is fully data-driven — nothing in the component code branches on the literal year 2005. `LifeTimelineCamera.tsx` detects `transition.type === 'journey'` for whichever year has it and hands off to `journey-animation.ts`, which:

1. Draws a quadratic-bezier curve (`geo.ts#computeJourneyCurve`) between the resolved `from`/`to` map points, bowed by `curve` (0 = straight line).
2. Adds a GeoJSON `LineString` source/layer, revealing it progressively as the animation advances (`line-dasharray` when `lineStyle: 'dashed'`).
3. Moves an HTML marker (a small decorative plane glyph, `aria-hidden`) along the curve via `requestAnimationFrame`, rotating it to the current bearing.
4. Optionally re-centers the camera on the plane each frame (`followVehicle: true`) while zoomed out to keep both endpoints in view.
5. Eases into the entry's own `camera` at the destination once the animation completes, then removes the line/marker.

## Reduced motion

`useReducedMotion()` watches `prefers-reduced-motion: reduce`. When active:

* The intro pause before auto playback is skipped (starts immediately).
* Camera transitions use `jumpTo`/`duration: 0` instead of eased motion.
* The journey animation skips the rAF loop entirely — it draws the complete route instantly and jumps straight to the destination camera. No plane marker is animated.
* The finale marker's pulse animation is not rendered.

All textual information (title, description, active location names, journey status) is identical regardless of motion preference — reduced motion never removes content, only removes prolonged animation.

## Playback state model

```ts
type PlaybackState = "idle" | "playing" | "paused" | "transitioning" | "completed";
```

`LifeTimelinePlaybackController` (in `playback-controller.ts`) owns `{ yearIndex, playbackState }` plus its own advance timer. Every index change enters `'transitioning'` first; the camera driver calls `settleTransition()` once its MapLibre animation actually finishes, at which point playback resumes (`'playing'`), holds (`'paused'`), or finishes (`'completed'`). This keeps "which year is logically active" decoupled from "is the camera still moving" — rapid Next/Previous clicks move the index immediately (cancelling any in-flight animation via `map.stop()` and an animation-token check in `LifeTimelineCamera.tsx`) without ever queuing up multiple camera animations.

On mount, the component waits `LIFE_TIMELINE_CONFIG.introPauseDuration` (or no delay under reduced motion) showing the initial world view and "1974", then calls `controller.start()`, which begins the first transition and — once it settles — continues straight into automatic playback, matching "automatic mode begins at 1974" as the default experience. `restart()` returns to year index 0 and re-animates the camera back to 1974, but does **not** auto-resume playback — matching "Von vorn beginnen" being a distinct action from "Abspielen" in the control set.

## Adding or editing content

See [Life timeline authoring guide](life-timeline-authoring.md) for the full walkthrough (registering a place, recipes for a simple year/period/ multi-location year/journey, the finale, and what each validation error means). In short: add a `slug`/coordinates entry to `src/data/map-points.json` once per place, then reference it by slug from an object in `src/data/life-timeline.json`; `npm run test` runs the schema validation and fails loudly with the offending entry's year and field on any mistake.

## Moving the page later

Currently at `/timeline/`. To relocate: move `src/pages/timeline.astro` to the new path (Astro's file-based routing handles the rest) and update the canonical description/title if the route segment itself communicates something (it currently doesn't). No component or data file references the route path, so this is a pure file move.

To add it to the header navigation, add a `HeaderLink` entry in `Header.astro` — deliberately not done as part of this feature per the "experimental placement, do not add to main navigation unless explicitly instructed" requirement.

## OpenFreeMap privacy notes

Same as the rest of the site's map usage (see [Interactive maps](maps.md)): `tiles.openfreemap.org` receives ordinary connection metadata (e.g. visitor IP) when the map style/tiles load. This is not described as fully self-hosted or anonymous. The long-term path to full independence is a locally hosted style document plus a self-hosted regional Protomaps PMTiles file — not implemented yet for this feature either.

## Known limitations

* No Playwright test was added for this page. The repository has `@playwright/test` installed but no existing Playwright test suite/config (no `playwright.config.*`, no `*.spec.ts` files) — per the task's own instruction ("add a Playwright test **if** the repository already uses Playwright for interactive page behaviour"), a from-scratch Playwright harness was out of scope here. Coverage instead comes from Vitest tests over the data resolution, validation, geometry helpers, and the playback state machine, plus manual verification.
* The initial world view uses a fixed low zoom/center rather than a viewport-aspect-ratio-aware `fitBounds()` calculation, to avoid depending on `MapCanvas`'s post-mount viewport measurement before the first paint.
* `/timeline/` renders **no site chrome at all** — no `Header`/masthead/nav, no `Footer` — by deliberate request, so the map fills exactly one viewport (`h-svh`, no scroll) rather than sharing the page with the site's usual navigation. This also means the page has no theme toggle, no sound toggle, and no "skip to content" link; it keeps `Analytics.astro` (Matomo) directly, matching `Footer.astro`'s own `import.meta.env.PROD` guard, since losing tracking wasn't part of the request.
