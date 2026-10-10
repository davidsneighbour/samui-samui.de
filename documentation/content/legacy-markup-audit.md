# Legacy markup audit

Verified on 10 October 2026 against all 2,083 Markdown and MDX files under `src/content/`, the current rendering pipeline, and the local production output. This is an inventory, not a content migration. Cleanup is tracked in [the remaining-markup issue](https://github.com/davidsneighbour/samui-samui.de/issues/1804). Ordinary external links and all Markdown image destinations were not tested for link rot. Remote image service availability remains unverified where noted below.

File links open the source at the recorded line in VS Code. Line numbers describe the audit snapshot and can shift as you edit the articles.

## Broken legacy map navigation

The nine `zurück zur Map` links in [src/content/posts/2006/05/der-tag-der-neun-tempel/index.md:35](../../src/content/posts/2006/05/der-tag-der-neun-tempel/index.md#L35) still use `href="#map"`, but their target no longer exists. The remaining occurrences are on lines 49, 63, 77, 91, 105, 119, 133, and 147. These links require a separate editorial decision; no replacement map or destination has been invented.

## Broken raw HTML images

The following 28 raw `<img>` references, across 22 posts, point to files absent from both `public/` and `dist/`. No corresponding image-path redirects were found. This verifies missing local resources, not the absence of recoverable copies elsewhere in the repository or an external archive. Several may have recoverable alternatives under `public/wp-content/old-images/`; this audit does not choose replacements without checking their identity.

| Source | Missing image path |
| --- | --- |
| [src/content/posts/2005/02/4-4einhalb-5-67-wochen-oder-sinds-doch-schon-8/index.md:23](../../src/content/posts/2005/02/4-4einhalb-5-67-wochen-oder-sinds-doch-schon-8/index.md#L23) | `/images/57.jpg` |
| [src/content/posts/2005/03/patrick-vs-harry-vs-hagrid/index.md:65](../../src/content/posts/2005/03/patrick-vs-harry-vs-hagrid/index.md#L65) | `/images/82.jpg` |
| [src/content/posts/2005/03/patrick-vs-harry-vs-hagrid/index.md:67](../../src/content/posts/2005/03/patrick-vs-harry-vs-hagrid/index.md#L67) | `/images/78.jpg` |
| [src/content/posts/2005/04/der-visa-run/index.md:51](../../src/content/posts/2005/04/der-visa-run/index.md#L51) | `/images/90t.jpg` |
| [src/content/posts/2005/04/der-visa-run/index.md:51](../../src/content/posts/2005/04/der-visa-run/index.md#L51) | `/images/91t.jpg` |
| [src/content/posts/2005/04/der-visa-run/index.md:55](../../src/content/posts/2005/04/der-visa-run/index.md#L55) | `/images/92t.jpg` |
| [src/content/posts/2005/04/der-visa-run/index.md:55](../../src/content/posts/2005/04/der-visa-run/index.md#L55) | `/images/94t.jpg` |
| [src/content/posts/2005/04/josef-und-maria/index.md:13](../../src/content/posts/2005/04/josef-und-maria/index.md#L13) | `/images/105.jpg` |
| [src/content/posts/2005/04/visa-run-vermutlich-nur-teil-1/index.md:16](../../src/content/posts/2005/04/visa-run-vermutlich-nur-teil-1/index.md#L16) | `/images/87t.jpg` |
| [src/content/posts/2005/06/ah-schoene-frauen-oder-so/index.md:27](../../src/content/posts/2005/06/ah-schoene-frauen-oder-so/index.md#L27) | `/images/114.jpg` |
| [src/content/posts/2005/06/essen-gehen/index.md:13](../../src/content/posts/2005/06/essen-gehen/index.md#L13) | `/images/129.jpg` |
| [src/content/posts/2005/07/eilmeldung-autor-geht-baden/index.md:15](../../src/content/posts/2005/07/eilmeldung-autor-geht-baden/index.md#L15) | `/images/78.jpg` |
| [src/content/posts/2005/09/der-papst-und-seine-kritiker/index.md:15](../../src/content/posts/2005/09/der-papst-und-seine-kritiker/index.md#L15) | `/images/105.jpg` |
| [src/content/posts/2005/11/ueberwindung/index.md:13](../../src/content/posts/2005/11/ueberwindung/index.md#L13) | `/images/105.jpg` |
| [src/content/posts/2005/11/vatikan-schliesst/index.md:13](../../src/content/posts/2005/11/vatikan-schliesst/index.md#L13) | `/images/105.jpg` |
| [src/content/posts/2006/02/thaksin-loest-das-parlament-auf/index.md:13](../../src/content/posts/2006/02/thaksin-loest-das-parlament-auf/index.md#L13) | `/images/206.jpg` |
| [src/content/posts/2006/02/thaksin-loest-das-parlament-auf/index.md:21](../../src/content/posts/2006/02/thaksin-loest-das-parlament-auf/index.md#L21) | `/images/207t.jpg` |
| [src/content/posts/2006/04/vorwahlenkurzgeschnitten/index.md:13](../../src/content/posts/2006/04/vorwahlenkurzgeschnitten/index.md#L13) | `/images/208.jpg` |
| [src/content/posts/2006/06/was-die-prinzessin-sah/index.md:12](../../src/content/posts/2006/06/was-die-prinzessin-sah/index.md#L12) | `/images/210.jpg` |
| [src/content/posts/2006/10/templatespielereien-ii-genereller-templateaufbau/index.md:19](../../src/content/posts/2006/10/templatespielereien-ii-genereller-templateaufbau/index.md#L19) | `/images/redesign/layout.gif` |
| [src/content/posts/2006/10/templatespielereien-ii-genereller-templateaufbau/index.md:37](../../src/content/posts/2006/10/templatespielereien-ii-genereller-templateaufbau/index.md#L37) | `/images/redesign/resolutions.jpg` |
| [src/content/posts/2007/08/von-bullen-und-katzen/index.md:14](../../src/content/posts/2007/08/von-bullen-und-katzen/index.md#L14) | `/images/239.jpg` |
| [src/content/posts/2007/11/miss-international-queen-2007/index.md:12](../../src/content/posts/2007/11/miss-international-queen-2007/index.md#L12) | `/images/244.jpg` |
| [src/content/posts/2008/04/deutsch-landreise/index.md:13](../../src/content/posts/2008/04/deutsch-landreise/index.md#L13) | `/images/252t.png` |
| [src/content/posts/2008/04/songkran-2/index.md:14](../../src/content/posts/2008/04/songkran-2/index.md#L14) | `/images/251.gif` |
| [src/content/posts/2009/12/5-jahre/index.md:14](../../src/content/posts/2009/12/5-jahre/index.md#L14) | `/images/274t.jpg` |
| [src/content/posts/2010/11/floh-im-ohr/index.md:16](../../src/content/posts/2010/11/floh-im-ohr/index.md#L16) | `/images/280.jpg` |
| [src/content/posts/2010/11/tiger-woods-kommt-heim/index.md:14](../../src/content/posts/2010/11/tiger-woods-kommt-heim/index.md#L14) | `/images/279.jpg` |

Three further raw HTML images use the invalid combined host/path prefix `//samui-samui.dehttps://assets.samui-samui.de/`:

| Source | Invalid image URL |
| --- | --- |
| [src/content/posts/2012/06/familienphotos-uber-kontinente-hinweg/index.md:15](../../src/content/posts/2012/06/familienphotos-uber-kontinente-hinweg/index.md#L15) | `//samui-samui.dehttps://assets.samui-samui.de/2012/06/Futuristic-Family-Reunion-slide-D3HF-jumbo-640x426.jpg` |
| [src/content/posts/2012/12/breaking-news-des-tages/index.md:16](../../src/content/posts/2012/12/breaking-news-des-tages/index.md#L16) | `//samui-samui.dehttps://assets.samui-samui.de/2012/12/Selection_004-640x284.png` |
| [src/content/posts/2013/04/happy-songkran/index.md:14](../../src/content/posts/2013/04/happy-songkran/index.md#L14) | `//samui-samui.dehttps://assets.samui-samui.de/2013/04/songkran_festival_2013-1504005-hp.jpg` |

These combined URLs are already tracked by [the malformed-image-path issue](https://github.com/davidsneighbour/samui-samui.de/issues/1793). Lost media and dead historical sources also relate to [the archive-media decision issue](https://github.com/davidsneighbour/samui-samui.de/issues/1780).

## Blocked audio embed and unverified remote images

The SoundCloud iframe at [src/content/posts/2018/02/in-der-mitte-des-lebens/index.md:18](../../src/content/posts/2018/02/in-der-mitte-des-lebens/index.md#L18) is still a direct third-party player. `public/.htaccess` does not permit `w.soundcloud.com` in `frame-src`. A browser check applying the exact configured CSP to the local built article confirms the frame is blocked. This is a verified configuration and local-runtime failure; the live deployed headers were not separately checked.

Two remaining raw HTML image references require separate availability checks:

* [src/content/posts/2012/07/somchai-somsak-und-somporn/index.md:18](../../src/content/posts/2012/07/somchai-somsak-und-somporn/index.md#L18) loads `http://graph.facebook.com/603392055/picture`. It is a direct external avatar request. The endpoint's present availability is unverified.
* [src/content/posts/2013/08/angeblich-nur-50-000-liter/index.md:15](../../src/content/posts/2013/08/angeblich-nur-50-000-liter/index.md#L15) uses `https://assets.samui-samui.de/2013/08/10-Reuters-mecom-00016016582096-HighRes-640x422.jpg`, with local `srcset` candidates. The external fallback's availability is unverified; a browser can choose a local candidate, so the remote fallback alone does not establish a broken displayed image.

## Supported components

The content audit also found supported `<dnb-map>`, `<dnb-notice>`, `<dnb-person>`, `<dnb-youtube>`, and the imported MDX `<SamuiLifeBar>` component. Their transforms or component registrations exist. They are excluded from the broken-legacy inventory. Ordinary links, tables, emphasis, Thai spans, and working local images are also excluded.
