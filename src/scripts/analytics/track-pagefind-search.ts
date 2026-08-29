import type { Instance, PagefindSearchResult } from '@pagefind/component-ui';

// Matomo internal search tracking (see AGENTS.md § Analytics for the
// "loaded from the footer, tracks may be lost" tradeoff this relies on).
// Shared across every Pagefind instance on the site (the sitewide header
// searchbox, the archive page searchbox, and the dedicated /suche/ page) so
// a search fires the same trackSiteSearch call regardless of which UI the
// visitor used, including the typeahead dropdowns where the term never
// appears in the URL.
export function trackPagefindSearch(instance: Instance): void {
  instance.on('results', (...args) => {
    const results = args[0] as PagefindSearchResult;
    const term = instance.searchTerm;
    if (!term) return;
    window._paq?.push(['trackSiteSearch', term, false, results.results.length]);
  });
}
