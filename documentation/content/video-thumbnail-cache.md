# Video thumbnail cache

YouTube and Vimeo embeds ([`youtube.md`](../components/youtube.md),
[`vimeo.md`](../components/vimeo.md), [`post-covers.md`](../components/post-covers.md))
show a poster image before a visitor clicks to load the real player. That
poster is a locally cached, git-committed file — never a live request to
`i.ytimg.com` or Vimeo's oEmbed API/CDN — so viewing a page with a video
embed never contacts YouTube or Vimeo. Only clicking (or activating) the
preview does, exactly as described in
[`datenschutzerklaerung.mdx`](../../src/pages/kleingedrucktes/datenschutzerklaerung.mdx).

## Storage

```text
src/assets/images/video-thumbnails/youtube/<11-character-id>.jpg
src/assets/images/video-thumbnails/vimeo/<numeric-id>.jpg
```

These files are committed to the repository, mirroring the equivalent
YouTube-only mechanism in the sibling `kollitsch.dev` project. There is no
build-time or dev-time network fetch for posters at all — if a file isn't
here, there is no poster for that video until the maintenance script below
has been run and its output committed.

`src/utils/video-thumbnails.ts` is the single resolver both consumers share:
`resolveLocalThumbnail(provider, videoId)` returns the matching
`ImageMetadata` (via an `import.meta.glob` over this directory) or
`undefined`.

## Consumers

* **Post covers** (`cover.type: youtube/vimeo` in frontmatter) —
  `src/utils/covers.ts` resolves `posterImage` from the cache, and
  `PostCover.astro` renders it through `astro:assets`' `<Picture>`
  (responsive `webp`/`jpeg`).
* **In-body embeds** (`<dnb-youtube videoid="...">` / `<dnb-vimeo
  videoid="...">` dropped directly into a post's Markdown body) — the
  `rehypeVideoPosters` plugin (`src/scripts/rehype/video-posters.ts`,
  registered in `astro.config.ts`) injects a plain `<img slot="poster">`
  referencing the same cached file's built asset URL. Both
  `YoutubeScript.astro`/`VimeoScript.astro`'s custom elements already skip
  their client-side live-fetch fallback whenever a `[slot="poster"]` child
  is present.

If a video id has no cached thumbnail yet, the corresponding component (or
plugin) leaves it untouched, and the custom element falls back to its
previous live-fetch-on-connect behaviour for that one video — safe and
non-breaking, but not privacy-preserving until the thumbnail exists. New
posts should always run the fetch script (see below) before publishing.

## Maintenance script

`src/scripts/content/fetch-video-thumbnails.ts` scans
`src/content/posts/**/*.md` for both `cover:` frontmatter and in-body
`<dnb-youtube>`/`<dnb-vimeo>` tags, and downloads any thumbnail that isn't
already cached:

```bash
npm run thumbnails:fetch              # fetch missing thumbnails for every id found in the project
node src/scripts/content/fetch-video-thumbnails.ts <videoId>          # fetch/refresh a single id (provider auto-detected: numeric = Vimeo, 11-character = YouTube)
node src/scripts/content/fetch-video-thumbnails.ts --force            # re-fetch all
npm run thumbnails:verify             # check every known id is still live/reachable, no download; exits 1 if any are dead
```

YouTube downloads try `maxresdefault.jpg` → `sddefault.jpg` →
`hqdefault.jpg` in order, detecting and skipping YouTube's 120×90
placeholder image. Vimeo downloads go through the oEmbed API to find
`thumbnail_url`, then fetch those bytes directly. Both paths validate the
downloaded bytes are a real JPEG (magic-number check) before writing to
disk.

## Automation

* **`lint-staged`** (`package.json`) runs the fetch script whenever staged
  content under `src/content/**/*.{md,mdx}` changes, then stages
  `src/assets/images/video-thumbnails/` — a new or edited post with a video
  never gets committed without its poster.
* **`.github/workflows/check-video-thumbnails.yml`** runs
  `npm run thumbnails:verify` weekly and files/comments on a tracking issue
  when a referenced video is no longer live/reachable — mirroring
  `kollitsch.dev`'s equivalent YouTube-only workflow.
