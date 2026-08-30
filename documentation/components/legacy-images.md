# Legacy image presentation

Many posts in the archive (2005 onward) embed images whose intrinsic dimensions are far smaller than the post content column -- old blog thumbnails, Flickr embeds, WordPress upload scans -- and the original larger files no longer exist. Stretching these to fill the column looks blurry and broken. The legacy-image system detects this automatically and renders a deliberate small-photo presentation instead.

It has two integration points that share the same classification logic, config, and CSS, but render independently because they run in different parts of the pipeline:

* **Post-body images** -- both Markdown `![]()` syntax and raw HTML `<img>` tags in post content -- are rewritten by a rehype plugin, `src/scripts/rehype/legacy-images.ts` (`rehypeLegacyImages`), wired into `astro.config.ts`'s `markdown.rehypePlugins`.
* **Post covers in preview contexts** (`cover:` frontmatter and the legacy `featured_image` string field), resolved by `getPostCover()` in `src/utils/covers.ts`, are classified in `PostCover.astro` and rendered by `src/components/content/post/LegacyImagePresentation.astro` where the call site opts in with `presentationWidth`.

Both read the same central config and classification function from `src/utils/legacy-images/`:

* `config.ts` -- `LegacyImageConfig` and its defaults.
* `classify.ts` -- `classifyImagePresentation()` and override resolution.
* `frame.ts` -- the shared CSS class names and frame-height calculation.
* `fs.ts` -- local file resolution, dimension probing, and the blurred background derivative, all via `sharp` (already an Astro build dependency).

## The three modes

* **`standard`** -- the existing responsive `<Picture>`/`<img>` rendering, unchanged. Used whenever the source has enough intrinsic resolution for where it renders.
* **`legacy`** -- the small source is shown at its own native size (never upscaled), centered on a canvas filled by a heavily blurred, enlarged derivative of the same image plus a restrained translucent scrim. Canvas height tracks the foreground's own display height plus fixed padding, not the container's aspect ratio -- a landscape photo in a wide column gets a compact band, not a tall stretched square.
* **`thumbnail`** -- for sources at or below `thumbnailMaximumWidth` (very small icons/thumbnails from the old CMS). Centered on a plain `--color-muted` surface with no blurred background, so tiny sources don't get an exaggerated decorative treatment.

Markup (both integration points render the same structure/classes, defined in `src/styles/theme.css`):

```html
<span class="legacy-image-frame" style="height:…px; --legacy-blur-radius:…px">
  <span class="legacy-image-bg" aria-hidden="true" style="background-image:url(data:…)"></span>
  <span class="legacy-image-scrim" aria-hidden="true"></span>
  <img class="legacy-image-fg" width="…" height="…" alt="…" />
</span>
```

The background and scrim are plain `<span>`s with `aria-hidden="true"` -- not `<img>` elements -- so they carry no accessible-image semantics and never duplicate the foreground's `alt` text. The background derivative is a ~32px-wide (`blurDerivativeWidth`) resize of the source, base64-inlined as a `data:` URI rather than a second network request; blur itself is a CSS `filter: blur(...)` (via `--legacy-blur-radius`) applied at render time, not baked into the derivative's pixels, so the same tiny derivative works regardless of the configured radius.

## Automatic classification

```ts
if (intrinsicWidth <= thumbnailMaximumWidth) return "thumbnail";
if (intrinsicWidth < minimumUsefulWidth || intrinsicWidth < expectedRenderedWidth * minimumSourceRatio) return "legacy";
return "standard";
```

Classification is always width-driven (landscape and portrait sources are judged on their own intrinsic width, not an aspect-ratio heuristic). `expectedRenderedWidth` is the width the image is expected to render at:

* Post-body images default to `720` (see `DEFAULT_EXPECTED_RENDERED_WIDTH` in the rehype plugin) -- the content column has no per-image `sizes`, unlike `<Picture>` call sites.
* Post covers pass the `presentationWidth` prop only in preview contexts (`896` for the featured list card; see [Per-image overrides](#per-image-overrides) below for the cropped 288px list-card thumbnails, which don't opt in at all). Single-post covers intentionally do not opt in, so they render as full-width images without a separate legacy presentation frame behind them.

Current defaults (`src/utils/legacy-images/config.ts`):

| Key | Default | Notes |
| -------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `thumbnailMaximumWidth` | `320` | At/below this width: `thumbnail`. |
| `minimumUsefulWidth` | `720` | Below this width: `legacy`. |
| `minimumSourceRatio` | `0.8` | A source narrower than `expectedRenderedWidth * 0.8` is `legacy` even if above `minimumUsefulWidth`. |
| `maximumForegroundUpscale` | `1` | Foreground is never scaled above `intrinsicWidth * this`. |
| `blurDerivativeWidth` | `32` | Width, in px, of the generated background derivative. |
| `blurRadius` | `24` | CSS blur radius, in px. |

Change these in `config.ts` -- both integration points read from the same `defaultLegacyImageConfig` export, so there is one place to retune thresholds for the whole site.

SVGs (`src="*.svg"`) are always left as `standard` and never probed.

## Overrides

Precedence: **per-image > post frontmatter > automatic classification.**

### Post frontmatter

```yaml
legacyImages: auto # or "always" / "never" -- default is "auto"
```

Defined on the `posts` collection schema in `src/content.config.ts`. `always` forces the `legacy` treatment (not `thumbnail`, which only comes from automatic classification of very small sources); `never` forces `standard`.

### Per-image overrides

* **Cover images** (`cover:` frontmatter, `type: image`):

  ```yaml
  cover:
    type: image
    src: cover.jpg
    legacyPresentation: always # or "never" / "auto"
  ```

* **Raw HTML `<img>` in post bodies**:

  ```html
  <img src="/wp-content/old-images/100.jpg" data-legacy-image="always" />
  ```

  The `data-legacy-image` attribute is consumed and stripped by the rehype plugin -- it never leaks into rendered output. There's no equivalent for plain Markdown `![]()` syntax (Markdown has no attribute syntax); use raw HTML or the post-level frontmatter for those.

## Remote and unknown-dimension images

Remote sources (`http(s)://`, protocol-relative `//`) are never fetched at build time -- this system doesn't download or mirror remote assets. They always render exactly as before (`standard`), even under an `always` override, since the decorative background can't be generated without local file access. The vast majority of this site's pre-2015 inline images are Flickr/off-site embeds and fall into this category.

Local images (root-relative `/wp-content/...`, `/images/...` paths served from `public/`, or Markdown-relative `./file.jpg` paths bundled next to a post) are read with `sharp` at build time. If the file can't be read -- missing on disk, corrupt, unsupported format -- classification silently falls back to `standard` rather than guessing a frame size or breaking the build.

Bundled Markdown-relative images (`![]()` pointing at a file next to `index.md`) are optimized by Astro's own built-in remark image pipeline *before* the legacy-image rehype plugin runs, so their `width`/`height` attributes are already correct by the time this plugin sees them; only the still-tiny minority of such posts with genuinely small bundled sources would classify as `legacy`, and for those the blurred-background derivative step may be skipped (degrading gracefully to a plain muted frame) since the rehype plugin can't reliably resolve Astro's post-optimization asset path back to the original file on disk.

## Layout and performance

* `width`/`height` are always set from intrinsic dimensions (from HTML attributes when already present, otherwise probed via `sharp`), so the browser reserves space before the image loads.
* The frame's `height` is an explicit inline pixel value computed at build time (foreground display height + fixed vertical padding, capped relative to the column width for pathological sources) -- no client-side JavaScript, no layout shift.
* `loading`/`decoding` on the foreground default to `lazy`/`async` in body content, and inherit the caller's `eager`/`lazy` choice for cover preview contexts (the featured list cover renders eager, matching prior behavior).
* `standard`-classified images never generate or load a blurred derivative.
* Runs entirely at build time; no hydration, no runtime JS.

## Styling

`.legacy-image-frame` and friends live in `src/styles/theme.css`, using the same `--radius` and `--color-muted` design tokens as the rest of the site (see `DESIGN.md`), so the canvas matches current card/image styling in both themes. No animation is added, so there's nothing to gate behind `prefers-reduced-motion`.

## Tests

`src/test/legacy-images-classify.test.ts` covers the pure classification and override-resolution functions. `src/test/legacy-images-rehype.test.ts` runs the rehype plugin against hand-built hast trees (standard/legacy/ thumbnail classification, post-level and per-image overrides, SVG and remote-image fallback, missing-metadata fallback, and the generated markup's accessibility shape).
