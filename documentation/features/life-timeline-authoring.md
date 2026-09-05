# Life timeline authoring guide

A practical, copy-paste-driven guide to filling in real content for the `/timeline/` life timeline map. For architecture, the resolved data model, and the playback/camera/journey mechanics, see [Life timeline map](life-timeline.md) — this file only covers *how to author entries*.

Two files matter for content:

* `src/data/map-points.json` — the registry of real-world places (shared with `/kontakt/`'s contact map).
* `src/data/life-timeline.json` — the sparse list of "things changed this year" entries that reference those places by slug.

After editing either file, run `npm run test` (or just `npm run dev` and watch the terminal) — `src/data/life-timeline.ts` validates the whole file at import time and throws a descriptive error identifying the offending entry's year and field if something's wrong.

## Quick reference

| Field | Type | Notes |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `year` | `number` | Required. Must be `>= 1974` and at most the current year (Bangkok time) unless `allowFutureYear: true`. Multiple entries MAY share the same year — see [Recipe: multiple moments in one year](#recipe-multiple-moments-in-one-year). |
| `endYear` | `number?` | Optional period end (inclusive). Omit for a one-off moment. Setting this (or `currentLocation`) makes the entry a "period" that may not overlap another period's range. |
| `title` | `string?` | Short heading, shown in the description panel. |
| `description` | `string?` | German prose, 1–3 sentences is plenty. |
| `image` | `string?` | Path to a representative photo (e.g. `/assets/timeline/1975-geburt.jpg`). Requires `imageAlt`. |
| `imageAlt` | `string?` | Accessible alt text. Required (validated) whenever `image` is set. |
| `locations` | `LifeTimelineLocation[]` | Required, at least one. `{ point: 'slug', label?, role? }`. |
| `duration` | `number?` | ms this entry holds during auto playback (default `2400`). |
| `transitionDuration` | `number?` | ms for the camera move into this entry (default `1600`). |
| `pauseAfterTransition` | `number?` | Extra ms pause once the camera settles (default `400`). |
| `camera` | `{ zoom?, pitch?, bearing?, padding? }` | Unset fields inherit from the previous entry. |
| `transition` | `{ type?, showPreviousLocation?, route? }` | See the recipes below. |
| `currentLocation` | `boolean?` | Marks the present-day finale (see [Recipe: the finale](#recipe-the-present-day-finale)). |
| `allowFutureYear` | `boolean?` | Escape hatch to deliberately author a not-yet-reached year. |

`locations[].role` is `'primary' | 'previous' | 'destination' | 'context'` — it only affects marker styling (context/previous render muted) and popup labeling, not the resolution logic.

Indicative zoom levels from `LIFE_TIMELINE_CONFIG` (`src/config/life-timeline.ts`) — not enforced, just a reference scale:

| Name | Value | Roughly |
| ------------- | ----- | ----------------------- |
| `worldZoom` | 0.55 | Whole-world view |
| `regionZoom` | 4 | Continent/large country |
| `countryZoom` | 6 | Country |
| `cityZoom` | 11 | City/island |

## Step 1: register the place

Every location a timeline entry points to must already exist in `src/data/map-points.json`. Add one object per real place:

```json
{
  "slug": "berlin-kindheit",
  "latitude": 52.520008,
  "longitude": 13.404954,
  "title": "Berlin",
  "description": "",
  "tags": []
}
```

* `slug` — kebab-case, unique, referenced from `life-timeline.json` as `{ "point": "berlin-kindheit" }`.
* `description`/`tags` can stay empty strings/arrays if unused elsewhere (the contact map and timeline don't require them to be filled in).
* Coordinates: `latitude`/`longitude` only, **never** `[lng, lat]` here — that array-order convention only applies at the MapLibre API boundary inside the component code, not in data files.

Do this once per distinct place, then reference the slug as many times as needed across timeline entries.

## Step 2: replace the placeholder(s)

Two things are currently marked as placeholders and should be replaced with your real data as you go — see [Life timeline map § Placeholders still requiring real values](life-timeline.md#placeholders-still-requiring-real-values):

1. `todo-birthplace` in `map-points.json` — currently Null Island (0°N 0°O), with a visitor-facing placeholder title of "Herkunftsort (noch nicht dokumentiert)". Update its `latitude`/`longitude`/`title`/`description` to the real 1974 origin. Nothing in `life-timeline.json` needs to change — it already references this slug, so updating the coordinates here is the only edit needed.
2. The 2005 entry's journey `route.from` also points at `todo-birthplace` — update it at the same time, or point it at a different registered slug if the actual pre-Thailand departure point differs from the birthplace.

## Recipe: a simple one-year event

The minimum useful entry — a single year, one location, no special camera or transition:

```json
{
  "year": 1990,
  "title": "Umzug nach Hamburg",
  "description": "Die Familie zieht nach Hamburg um.",
  "locations": [{ "point": "hamburg-1990", "role": "primary" }],
  "camera": { "zoom": 10 }
}
```

Because the *location* changed from whatever the previous active entry was, this automatically gets an eased camera transition and (if the previous location differs) a briefly-visible "previous location" marker — you don't need to configure that yourself.

Add `image`/`imageAlt` to show a small photo alongside the text:

```json
{
  "year": 1990,
  "title": "Umzug nach Hamburg",
  "description": "Die Familie zieht nach Hamburg um.",
  "image": "/assets/timeline/1990-hamburg.jpg",
  "imageAlt": "Die Familie vor dem neuen Haus in Hamburg, 1990",
  "locations": [{ "point": "hamburg-1990", "role": "primary" }],
  "camera": { "zoom": 10 }
}
```

`image` is a plain public path (not run through Astro's image pipeline — this is JSON-driven data, same as `map-points.json`), so put the file under `public/` and reference its public URL directly. `imageAlt` is required whenever `image` is set — the validator rejects one without the other.

## Recipe: multiple moments in one year

Sometimes a single calendar year has more than one distinct thing worth telling — a birth and, later that same year, a naming/christening ceremony, say. Just add two entries with the same `year`; each becomes its own step, played in the order they appear in the file:

```json
{
  "year": 1975,
  "title": "Geburt",
  "description": "Geboren in [Ort].",
  "locations": [{ "point": "geburtsort", "role": "primary" }]
},
{
  "year": 1975,
  "title": "Taufe",
  "description": "Die Taufe findet in [Ort] statt.",
  "locations": [{ "point": "taufort", "role": "primary" }]
}
```

The year display shows "1975" for both steps — that's expected, they're two moments within the same year, not two different years. If both moments happen at the *same* place, just repeat the same `point` slug in both entries; no transition plays between them since nothing moved.

This only works for plain moments (no `endYear`, no `currentLocation`) — those are the only entries allowed to share a year. A moment may also sit *inside* an ongoing multi-year period (e.g. one specific documented event during a six-year "Schulzeit" period); the period's own text/location resume automatically on the following year. See [Life timeline map § Multiple moments per year](life-timeline.md#multiple-moments-per-year) for how the resolver handles this.

## Recipe: a multi-year period

Use `endYear` when a single description should stay on screen for several years — school years, a job, a relationship phase — without repeating the same entry every year:

```json
{
  "year": 1992,
  "endYear": 1998,
  "title": "Schulzeit in Hamburg",
  "description": "Sechs Jahre Schule in Hamburg.",
  "locations": [{ "point": "hamburg-1990", "role": "primary" }]
}
```

Years 1992 through 1998 all show this title/description; 1999 onward reverts to no text (unless another entry starts) while keeping the same location and camera until something else changes it.

Only 1992 (the anchor year) gets the slower `duration`; 1993–1998 tick at the fast gap-year pace while still displaying the text — so a six-year period doesn't make auto playback crawl.

## Recipe: a multi-location year

For a year where more than one place matters at once (e.g. a long trip visiting several cities, or a "here and there" moment), list more than one location — the camera automatically switches to `fitBounds()` covering all of them instead of centering on a single point:

```json
{
  "year": 2000,
  "title": "Sommerreise",
  "description": "Ein Sommer zwischen zwei Städten.",
  "locations": [
    { "point": "hamburg-1990", "role": "primary" },
    { "point": "muenchen-2000", "role": "context" }
  ],
  "camera": { "padding": { "top": 40, "right": 40, "bottom": 40, "left": 40 } }
}
```

`role: 'context'` locations render as a smaller, muted marker rather than the primary coral one, so the "main" place stays visually distinct.

## Recipe: a journey (plane) sequence

This is what powers the 2005 Thailand move — a curved animated route with a plane icon, not a plain camera cut. Use it for any dramatic long-distance relocation, not just 2005:

```json
{
  "year": 2005,
  "title": "Der Umzug nach Thailand",
  "description": "2005 geht es nach Thailand, auf die Insel Koh Samui. Dieser Ort bleibt bis heute der aktuelle Lebensmittelpunkt.",
  "locations": [{ "point": "dnb-hq", "role": "destination" }],
  "camera": { "zoom": 9 },
  "transition": {
    "type": "journey",
    "showPreviousLocation": true,
    "route": {
      "from": "todo-birthplace",
      "to": "dnb-hq",
      "transport": "plane",
      "curve": 0.35,
      "duration": 5200,
      "lineStyle": "dashed",
      "followVehicle": true
    }
  },
  "transitionDuration": 5200,
  "pauseAfterTransition": 900
}
```

Notes on the `route` fields:

* `from`/`to` are map-point slugs (not the same slug — the validator rejects a journey to/from the same place).
* `curve` — `0` is a straight line; `0.2`–`0.4` gives a pleasant arc. Higher values bow further off the direct line.
* `duration` — how long the plane animation itself takes, independent of `transitionDuration` on the entry (though it's sensible to keep them equal, as above, so the entry doesn't advance before the journey finishes).
* `followVehicle: true` keeps the camera centered on the moving plane while zoomed out enough to see both ends of the route; set it to `false` for a fixed wide shot instead.
* `lineStyle: 'dashed'` matches the "old adventure-film travel map" look; `'solid'` is also available.

Reduced-motion visitors skip the animated flight entirely — they get the complete route drawn instantly and a quick cut to the destination camera; see [Life timeline map § Reduced motion](life-timeline.md#reduced-motion).

## Recipe: the present-day finale

Exactly one entry should carry `currentLocation: true` — the place the story ends up. Its period automatically extends through whatever "today" is at render time (Bangkok time), so you never have to bump a year number:

```json
{
  "year": 2005,
  "locations": [{ "point": "dnb-hq", "role": "destination" }],
  "currentLocation": true
}
```

If a later relocation is ever authored, add the new entry for that year and move `currentLocation: true` onto it — remove it from the old entry. A `currentLocation` entry is a "period" (its range is open-ended through today), so the validator already rejects two of them coexisting as an overlap — you'll get a clear error if you forget to remove the old flag.

## Common validation errors and what they mean

Errors surface as thrown exceptions when `src/data/life-timeline.ts` is imported (so `npm run dev`/`npm run test`/`npm run build` will all fail loudly rather than silently rendering broken data). Each message names the year:

* `"year" must not be before 1974.` — check for a typo, or reconsider whether this is really about the site's subject's life.
* `"year" (2099) is after the current year (2026). Set "allowFutureYear" to author it deliberately.` — either fix the year, or this is truly a planned future event and you want to add `"allowFutureYear": true`.
* `"endYear" (…) must be an integer greater than or equal to "year".` — swap or fix the two numbers.
* `unknown map-point slug "…" in "locations".` — the slug isn't in `map-points.json` yet; do Step 1 first.
* `journey "route.from"/"route.to" references an unknown map-point slug` — same as above, but for a journey's endpoints specifically.
* `journey "route.from" and "route.to" must not be the same map point.` — a journey needs two different places.
* `Duplicate life-timeline period entries for year …` / `period entries overlap` — two **period** entries (ones with `endYear` and/or `currentLocation`) claim the same year or overlapping ranges. Merge them into one entry or adjust the ranges. This does *not* apply to plain one-off moments — those may freely share a year or sit inside a period; see [Recipe: multiple moments in one year](#recipe-multiple-moments-in-one-year).
* `has no usable content (no title, description, camera, or transition)` — an entry that changes nothing meaningful is indistinguishable from an unauthored gap year; give it at least a title, description, camera override, or transition, or just delete it and let the previous entry's location carry forward.
* `"image" is set but "imageAlt" is missing.` — add an `imageAlt` string describing the photo, or remove `image` if it's a placeholder.

## Worked example: turning three real memories into entries

Say you know: born 1974 somewhere, moved to Hamburg in 1990, and moved to Thailand in 2005 (already in the sample data). Here's the full diff shape:

**`src/data/map-points.json`** — add one new point:

```json
{
  "slug": "hamburg-1990",
  "latitude": 53.551086,
  "longitude": 9.993682,
  "title": "Hamburg",
  "description": "",
  "tags": []
}
```

**`src/data/life-timeline.json`** — insert a new entry between the existing 1974 and 2005 ones (order doesn't matter, the loader sorts by year, but keeping the file chronological is easier to read):

```json
{
  "year": 1990,
  "title": "Umzug nach Hamburg",
  "description": "1990 zieht die Familie nach Hamburg.",
  "locations": [{ "point": "hamburg-1990", "role": "primary" }],
  "camera": { "zoom": 10 }
}
```

Run `npm run test` — if it passes, the years 1975–1989 now show the birthplace (unchanged), 1990–2004 show Hamburg, and 2005 onward still plays the Thailand journey exactly as before. That's the whole authoring loop: register a place once, add a short entry for the year something changed, and let the sparse-year resolver handle everything in between.
