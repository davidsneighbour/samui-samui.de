# Legacy markup audit

Verified on 10 October 2026 against all 2,083 Markdown and MDX files under `src/content/`, the current rendering pipeline, and the local production output. This is an inventory, not a content migration. Cleanup is tracked in [the remaining-markup issue](https://github.com/davidsneighbour/samui-samui.de/issues/1804). Ordinary external links and all Markdown image destinations were not tested for link rot. Remote image service availability remains unverified where noted below.

## Textpattern and legacy shortcodes

No active opening, closing, escaped, or malformed `<txp:…>` tags remain. `npm run publisher -- list --textpattern-tags` reports zero posts. The apparent `<txp -->` occurrence in `src/content/posts/2006/09/die-tesko-these/index.md:16` is inside a grammar-ignore HTML comment and is not rendered.

The broader audit finds these unsupported square-bracket wrappers. Browser checks confirm they appear literally in the rendered article instead of making links or components. Their origin is legacy markup; the current repository does not establish which old plugin produced each form.

| Form | Source | Result |
| --- | --- | --- |
| `[intro]…[/intro]` | `src/content/posts/2006/01/darfichvorstellenpokki/index.md:17` | Wrapper text is visible. |
| `[outro]…[/outro]` | `src/content/posts/2006/01/darfichvorstellenpokki/index.md:31` | Wrapper text is visible. |
| `[permalink id="1762"]…[/permalink]` | `src/content/posts/2009/07/panda/index.md:20` | Link is not resolved. |
| Escaped/mixed `[permalink]` wrappers for IDs `1104`, `1193`, and `1196` | `src/content/posts/2013/09/lin-ping-geht/index.md:19` | Three links are not resolved. |

Do not invent destinations from numeric IDs. The earlier migration contract is in [Textpattern tag migration](textpattern-tags.md), tracked by [the legacy-tag research issue](https://github.com/davidsneighbour/samui-samui.de/issues/1234).

## Unsupported editorial HTML

These pseudo-elements have no component, transform, custom-element registration, or stylesheet support. Their original presentation cannot be inferred safely.

| Markup | Source | Verified rendered behaviour |
| --- | --- | --- |
| `<diabolisches lachen an>…</diabolisches lachen aus>` | `src/content/posts/2006/02/derchef/index.md:16` | Opening becomes an unknown element; the malformed closing tag appears in visible prose. |
| `<piep>` | `src/content/posts/2007/04/kommunikation-2/index.md:14` | Becomes an unknown element; the literal cue disappears from visible prose. |
| `<gebrauchsanweisung>` | `src/content/posts/2005/07/blindes-huehnchen-findet-korn/index.md:23` and `:63` | Two unknown elements; inner paragraphs remain visible, with no special component behaviour. |

`<Fügen Sie hier das Crackdown-Subjekt Ihrer Wahl ein>` in `src/content/posts/2006/10/experiment-demokratie/index.md:19` is rendered as visible text, so it is not a broken component. `<big>` is obsolete HTML but still renders; `<caption>` is correctly inside a table. Standard HTML, including `span.caps`, is not automatically broken merely because its historical styling classes have no dedicated rule.

## Empty legacy containers

There are 25 empty containers: 19 video containers, four Flickr containers, one map container, and one other empty container. Each was checked in the production output; none of these 25 articles contains an active video, iframe, or supported video-player element. Empty wrappers do not by themselves identify the original missing asset or video ID.

| Source | Empty markup |
| --- | --- |
| `src/content/posts/2006/03/chinesischerschreininnathon/index.md:25` | `<div class="flickrbadge clearfix"> </div>` |
| `src/content/posts/2006/05/der-tag-der-neun-tempel/index.md:19` | `<div id="map" style="height:550px;width:508px;margin:5px 0;border:1px solid #000;"> </div>` |
| `src/content/posts/2006/05/raucherbildchen/index.md:16` | `<div class="clearfix" style="width:500px;margin:0 auto;"> </div>` |
| `src/content/posts/2006/11/flickrset-rainseason/index.md:14` | `<div class="flickr2 clearfix"> </div>` |
| `src/content/posts/2009/06/best-foreign-husband-competition/index.md:15` | `<div class="flickr"> </div>` |
| `src/content/posts/2009/06/mee-and-my-father/index.md:15` | `<div class="flickr"> </div>` |
| `src/content/posts/2009/07/panda/index.md:15` | `<div class="flex-video"> </div>` |
| `src/content/posts/2010/11/vorgestern-am-strand/index.md:13` | `<div class="media video"> </div>` |
| `src/content/posts/2011/03/babies-in-tueten-iii-the-movie/index.md:17` | `<div class="media video"> </div>` |
| `src/content/posts/2011/04/censorsht/index.md:13` | `<div class="media video"> </div>` |
| `src/content/posts/2011/04/der-perfekte-eistee/index.md:15` | `<div class="media video"> </div>` |
| `src/content/posts/2011/04/heimvideo-dogporno/index.md:15` | `<div class="media video"> </div>` |
| `src/content/posts/2011/05/neulich-in-hat-yai/index.md:13` | `<div class="media video"> </div>` |
| `src/content/posts/2011/05/und-jetzt-werbung/index.md:13` | `<div class="media video"> </div>` |
| `src/content/posts/2011/10/bangkok-unter-wasser-1942/index.md:13` | `<div class="media movie"> </div>` |
| `src/content/posts/2011/10/hochwasser-parking-lot/index.md:15` | `<div class="media movie"> </div>` |
| `src/content/posts/2011/10/hochwassererklaervideo-ii/index.md:15` | `<div class="media movie"> </div>` |
| `src/content/posts/2011/10/hochwassererklaervideo-iii/index.md:17` | `<div class="media movie"> </div>` |
| `src/content/posts/2011/10/hochwassererklaervideo/index.md:15` | `<div class="media movie"> </div>` |
| `src/content/posts/2012/01/explosiv-2/index.md:13` | `<div class="media video"> </div>` |
| `src/content/posts/2012/01/rangordnung/index.md:13` | `<div class="media video"> </div>` |
| `src/content/posts/2012/02/demnaechst-im-kino-mae-naak-3d/index.md:13` | `<div class="media video"> </div>` |
| `src/content/posts/2012/03/immigration-the-movie/index.md:15` | `<div class="media video"> </div>` |
| `src/content/posts/2012/06/rauchende-kinder/index.md:13` | `<div class="media video"> </div>` |
| `src/content/posts/2012/11/alle-jahre-wieder/index.md:21` | `<div class="media video"> </div>` |

The map in `der-tag-der-neun-tempel` also retains links to `#map`, but the target is only an empty fixed-size box. The `flickrset-rainseason` article has no content beyond its empty wrapper. Video wrappers and Flickr wrappers must be researched or given explicit historical availability notes; no source URL or ID can be recovered from the empty HTML alone.

## Broken raw HTML images

The following 28 raw `<img>` references, across 22 posts, point to files absent from both `public/` and `dist/`. No corresponding image-path redirects were found. This verifies missing local resources, not the absence of recoverable copies elsewhere in the repository or an external archive. Several may have recoverable alternatives under `public/wp-content/old-images/`; this audit does not choose replacements without checking their identity.

| Source | Missing image path |
| --- | --- |
| `src/content/posts/2005/02/4-4einhalb-5-67-wochen-oder-sinds-doch-schon-8/index.md:23` | `/images/57.jpg` |
| `src/content/posts/2005/03/patrick-vs-harry-vs-hagrid/index.md:65` | `/images/82.jpg` |
| `src/content/posts/2005/03/patrick-vs-harry-vs-hagrid/index.md:67` | `/images/78.jpg` |
| `src/content/posts/2005/04/der-visa-run/index.md:51` | `/images/90t.jpg` |
| `src/content/posts/2005/04/der-visa-run/index.md:51` | `/images/91t.jpg` |
| `src/content/posts/2005/04/der-visa-run/index.md:55` | `/images/92t.jpg` |
| `src/content/posts/2005/04/der-visa-run/index.md:55` | `/images/94t.jpg` |
| `src/content/posts/2005/04/josef-und-maria/index.md:13` | `/images/105.jpg` |
| `src/content/posts/2005/04/visa-run-vermutlich-nur-teil-1/index.md:16` | `/images/87t.jpg` |
| `src/content/posts/2005/06/ah-schoene-frauen-oder-so/index.md:27` | `/images/114.jpg` |
| `src/content/posts/2005/06/essen-gehen/index.md:13` | `/images/129.jpg` |
| `src/content/posts/2005/07/eilmeldung-autor-geht-baden/index.md:15` | `/images/78.jpg` |
| `src/content/posts/2005/09/der-papst-und-seine-kritiker/index.md:15` | `/images/105.jpg` |
| `src/content/posts/2005/11/ueberwindung/index.md:13` | `/images/105.jpg` |
| `src/content/posts/2005/11/vatikan-schliesst/index.md:13` | `/images/105.jpg` |
| `src/content/posts/2006/02/thaksin-loest-das-parlament-auf/index.md:13` | `/images/206.jpg` |
| `src/content/posts/2006/02/thaksin-loest-das-parlament-auf/index.md:21` | `/images/207t.jpg` |
| `src/content/posts/2006/04/vorwahlenkurzgeschnitten/index.md:13` | `/images/208.jpg` |
| `src/content/posts/2006/06/was-die-prinzessin-sah/index.md:12` | `/images/210.jpg` |
| `src/content/posts/2006/10/templatespielereien-ii-genereller-templateaufbau/index.md:19` | `/images/redesign/layout.gif` |
| `src/content/posts/2006/10/templatespielereien-ii-genereller-templateaufbau/index.md:37` | `/images/redesign/resolutions.jpg` |
| `src/content/posts/2007/08/von-bullen-und-katzen/index.md:14` | `/images/239.jpg` |
| `src/content/posts/2007/11/miss-international-queen-2007/index.md:12` | `/images/244.jpg` |
| `src/content/posts/2008/04/deutsch-landreise/index.md:13` | `/images/252t.png` |
| `src/content/posts/2008/04/songkran-2/index.md:14` | `/images/251.gif` |
| `src/content/posts/2009/12/5-jahre/index.md:14` | `/images/274t.jpg` |
| `src/content/posts/2010/11/floh-im-ohr/index.md:16` | `/images/280.jpg` |
| `src/content/posts/2010/11/tiger-woods-kommt-heim/index.md:14` | `/images/279.jpg` |

Three further raw HTML images use the invalid combined host/path prefix `//samui-samui.dehttps://assets.samui-samui.de/`:

| Source | Invalid image URL |
| --- | --- |
| `src/content/posts/2012/06/familienphotos-uber-kontinente-hinweg/index.md:15` | `//samui-samui.dehttps://assets.samui-samui.de/2012/06/Futuristic-Family-Reunion-slide-D3HF-jumbo-640x426.jpg` |
| `src/content/posts/2012/12/breaking-news-des-tages/index.md:16` | `//samui-samui.dehttps://assets.samui-samui.de/2012/12/Selection_004-640x284.png` |
| `src/content/posts/2013/04/happy-songkran/index.md:14` | `//samui-samui.dehttps://assets.samui-samui.de/2013/04/songkran_festival_2013-1504005-hp.jpg` |

These combined URLs are already tracked by [the malformed-image-path issue](https://github.com/davidsneighbour/samui-samui.de/issues/1793). Lost media and dead historical sources also relate to [the archive-media decision issue](https://github.com/davidsneighbour/samui-samui.de/issues/1780).

## Blocked audio embed and unverified remote images

The SoundCloud iframe at `src/content/posts/2018/02/in-der-mitte-des-lebens/index.md:18` is still a direct third-party player. `public/.htaccess` does not permit `w.soundcloud.com` in `frame-src`. A browser check applying the exact configured CSP to the local built article confirms the frame is blocked. This is a verified configuration and local-runtime failure; the live deployed headers were not separately checked.

Two remaining raw HTML image references require separate availability checks:

* `src/content/posts/2012/07/somchai-somsak-und-somporn/index.md:18` loads `http://graph.facebook.com/603392055/picture`. It is a direct external avatar request. The endpoint's present availability is unverified.
* `src/content/posts/2013/08/angeblich-nur-50-000-liter/index.md:15` uses `https://assets.samui-samui.de/2013/08/10-Reuters-mecom-00016016582096-HighRes-640x422.jpg`, with local `srcset` candidates. The external fallback's availability is unverified; a browser can choose a local candidate, so the remote fallback alone does not establish a broken displayed image.

## Supported components

The content audit also found supported `<dnb-map>`, `<dnb-notice>`, `<dnb-person>`, `<dnb-youtube>`, and the imported MDX `<SamuiLifeBar>` component. Their transforms or component registrations exist. They are excluded from the broken-legacy inventory. Ordinary links, tables, emphasis, Thai spans, and working local images are also excluded.
