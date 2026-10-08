# Header navigation

`src/components/layout/header/Header.astro` renders the main navigation in a full-width wrapper immediately after the masthead header. The navigation includes the home, archive, and contact links, Pagefind search, and the theme control. Its accessible landmark name is `Hauptnavigation`.

## Scrolling behaviour

The title and tagline scroll normally. The navigation uses CSS sticky positioning at the top of the viewport, with its existing opaque background covering content scrolling underneath. Its inner grid, spacing, and maximum width remain unchanged. The wrapper has stacking level 40 and the existing bottom-border treatment, as recorded in DESIGN.md.

`src/scripts/header-navigation.ts` observes the real shared footer. When any part of that footer enters the viewport, the navigation returns to normal document flow and scrolls out with the header. Scrolling back into the content restores sticky positioning. Both states retain the bar's original layout space, avoiding content jumps. The weather widget before the footer remains part of the scrolling content.

If keyboard focus is inside the navigation when the footer becomes visible, the bar stays sticky until focus leaves. This keeps a focused link, search field, or theme control visible. There is no scroll animation, so reduced-motion users receive the same behaviour without additional motion.

A ResizeObserver measures the actual navigation height, including the two-row mobile layout. The root's `--header-navigation-height` supplies `scroll-padding-top` so native anchor navigation and scrolling focused elements can leave room for the sticky bar. This is a measured dimension, not a fixed design token. The inset becomes zero when the bar releases at the footer. Existing footnote scroll margins remain additional clearance.

## Lifecycle and fallback

The normal Astro module script initialises on first load and on `astro:page-load`. Before a view-transition swap, it disconnects both observers, removes focus listeners, and clears the old root inset. It binds to the new navigation and footer after the swap, including pages reached while already scrolled. Pages without shared navigation clear the previous state and need no setup. There are no global IDs, fixed positioning, scroll-event listeners, or placeholder nodes.

Without JavaScript, the navigation remains CSS-sticky, but footer release and measured anchor clearance are unavailable. Short pages release the bar immediately if their footer is already visible. Footer observation is independent of scroll direction.

## Verification

The browser tests in `src/test/header-navigation.spec.ts` cover mobile and desktop sticking, the masthead scrolling away, content passing underneath, footer release and restoration, keyboard focus, anchor clearance, and Astro navigation. Existing masthead tests continue to check the artwork and responsive layout.

```bash
node node_modules/@playwright/test/cli.js test src/test/header-navigation.spec.ts src/test/masthead.spec.ts
```
