# YouTube embed

A lazy-loading YouTube embed ported from [paulirish/lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed) ([`lite-yt-embed.js`](https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.js), [`lite-yt-embed.css`](https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.css)), adapted to shadow DOM and to the same conventions used by this repo's [Vimeo embed](vimeo.md) — the two components share one implementation shape, so if you know one you know the other.

Instead of loading the full YouTube iframe (and YouTube's own heavy `www.youtube.com/embed` bootstrap JS) up front, it shows a locally cached poster image and loads the actual `youtube-nocookie.com` player iframe only after the visitor clicks. Nothing contacts YouTube or Google before that click ([#1789](https://github.com/davidsneighbour/samui-samui.de/issues/1789)).

It ships as two things that share one implementation:

| Variant | Source | Use it from |
| --------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Youtube />` | [`src/components/content/embeds/Youtube.astro`](../../src/components/content/embeds/Youtube.astro) | `.astro` files (layouts, pages, any component tree) |
| `<dnb-youtube>` | [`src/components/content/embeds/YoutubeScript.astro`](../../src/components/content/embeds/YoutubeScript.astro) | Raw markdown content (blog posts are plain `.md`, not `.mdx`, so they cannot import an Astro component — but raw HTML tags pass through untouched) |

`<Youtube />` is a thin wrapper: it renders `<YoutubeScript />` (the custom element definition) followed by a `<dnb-youtube>` element with the props mapped to its HTML attributes. Both variants are backed by the exact same `dnb-youtube` custom element.

## `<Youtube />` (astro component)

```astro
---
import Youtube from '@components/content/embeds/Youtube.astro';
---

<Youtube videoid="XwQRkOK5KC4" title="The White Lotus – Season 3 Trailer" />
```

Only `videoid` is required; every other prop is optional.

| Prop | Type | Default | Description |
| ----------- | --------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `videoid` | `string` | — (required) | YouTube video id, e.g. `dQw4w9WgXcQ` for `https://youtu.be/dQw4w9WgXcQ`. |
| `title` | `string` | `'Video'` | Accessible title used for the play button's `aria-label`, the host element's `title`, the iframe's `title`, and the gradient title overlay shown on the poster. |
| `playLabel` | `string` | `'Play'` | Prefixed to the title, e.g. `"Play: The White Lotus – Season 3 Trailer"`. |
| `params` | `string` | — | Extra YouTube player URL params passed through as-is, e.g. `'start=30'` or `'start=30&end=90'`. |
| `class` | `string` | — | Forwarded to the underlying `<dnb-youtube>` element. |

## `<dnb-youtube>` (web component / raw markdown)

```md
<dnb-youtube videoid="XwQRkOK5KC4" videotitle="The White Lotus – Season 3 Trailer"></dnb-youtube>
```

This is the tag to use directly inside post content (`src/content/posts/**/index.md`), since those files are plain markdown and cannot `import` an Astro component. `BlogPost.astro` (see [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro)) scans each post's raw markdown source for the string `dnb-youtube` at build time and only renders `<YoutubeScript />` — the element definition — for posts that actually use it (independently of the same check for `dnb-vimeo`), so posts without a YouTube embed don't ship the component's JavaScript.

| Attribute | Maps to `<Youtube />` prop | Default | Description |
| ------------ | -------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `videoid` | `videoid` | — (required) | YouTube video id. The only attribute the element observes for changes — changing it at runtime resets and reloads the poster. |
| `videotitle` | `title` | `'Video'` | Accessible title (see above). |
| `videoplay` | `playLabel` | `'Play'` | Label prefix (see above). |
| `params` | `params` | — | Extra player URL params, passed through as-is (see above). |

## Behaviour and features

* **Local poster thumbnails.** Both the `<Youtube />` cover path and raw `<dnb-youtube>` markdown embeds show a poster from a locally cached, git-committed file (`src/assets/images/video-thumbnails/youtube/<id>.jpg`) rather than ever contacting `i.ytimg.com` to show one — see [`video-thumbnail-cache.md`](../content/video-thumbnail-cache.md). A video without a cached thumbnail (for example one that YouTube deleted) shows the neutral black placeholder with the title and play button; there is no live poster fallback.
* **Click-to-load only.** The real `youtube-nocookie.com` iframe is created only when the visitor clicks the element. Before that click the component makes no request and opens no connection to YouTube or Google: no live thumbnail, no `preconnect` hints on hover or focus, and no loading on scroll. Upstream lite-youtube-embed warms connections on hover and loads thumbnails from `i.ytimg.com`; this port removes both on purpose, because the privacy policy promises click-to-connect. Do not add them back (see `AGENTS.md`).
* **Shadow DOM.** Markup and styles (the poster frame, the gradient title overlay, the play button, the injected iframe) live in a shadow root, so the component is self-contained and doesn't depend on — or leak into — the host page's CSS. (Upstream lite-youtube-embed uses light-DOM + a global stylesheet instead; this port follows the same shadow-DOM approach as this repo's Vimeo embed for consistency between the two.)
* **Placeholder image.** Same fix as the Vimeo embed: the `<img>` starts with a 1×1 transparent GIF `src` (not an absent/empty one) so it never renders a browser's "broken image" glyph; without a local poster, the shadow host's black background is the neutral placeholder.
* **Accessible labelling.** The play button's `aria-label`, the host's `title`, and the placeholder image's `alt` are all set to `"<playLabel>: <title>"` on connect. The gradient title overlay (a direct visual port of upstream's YouTube-style caption bar) shows the same title text, or nothing if `title`/`videotitle` wasn't supplied.
* **Privacy.** The generated iframe always points at `www.youtube-nocookie.com` (YouTube's cookie-reduced domain — matches upstream and this repo's privacy posture) rather than `www.youtube.com`.
* **`allow` list includes `fullscreen`.** The upstream lite-youtube-embed reference omits `fullscreen` from the iframe's `allow` attribute while still setting the legacy `allowFullscreen` boolean property — modern browsers give the `allow` list precedence, so that combination silently breaks fullscreen. Same bug as upstream lite-vimeo, fixed the same way here: the `allow` list includes `fullscreen` explicitly.
* **`referrerpolicy="strict-origin-when-cross-origin"`** is set on the iframe, matching upstream — YouTube requires this to avoid embed "Error 153."
* **Not ported: the YouTube IFrame Player API integration.** Upstream lite-youtube-embed can optionally load the full `youtube.com/iframe_api` JS and drive playback through `YT.Player` (its `js-api` attribute, `getYTPlayer()`), mainly to work around Safari/mobile browsers not reliably honouring `?autoplay=1` on a bare iframe. This port intentionally does not include that layer, keeping parity with the simpler iframe-only Vimeo embed — a plain `?autoplay=1` iframe still starts on a real click almost everywhere.

## Source

* [`src/components/content/embeds/Youtube.astro`](../../src/components/content/embeds/Youtube.astro) — the Astro wrapper component.
* [`src/components/content/embeds/YoutubeScript.astro`](../../src/components/content/embeds/YoutubeScript.astro) — the `dnb-youtube` custom element definition (TypeScript, inside a `<script>` block).
* [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro) and `src/pages/[...slug].astro` — where the post-body scan and conditional `<YoutubeScript />` rendering happens.
* Ported from [paulirish/lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed), specifically [`lite-yt-embed.js`](https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.js) and [`lite-yt-embed.css`](https://github.com/paulirish/lite-youtube-embed/blob/master/src/lite-yt-embed.css).
* Demonstrated in [`src/content/posts/2024/the-white-lotus-trailer/index.md`](../../src/content/posts/2024/the-white-lotus-trailer/index.md).
* See also [`vimeo.md`](vimeo.md) for the sibling component this one mirrors.
