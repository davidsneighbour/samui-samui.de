# Icons

All icons render as inline SVG. No icon is loaded from another host.

## Packages and where they are used

| Package | Used for | Why this package |
| --- | --- | --- |
| `@lucide/astro` | Icons in Astro components (header, footer, weather, `iumas`, and others). | Astro components, rendered at build time. |
| `lucide-react` | Icons inside React islands (`PlaybackControls.tsx`, the popup close button in `src/components/ui/map.tsx`). | `@lucide/astro` components cannot render inside React. |
| `lucide` | Icon node data in browser scripts (`ThemeToggle.astro` passes `Moon` and `Sun` to morphicons) and in the footnote rehype plugin (`CornerLeftUp`). | Tree-shakable named exports: the browser bundle gets only the icons it imports. |
| `lucide-static` | Notice icons chosen by name in content (`src/utils/notices/icons.ts`). | Its `icon-nodes.json` holds exactly the 2,140 canonical kebab-case names. |
| `simple-icons` | Brand logos: footer social links and the Dropbox link on `/kontakt/`, through `src/components/ui/BrandIcon.astro`. | Lucide has no brand logos. |

Keep all Lucide packages on the same version.

## Why the four icon packages stay separate

This was reviewed on 2026-11-28 ([#1883](https://github.com/davidsneighbour/samui-samui.de/issues/1883)). None of the four packages can be removed without a different result:

* `lucide-react` and `@lucide/astro` serve different renderers. Replacing one with a hand-written renderer for raw icon data would add local code to replace a maintained package.
* `lucide-static` could be replaced by the `icons` export of `lucide`. That export has the same 2,140 icons with identical geometry, but under PascalCase keys plus 309 alias names. Notices would then accept old alias names that they reject now, and the list of valid names in error messages would change.
* `lucide` cannot be replaced by `lucide-static` in browser scripts. Importing `icon-nodes.json` would put all icons into the theme toggle's bundle.

`lucide`, `lucide-static`, and `@lucide/astro` are only needed at build time or in small tree-shaken bundles. Visitors download only the icons a page uses.

## Brand logos

`BrandIcon.astro` takes a `simple-icons` icon object (for example `siMastodon`) and draws its path in a 24×24 `viewBox` with `fill="currentColor"`. The logo is decorative (`aria-hidden="true"`) by default, so the link or button around it must carry the accessible name. Import icon objects, not name strings: a wrong name then fails the type check.

`astro-icon` and the Iconify sets were removed in [#1883](https://github.com/davidsneighbour/samui-samui.de/issues/1883). `astro-icon` was only used for these seven logos, and it always looked for a local SVG folder.
