# IUMAS

`IUMAS` is `SAMUI` backwards. It is the site's own history of how the weblog presented itself over time.

Canonical route: [`/iumas/`](../../src/pages/iumas/index.astro). Legacy route `/taglines/` permanently redirects to it (see `netlify.toml`, next to the existing `/tags/` → `/themen/` rule).

## Four tracked dimensions

IUMAS tracks four independent dimensions, each with its own history:

* `title` — site/domain identity, e.g. `schreibbloga.de` and later `samui-samui.de`
* `subtitle` — historical taglines (the text shown under the masthead title)
* `image` — masthead/header artwork and its variants
* `logo` — masthead/wordmark/logo treatments

These can change independently, and more than one can change on the same date. Each timeline event represents one change in exactly one dimension — IUMAS does not model complete masthead "versions".

## Data model

`src/data/iumas.ts` loads and validates `src/data/iumas.json` (a flat array, one object per event):

```ts
type IumasDatePrecision = 'day' | 'month' | 'year' | 'unknown';
type IumasEntryType = 'title' | 'subtitle' | 'image' | 'logo';

interface IumasSource {
  type: 'git' | 'wayback' | 'screenshot' | 'backup' | 'memory' | 'other';
  reference?: string; // e.g. a Git commit hash
  url?: string;
  note?: string;
}

interface IumasEntry {
  type: IumasEntryType;
  from: string | null; // ISO date, or null when precision is "unknown"
  precision: IumasDatePrecision;
  value: string;
  source?: IumasSource;
  note?: string;
  alt?: string; // "image" entries only
}
```

`getIumasValidationErrors()` runs at build/import time (`parseIumasEntries()` throws on the first invalid dataset) and checks entry shape, event type, date precision, real ISO dates, source shape, plain-text markup/HTML-entity issues in `value`/`note`/`source.note`/`alt`, and duplicate rejection (below).

### Same-date events

Several events may share one date — e.g. a redesign that changes the title, logo, subtitle, and image all on the same day. This is valid. Only true duplicates are rejected, using the deterministic identity `type + from + value`.

### Adding a future record

Append an object to `src/data/iumas.json` with the appropriate `type`. Leave `from: null` and `precision: "unknown"` for anything without a confirmed date; prefer a `source` (a Git commit reference is strongest) whenever one exists.

### Adding an image entry

Set `value` to the asset path (as referenced elsewhere in the site, e.g. `/assets/header/...`) and always include a meaningful `alt`. Missing image files don't break the build or the page — the timeline renders a plain `<img>`, not an `astro:assets`-processed image, since header photos currently live in `public/` rather than under `src/`.

## Current value per dimension

"Current" is derived independently per type — there can be a current title, logo, subtitle, and image all at once, each from its own most-recent entry:

```ts
getCurrentIumasValue('subtitle'); // -> IumasEntry | undefined
```

Returns `undefined` for a dimension with no recorded entries yet (e.g. `logo`, until historical logo data is added). The masthead (`src/components/layout/header/Header.astro`) reads the current subtitle this way instead of a separate tagline data source, and its info link points at `/iumas/`.

## Period calculations

Periods (`"seit ..."`, `"X – Y"`) are calculated per type, independently. An `image` event never shortens or extends a `subtitle` period, and vice versa — see `buildIumasTimeline()`'s per-type pass in `src/data/iumas.ts`.

## Global ordering

The rendered timeline is newest first across all four types combined. Ties on equal (or both-unknown) dates break deterministically by type order — `title`, `logo`, `subtitle`, `image` — rather than relying on array/sort stability.

## The four-lane graph

`src/pages/iumas/index.astro` renders the timeline as a small Git-branch-inspired graph: four persistent vertical rails (one per type, in a stable colour defined once in `src/styles/theme.css` as `--iumas-title`/`--iumas-logo`/`--iumas-subtitle`/`--iumas-image`), with one node per event on its own rail and a short connector to that event's content row.

This is **not** a real Git graph: no merges, no branches, no parent relationships — just fixed lane positions. It's implemented with plain CSS (a single absolutely positioned background layer draws the continuous rails behind the list) and no runtime JS or graph library. Each event's type is always shown as explicit German text (`Titel`/`Logo`/`Untertitel`/`Kopfbild`) in addition to the lane colour and node icon, so the graph never relies on colour alone.

## Migrating from the old tagline data

The previous `/taglines/` implementation (`Tagline*` types, `src/data/taglines.json`) tracked only the subtitle dimension. Its entries were migrated into `iumas.json` as `type: "subtitle"` with `text` renamed to `value`; all dates, precision, notes, and sources were preserved as-is. `src/data/iumas.json` is now the single source of truth.
