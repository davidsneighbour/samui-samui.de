# Legacy markup audit

Verified on 10 October 2026 against all 2,083 Markdown and MDX files under `src/content/`, the current rendering pipeline, and the local production output. This is an inventory, not a content migration. Cleanup is tracked in [the remaining-markup issue](https://github.com/davidsneighbour/samui-samui.de/issues/1804). Ordinary external links and all Markdown image destinations were not tested for link rot. Remote image service availability remains unverified where noted below.

File links open the source at the recorded line in VS Code. Line numbers describe the audit snapshot and can shift as you edit the articles.

## Blocked audio embed and unverified remote images

The SoundCloud iframe at [src/content/posts/2018/02/in-der-mitte-des-lebens/index.md:18](../../src/content/posts/2018/02/in-der-mitte-des-lebens/index.md#L18) is still a direct third-party player. `public/.htaccess` does not permit `w.soundcloud.com` in `frame-src`. A browser check applying the exact configured CSP to the local built article confirms the frame is blocked. This is a verified configuration and local-runtime failure; the live deployed headers were not separately checked.

Two remaining raw HTML image references require separate availability checks:

* [src/content/posts/2012/07/somchai-somsak-und-somporn/index.md:18](../../src/content/posts/2012/07/somchai-somsak-und-somporn/index.md#L18) loads `http://graph.facebook.com/603392055/picture`. It is a direct external avatar request. The endpoint's present availability is unverified.
* [src/content/posts/2013/08/angeblich-nur-50-000-liter/index.md:15](../../src/content/posts/2013/08/angeblich-nur-50-000-liter/index.md#L15) uses `https://assets.samui-samui.de/2013/08/10-Reuters-mecom-00016016582096-HighRes-640x422.jpg`, with local `srcset` candidates. The external fallback's availability is unverified; a browser can choose a local candidate, so the remote fallback alone does not establish a broken displayed image.

## Supported components

The content audit also found supported `<dnb-map>`, `<dnb-notice>`, `<dnb-person>`, `<dnb-youtube>`, and the imported MDX `<SamuiLifeBar>` component. Their transforms or component registrations exist. They are excluded from the broken-legacy inventory. Ordinary links, tables, emphasis, Thai spans, and working local images are also excluded.
