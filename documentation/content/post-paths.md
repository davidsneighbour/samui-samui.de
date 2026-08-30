# Post paths

Posts live under `src/content/posts/**/index.md`. The filesystem path is an editorial storage convention, not the canonical URL source.

Post URLs are resolved in `src/utils/posts.ts`: an explicit frontmatter `url` wins, and posts without one fall back to `/:year/:month/:slug/` from the Bangkok calendar date (`Asia/Bangkok`, UTC+07:00) plus the post folder slug.

Historical folders such as `src/content/posts/2005/01/2005-01-07-example/index.md` are migration artefacts. For refactor work, prefer the date-free folder form when a post is moved or normalised:

```text
src/content/posts/YYYY/MM/slug/index.md
```

Before moving an existing post, check that removing the `YYYY-MM-DD-` folder prefix does not collide with another post in the same month. Only remove frontmatter `url` when it already matches the target folder slug and its `YYYY/MM` matches the Bangkok calendar date from frontmatter `date`. Move same-folder assets together with `index.md`, and verify that the generated permalink remains unchanged.
