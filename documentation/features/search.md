<!-- markdownlint-disable MD013 -->
# Search

The website uses [Pagefind](https://pagefind.app/) for static search. The search UI uses the Pagefind Component UI in three places:

* `src/components/layout/header/Header.astro` renders the compact `<pagefind-searchbox>` as a dedicated masthead control to the right of the text-link navigation and before the theme toggle. The field uses the German placeholder `Finden`, a Lucide binoculars icon, and the light `accent` surface from `DESIGN.md`.
* `src/pages/suche.mdx` remains the standalone search page. It renders `src/components/features/search/PagefindSearchPage.astro`, a composed interface with an input, year and topic filters, a summary, and a result list. The page focuses the search field only on hover-capable fine-pointer devices so phones do not open the keyboard immediately after navigation.
* `src/pages/archiv/index.astro` also uses a compact `<pagefind-searchbox>` on the archive page.
* `src/styles/theme.css` maps Pagefind `--pf-*` variables onto the existing color, font, radius, and focus values from `DESIGN.md`. Do not invent Pagefind-only colors there.

## Index cache

The Astro Pagefind hook in `src/scripts/integrations/pagefind.ts` no longer rebuilds the index on every build. It calculates a hash over `src/content/**`, `src/layouts/**`, `src/components/**`, `src/pages/**`, `src/data/video-media.json`, the Pagefind version, and the Pagefind index configuration.

When the hash matches the local manifest at `node_modules/.astro/pagefind/manifest.json` and the cached bundle exists, the bundle is copied to `dist/pagefind/`. When the manifest is missing, the bundle is missing, the Pagefind version changes, the index configuration changes, or any hashed input changes, Pagefind runs again and the cache is refreshed.

Manual controls:

```bash
npm run build          # normal build, uses the Pagefind cache when possible
npm run build:nocache  # forces a fresh Pagefind index
npm run clean:pagefind # removes the cache and current dist/pagefind bundle
```

Layout, metadata markup, filter attributes, and media-history changes now invalidate the index automatically. Use `npm run build:nocache` to diagnose changes to other search inputs.

## Development dependency scan

Avoid literal opening script tags in frontmatter comments in `PagefindComponentUi.astro`. The development dependency scanner can treat them as real client script blocks, extract comment prose as JavaScript, and report an unterminated string before the Pagefind import. Describe client scripts in plain words instead. This does not change the browser script or the frontmatter stylesheet import.

## Digital relics

All three interfaces use `RelicSearchFilter.astro` and default to excluding complete `relic:true` pages while including `relic:false` regular and partial posts. The checkbox opts into complete relic results without clearing year or topic filters. The shared indicator labels opted-in results. In the header, the field takes the full width and the control sits in a keyboard-accessible disclosure behind a cog icon button ("Suchoptionen") at its right. Other interfaces show the control above their results. The checkbox label reads "Auch digitale Relikte durchsuchen", and the words "digitale Relikte" link to `/digitale-archaeologie/`. A link inside a `<label>` is valid HTML (`<a>` is phrasing content, not a labelable element), the checkbox keeps the full label text as its accessible name, and clicking the link follows it without toggling the checkbox. The header popup uses `w-max` (capped at the viewport width minus 2rem), so the label stays on one line where space allows. A click outside the open popup closes it (a document-level listener in `Header.astro`, so it also works after view-transition navigations). See [Digital relics](../content/digital-relics.md) for the editorial contract.
