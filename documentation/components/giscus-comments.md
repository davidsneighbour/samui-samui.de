# Giscus comments

`src/components/Giscus.astro` renders the lazy-loaded giscus comment widget used
on post pages. The widget is configured for the `davidsneighbour/samui-samui.de`
repository, the `Kommentare` discussion category, German interface copy, and
pathname-based discussion mapping by default.

The comment form uses custom giscus themes from:

* `https://samui-samui.de/assets/styles/giscus-samui-light.css`
* `https://samui-samui.de/assets/styles/giscus-samui-dark.css`

These URLs intentionally point at the live site even during local development.
When giscus runs inside its `https://giscus.app` iframe, browsers can block
stylesheet requests to private-network dev origins such as
`https://192.168.1.201:4321` under Private Network Access rules. Using the live
theme files avoids that local-only failure. The trade-off is that local edits to
the giscus theme CSS are not visible in the iframe until the stylesheet has been
deployed.

Production must allow `https://giscus.app` to fetch these custom theme files.
`netlify.toml` therefore keeps `Access-Control-Allow-Origin:
https://giscus.app` on `/assets/styles/giscus-samui-*.css` and the webfont
assets used by those stylesheets.
