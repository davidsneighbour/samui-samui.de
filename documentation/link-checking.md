# Link checking

`npm run lint:links` checks Markdown and MDX links in `src/content` with Lychee. During the content refactor it is intentionally separate from `npm run check`, so the inherited archive can be fixed gradually instead of blocking every full quality gate.

```bash
npm run lint:links
npm run lint:links -- src/content/posts/2005
npm run lint:links -- src/content/posts/2005/01/example/index.md
```

The wrapper refuses paths outside `src/content`. Lint-staged uses the same wrapper in staged mode and only passes staged content Markdown/MDX files, so newly edited posts can be fixed as they are touched.

Configuration lives in `src/config/lychee.toml`. The wrapper adds the absolute repository root at runtime because Lychee requires `--root-dir` to be absolute for root-relative local links. It also remaps content routes such as `/2005/01/post-slug/`, `/themen/thema/`, and `/kontakt/` back to the matching source files before Lychee checks them. Current first-party page routes are mapped only for target-existence checks; Lychee does not scan those page files unless they are passed as inputs, and this wrapper does not pass them. Same-domain `samui-samui.de` URLs are treated as internal so the checker does not crawl the live site for archive-authored self-links. Root-relative legacy asset links under `/wp-content/` and `/assets/` are remapped to `public/` so content posts do not report bundled local media as missing. This keeps the current link-check input scope limited to the content section instead of crawling the whole site or depending on a fresh `dist/` build.

The config uses Lychee's detailed report format, per-host statistics, GET requests, anchor-fragment checks, and a seven-day cache. Failed HTTP responses, timeouts, missing local files, and blocked crawler responses remain failures on purpose; the refactor period needs the concrete reason so each post can either be repaired or documented as historical source rot.

The wrapper prints the number of content Markdown/MDX files in scope before Lychee runs. Lychee's batched report then shows aggregate link totals, including successful, redirected, timed-out, unknown, excluded, and errored links. It does not expose per-source clean-file counts in one fast batched run, so the normal report is "files checked, then link status totals" rather than "posts checked, posts clean".

Lychee is not published as an official npm package by `lycheeverse`, and the unscoped `lychee` package on npm is unrelated. Install the upstream CLI through Homebrew, Cargo, Docker, or a pre-built release binary before running the npm script.
