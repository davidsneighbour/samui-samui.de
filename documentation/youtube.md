# YouTube embed

A lazy-loading YouTube embed ported from
[paulirish/lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed)
([`lite-yt-embed.js`](https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.js),
[`lite-yt-embed.css`](https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.css)),
adapted to shadow DOM and to the same conventions used by this repo's
[Vimeo embed](vimeo.md) (`documentation/vimeo.md`) — the two components share
one implementation shape, so if you know one you know the other.

Instead of loading the full YouTube iframe (and YouTube's own heavy
`www.youtube.com/embed` bootstrap JS) up front, it shows a poster image built
from YouTube's predictable thumbnail URL and defers the actual
`youtube-nocookie.com` player iframe until the visitor clicks (or, with
`autoload`, until it scrolls into view).

It ships as two things that share one implementation:

| Variant | Source | Use it from |
| --- | --- | --- |
| `<Youtube />` | [`src/components/Youtube.astro`](../src/components/Youtube.astro) | `.astro` files (layouts, pages, any component tree) |
| `<dnb-youtube>` | [`src/components/YoutubeScript.astro`](../src/components/YoutubeScript.astro) | Raw markdown content (blog posts are plain `.md`, not `.mdx`, so they cannot import an Astro component — but raw HTML tags pass through untouched) |

`<Youtube />` is a thin wrapper: it renders `<YoutubeScript />` (the custom
element definition) followed by a `<dnb-youtube>` element with the props
mapped to its HTML attributes. Both variants are backed by the exact same
`dnb-youtube` custom element.

## `<Youtube />` (astro component)

```astro
---
import Youtube from '@components/Youtube.astro';
---

<Youtube videoid="XwQRkOK5KC4" title="The White Lotus – Season 3 Trailer" />
```

Only `videoid` is required; every other prop is optional.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `videoid` | `string` | — (required) | YouTube video id, e.g. `dQw4w9WgXcQ` for `https://youtu.be/dQw4w9WgXcQ`. |
| `title` | `string` | `'Video'` | Accessible title used for the play button's `aria-label`, the host element's `title`, the iframe's `title`, and the gradient title overlay shown on the poster. |
| `playLabel` | `string` | `'Play'` | Prefixed to the title, e.g. `"Play: The White Lotus – Season 3 Trailer"`. |
| `params` | `string` | — | Extra YouTube player URL params passed through as-is, e.g. `'start=30'` or `'start=30&end=90'`. |
| `autoload` | `boolean` | `false` | Load the iframe automatically once the element scrolls into view, via `IntersectionObserver`, instead of waiting for a click. |
| `autoplay` | `boolean` | `false` | Autoplay when the load is triggered by `autoload`. A manual click always autoplays regardless of this prop — the click is itself the user gesture that makes autoplay expected and browser-permitted. |
| `class` | `string` | — | Forwarded to the underlying `<dnb-youtube>` element. |

## `<dnb-youtube>` (web component / raw markdown)

```md
<dnb-youtube videoid="XwQRkOK5KC4" videotitle="The White Lotus – Season 3 Trailer"></dnb-youtube>
```

This is the tag to use directly inside post content (`src/content/posts/**/index.md`),
since those files are plain markdown and cannot `import` an Astro component.
`BlogPost.astro` (see [`src/layouts/BlogPost.astro`](../src/layouts/BlogPost.astro))
scans each post's raw markdown source for the string `dnb-youtube` at build
time and only renders `<YoutubeScript />` — the element definition — for
posts that actually use it (independently of the same check for
`dnb-vimeo`), so posts without a YouTube embed don't ship the component's
JavaScript.

| Attribute | Maps to `<Youtube />` prop | Default | Description |
| --- | --- | --- | --- |
| `videoid` | `videoid` | — (required) | YouTube video id. The only attribute the element observes for changes — changing it at runtime resets and reloads the poster. |
| `videotitle` | `title` | `'Video'` | Accessible title (see above). |
| `videoplay` | `playLabel` | `'Play'` | Label prefix (see above). |
| `params` | `params` | — | Extra player URL params, passed through as-is (see above). |
| `autoload` | `autoload` | absent | Boolean attribute — presence enables it, e.g. `autoload=""` or bare `autoload`. |
| `autoplay` | `autoplay` | absent | Boolean attribute, same convention as `autoload`. |

## Behaviour and features

* **Click-to-load facade.** The poster is built from YouTube's own
  predictable thumbnail URL (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`) —
  unlike the Vimeo embed, no network round trip is needed just to find out
  what the thumbnail is, so it's set synchronously on connect. The real
  `youtube-nocookie.com` iframe is not created until the user clicks the
  element (or `autoload` triggers it).
* **Shadow DOM.** Markup and styles (the poster frame, the gradient title
  overlay, the play button, the injected iframe) live in a shadow root, so
  the component is self-contained and doesn't depend on — or leak into —
  the host page's CSS. (Upstream lite-youtube-embed uses light-DOM + a
  global stylesheet instead; this port follows the same shadow-DOM approach
  as this repo's Vimeo embed for consistency between the two.)
* **Poster upgrade.** 100ms after the low-res poster is set, the component
  probes `https://i.ytimg.com/vi_webp/<id>/maxresdefault.webp` and swaps it
  in if it loads and isn't YouTube's 120×90 "no poster available"
  placeholder image — YouTube returns that placeholder (sometimes with a
  200, sometimes with an actual 404, hence the occasional harmless 404 you
  may see logged in the console for older videos without a maxres
  thumbnail) instead of a real 404 for videos that don't have one, so
  checking the loaded image's dimensions is the only reliable way to detect
  "there isn't a better poster."
* **Placeholder image.** Same fix as the Vimeo embed: the `<img>` starts
  with a 1×1 transparent GIF `src` (not an absent/empty one) so it never
  renders a browser's "broken image" glyph; the shadow host's black
  background carries the loading look for the brief window before the
  (synchronously-known) poster URL loads.
* **Accessible labelling.** The play button's `aria-label`, the host's
  `title`, and the poster image's `alt`/`aria-label` are all set to
  `"<playLabel>: <title>"` on connect. The gradient title overlay (a direct
  visual port of upstream's YouTube-style caption bar) shows the same title
  text, or nothing if `title`/`videotitle` wasn't supplied.
* **Connection warm-up.** On the first `pointerover` (hover/touch) *or*
  `focusin` (keyboard), and again right before the iframe is created, the
  component adds `<link rel="preconnect">` hints for
  `www.youtube-nocookie.com`, `www.google.com`,
  `googleads.g.doubleclick.net`, and `static.doubleclick.net` — matching
  upstream's exact preconnect list — so the actual embed request that
  follows starts warm.
* **`autoload` + `IntersectionObserver`.** With `autoload` set, an
  `IntersectionObserver` loads the iframe the first time the element enters
  the viewport, instead of waiting for a click. This is an addition on top
  of upstream lite-youtube-embed (which has no scroll-triggered loading),
  added for parity with the Vimeo embed. Combine with `autoplay` to
  autoplay once it scrolls into view.
* **Privacy.** The generated iframe always points at
  `www.youtube-nocookie.com` (YouTube's cookie-reduced domain — matches
  upstream and this repo's privacy posture) rather than `www.youtube.com`.
* **`allow` list includes `fullscreen`.** The upstream lite-youtube-embed
  reference omits `fullscreen` from the iframe's `allow` attribute while
  still setting the legacy `allowFullscreen` boolean property — modern
  browsers give the `allow` list precedence, so that combination silently
  breaks fullscreen. Same bug as upstream lite-vimeo, fixed the same way
  here: the `allow` list includes `fullscreen` explicitly.
* **`referrerpolicy="strict-origin-when-cross-origin"`** is set on the
  iframe, matching upstream — YouTube requires this to avoid embed
  "Error 153."
* **Not ported: the YouTube IFrame Player API integration.** Upstream
  lite-youtube-embed can optionally load the full `youtube.com/iframe_api`
  JS and drive playback through `YT.Player` (its `js-api` attribute,
  `getYTPlayer()`), mainly to work around Safari/mobile browsers not
  reliably honouring `?autoplay=1` on a bare iframe. This port intentionally
  does not include that layer, keeping parity with the simpler
  iframe-only Vimeo embed — a plain `?autoplay=1` iframe still starts on a
  real click almost everywhere; only the (less common) `autoload`-without-a-click
  path on Safari/mobile is affected.

## Source

* [`src/components/Youtube.astro`](../src/components/Youtube.astro) — the
  Astro wrapper component.
* [`src/components/YoutubeScript.astro`](../src/components/YoutubeScript.astro) —
  the `dnb-youtube` custom element definition (TypeScript, inside a
  `<script>` block).
* [`src/layouts/BlogPost.astro`](../src/layouts/BlogPost.astro) and
  `src/pages/[...slug].astro` — where the post-body scan and conditional
  `<YoutubeScript />` rendering happens.
* Ported from [paulirish/lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed),
  specifically [`lite-yt-embed.js`](https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.js)
  and [`lite-yt-embed.css`](https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.css).
* Demonstrated in
  [`src/content/posts/2024/the-white-lotus-trailer/index.md`](../src/content/posts/2024/the-white-lotus-trailer/index.md).
* See also [`documentation/vimeo.md`](vimeo.md) for the sibling component
  this one mirrors.
