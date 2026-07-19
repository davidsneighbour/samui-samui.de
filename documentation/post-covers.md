# Post covers

Blog posts can define optional `cover` frontmatter. Covers are rendered above
the single post body and in blog list previews.

## Image covers

Use image covers for files stored next to a post's `index.md`.

```yaml
cover:
  type: image
  src: "gabrielle-maurer-vhtzzJ6hLVM-unsplash.jpg"
  caption: "Deprimierender Ausblick."
  alt: "Blick auf einen grauen Strandhimmel"
```

Properties:

| Property | Required | Notes |
| --- | --- | --- |
| `type` | yes | Must be `image`. |
| `src` | yes | File name only. The image must live next to the post `index.md`. |
| `caption` | no | Visible caption below the media. Preferred for new posts. |
| `alt` | no | Image alt text. Falls back to `caption`, then the post title. |
| `title` | no | Legacy alias for old image captions. Prefer `caption`. |

`src` intentionally does not accept paths. Put cover images in the post bundle
so Astro can optimize them.

## Video covers

Use video covers for YouTube and Vimeo embeds that should appear as the post
media instead of inside the Markdown body.

```yaml
cover:
  type: youtube
  video: XwQRkOK5KC4
  caption: The White Lotus - Season 3 Trailer
```

```yaml
cover:
  type: vimeo
  video: 522265992
  caption: Thailand vermisst dich
```

Properties:

| Property | Required | Notes |
| --- | --- | --- |
| `type` | yes | Must be `youtube` or `vimeo`. |
| `video` | yes | YouTube or Vimeo video id. Strings and numbers are accepted. |
| `caption` | no | Visible caption below the media and accessible video title. |
| `title` | no | Alias used as the accessible video title if `caption` is missing. |
| `params` | no | Extra YouTube player URL params, for example `start=30`. |
| `startAt` | no | Vimeo start offset, for example `1m30s`. |
| `hash` | no | Vimeo unlisted-video hash. |
| `autoload` | no | Boolean. Loads the iframe when the facade scrolls into view. |
| `autoplay` | no | Boolean. Autoplays when used together with `autoload`. |

Remove the matching in-body `<dnb-youtube>` or `<dnb-vimeo>` embed once it has
been promoted to `cover`, unless the same video is intentionally discussed again
inside the article.

## Migration helpers

Use the cover helper to audit and migrate historical posts:

```bash
npm run covers -- audit --all --summary
npm run covers -- migrate --path=2024/the-white-lotus-trailer --dry-run
npm run covers -- migrate --path=2024/the-white-lotus-trailer
```

The migration command only changes clear single-media posts. It can promote one
local Markdown image, one standalone YouTube/Vimeo embed, or one Hugo
`resources` image when there is no body media.

`resources` entries are not removed automatically. Treat them as post-migration
metadata to review once rendered covers have been checked.
