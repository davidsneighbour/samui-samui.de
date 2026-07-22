# Vimeo embed

A lazy-loading Vimeo embed ported from
[slightlyoff/lite-vimeo](https://github.com/slightlyoff/lite-vimeo)
([`lite-vimeo.ts`](https://github.com/slightlyoff/lite-vimeo/blob/master/lite-vimeo.ts)).
Instead of loading the full Vimeo player iframe up front, it fetches only the
lightweight oEmbed thumbnail on render and defers the actual player iframe
until the visitor clicks (or, with `autoload`, until the element scrolls into
view).

It ships as two things that share one implementation:

| Variant | Source | Use it from |
| --- | --- | --- |
| `<Vimeo />` | [`src/components/Vimeo.astro`](../../src/components/Vimeo.astro) | `.astro` files (layouts, pages, any component tree) |
| `<dnb-vimeo>` | [`src/components/VimeoScript.astro`](../../src/components/VimeoScript.astro) | Raw markdown content (blog posts are plain `.md`, not `.mdx`, so they cannot import an Astro component — but raw HTML tags pass through untouched) |

`<Vimeo />` is a thin wrapper: it renders `<VimeoScript />` (the custom
element definition) followed by a `<dnb-vimeo>` element with the props
mapped to its HTML attributes. Both variants are backed by the exact same
`dnb-vimeo` custom element — there is no behavioural difference between them,
only a different surface for a different content type.

## `<Vimeo />` (astro component)

```astro
---
import Vimeo from '@components/Vimeo.astro';
---

<Vimeo videoid="522265992" title="Thailand vermisst dich" />
```

Only `videoid` is required; every other prop is optional.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `videoid` | `string` | — (required) | Vimeo video id, e.g. `522265992` for `https://vimeo.com/522265992`. |
| `title` | `string` | `'Video'` | Accessible title used for the play button's `aria-label`, the host element's `title`, and the iframe's `title`. If omitted, the component falls back to the title returned by Vimeo's oEmbed API. |
| `playLabel` | `string` | `'Play'` | Prefixed to the title, e.g. `"Play: Thailand vermisst dich"`. |
| `startAt` | `string` | `'0s'` | Start offset passed as the player's `#t=` fragment, e.g. `'1m30s'`. |
| `hash` | `string` | — | Unlisted-video access hash — the `h` query param Vimeo requires for unlisted videos (the `<hash>` in `vimeo.com/<id>/<hash>`). |
| `autoload` | `boolean` | `false` | Load the iframe automatically once the element scrolls into view, via `IntersectionObserver`, instead of waiting for a click. |
| `autoplay` | `boolean` | `false` | Autoplay once loaded. Only takes effect together with `autoload` — a click-triggered load never autoplays, since the click itself is the play action. |
| `class` | `string` | — | Forwarded to the underlying `<dnb-vimeo>` element. |

## `<dnb-vimeo>` (web component / raw markdown)

```md
<dnb-vimeo videoid="522265992" videotitle="Thailand vermisst dich"></dnb-vimeo>
```

This is the tag to use directly inside post content (`src/content/posts/**/index.md`),
since those files are plain markdown and cannot `import` an Astro component.
`BlogPost.astro` (see [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro))
scans each post's raw markdown source for the string `dnb-vimeo` at build time
and only renders `<VimeoScript />` — the element definition — for posts that
actually use it, so the ~2000 posts without a video embed don't ship the
component's JavaScript.

| Attribute | Maps to `<Vimeo />` prop | Default | Description |
| --- | --- | --- | --- |
| `videoid` | `videoid` | — (required) | Vimeo video id. The only attribute the element observes for changes — changing it at runtime resets and reloads the placeholder. |
| `videotitle` | `title` | `'Video'` | Accessible title (see above). |
| `videoplay` | `playLabel` | `'Play'` | Label prefix (see above). |
| `start` | `startAt` | `'0s'` | Start offset (see above). |
| `videohash` | `hash` | — | Unlisted-video hash (see above). |
| `autoload` | `autoload` | absent | Boolean attribute — presence enables it, e.g. `autoload=""` or bare `autoload`. |
| `autoplay` | `autoplay` | absent | Boolean attribute, same convention as `autoload`. |

## Behaviour and features

* **Click-to-load facade.** On connect, the element fetches only
  `https://vimeo.com/api/oembed.json` for the video's thumbnail and title —
  the real `player.vimeo.com` iframe is not created until the user clicks the
  element (or `autoload` triggers it). This is the entire point of porting
  lite-vimeo: a page with several embeds doesn't pay for several Vimeo
  players until the visitor actually asks for one.
* **Shadow DOM.** Markup and styles (the placeholder frame, the play button,
  the injected iframe) live in a shadow root, so the component is
  self-contained and doesn't depend on — or leak into — the host page's CSS.
* **Placeholder image.** The `<img>` starts with a 1×1 transparent GIF `src`
  (not an absent/empty one) so it never renders a browser's "broken image"
  glyph while the oEmbed thumbnail request is in flight; the shadow host's
  black background and the play button carry the loading look until the real
  poster (`i.vimeocdn.com`) loads.
* **Accessible labelling.** Once the oEmbed response resolves, the play
  button's `aria-label`, the host's `title`, and the placeholder image's
  `alt`/`aria-label` are all set to `"<playLabel>: <title>"`. If `title` /
  `videotitle` wasn't supplied, the oEmbed response's own title is used
  before falling back to the literal string `'Video'`.
* **Connection warm-up.** On the first `pointerover` (hover/touch) and again
  right before the iframe is created, the component adds `<link
  rel="preconnect">` hints for `f.vimeocdn.com`, `player.vimeo.com`, and
  `i.vimeocdn.com`, so the actual embed request that follows starts warm.
* **`autoload` + `IntersectionObserver`.** With `autoload` set, an
  `IntersectionObserver` loads the iframe the first time the element enters
  the viewport, instead of waiting for a click. Combine with `autoplay` to
  autoplay once it scrolls into view.
* **Privacy.** The generated iframe URL always sets `dnt=1` (Vimeo's
  do-not-track player param), matching this repo's privacy posture (see
  [`src/pages/kleingedrucktes/datenschutzerklaerung.mdx`](../../src/pages/kleingedrucktes/datenschutzerklaerung.mdx),
  "Einsatz von Vimeo-Komponenten").
* **`allow` list includes `fullscreen`.** The upstream lite-vimeo reference
  omits `fullscreen` from the iframe's `allow` attribute while still setting
  the legacy `allowfullscreen` boolean attribute — modern browsers give the
  `allow` list precedence, so that combination silently breaks fullscreen.
  This port's `allow` list includes `fullscreen` explicitly.

## Source

* [`src/components/Vimeo.astro`](../../src/components/Vimeo.astro) — the Astro
  wrapper component.
* [`src/components/VimeoScript.astro`](../../src/components/VimeoScript.astro) —
  the `dnb-vimeo` custom element definition (TypeScript, inside a `<script>`
  block).
* [`src/layouts/BlogPost.astro`](../../src/layouts/BlogPost.astro) and
  `src/pages/[...slug].astro` — where the post-body scan and conditional
  `<VimeoScript />` rendering happens.
* Ported from [slightlyoff/lite-vimeo](https://github.com/slightlyoff/lite-vimeo),
  specifically [`lite-vimeo.ts`](https://github.com/slightlyoff/lite-vimeo/blob/master/lite-vimeo.ts).
* Demonstrated in
  [`src/content/posts/2021/03/thailand-vermisst-dich/index.md`](../../src/content/posts/2021/03/thailand-vermisst-dich/index.md).
* See also [`youtube.md`](youtube.md) for the sibling
  component this one shares its shape with.
