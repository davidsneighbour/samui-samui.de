# Post covers

Blog posts can define optional `cover` frontmatter. Covers are rendered above the single post body and in blog list previews.

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
| --------- | -------- | ---------------------------------------------------------------- |
| `type` | yes | Must be `image`. |
| `src` | yes | File name only. The image must live next to the post `index.md`. |
| `caption` | no | Visible caption below the media. Preferred for new posts. |
| `alt` | no | Image alt text. Falls back to `caption`, then the post title. |
| `title` | no | Legacy alias for old image captions. Prefer `caption`. |

`src` intentionally does not accept paths. Put cover images in the post bundle so Astro can optimize them.

On single post pages, image covers sit flush against the post header area: the image itself renders full-width, and the cover's own clip provides the visible rounded top corners. There is no separate cover-frame background behind the image. The bottom edge remains square so captions and post content connect cleanly below the media. Blog list preview covers keep their fully rounded image treatment.

### Cover card corners

The single post card and the featured post card on the home page use the `cover-card` class from `src/styles/theme.css`. It applies to image and video covers alike.

The card itself does not clip its children with `overflow: hidden`. That approach left a hard, stepped media edge under the anti-aliased curve of the 1px border, so the top corners looked pixelated and thinner than the straight edges, most visibly with dark video posters. Instead:

* The card has no border width of its own. Its classes only set the border colour (`border-border dark:border-transparent`).
* A `::after` overlay paints the 1px border in that colour on top of the card, including on top of the cover.
* The cover figure (the card's first child) clips itself with `clip-path` just inside that line, at the border's inner radius (`var(--radius) - 1px`).

One painted line avoids the doubled edge that appears when a real border and an overlay copy snap to different device pixels. Do not add `overflow-hidden` or a `border` width back to these cards.

## Video covers

Use video covers for YouTube and Vimeo embeds that should appear as the post media instead of inside the Markdown body.

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
| ---------- | -------- | ----------------------------------------------------------------- |
| `type` | yes | Must be `youtube` or `vimeo`. |
| `video` | yes | YouTube or Vimeo video id. Strings and numbers are accepted. |
| `caption` | no | Visible caption below the media and accessible video title. |
| `title` | no | Alias used as the accessible video title if `caption` is missing. |
| `params` | no | Extra YouTube player URL params, for example `start=30`. |
| `startAt` | no | Vimeo start offset, for example `1m30s`. |
| `hash` | no | Vimeo unlisted-video hash. |

Remove the matching in-body `<dnb-youtube>` or `<dnb-vimeo>` embed once it has been promoted to `cover`, unless the same video is intentionally discussed again inside the article.

Video covers show a locally cached, git-committed poster image rather than ever contacting YouTube/Vimeo to render one — see [`video-thumbnail-cache.md`](../content/video-thumbnail-cache.md). Run `npm run thumbnails:fetch` after adding a new video cover so the poster is committed alongside the post. The former `autoload` and `autoplay` cover fields were removed, because loading a player without a click contacts the provider ([#1789](https://github.com/davidsneighbour/samui-samui.de/issues/1789)).

## Migration helpers

Use the cover helper to audit and migrate historical posts:

```bash
npm run covers -- audit --all --summary
npm run covers -- migrate --path=2024/the-white-lotus-trailer --dry-run
npm run covers -- migrate --path=2024/the-white-lotus-trailer
npm run covers -- migrate --all --review --mark-missing --dry-run
```

The migration command only changes clear single-media posts. It can promote one local Markdown image, one standalone YouTube/Vimeo embed, or one Hugo `resources` image when there is no body media.

Add `--review` for ambiguous posts that still have at least one usable cover candidate. Review migrations prefer the first Hugo `resources` image, add `publisher.covermigration: true`, and keep body media in place so the article is not silently edited before a manual check.

Add `--mark-missing` together with `--review` to mark posts that have no usable cover candidate:

```yaml
publisher:
  covermigration: true
```

Those posts do not get fake or empty `cover` objects. The marker is a manual queue for choosing or adding a real cover later.

`resources` entries are not removed automatically. Treat them as post-migration metadata to review once rendered covers have been checked.
