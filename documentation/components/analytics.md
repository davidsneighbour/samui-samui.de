# Analytics

`Analytics.astro` renders the Matomo tracking snippet, reading `matomoHost` and
`matomoSiteId` from `src/data/setup.json`. It is included from `Footer.astro`,
intentionally last in the page — see AGENTS.md § Analytics for why the include
position must not move.

## Matomo tracking references

* [JavaScript tracking guide](https://developer.matomo.org/guides/tracking-javascript-guide) —
  conceptual overview of how the `_paq` push-queue works and common tracking
  patterns.
* [JavaScript tracking API reference](https://developer.matomo.org/api-reference/tracking-javascript) —
  the full list of `_paq.push([...])` methods (`trackPageView`,
  `trackSiteSearch`, `setCustomDimension`, etc.) available in the client-side
  snippet used here.
* [HTTP Tracking API reference](https://developer.matomo.org/api-reference/tracking-api) —
  the server-side tracking endpoint (`matomo.php`), used by the `<noscript>`
  pixel fallback in `Analytics.astro`.

Consult the JS API reference before adding new `_paq.push([...])` calls
anywhere in the site (for example, `trackSiteSearch` on `/suche/`); consult the
HTTP Tracking API reference only when touching the `<noscript>` fallback or
any other direct `matomo.php` request.
