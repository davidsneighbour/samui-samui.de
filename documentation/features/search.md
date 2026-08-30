# Search

The website uses [Pagefind](https://pagefind.app/) for static search. The search UI uses the Pagefind Component UI in three places:

* `src/components/Header.astro` renders the compact `<pagefind-searchbox>` as a dedicated masthead control to the right of the text-link navigation and before the theme toggle. The field uses the German placeholder `Finden`, a Lucide binoculars icon, and the light `accent` surface from `DESIGN.md`.
* `src/pages/suche.mdx` remains the standalone search page. It renders `src/components/PagefindSearchPage.astro`, a composed interface with an input, year and topic filters, a summary, and a result list. The page focuses the search field only on hover-capable fine-pointer devices so phones do not open the keyboard immediately after navigation.
* `src/pages/archiv/index.astro` also uses a compact `<pagefind-searchbox>` on the archive page.
* `src/styles/theme.css` maps Pagefind `--pf-*` variables onto the existing color, font, radius, and focus values from `DESIGN.md`. Do not invent Pagefind-only colors there.

## Index cache

The Astro Pagefind hook in `src/scripts/integrations/pagefind.ts` no longer rebuilds the index on every build. It calculates a hash over `src/content/**`, the Pagefind version, and the Pagefind index configuration.

When the hash matches the local manifest at `node_modules/.astro/pagefind/manifest.json` and the cached bundle exists, the bundle is copied to `dist/pagefind/`. When the manifest is missing, the bundle is missing, the Pagefind version changes, the index configuration changes, or `src/content/**` changes, Pagefind runs again and the cache is refreshed.

Manual controls:

```bash
npm run build          # normal build, uses the Pagefind cache when possible
npm run build:nocache  # forces a fresh Pagefind index
npm run clean:pagefind # removes the cache and current dist/pagefind bundle
```

Use `npm run build:nocache` after layout changes, metadata-markup changes, Pagefind filter-attribute changes, or other non-content search-signal changes. The automatic cache key is intentionally limited to `src/content/**` as its primary change indicator.
