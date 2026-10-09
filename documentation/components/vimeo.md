# Vimeo embed

A lazy-loading Vimeo embed ported from [slightlyoff/lite-vimeo](https://github.com/slightlyoff/lite-vimeo) ([`lite-vimeo.ts`](https://github.com/slightlyoff/lite-vimeo/blob/master/lite-vimeo.ts)). Instead of loading the full Vimeo player iframe up front, it shows a locally cached poster and loads the actual player iframe only after the visitor clicks.

It ships as two things that share one implementation:

| Variant | Source | Use it from |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Vimeo />` | [`src/components/content/embeds/Vimeo.astro`](../../src/components/content/embeds/Vimeo.astro) | `.astro` files (layouts, pages, any component tree) |
| `<dnb-vimeo>` | [`src/components/content/embeds/VimeoScript.astro`](../../src/components/content/embeds/VimeoScript.astro) | Raw markdown content (blog posts are plain `.md`, not `.mdx`, so they cannot import an Astro component — but raw HTML tags pass through untouched) |

`<Vimeo />` is a thin wrapper: it renders `<VimeoScript />` (the custom element definition) followed by a `<dnb-vimeo>` element with the props mapped to its HTML attributes. Both variants are backed by the exact same `dnb-vimeo` custom element — there is no behavioural difference between them, only a different surface for a different content type.

## `<Vimeo />` (astro component)

```astro
---
import Vimeo from '@components/content/embeds/Vimeo.astro';
---

<Vimeo videoid="522265992" title="Thailand vermisst dich" />
```

Only `videoid` is required; every other prop is optional.

| Prop | Type | Default | Description |
| ----------- | --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `videoid` | `string` | — (required) | Vimeo video id, e.g. `522265992` for `https://vimeo.com/522265992`. |
| `title` | `string` | `'Video'` | Accessible title used for the play button's `aria-label`, the host element's `title`, and the iframe's `title`. There is no oEmbed lookup, so without `title` the label is the literal `'Video'`. |
| `playLabel` | `string` | `'Play'` | Prefixed to the title, e.g. `"Play: Thailand vermisst dich"`. |
| `startAt` | `string` | `'0s'` | Start offset passed as the player's `#t=` fragment, e.g. `'1m30s'`. |
| `hash` | `string` | — | Unlisted-video access hash — the `h` query param Vimeo requires for unlisted videos (the `<hash>` in `vimeo.com/<id>/<hash>`). |
| `class` | `string` | — | Forwarded to the underlying `<dnb-vimeo>` element. |

## `<dnb-vimeo>` (web component / raw markdown)

```md
<dnb-vimeo videoid="522265992" videotitle="Thailand vermisst dich"></dnb-vimeo>
```

This is the tag to use directly inside post content (`src/content/posts/**/index.md`), since those files are plain markdown and cannot `import` an Astro component. `BlogPost.astro` (see [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro)) scans each post's raw markdown source for the string `dnb-vimeo` at build time and only renders `<VimeoScript />` — the element definition — for posts that actually use it, so the ~2000 posts without a video embed don't ship the component's JavaScript.

| Attribute | Maps to `<Vimeo />` prop | Default | Description |
| ------------ | ------------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `videoid` | `videoid` | — (required) | Vimeo video id. The only attribute the element observes for changes — changing it at runtime resets and reloads the placeholder. |
| `videotitle` | `title` | `'Video'` | Accessible title (see above). |
| `videoplay` | `playLabel` | `'Play'` | Label prefix (see above). |
| `start` | `startAt` | `'0s'` | Start offset (see above). |
| `videohash` | `hash` | — | Unlisted-video hash (see above). |

## Behaviour and features

* **Local poster thumbnails.** Both the `<Vimeo />` cover path and raw `<dnb-vimeo>` markdown embeds show a poster from a locally cached, git-committed file (`src/assets/images/video-thumbnails/vimeo/<id>.jpg`) rather than ever contacting Vimeo's oEmbed API/CDN to show one — see [`video-thumbnail-cache.md`](../content/video-thumbnail-cache.md). A video without a cached thumbnail shows the neutral black placeholder with the play button; there is no live poster fallback.
* **Click-to-load only.** The real `player.vimeo.com` iframe is created only when the visitor clicks the element. Before that click the component makes no request and opens no connection to Vimeo: no oEmbed lookup, no `i.vimeocdn.com` thumbnail, no `preconnect` hints on hover, and no loading on scroll ([#1789](https://github.com/davidsneighbour/samui-samui.de/issues/1789)). Upstream lite-vimeo does all of these as speed optimisations; this port removes them on purpose, because the privacy policy promises click-to-connect. Do not add them back (see `AGENTS.md`).
* **Play-button interaction.** The custom play button transitions only the properties that change (`background-color` and `opacity`), gates the hover color to hover-capable pointer devices, and disables that transition for `prefers-reduced-motion: reduce`.
* **Shadow DOM.** Markup and styles (the placeholder frame, the play button, the injected iframe) live in a shadow root, so the component is self-contained and doesn't depend on — or leak into — the host page's CSS.
* **Placeholder image.** The `<img>` starts with a 1×1 transparent GIF `src` (not an absent/empty one) so it never renders a browser's "broken image" glyph; without a local poster, the shadow host's black background and the play button are the neutral placeholder.
* **Accessible labelling.** The play button's `aria-label`, the host's `title`, and the placeholder image's `alt` are set to `"<playLabel>: <title>"` on connect, with `'Video'` as the title when `title` / `videotitle` is missing.
* **Privacy.** The generated iframe URL always sets `dnt=1` (Vimeo's do-not-track player param), matching this repo's privacy posture (see [`src/pages/kleingedrucktes/datenschutzerklaerung.mdx`](../../src/pages/kleingedrucktes/datenschutzerklaerung.mdx), "Einsatz von Vimeo-Komponenten").
* **`allow` list includes `fullscreen`.** The upstream lite-vimeo reference omits `fullscreen` from the iframe's `allow` attribute while still setting the legacy `allowfullscreen` boolean attribute — modern browsers give the `allow` list precedence, so that combination silently breaks fullscreen. This port's `allow` list includes `fullscreen` explicitly.

## Source

* [`src/components/content/embeds/Vimeo.astro`](../../src/components/content/embeds/Vimeo.astro) — the Astro wrapper component.
* [`src/components/content/embeds/VimeoScript.astro`](../../src/components/content/embeds/VimeoScript.astro) — the `dnb-vimeo` custom element definition (TypeScript, inside a `<script>` block).
* [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro) and `src/pages/[...slug].astro` — where the post-body scan and conditional `<VimeoScript />` rendering happens.
* Ported from [slightlyoff/lite-vimeo](https://github.com/slightlyoff/lite-vimeo), specifically [`lite-vimeo.ts`](https://github.com/slightlyoff/lite-vimeo/blob/master/lite-vimeo.ts).
* Demonstrated in [`src/content/posts/2021/03/thailand-vermisst-dich/index.md`](../../src/content/posts/2021/03/thailand-vermisst-dich/index.md).
* See also [`youtube.md`](youtube.md) for the sibling component this one shares its shape with.
