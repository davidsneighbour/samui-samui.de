# Post cover migration plan

Issue: [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)

## Goal

Move post-leading media into optional `cover` frontmatter so single posts and list pages can render images, YouTube videos, and Vimeo videos consistently.

## Decisions

* `cover` is optional. Posts can have no public cover until they are reviewed.
* Image covers use bundle-local files only: `type: image`, `src`, optional `caption`, optional `alt`.
* Video covers use `type: youtube` or `type: vimeo`, `video`, and optional `caption`.
* Existing image `title` values remain valid, but new content should use `caption`.
* Hugo `resources` is migration evidence, not an implicit runtime fallback.
* When a post has multiple Hugo `resources`, the first usable image resource is the review cover candidate.
* Migrated `resources` entries remain in frontmatter until a dedicated cleanup pass decides what to delete.
* Risky or incomplete migrations are marked with `publisher.covermigration: true`.
* List-page cover placement alternates by post index instead of randomizing at build time.

## Current implementation steps

1. Extend `src/content.config.ts` to validate optional image, YouTube, and Vimeo cover frontmatter.
2. Extend `src/utils/covers.ts` to normalize cover frontmatter into renderable image/video media.
3. Extend `src/components/PostCover.astro` to render optimized images, `Youtube.astro`, or `Vimeo.astro`.
4. Keep the first homepage post large; render subsequent list covers in the compact flex preview and alternate left/right placement.
5. Document the cover properties in `documentation/components/post-covers.md`.
6. Add `src/scripts/post-covers.ts` for archive audit and safe scoped migration.

## Sample posts

* Image: `src/content/posts/2026/blogdepression-version-2026/index.md`
* YouTube: `src/content/posts/2024/the-white-lotus-trailer/index.md`
* Vimeo: `src/content/posts/2021/03/thailand-vermisst-dich/index.md`

The video samples should not keep duplicate body embeds after the cover renderer is active.

## Archive migration procedure

1. Run `npm run covers -- audit --all --summary`.
2. Review the summary counts:
   * `covered` already has explicit cover frontmatter.
   * `candidate:body-image:image` can usually migrate automatically.
   * `candidate:body-video:youtube` and `candidate:body-video:vimeo` can usually migrate automatically.
   * `candidate:resources:image` can promote one Hugo resource when no body media exists.
   * `review:has-candidate:*` can be migrated with `--review`, but body media is kept in place and the post receives `publisher.covermigration: true`.
   * `review:no-candidate` has no usable local cover candidate.
   * `review:marked:no-candidate` is already in the manual queue.
   * `covered:review` has a cover and still needs manual verification.
3. Migrate in small batches, for example:

   ```bash
   npm run covers -- migrate --year=2021 --dry-run
   npm run covers -- migrate --year=2021
   npm run covers -- migrate --year=2021 --review --mark-missing --dry-run
   ```

4. Build or inspect the affected pages.
5. Remove or unset `publisher.covermigration` only after the cover has been reviewed.
6. Leave remaining `resources` cleanup for a separate pass.

After the first full migration pass, the archive audit was:

```text
covered 91
covered:review 8
review:marked:no-candidate 1951
```

## Open questions

* How aggressive should the later `resources` cleanup be?
* Should remote Flickr and old WordPress image embeds become covers, or stay as historical body content until their assets are normalized?
* Should posts with more than one image get gallery treatment instead of a single cover?
