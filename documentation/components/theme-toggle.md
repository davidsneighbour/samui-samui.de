# Theme toggle

`src/components/layout/header/ThemeToggle.astro` renders the masthead button that switches between the site's light and dark colour schemes.

The component keeps the dark theme as the static, no-JavaScript fallback. It renders a server-side Morphicons icon initialized with the Lucide `Moon` icon data, then upgrades to the `<morph-icon>` custom element in the browser. The theme update script calls `morphTo()` with Lucide `Moon` or `Sun` icon data when `samui-theme-change` fires or when the button is clicked.

The button remains responsible for the German accessible labels:

* Dark theme active: `Helles Farbschema aktivieren`
* Light theme active: `Dunkles Farbschema aktivieren`

The component script uses one processed module with delegated click handling and an `astro:page-load` resync because the site uses Astro view transitions. That keeps package imports available while still updating each newly swapped-in button after a page swap.

Morphicons is configured with `reducedMotion="user"` so visitors who request reduced motion receive the library's reduced-motion behavior instead of the full spring morph.
