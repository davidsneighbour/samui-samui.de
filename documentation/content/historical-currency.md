# Historical currency rates

Historical currency is an explicit editorial opt-in implemented under [#1809](https://github.com/davidsneighbour/samui-samui.de/issues/1809). Historical ECB EUR/THB observations are resolved during content maintenance and stored in frontmatter. Visitors never request historical rates. This compares nominal exchange-rate equivalents, without inflation, purchasing power, fees, or actual transaction rates.

## Authoring

Normal/current posts omit `currency`. To mark the original prices as historical:

```yaml
currency:
  mode: historical
```

The requested day defaults to the publication date in `Asia/Bangkok`. Use `requestedDate: "2005-02-20"` when the price refers to another known date. A date override is an editorial statement; scripts do not infer it from prose. `compareCurrent: true` opts into the richer "Damals" and "Heute" comparison. The default is `false`, which shows only the historical hint and causes no visitor API request.

Enrichment produces this contract:

```yaml
currency:
  mode: historical
  compareCurrent: true
  schema: 1
  requestedDate: "2005-01-23"
  resolvedFor: "2005-01-23"
  dateBasis: publication
  rateDate: "2005-01-21"
  base: EUR
  quote: THB
  rate: 50.116
  provider: ECB
  source: frankfurter
```

| Field | Contract |
| --- | --- |
| `mode` | Required literal `historical` when the block exists. |
| `compareCurrent` | Optional boolean, default `false`. Request the shared latest reference rate for comparison. |
| `schema` | Resolved metadata version, currently `1`; absent before enrichment. |
| `requestedDate` | Optional ISO calendar date; otherwise the Bangkok publication day. |
| `rateDate` | Actual ISO reference day, never later than the requested day. |
| `resolvedFor` | Requested day used by the enrichment run. Detects an edited `requestedDate` independently of weekend fallback. |
| `dateBasis` | `publication` or `override`. Generated provenance that also detects changes to a publication-date default. |
| `base`, `quote` | Fixed `EUR` and `THB`; store one rate for both directions. |
| `rate` | Finite positive THB per EUR. |
| `provider`, `source` | Fixed `ECB` and `frankfurter`. |

Date-only YAML values may be quoted or unquoted; the collection normalises parser Date objects to ISO calendar strings. Before enrichment, rate fields may be incomplete. Complete malformed values fail content validation. Pending or stale metadata is not emitted as an authoritative historical rate: until enrichment, the existing dated current hint remains the fallback. Run enrichment before publishing historical content.

Do not edit `resolvedFor` to make a stale observation appear valid. Editing `requestedDate` without editing its generated provenance makes the entry stale and causes a new lookup. A publication-date change is also detected when `dateBasis` is `publication`. To switch an existing manual override back to the publication day, remove `requestedDate` and rerun enrichment.

## Commands

```bash
npm run currency:archive                       # archive audit; no writes or requests
npm run currency:archive -- --lookup           # audit plus lookup checks; no writes
npm run currency:archive -- --write            # enrich explicitly opted-in currency posts
npm run currency:enrich                        # incremental enrichment; writes pending/stale entries
npm run currency:enrich -- --audit              # inspect without requests or writes
npm run currency:enrich -- --force path/to/post/index.md
```

Both entry points accept file or directory paths; without paths they scan `src/content/posts`. Only posts containing an explicit `<dnb-currency amount="…">` or `<Currency amount={…}>` and `currency.mode: historical` are enriched. HTML comments, inline code, and fenced examples are excluded from discovery by masking them with whitespace while preserving line breaks. This prevents text on either side of an ignored region from joining into a new comment delimiter or component tag. Discovery is a component-presence check, not an HTML sanitiser. Unmarked currency posts are reported for an editorial decision, never silently opted in. The archive audit reports configured, unmarked, already enriched, invalid, failed lookup, and no-component categories. `--lookup` tests unresolved configured entries without writing; already enriched entries are not re-queried unless `--force` is also set.

The shared maintenance implementation is `src/scripts/currency/enrichment.ts`. It calls Frankfurter's ECB single-pair route with `date`, accepts the returned previous observation for weekends/holidays, and rejects a later reference day. If an observation is absent (HTTP 404), it steps backwards at most 14 days. Unavailable coverage, other HTTP failures, or malformed observations fail safely rather than using an unrelated later rate. Each requested day shares one in-memory promise, including failures. There is no persistent generated cache; frontmatter is authoritative.

Valid enriched entries are immutable unless `--force` is explicit. Writes preserve the article body byte for byte, retain existing YAML comments and scalar styles where supported by the YAML document parser, preserve file permissions, and replace the file atomically through a temporary sibling. A concurrent content change aborts the write. Lookup or write failures leave the file intact, are reported per file, and do not stop other files. Any failed requested enrichment returns exit code 1. No scripts are added to builds or releases automatically.

## Rendering and interaction

`BlogPost.astro` and both `BlogList.astro` article variants serialise validated historical metadata into `data-currency-history` on the nearest article. `<Currency>` also accepts an optional `historical` object for standalone Astro/MDX use. The browser reads rendered JSON attributes, never YAML. Each amount resolves its nearest scope, preventing different posts on the same archive page from sharing historical data. Stale metadata is omitted rather than trusted.

Historical-only mode shows `damals ≈ …` and the actual ECB rate date through the existing tooltip. Comparison mode uses a read-only native popover where supported, with the same accessible tooltip role, trigger, surface, and controller. It initially shows "Damals"; "Heute" is added when the current reference rate arrives. Each side includes its actual date, including a stale current fallback. Browsers without the native popover API keep the same shared tooltip content. No dialog or extra tab stop is added because the panel has no interactive controls. Hover, focus, tap, Escape, top placement, viewport fallback, and Astro navigation remain supported. The original price works without JavaScript.

The current-rate service and 24-hour/seven-day browser cache remain unchanged. Historical-only pages make no rate request. Comparisons and current amounts share at most one current-rate lookup per browser document, with fresh Local Storage shared across reloads and pages. A failed current request never hides the stored historical hint. Price and then-versus-now information are supplementary; historical/current reference rates do not imply purchasing-power equivalence.

## Initial archive migration

An audit on 10 October 2026 found 2,053 posts: four explicit currency posts and 2,049 without the component. Only the four inspected historical narratives were opted in, with `compareCurrent: true`; their existing body content was preserved. Live ECB observations were stored for laundry (20 January 2005), motorcycle return (21 January 2005), helmet fine (24 June 2005 for Sunday 26 June), and smoking fine (29 December 2006 for Sunday 31 December). The repeat enrichment run reported four already enriched posts and zero updates.

Script tests cover date defaults/overrides, stale provenance, malformed data, bounded previous-day lookup, deduplication, audit/idempotency/force behaviour, atomic writes, permissions, concurrent edits, and failure exit status. Browser regressions cover both directions, current and historical hints, comparison enhancement, offline historical fallback, no historical browser requests, multiple amounts, separate card scopes, keyboard/touch interaction, dates, and viewport placement.

Approximate conversions use `≈`. Comparison columns show only their actual reference dates, with one centred `EZB-Referenzkurs` footer in the existing `muted-foreground` colour and `mt-1` spacing. Native popovers use visible overflow so the shared arrow does not create a browser scrollbar. The source is readable without a second interaction.

Each comparison column places its label and value on the same line (`Damals ≈ …`, `Heute ≈ …`), with its reference date directly below.
