# Changelog

## [2.5.0](https://github.com/davidsneighbour/samui-samui.de/compare/v2.4.0...v2.5.0) (2026-07-25)

### Content

* **fix:** add photo to 2007 post ([ca264e3](https://github.com/davidsneighbour/samui-samui.de/commit/ca264e3ea093d719b84616eb54a6757c8dd0bf9b))
* **fix:** mark legacy Textpattern tags for review ([8e4a4b3](https://github.com/davidsneighbour/samui-samui.de/commit/8e4a4b33a18b1767f2a8ee8de9d9194d656796b8)), closes [#1234](https://github.com/davidsneighbour/samui-samui.de/issues/1234)
* **refactor:** drop duplicate post urls ([dc884fb](https://github.com/davidsneighbour/samui-samui.de/commit/dc884fba89bfa90da17d82484bf23f795a80706e)), closes [#697](https://github.com/davidsneighbour/samui-samui.de/issues/697)
* **refactor:** enforce Bangkok post calendar time ([8a06f21](https://github.com/davidsneighbour/samui-samui.de/commit/8a06f212a07237a3fb7720429fc7f9c53570b06b)), closes [#697](https://github.com/davidsneighbour/samui-samui.de/issues/697)
* **refactor:** normalize dated post folders ([dd009c5](https://github.com/davidsneighbour/samui-samui.de/commit/dd009c5184585247f7cc9c8f379c6a792e99ef8b)), closes [#697](https://github.com/davidsneighbour/samui-samui.de/issues/697)
* **refactor:** recover January 2005 Flickr originals ([ad6ef33](https://github.com/davidsneighbour/samui-samui.de/commit/ad6ef33175468ca4b4adb3e72fcc16fd1b21412e)), closes [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898)

### Feat

* **a11y:** add skip-to-content link for keyboard users ([dab5e53](https://github.com/davidsneighbour/samui-samui.de/commit/dab5e53c1d9da9173364dea3ebf62a0845b19578)), closes [#928](https://github.com/davidsneighbour/samui-samui.de/issues/928)
* add /tags/ full tag index ([d039eec](https://github.com/davidsneighbour/samui-samui.de/commit/d039eecd5eeb2936cbde6efe023444f9a099a012)), closes [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908) [#912](https://github.com/davidsneighbour/samui-samui.de/issues/912)
* add accordion UI primitive for collapsible archive rows ([0e26713](https://github.com/davidsneighbour/samui-samui.de/commit/0e2671356038f1816beed1c6bf8dca393eb5a7e7)), closes [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908) [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908) [#906](https://github.com/davidsneighbour/samui-samui.de/issues/906)
* add breadcrumb component + BreadcrumbList JSON-LD ([106ef23](https://github.com/davidsneighbour/samui-samui.de/commit/106ef23f5371c36b8bc5968c5cfa5a552170bced)), closes [#911](https://github.com/davidsneighbour/samui-samui.de/issues/911)
* add MapLibre map dialog ([2ffb441](https://github.com/davidsneighbour/samui-samui.de/commit/2ffb44160147860b6ed0f54a3cc3636c1c51ae08)), closes [#1227](https://github.com/davidsneighbour/samui-samui.de/issues/1227)
* add month-jump nav and prev/next-year navigation to /archiv/[year]/ ([0e4a332](https://github.com/davidsneighbour/samui-samui.de/commit/0e4a3320bbee5ebde5a66ad18f524b0b30ee9fd8)), closes [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908) [#monat-07](https://github.com/davidsneighbour/samui-samui.de/issues/monat-07) [#909](https://github.com/davidsneighbour/samui-samui.de/issues/909)
* add Pagefind year/tag facets to /suche/ ([672b03b](https://github.com/davidsneighbour/samui-samui.de/commit/672b03ba3a293e494636e1d612ad0e9f13eea03d)), closes [#913](https://github.com/davidsneighbour/samui-samui.de/issues/913)
* add short German month-name formatter ([b1e5ed7](https://github.com/davidsneighbour/samui-samui.de/commit/b1e5ed73978a05d245d1f3e47a11e7839ab9a2ca)), closes [#904](https://github.com/davidsneighbour/samui-samui.de/issues/904)
* **archive:** derive site age copy ([c3054df](https://github.com/davidsneighbour/samui-samui.de/commit/c3054df053518510bb77272ebcf4c27d491b48a8)), closes [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908)
* **blog:** add pagination page jump ([ecbf567](https://github.com/davidsneighbour/samui-samui.de/commit/ecbf5675e54c12c37a28927ab2b19c669449336a)), closes [#1236](https://github.com/davidsneighbour/samui-samui.de/issues/1236)
* **blog:** edit current pagination page ([aed0ad4](https://github.com/davidsneighbour/samui-samui.de/commit/aed0ad45132faf10bbb2b47858f1ef474a2e713a)), closes [#1238](https://github.com/davidsneighbour/samui-samui.de/issues/1238)
* **blog:** show pagination above older lists ([c4ede63](https://github.com/davidsneighbour/samui-samui.de/commit/c4ede6334f0fb98aa2017c747d00c429b08e6f1e)), closes [#1237](https://github.com/davidsneighbour/samui-samui.de/issues/1237)
* **contact:** rework form with shadcn-style primitives and field errors ([734e62e](https://github.com/davidsneighbour/samui-samui.de/commit/734e62ebc6297759a13244b6b80d9a46243b7c14))
* cross-link tags and archive into blog navigation ([39bceef](https://github.com/davidsneighbour/samui-samui.de/commit/39bceefc9eba4d48bb49d91e6ccc90a6c603906a)), closes [#912](https://github.com/davidsneighbour/samui-samui.de/issues/912) [#914](https://github.com/davidsneighbour/samui-samui.de/issues/914)
* **docs:** group preview navigation ([48960e3](https://github.com/davidsneighbour/samui-samui.de/commit/48960e351ee8c53663011196e4439c7e35abb4f4)), closes [#1339](https://github.com/davidsneighbour/samui-samui.de/issues/1339)
* **homepage:** feature full lead article ([c8c461f](https://github.com/davidsneighbour/samui-samui.de/commit/c8c461feeca43bf218acdceaed8858c3f2812782))
* **images:** add automatic legacy-image presentation system ([899a3d3](https://github.com/davidsneighbour/samui-samui.de/commit/899a3d35e6f1b5ff158f1e332d0e0d2f84decc3a)), closes [#1008](https://github.com/davidsneighbour/samui-samui.de/issues/1008)
* implement German content taxonomies ([16139fe](https://github.com/davidsneighbour/samui-samui.de/commit/16139fe298c9d48badebf4b5506e47d27f18b52e)), closes [#1233](https://github.com/davidsneighbour/samui-samui.de/issues/1233)
* **legal:** consolidate legal pages under /kleingedrucktes ([69b0ebc](https://github.com/davidsneighbour/samui-samui.de/commit/69b0ebc4973b5fa69d4346f1d88542adcff51970))
* **notices:** add reusable editorial notice system for Markdown and MDX ([d784ef5](https://github.com/davidsneighbour/samui-samui.de/commit/d784ef5e391338c9e33908e4a3a96eb66f3d724b)), closes [#1092](https://github.com/davidsneighbour/samui-samui.de/issues/1092)
* **pages:** convert kontakt and suche to standalone mdx pages ([18a3c85](https://github.com/davidsneighbour/samui-samui.de/commit/18a3c8551681aa516199b1769f1505572e0efb2a))
* **pagination:** morph active page pill via Astro view transitions ([33b32ad](https://github.com/davidsneighbour/samui-samui.de/commit/33b32ad26780cd2c479b03e8151150cf97b53f0e))
* rebuild /archiv/ with stats, search, year overview, and tags ([11513c8](https://github.com/davidsneighbour/samui-samui.de/commit/11513c805bc638869ba038a4375c59d1a449d110)), closes [#907](https://github.com/davidsneighbour/samui-samui.de/issues/907) [#906](https://github.com/davidsneighbour/samui-samui.de/issues/906) [#monat-MM](https://github.com/davidsneighbour/samui-samui.de/issues/monat-MM) [#909](https://github.com/davidsneighbour/samui-samui.de/issues/909) [#912](https://github.com/davidsneighbour/samui-samui.de/issues/912) [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908) [#906](https://github.com/davidsneighbour/samui-samui.de/issues/906)
* recreate Garuda footer holding up the site ([ec8c646](https://github.com/davidsneighbour/samui-samui.de/commit/ec8c646f6690c77f533feb48970659acf928e5d9)), closes [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926) [1D1D1D/#000000](https://github.com/davidsneighbour/samui-samui.de/issues/000000) [#290e1c](https://github.com/davidsneighbour/samui-samui.de/issues/290e1c) [#f8f3e6](https://github.com/davidsneighbour/samui-samui.de/issues/f8f3e6) [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926)
* render featured homepage preview as html ([9166794](https://github.com/davidsneighbour/samui-samui.de/commit/9166794b3dfb1419653ac0863e38c577b6a8ba2a)), closes [#902](https://github.com/davidsneighbour/samui-samui.de/issues/902)
* render mapcn contact map ([5c1704a](https://github.com/davidsneighbour/samui-samui.de/commit/5c1704a5a9c7b37c7a62d336ff438461e9c13c53)), closes [#1228](https://github.com/davidsneighbour/samui-samui.de/issues/1228)
* restore markdown dash typography ([ed97db8](https://github.com/davidsneighbour/samui-samui.de/commit/ed97db87ff2197c9357902f1e2635e510a5ab11f)), closes [#1196](https://github.com/davidsneighbour/samui-samui.de/issues/1196)
* **search:** adopt Pagefind Component UI ([5eb1485](https://github.com/davidsneighbour/samui-samui.de/commit/5eb14853614d53ea193ed31b9c6897912d4218ca)), closes [#1281](https://github.com/davidsneighbour/samui-samui.de/issues/1281)
* **seo:** add robots.txt and filter pagination pages from sitemap ([4c5d9dc](https://github.com/davidsneighbour/samui-samui.de/commit/4c5d9dcb7db1a0fb247c96f0273df7df4f8687f2)), closes [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915)
* **skill:** add Samui news research workflow ([568f1a8](https://github.com/davidsneighbour/samui-samui.de/commit/568f1a8a01f86cf37996c4b172b5d10681717b58)), closes [#1239](https://github.com/davidsneighbour/samui-samui.de/issues/1239)
* **sound:** add optional Cuelume effects ([1cff582](https://github.com/davidsneighbour/samui-samui.de/commit/1cff58240bf6923389a2bd3064695dd12a0bd079)), closes [#1567](https://github.com/davidsneighbour/samui-samui.de/issues/1567)
* **timeline:** add experimental /timeline/ life-timeline map ([ad7f608](https://github.com/davidsneighbour/samui-samui.de/commit/ad7f6084203a21371dc89903adc7b7b09091933f)), closes [#1656](https://github.com/davidsneighbour/samui-samui.de/issues/1656)

### Instructions

* require conventional commit messages ([a39cd28](https://github.com/davidsneighbour/samui-samui.de/commit/a39cd2887e2c204de8a49cdc993c9ba70b1b106b)), closes [#1235](https://github.com/davidsneighbour/samui-samui.de/issues/1235)

### Fix

* color Turnstile disclaimer links ([6fd5e0e](https://github.com/davidsneighbour/samui-samui.de/commit/6fd5e0eea2fa260ce3470b95e286a3bc93a3359f)), closes [#1230](https://github.com/davidsneighbour/samui-samui.de/issues/1230)
* **comments:** set Giscus interface language to German ([0bd1ca6](https://github.com/davidsneighbour/samui-samui.de/commit/0bd1ca660dcdf376e69a18035a9c6314b89b77c3))
* **covers:** bound Picture fallback img to largest breakpoint ([be04822](https://github.com/davidsneighbour/samui-samui.de/commit/be04822d4cdfa8c8f8f04ef59a5d1640bc7e3535))
* **dates:** balance optical spacing around the post date ([e81a5ab](https://github.com/davidsneighbour/samui-samui.de/commit/e81a5ab443da8f44da153d0faa3a59cac16d3210))
* **deps:** pin root vite for react oxc config ([069a2a9](https://github.com/davidsneighbour/samui-samui.de/commit/069a2a935d8c3769f429604c04cdbe269e66241a)), closes [#1646](https://github.com/davidsneighbour/samui-samui.de/issues/1646)
* **layout:** match home page top spacing to single post pages ([9f63e09](https://github.com/davidsneighbour/samui-samui.de/commit/9f63e093d0af2f498abb54a220d6e5ff07389016))
* **legal:** update Impressum provider address ([c65fd28](https://github.com/davidsneighbour/samui-samui.de/commit/c65fd286ec7be717e6032f1004fb2d6c99c9738d))
* let article clip post cover corners ([10d4b2c](https://github.com/davidsneighbour/samui-samui.de/commit/10d4b2c46816c40c8870e4d04fb39eb632e50ae1))
* **maps:** load MapLibre worker through Vite ([b8b6c38](https://github.com/davidsneighbour/samui-samui.de/commit/b8b6c384f28e915a41917eb13ce915ad143ab174)), closes [#1227](https://github.com/davidsneighbour/samui-samui.de/issues/1227)
* **maps:** support MapLibre 6 ESM import ([3efea59](https://github.com/davidsneighbour/samui-samui.de/commit/3efea596cb2bb6de3c3a1ee4927a8a87631de3cc)), closes [#1227](https://github.com/davidsneighbour/samui-samui.de/issues/1227)
* moving the analytics section to the footer ([dfe6279](https://github.com/davidsneighbour/samui-samui.de/commit/dfe6279e882926c716d3d7b665a4d59714163e2d))
* pause Garuda footer rendering ([9d5825c](https://github.com/davidsneighbour/samui-samui.de/commit/9d5825c7e446d64660a73ce5bf7181887d0ebb40))
* remove content schema deprecation warnings ([e9d525d](https://github.com/davidsneighbour/samui-samui.de/commit/e9d525d98b83c85a02093f1f9b10a05b16c98680)), closes [#1232](https://github.com/davidsneighbour/samui-samui.de/issues/1232)
* render single post covers without legacy frame ([ae6011b](https://github.com/davidsneighbour/samui-samui.de/commit/ae6011b6bd800c0d3f8eec9ec0145b636a556542))
* resolve findings from a full impeccable audit pass ([bee9d65](https://github.com/davidsneighbour/samui-samui.de/commit/bee9d65b56032801eb2817a89dd3fbb70a5edc74)), closes [#1647](https://github.com/davidsneighbour/samui-samui.de/issues/1647)
* **search:** refine header search control ([7eb66d8](https://github.com/davidsneighbour/samui-samui.de/commit/7eb66d8770b04e95d6f4a603aec4c49e495a1c97)), closes [#1303](https://github.com/davidsneighbour/samui-samui.de/issues/1303)
* square single-post cover bottoms ([1746548](https://github.com/davidsneighbour/samui-samui.de/commit/174654852a2c6a004d27b8ab01c3ea992806cedd))
* **text:** normalize German umlaut HTML entities to native characters ([89503c4](https://github.com/davidsneighbour/samui-samui.de/commit/89503c4b57f7dd41b98e6ad6576352a68b335a7f))
* **ui:** finish interface audit pass on hierarchy, motion, and touch targets ([9a7ec72](https://github.com/davidsneighbour/samui-samui.de/commit/9a7ec72d1b69789f6151eff0ce59f43029c06547))
* **ui:** rerun view-transition scripts and track pagefind stylesheet loading ([cf5685c](https://github.com/davidsneighbour/samui-samui.de/commit/cf5685c6df66d459f5f9bb97a0f5dcc858b66b48))
* **ui:** tighten interface audit hygiene ([a6a858c](https://github.com/davidsneighbour/samui-samui.de/commit/a6a858cee605656f7718a48b1885bf5ef56e2a5a)), closes [#1645](https://github.com/davidsneighbour/samui-samui.de/issues/1645)
* update contact Dropbox drop address ([b57bc70](https://github.com/davidsneighbour/samui-samui.de/commit/b57bc70c389862c5070759cc34092d35a21444d3)), closes [#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229)
* **wording:** Aktualisiert instead of Zuletzt aktualisiert in timestamps ([7f22746](https://github.com/davidsneighbour/samui-samui.de/commit/7f227467414b5b48b40df8394a2076a8cc124f79))

### Refactor

* **netlify:** move function sources into src ([240d211](https://github.com/davidsneighbour/samui-samui.de/commit/240d211e567e918dd47d48746f670067ec955c59)), closes [#1568](https://github.com/davidsneighbour/samui-samui.de/issues/1568)

### Docs

* add archive route, indexing, and data strategy ([6de7317](https://github.com/davidsneighbour/samui-samui.de/commit/6de731764888cf77ca7ac8273ea4a5dbf9f690b4)), closes [#903](https://github.com/davidsneighbour/samui-samui.de/issues/903)
* add local documentation server ([11ee5c1](https://github.com/davidsneighbour/samui-samui.de/commit/11ee5c1f8088f7a62f998491731dcf0980436069)), closes [#1339](https://github.com/davidsneighbour/samui-samui.de/issues/1339)
* **agents:** broaden issue-linking rule to all surfaces ([5dc596e](https://github.com/davidsneighbour/samui-samui.de/commit/5dc596edeb8442b0a6c7edac267780de753ef11f)), closes [#123](https://github.com/davidsneighbour/samui-samui.de/issues/123)
* **agents:** codify always-fix policy for impeccable hook findings ([4df4570](https://github.com/davidsneighbour/samui-samui.de/commit/4df4570fb1c56597426219a7e3beda5788c4a8e1))
* **ai:** add content rework skill setup ([0ff8ebd](https://github.com/davidsneighbour/samui-samui.de/commit/0ff8ebda657ef9fd35aad5b5e8faf9569068d7a8)), closes [#1008](https://github.com/davidsneighbour/samui-samui.de/issues/1008)
* clarify local command guide ([387817d](https://github.com/davidsneighbour/samui-samui.de/commit/387817de5e3f4944819ae3443973ba3d7b04f6ca))
* **content:** index frontmatter variables ([4dea9c6](https://github.com/davidsneighbour/samui-samui.de/commit/4dea9c631a5afcd343af4c36f934e24fad58b85f))
* decide against separate /archiv/[year]/[month]/ routes ([cf08e08](https://github.com/davidsneighbour/samui-samui.de/commit/cf08e08adc82de5761f228b961097c8d294afb71)), closes [#910](https://github.com/davidsneighbour/samui-samui.de/issues/910) [#909](https://github.com/davidsneighbour/samui-samui.de/issues/909) [#monat-MM](https://github.com/davidsneighbour/samui-samui.de/issues/monat-MM) [#910](https://github.com/davidsneighbour/samui-samui.de/issues/910)
* define month-activity indicator color scale in DESIGN.md ([87b179d](https://github.com/davidsneighbour/samui-samui.de/commit/87b179dc8c7345eefbcd0bca7c665f86e50f3047)), closes [#908](https://github.com/davidsneighbour/samui-samui.de/issues/908) [#907](https://github.com/davidsneighbour/samui-samui.de/issues/907)
* document Footer-loaded analytics tradeoff in AGENTS.md ([6d538e8](https://github.com/davidsneighbour/samui-samui.de/commit/6d538e81ea415f12916f5be265e8ea9bf84086f0))
* **giscus:** use live comment theme URLs ([b26e110](https://github.com/davidsneighbour/samui-samui.de/commit/b26e11072f55956341df3157f93ae11151ffdbec)), closes [#887](https://github.com/davidsneighbour/samui-samui.de/issues/887)
* order interface optimisation tasks ([1475cda](https://github.com/davidsneighbour/samui-samui.de/commit/1475cda87ce412ad838cfa521c3cf8fd36c87526))
* organize documentation in English ([1bbe3ec](https://github.com/davidsneighbour/samui-samui.de/commit/1bbe3ec753cbc814e68b16550685bbfff3d6caac)), closes [#1306](https://github.com/davidsneighbour/samui-samui.de/issues/1306)
* record interface audit tasks ([63c1301](https://github.com/davidsneighbour/samui-samui.de/commit/63c1301a93ea03edcec3b8dc9a489f2da600ec5f))
* **refactor:** record post path normalization ([1abf127](https://github.com/davidsneighbour/samui-samui.de/commit/1abf127ceecefd4ac8ea9ebe97720a8621c5477c)), closes [#697](https://github.com/davidsneighbour/samui-samui.de/issues/697)
* require feature documentation updates ([2f6493d](https://github.com/davidsneighbour/samui-samui.de/commit/2f6493d80a18fe5b2bd424a4b39f2f5621fb778e)), closes [#901](https://github.com/davidsneighbour/samui-samui.de/issues/901)
* sync AGENTS.md label taxonomy with canonical GitHub labels ([bfc3d64](https://github.com/davidsneighbour/samui-samui.de/commit/bfc3d64d275e65c4fae1bfab44ed51c97c285e92))
* **todo:** capture matomo docs, search tracking, and archive-view notes ([0b2d424](https://github.com/davidsneighbour/samui-samui.de/commit/0b2d424963c6d1d3e6d1909c338d1f16b2c2aa5d))
* **vimeo:** fix stale link to relocated datenschutzerklaerung page ([e045f96](https://github.com/davidsneighbour/samui-samui.de/commit/e045f96d0ccef70f4769123a67201a3779784516))

### Style

* **analytics:** normalize matomo script formatting ([6a186c8](https://github.com/davidsneighbour/samui-samui.de/commit/6a186c8cf8ebb44c2b7728fc1c4b78c4020c2fba))
* **header:** give the nav/search row clearer grouping ([cb6bb32](https://github.com/davidsneighbour/samui-samui.de/commit/cb6bb329d6bbcf913a131b239c3bf2b237577d76)), closes [#1645](https://github.com/davidsneighbour/samui-samui.de/issues/1645)

### Test

* add Vitest test runner ([a7eec11](https://github.com/davidsneighbour/samui-samui.de/commit/a7eec11306327f6f0083d620c3151d8db0bae75b)), closes [#904](https://github.com/davidsneighbour/samui-samui.de/issues/904) [#905](https://github.com/davidsneighbour/samui-samui.de/issues/905)

### Build

* **deps-dev:** bump cspell from 9.3.2 to 10.0.1 ([#921](https://github.com/davidsneighbour/samui-samui.de/issues/921)) ([462af95](https://github.com/davidsneighbour/samui-samui.de/commit/462af9522193a6faf6c624fbfcd464941c961e46))
* **deps-dev:** bump sharp from 0.34.5 to 0.35.3 ([#918](https://github.com/davidsneighbour/samui-samui.de/issues/918)) ([a80825e](https://github.com/davidsneighbour/samui-samui.de/commit/a80825e78611cd23cfd50ab703b26626fadb1821))
* **deps-dev:** bump wireit from 0.14.12 to 0.14.13 ([#919](https://github.com/davidsneighbour/samui-samui.de/issues/919)) ([1ea780a](https://github.com/davidsneighbour/samui-samui.de/commit/1ea780a783a8868c80104c88dc8d61fa7341b366))
* **deps:** align runtime with Node 26 ([f54365d](https://github.com/davidsneighbour/samui-samui.de/commit/f54365db058533d2db2d656d914ed0d8e8e5f6fa)), closes [#1644](https://github.com/davidsneighbour/samui-samui.de/issues/1644)
* **deps:** bump @astrojs/react from 5.0.7 to 6.0.1 ([#922](https://github.com/davidsneighbour/samui-samui.de/issues/922)) ([d9de84f](https://github.com/davidsneighbour/samui-samui.de/commit/d9de84f915a589ed1a656255e1c68163caa1f986))
* **deps:** bump @pagefind/default-ui from 1.4.0 to 1.5.2 ([#925](https://github.com/davidsneighbour/samui-samui.de/issues/925)) ([ff87bfd](https://github.com/davidsneighbour/samui-samui.de/commit/ff87bfd3a0416a7435ee9c93364d1e95e825ceea))
* **deps:** bump @tailwindcss/vite from 4.1.17 to 4.3.2 ([#924](https://github.com/davidsneighbour/samui-samui.de/issues/924)) ([bdfdbc4](https://github.com/davidsneighbour/samui-samui.de/commit/bdfdbc45df49fcb45048287dc61e0ebc6179aebd))
* **deps:** bump tailwindcss from 4.1.17 to 4.3.2 ([#923](https://github.com/davidsneighbour/samui-samui.de/issues/923)) ([01094ef](https://github.com/davidsneighbour/samui-samui.de/commit/01094ef5b9ed05f32571d4e57b33aedd9f7e05ac))
* **deps:** update dependencies ([fffd30b](https://github.com/davidsneighbour/samui-samui.de/commit/fffd30b178912ba48dc35175561835a65a5be7ef))
* **fix:** remove verbosity from default scripts ([0c005b6](https://github.com/davidsneighbour/samui-samui.de/commit/0c005b6bae1a20dcada34747408d85a71bbef6bb))
* **fix:** update used node version ([786f5d5](https://github.com/davidsneighbour/samui-samui.de/commit/786f5d5f23d7dc6084c384b051ed0c1909eebed3))
* **ts:** switch tsconfig to shared @dnbhq/tsconfig/astro preset ([6879fbe](https://github.com/davidsneighbour/samui-samui.de/commit/6879fbeb60883dd945140a681848801669385f43))

### Chore

* align quality gate script names ([088230f](https://github.com/davidsneighbour/samui-samui.de/commit/088230f67e9c9a839a35807d827c81f0fe4deaa8)), closes [#1231](https://github.com/davidsneighbour/samui-samui.de/issues/1231)
* close out interface audit tracking file ([1d4c540](https://github.com/davidsneighbour/samui-samui.de/commit/1d4c5406ace2ada56a342642d2378db3a0b5b649))
* **content:** flag posts with flickr indicators in publisher frontmatter ([da57784](https://github.com/davidsneighbour/samui-samui.de/commit/da57784642c09e6bb8beb8468b3f293bc43b4e0b))
* **data:** remove obsolete Hugo config from data/dnb ([ba6b99d](https://github.com/davidsneighbour/samui-samui.de/commit/ba6b99d7aaccd419e19e075d37b0e15769986105))
* **deps:** add @dnbhq/tsconfig dependency ([282e6ec](https://github.com/davidsneighbour/samui-samui.de/commit/282e6eca4d81eb81d39ec298850905475294f4e7))
* **dev:** ignore scratch watcher changes ([47b3156](https://github.com/davidsneighbour/samui-samui.de/commit/47b31563c2b3d694fcda7709eace4f60a40fa15b)), closes [#1351](https://github.com/davidsneighbour/samui-samui.de/issues/1351)
* **editor:** disable workspace color overrides ([e8f9e0c](https://github.com/davidsneighbour/samui-samui.de/commit/e8f9e0cea00e7c6365ae74a8ee8fa6afb1148dcb))
* exclude AI agent/skill tooling dirs from format and markdown lint ([b1f4b4b](https://github.com/davidsneighbour/samui-samui.de/commit/b1f4b4bf53848dce71833a7cb377667daddba8c2)), closes [#1647](https://github.com/davidsneighbour/samui-samui.de/issues/1647)
* ignore auto-installed impeccable plugin skill/hook mirrors ([20a3d1f](https://github.com/davidsneighbour/samui-samui.de/commit/20a3d1f815dd1c11508e09a5a336365b140278c2))
* keep package manifest out of biome ([56c396d](https://github.com/davidsneighbour/samui-samui.de/commit/56c396daf3136fb7a810a42277e4283d916e3f35)), closes [#899](https://github.com/davidsneighbour/samui-samui.de/issues/899)
* **lint:** onboard content link checks ([dc9bb5d](https://github.com/davidsneighbour/samui-samui.de/commit/dc9bb5ded17c2d3c939ee4ce3f2a6f769c0ff3c0)), closes [#1304](https://github.com/davidsneighbour/samui-samui.de/issues/1304)
* move osv ledger to ai/reports ([118e213](https://github.com/davidsneighbour/samui-samui.de/commit/118e213db6806ff02f661920449a9823768f180e))
* **project:** update project plan ([fdfa197](https://github.com/davidsneighbour/samui-samui.de/commit/fdfa1977fee776cf74c80c82e8fd9d7beaefbcb9)), closes [1227/#1228](https://github.com/davidsneighbour/samui-samui.de/issues/1228) [#1230](https://github.com/davidsneighbour/samui-samui.de/issues/1230) [#1231](https://github.com/davidsneighbour/samui-samui.de/issues/1231) [#1232](https://github.com/davidsneighbour/samui-samui.de/issues/1232) [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927) [#1229](https://github.com/davidsneighbour/samui-samui.de/issues/1229) [#1648](https://github.com/davidsneighbour/samui-samui.de/issues/1648) [#1649](https://github.com/davidsneighbour/samui-samui.de/issues/1649) [#1650](https://github.com/davidsneighbour/samui-samui.de/issues/1650) [#1651](https://github.com/davidsneighbour/samui-samui.de/issues/1651) [#1652](https://github.com/davidsneighbour/samui-samui.de/issues/1652) [#1653](https://github.com/davidsneighbour/samui-samui.de/issues/1653) [#1654](https://github.com/davidsneighbour/samui-samui.de/issues/1654) [#1655](https://github.com/davidsneighbour/samui-samui.de/issues/1655)
* **project:** update project plan ([702d9d6](https://github.com/davidsneighbour/samui-samui.de/commit/702d9d63c480042f2569a1a7952c00ccff9b6f5a)), closes [#928](https://github.com/davidsneighbour/samui-samui.de/issues/928)
* **project:** update project plan ([ac21aef](https://github.com/davidsneighbour/samui-samui.de/commit/ac21aef0221077e4f89c16cfd9f5b92593121caa)), closes [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915) [903-#917](https://github.com/davidsneighbour/samui-samui.de/issues/917)
* **project:** update project plan ([218fc65](https://github.com/davidsneighbour/samui-samui.de/commit/218fc6556a4429148eeb14c4b33938fbb01b6e3b)), closes [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916) [#928](https://github.com/davidsneighbour/samui-samui.de/issues/928) [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916) [#928](https://github.com/davidsneighbour/samui-samui.de/issues/928) [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915)
* **project:** update project plan ([a8cb504](https://github.com/davidsneighbour/samui-samui.de/commit/a8cb504d535bc35048df9daa435046b55d78f799)), closes [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917) [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915) [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916)
* **project:** update project plan ([0b0d953](https://github.com/davidsneighbour/samui-samui.de/commit/0b0d953580c3de0652a7240180d2a1f4ee6f3668)), closes [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926)
* **project:** update project plan ([a6ee9ae](https://github.com/davidsneighbour/samui-samui.de/commit/a6ee9ae89162ce244bf7bc2a25ab49328221e152)), closes [#920](https://github.com/davidsneighbour/samui-samui.de/issues/920) [#927](https://github.com/davidsneighbour/samui-samui.de/issues/927)
* **project:** update project plan ([e33e2ea](https://github.com/davidsneighbour/samui-samui.de/commit/e33e2ea79658586b5e779b881f0accb544df44a8)), closes [#910](https://github.com/davidsneighbour/samui-samui.de/issues/910) [#911](https://github.com/davidsneighbour/samui-samui.de/issues/911) [#913](https://github.com/davidsneighbour/samui-samui.de/issues/913) [#914](https://github.com/davidsneighbour/samui-samui.de/issues/914) [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915) [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916) [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917) [910/#911](https://github.com/davidsneighbour/samui-samui.de/issues/911)
* **project:** update project plan ([5832c2e](https://github.com/davidsneighbour/samui-samui.de/commit/5832c2e2207bfa57b1d94670e017cb01faea18de)), closes [#910](https://github.com/davidsneighbour/samui-samui.de/issues/910) [#911](https://github.com/davidsneighbour/samui-samui.de/issues/911) [#913](https://github.com/davidsneighbour/samui-samui.de/issues/913) [#914](https://github.com/davidsneighbour/samui-samui.de/issues/914) [#915](https://github.com/davidsneighbour/samui-samui.de/issues/915) [#916](https://github.com/davidsneighbour/samui-samui.de/issues/916) [#917](https://github.com/davidsneighbour/samui-samui.de/issues/917) [903-#909](https://github.com/davidsneighbour/samui-samui.de/issues/909) [#912](https://github.com/davidsneighbour/samui-samui.de/issues/912) [913/#914](https://github.com/davidsneighbour/samui-samui.de/issues/914) [#898](https://github.com/davidsneighbour/samui-samui.de/issues/898) [#926](https://github.com/davidsneighbour/samui-samui.de/issues/926) [#887](https://github.com/davidsneighbour/samui-samui.de/issues/887)
* **sound:** move Cuelume package into source ([79737fb](https://github.com/davidsneighbour/samui-samui.de/commit/79737fbe26513b9e016f4a85fa53e005b1b5f457)), closes [#1567](https://github.com/davidsneighbour/samui-samui.de/issues/1567)
* sync src/packages/*.jsonc after Dependabot merges ([3a1693f](https://github.com/davidsneighbour/samui-samui.de/commit/3a1693fd81f0f33b71f37c567b43b774ba75ea68)), closes [#918](https://github.com/davidsneighbour/samui-samui.de/issues/918) [#919](https://github.com/davidsneighbour/samui-samui.de/issues/919) [#921](https://github.com/davidsneighbour/samui-samui.de/issues/921) [#922](https://github.com/davidsneighbour/samui-samui.de/issues/922) [#923](https://github.com/davidsneighbour/samui-samui.de/issues/923) [924/#925](https://github.com/davidsneighbour/samui-samui.de/issues/925)
* update dependabot cooldown config ([680d49c](https://github.com/davidsneighbour/samui-samui.de/commit/680d49c4bd4d9e02decc40c81a5d8c59a4198512)), closes [#900](https://github.com/davidsneighbour/samui-samui.de/issues/900)

## [2.4.0](https://github.com/davidsneighbour/samui-samui.de/compare/v2.3.0...v2.4.0) (2026-07-19)

### Content

* **posts:** replace raw YouTube embeds with dnb-youtube ([cfccb78](https://github.com/davidsneighbour/samui-samui.de/commit/cfccb78e07a5df10d665dea844d413d1ae3dd796)), closes [#893](https://github.com/davidsneighbour/samui-samui.de/issues/893)

### Feat

* **components:** add lazy-loading Vimeo embed ([aae042f](https://github.com/davidsneighbour/samui-samui.de/commit/aae042f8b33b2b15e4bc7c95ed64a03d602a4e9d)), closes [#888](https://github.com/davidsneighbour/samui-samui.de/issues/888)
* **components:** add lazy-loading YouTube embed ([4a29548](https://github.com/davidsneighbour/samui-samui.de/commit/4a29548c7b132c846237cb4d1b4728f15ad0e81b)), closes [#888](https://github.com/davidsneighbour/samui-samui.de/issues/888) [#889](https://github.com/davidsneighbour/samui-samui.de/issues/889) [#890](https://github.com/davidsneighbour/samui-samui.de/issues/890) [#892](https://github.com/davidsneighbour/samui-samui.de/issues/892)

### Fix

* **components:** give dnb-vimeo placeholder a real src ([fa94faa](https://github.com/davidsneighbour/samui-samui.de/commit/fa94faafd5139e81b2aa636f957ae1b83150657d)), closes [#889](https://github.com/davidsneighbour/samui-samui.de/issues/889)
* **header:** link masthead tagline home ([5ebc0a9](https://github.com/davidsneighbour/samui-samui.de/commit/5ebc0a9348dd10376fe83b2115ef5d3a575f5fc8))

### Perf

* **components:** only load dnb-vimeo script on posts that use it ([b5b6fef](https://github.com/davidsneighbour/samui-samui.de/commit/b5b6fef186c178fcd118ca342369e711f4406f0b)), closes [#890](https://github.com/davidsneighbour/samui-samui.de/issues/890)

### Docs

* document the Vimeo embed component ([c14d528](https://github.com/davidsneighbour/samui-samui.de/commit/c14d528a609b7cbae6c0a35efa1b4443649945eb)), closes [#891](https://github.com/davidsneighbour/samui-samui.de/issues/891)
* document the YouTube embed component ([bae59e2](https://github.com/davidsneighbour/samui-samui.de/commit/bae59e247b81d8a89fed794345215823b661443e)), closes [#894](https://github.com/davidsneighbour/samui-samui.de/issues/894)

### Chore

* **giscus:** restrict dev origins to https ([aeeeb01](https://github.com/davidsneighbour/samui-samui.de/commit/aeeeb014299d164bedf76340b59418f99c71efce))

## [2.3.0](https://github.com/davidsneighbour/samui-samui.de/compare/v2.2.0...v2.3.0) (2026-07-19)

### Feat

* **comments:** add Samui Giscus theme ([822dbef](https://github.com/davidsneighbour/samui-samui.de/commit/822dbef3954c702c299bc70c453eacede0236550)), closes [#887](https://github.com/davidsneighbour/samui-samui.de/issues/887)

### Docs

* **privacy:** reconcile privacy policy with actual site behavior ([f9412eb](https://github.com/davidsneighbour/samui-samui.de/commit/f9412eb2cff414729b6f33bc492c516436c2439a))
* **privacy:** remove stale Google Maps sections ([145d204](https://github.com/davidsneighbour/samui-samui.de/commit/145d204e94340585b50fb385401246185b11c859)), closes [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721)
* **readme:** add architecture overview ([67b0b84](https://github.com/davidsneighbour/samui-samui.de/commit/67b0b84ebeede99fdbdf83c5870f04125668388a)), closes [#885](https://github.com/davidsneighbour/samui-samui.de/issues/885)
* **readme:** document production setup steps ([ef866bb](https://github.com/davidsneighbour/samui-samui.de/commit/ef866bb4ad25bcd05110664bbf057c7a23bbbe9e)), closes [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723)
* **readme:** expand local command reference ([cb64df3](https://github.com/davidsneighbour/samui-samui.de/commit/cb64df362fb00c178ff5677051dad833b2dd27bc)), closes [#884](https://github.com/davidsneighbour/samui-samui.de/issues/884)
* **readme:** link status badges ([d52e3cc](https://github.com/davidsneighbour/samui-samui.de/commit/d52e3cc8be32682d82c1d6edd9184c8ad4131ccd)), closes [#886](https://github.com/davidsneighbour/samui-samui.de/issues/886)
* **readme:** polish badges and content notes ([d1c668f](https://github.com/davidsneighbour/samui-samui.de/commit/d1c668f8652556eec23605dc5fd554b9c9877d6c)), closes [#886](https://github.com/davidsneighbour/samui-samui.de/issues/886)
* **readme:** tighten command tables ([981273c](https://github.com/davidsneighbour/samui-samui.de/commit/981273c2339ab92ee7fba95bdc341032388af715)), closes [#884](https://github.com/davidsneighbour/samui-samui.de/issues/884)
* **readme:** trim setup introduction ([856391a](https://github.com/davidsneighbour/samui-samui.de/commit/856391ac9cc20396087dadc47a48992caba4da23)), closes [#885](https://github.com/davidsneighbour/samui-samui.de/issues/885)

### Chore

* **project:** update project plan ([50ffa5a](https://github.com/davidsneighbour/samui-samui.de/commit/50ffa5ab05f827b497dfc3704fe26d613aa2e197)), closes [#887](https://github.com/davidsneighbour/samui-samui.de/issues/887)
* **vscode:** nest components.json and giscus.json under astro.config.ts ([b0549a4](https://github.com/davidsneighbour/samui-samui.de/commit/b0549a4346fa77a49ca0496c27be6286933d64e8))

## [2.2.0](https://github.com/davidsneighbour/samui-samui.de/compare/v2.1.0...v2.2.0) (2026-07-18)

### Feat

* **contact:** replace Google reCAPTCHA with Cloudflare Turnstile ([1b9dea5](https://github.com/davidsneighbour/samui-samui.de/commit/1b9dea58109ce17334fef4d9200e23a3848df133)), closes [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722)

### Docs

* **privacy:** link Cloudflare's Turnstile-specific privacy policy ([36983a7](https://github.com/davidsneighbour/samui-samui.de/commit/36983a7d32becdd5b030e4c875aa22a7fa76fd9d))

## [2.1.0](https://github.com/davidsneighbour/samui-samui.de/compare/v2.0.0...v2.1.0) (2026-07-18)

### Feat

* **release:** add content(new)/content(fix) release scopes ([f3b764e](https://github.com/davidsneighbour/samui-samui.de/commit/f3b764e385b958a01563e50ac171f2b7c1a8fd4e))

## [2.0.0](https://github.com/davidsneighbour/samui-samui.de/compare/v1.2024.7...v2.0.0) (2026-07-18)

### Feat

* add 404 page, confirm no real redirects to port ([07c2588](https://github.com/davidsneighbour/samui-samui.de/commit/07c2588e678d0d87e7de15824305a7e2c5e24d4e)), closes [#703](https://github.com/davidsneighbour/samui-samui.de/issues/703)
* add bundled blog cover images ([2f4dccb](https://github.com/davidsneighbour/samui-samui.de/commit/2f4dccbff0b2ea69294e4acbe718d06980cc7201)), closes [#727](https://github.com/davidsneighbour/samui-samui.de/issues/727)
* add Matomo analytics widget ([#704](https://github.com/davidsneighbour/samui-samui.de/issues/704)) ([74cef32](https://github.com/davidsneighbour/samui-samui.de/commit/74cef32dd64cfe3b01f0ab59edea640ef4136ab5))
* add new blog post script ([20ad8d4](https://github.com/davidsneighbour/samui-samui.de/commit/20ad8d420623ffd3b1b3fd2e3338324049672291)), closes [#726](https://github.com/davidsneighbour/samui-samui.de/issues/726)
* add OpenSearch descriptor, fix search deep-linking ([#704](https://github.com/davidsneighbour/samui-samui.de/issues/704)) ([84075cb](https://github.com/davidsneighbour/samui-samui.de/commit/84075cbc97c9082ec29297c969ac46269c39caa9))
* add PWA manifest link and giscus comments ([#704](https://github.com/davidsneighbour/samui-samui.de/issues/704)) ([5b2d6e6](https://github.com/davidsneighbour/samui-samui.de/commit/5b2d6e6515e7f13eef4d6addd8860fd69b2ef12a))
* add social sharing, close out [#704](https://github.com/davidsneighbour/samui-samui.de/issues/704) widgets/embeds parity ([ccb515a](https://github.com/davidsneighbour/samui-samui.de/commit/ccb515ad6d756d75a4fc41be311ce69bccef6c81)), closes [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715)
* add theme toggle ([7f5b652](https://github.com/davidsneighbour/samui-samui.de/commit/7f5b65264ee9f1e66889933beb7c5a8d3b6c5d5a)), closes [#740](https://github.com/davidsneighbour/samui-samui.de/issues/740)
* **analytics:** add DNT/cookieless options and noscript fallback to Matomo ([57b089b](https://github.com/davidsneighbour/samui-samui.de/commit/57b089b6294a2d24d482c146e4c3932b002dc7b9))
* **blog:** add adjacent post navigation ([4664b1f](https://github.com/davidsneighbour/samui-samui.de/commit/4664b1fb0fa9ac7b36422ec246a03fd6ade175bd)), closes [#728](https://github.com/davidsneighbour/samui-samui.de/issues/728)
* **blog:** feature first homepage preview ([be23ea5](https://github.com/davidsneighbour/samui-samui.de/commit/be23ea52135a542f9dd517a67f28f7c0733d0af9)), closes [#730](https://github.com/davidsneighbour/samui-samui.de/issues/730)
* **blog:** show summaries on list pages ([0600958](https://github.com/davidsneighbour/samui-samui.de/commit/06009583dc5c02a529181980ea283612d510ae2a)), closes [#729](https://github.com/davidsneighbour/samui-samui.de/issues/729)
* build archive page routes ([5375531](https://github.com/davidsneighbour/samui-samui.de/commit/53755315e203399619ce1a44e0401d666aa865ac)), closes [#703](https://github.com/davidsneighbour/samui-samui.de/issues/703) [#700](https://github.com/davidsneighbour/samui-samui.de/issues/700)
* build leute and tags page routes ([22c8d55](https://github.com/davidsneighbour/samui-samui.de/commit/22c8d55a7724fdb10f7b8c3b0b0d5705154f29bd)), closes [#698](https://github.com/davidsneighbour/samui-samui.de/issues/698) [#699](https://github.com/davidsneighbour/samui-samui.de/issues/699) [#697](https://github.com/davidsneighbour/samui-samui.de/issues/697) [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715)
* build top-level static page routes ([b77362f](https://github.com/davidsneighbour/samui-samui.de/commit/b77362fcafcbff8eabc52b0ed7da0a7b26301f92)), closes [#690](https://github.com/davidsneighbour/samui-samui.de/issues/690) [#696](https://github.com/davidsneighbour/samui-samui.de/issues/696) [#702](https://github.com/davidsneighbour/samui-samui.de/issues/702)
* **content:** add publisher frontmatter block + CLI for editorial triage ([2b330f9](https://github.com/davidsneighbour/samui-samui.de/commit/2b330f99fcb714a624fe1278cc1d542a018fa064))
* **content:** render tag links on posts and listings, humanize tag titles ([0ccc75d](https://github.com/davidsneighbour/samui-samui.de/commit/0ccc75de4879ffdf14381044dc890346e9361d8f)), closes [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706) [#699](https://github.com/davidsneighbour/samui-samui.de/issues/699)
* **content:** resolve feiertage/sitewide inventory gap, close [#688](https://github.com/davidsneighbour/samui-samui.de/issues/688) ([07b6fca](https://github.com/davidsneighbour/samui-samui.de/commit/07b6fcaae41aaff7aa5f750574021d7107ea4aef)), closes [#716](https://github.com/davidsneighbour/samui-samui.de/issues/716)
* **deploy:** add security headers and a CSP to netlify.toml ([7065dd8](https://github.com/davidsneighbour/samui-samui.de/commit/7065dd8ea59a85903e1895031dd92862b6a4244a)), closes [#709](https://github.com/davidsneighbour/samui-samui.de/issues/709) [#709](https://github.com/davidsneighbour/samui-samui.de/issues/709)
* **dev:** serve astro dev over HTTPS via mkcert ([84fc44c](https://github.com/davidsneighbour/samui-samui.de/commit/84fc44c939b88b88356002a73dc5b3924b2cea32)), closes [#718](https://github.com/davidsneighbour/samui-samui.de/issues/718)
* **header:** recreate live site's photo-clipped masthead effect ([b7aa35d](https://github.com/davidsneighbour/samui-samui.de/commit/b7aa35d0cd3478319a1c0e2779d50db5ab480c93)), closes [#725](https://github.com/davidsneighbour/samui-samui.de/issues/725)
* implement contact form via Netlify Function ([b8e7936](https://github.com/davidsneighbour/samui-samui.de/commit/b8e79362dffa0cbd1c76770d182a2cb3f40051e1))
* land Astro foundation on main, remove Hugo entirely ([62462b0](https://github.com/davidsneighbour/samui-samui.de/commit/62462b0be67389ce9e9999e32fd3efd7f3c5ecea)), closes [696-#700](https://github.com/davidsneighbour/samui-samui.de/issues/700) [#690](https://github.com/davidsneighbour/samui-samui.de/issues/690) [#707](https://github.com/davidsneighbour/samui-samui.de/issues/707) [#689](https://github.com/davidsneighbour/samui-samui.de/issues/689) [#691](https://github.com/davidsneighbour/samui-samui.de/issues/691) [#696](https://github.com/davidsneighbour/samui-samui.de/issues/696) [#697](https://github.com/davidsneighbour/samui-samui.de/issues/697) [#698](https://github.com/davidsneighbour/samui-samui.de/issues/698) [#699](https://github.com/davidsneighbour/samui-samui.de/issues/699) [#700](https://github.com/davidsneighbour/samui-samui.de/issues/700)
* restore legacy static assets, fix starter-template leftovers ([1f4f98f](https://github.com/davidsneighbour/samui-samui.de/commit/1f4f98fb681431d6cbb0b1c674ff9473fb42339f)), closes [#708](https://github.com/davidsneighbour/samui-samui.de/issues/708) [#704](https://github.com/davidsneighbour/samui-samui.de/issues/704) [#701](https://github.com/davidsneighbour/samui-samui.de/issues/701)
* **theme:** restyle site to match old identity, adopt shadcn/ui design system ([a7d1126](https://github.com/davidsneighbour/samui-samui.de/commit/a7d1126fc8aace72747f6d2445d30c9864178075)), closes [#716](https://github.com/davidsneighbour/samui-samui.de/issues/716) [#701](https://github.com/davidsneighbour/samui-samui.de/issues/701)
* **ui:** add site-wide under-construction banner ([13cc957](https://github.com/davidsneighbour/samui-samui.de/commit/13cc957ebed08053ca510ac6227b6f8fcb0e1abc)), closes [#724](https://github.com/davidsneighbour/samui-samui.de/issues/724)
* **ui:** render tags as badges ([a45d1b8](https://github.com/davidsneighbour/samui-samui.de/commit/a45d1b89244c0c03000725d4771503222789534f))
* **ui:** use lucide icons in pagination ([eaf6706](https://github.com/davidsneighbour/samui-samui.de/commit/eaf670664f80f29ee9fe793b7e9773b364dc8054))

### Fix

* **a11y:** add autocomplete attributes to contact form fields ([48b024c](https://github.com/davidsneighbour/samui-samui.de/commit/48b024ca6f150f0a22b31c87ed00f1604c8d18cf)), closes [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706)
* **a11y:** style the contact form's fields and submit button ([1e158df](https://github.com/davidsneighbour/samui-samui.de/commit/1e158dfefe418cc18a186691e97a29987bc03304)), closes [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706)
* add multiple local ports to giscus.json ([c90cb8d](https://github.com/davidsneighbour/samui-samui.de/commit/c90cb8d7ab702a90d6283815c302ea93a5570d9d))
* **config:** use full repository URL for changelog link generation ([8ef76ed](https://github.com/davidsneighbour/samui-samui.de/commit/8ef76ed9de4422ea3f8fcbf96d7762f8b4928caa))
* **content:** convert 4 dead WordPress-era video embeds to iframes ([04200dd](https://github.com/davidsneighbour/samui-samui.de/commit/04200dd74aacc5588338f1c54b994c94592129f6)), closes [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715) [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706)
* **content:** correct The White Lotus Trailer post's front matter ([0957c36](https://github.com/davidsneighbour/samui-samui.de/commit/0957c360c33b112fb0a22d9687b2950156785d99)), closes [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706)
* **content:** format dates in German, add an extended date+time variant ([f644b7c](https://github.com/davidsneighbour/samui-samui.de/commit/f644b7c050f6d9b4fcfed154714e66f991e4a9a2))
* **content:** remove duplicate tags key in front matter ([58a19c5](https://github.com/davidsneighbour/samui-samui.de/commit/58a19c565a6f55dd4ca8400297b2131d4d6eb428))
* **content:** remove Google Analytics and AdSense references ([c385626](https://github.com/davidsneighbour/samui-samui.de/commit/c385626de79586dec8b44ce6a77f21211a5355bf)), closes [#709](https://github.com/davidsneighbour/samui-samui.de/issues/709) [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721)
* **content:** remove Google Analytics and AdSense sections from privacy policy ([9ede502](https://github.com/davidsneighbour/samui-samui.de/commit/9ede502b7e6597fa0c7eac01abf4bca65b00c7b6)), closes [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721)
* **content:** show full post content in the home/list feed, not just title+date ([042a66d](https://github.com/davidsneighbour/samui-samui.de/commit/042a66d407348b363be1a8f3d697eae0be117554))
* **deps:** resolve 45 OSV-flagged transitive dependency vulnerabilities ([1d42087](https://github.com/davidsneighbour/samui-samui.de/commit/1d42087ba099d09d2ab0d38e95a4ff087bcd7ccb))
* **footer:** update copyright line ([6b07eb1](https://github.com/davidsneighbour/samui-samui.de/commit/6b07eb16d92dada5d2ff6d01fe1bb2c5985a2d34)), closes [#734](https://github.com/davidsneighbour/samui-samui.de/issues/734)
* header description font changes ([d816f2c](https://github.com/davidsneighbour/samui-samui.de/commit/d816f2cd1a893115c48b212fe899fb329158ad14))
* improve light masthead contrast ([773d9cd](https://github.com/davidsneighbour/samui-samui.de/commit/773d9cd3203573c5b778e2ad37ef800e41a863eb)), closes [#740](https://github.com/davidsneighbour/samui-samui.de/issues/740)
* **lint:** exclude CHANGELOG.md from markdownlint ([3243fb2](https://github.com/davidsneighbour/samui-samui.de/commit/3243fb2e0bf1881e8ff97a6d55bfb8bba41a656c))
* remove unused header images ([b3351c5](https://github.com/davidsneighbour/samui-samui.de/commit/b3351c5f92f0b7bac6e6ad95fa693549351923da))
* **theme:** style the tag/leute page title above BlogList's card ([07e2fb3](https://github.com/davidsneighbour/samui-samui.de/commit/07e2fb3d1bb3898a1dcc9db37525ffbea374c271)), closes [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706)
* **ui:** remove post list separators ([21d31bd](https://github.com/davidsneighbour/samui-samui.de/commit/21d31bd6988c3403054c74839e567316fda91795))
* update giscus setup values ([ba2692a](https://github.com/davidsneighbour/samui-samui.de/commit/ba2692ab0b3a5d1d5ebf3304dc8904f5df1f7723)), closes [#704](https://github.com/davidsneighbour/samui-samui.de/issues/704)

### Refactor

* **ui:** align post meta content ([a207c13](https://github.com/davidsneighbour/samui-samui.de/commit/a207c13aede25aa820f7e39592d5f59757e09fd9))
* **ui:** extract post title and meta components ([57a1813](https://github.com/davidsneighbour/samui-samui.de/commit/57a181346d5410652c58594dbacaf42d87424367))
* **ui:** replace remaining symbols with lucide icons ([4af2a8e](https://github.com/davidsneighbour/samui-samui.de/commit/4af2a8e00e95446871ceef632df8350142810389))
* **ui:** soften tag badge color ([3eb0768](https://github.com/davidsneighbour/samui-samui.de/commit/3eb076889f6b032bfca441bc9f46997a30744def))

### Docs

* add AGENTS.md, CLAUDE.md, and ROADMAP.md ([b080b1a](https://github.com/davidsneighbour/samui-samui.de/commit/b080b1a365264a00ca625986f2482b98a8656359)), closes [#686](https://github.com/davidsneighbour/samui-samui.de/issues/686)
* add HUGO-COMPATIBILITY.md, since apparently we need it now ([fc3e7c8](https://github.com/davidsneighbour/samui-samui.de/commit/fc3e7c8a311b9dbfb3f93ba3abd48cc0f4d208e1))
* **agents:** clarify that agents must commit autonomously ([24ba520](https://github.com/davidsneighbour/samui-samui.de/commit/24ba520d658f2bbc4da4e6f4701605a40126d492))
* **agents:** require committing workspace config changes ([481ee41](https://github.com/davidsneighbour/samui-samui.de/commit/481ee41f1ee7bc9886036b5d787b249734701ad0)), closes [#710](https://github.com/davidsneighbour/samui-samui.de/issues/710)
* **agents:** require linking issue numbers in agent output ([195266b](https://github.com/davidsneighbour/samui-samui.de/commit/195266b6cd1e2ad29da70406731e331b404f06b4)), closes [#123](https://github.com/davidsneighbour/samui-samui.de/issues/123) [#687](https://github.com/davidsneighbour/samui-samui.de/issues/687)
* bootstrap Astro migration project ([aa4902c](https://github.com/davidsneighbour/samui-samui.de/commit/aa4902c74d0b6a3835b0da4a68629e68674ab4c9)), closes [#689](https://github.com/davidsneighbour/samui-samui.de/issues/689) [#688](https://github.com/davidsneighbour/samui-samui.de/issues/688) [#689](https://github.com/davidsneighbour/samui-samui.de/issues/689) [#690](https://github.com/davidsneighbour/samui-samui.de/issues/690) [#691](https://github.com/davidsneighbour/samui-samui.de/issues/691) [#692](https://github.com/davidsneighbour/samui-samui.de/issues/692) [#693](https://github.com/davidsneighbour/samui-samui.de/issues/693) [#694](https://github.com/davidsneighbour/samui-samui.de/issues/694) [#695](https://github.com/davidsneighbour/samui-samui.de/issues/695) [#696](https://github.com/davidsneighbour/samui-samui.de/issues/696) [#697](https://github.com/davidsneighbour/samui-samui.de/issues/697) [#698](https://github.com/davidsneighbour/samui-samui.de/issues/698) [#699](https://github.com/davidsneighbour/samui-samui.de/issues/699) [#700](https://github.com/davidsneighbour/samui-samui.de/issues/700) [#701](https://github.com/davidsneighbour/samui-samui.de/issues/701) [#702](https://github.com/davidsneighbour/samui-samui.de/issues/702) [#703](https://github.com/davidsneighbour/samui-samui.de/issues/703) [#704](https://github.com/davidsneighbour/samui-samui.de/issues/704) [#705](https://github.com/davidsneighbour/samui-samui.de/issues/705) [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706) [#707](https://github.com/davidsneighbour/samui-samui.de/issues/707) [#708](https://github.com/davidsneighbour/samui-samui.de/issues/708) [#709](https://github.com/davidsneighbour/samui-samui.de/issues/709)
* clarify giscus config location ([c2b8535](https://github.com/davidsneighbour/samui-samui.de/commit/c2b853517588cd38ba3f23f831a0092018cc029f)), closes [#743](https://github.com/davidsneighbour/samui-samui.de/issues/743)
* close out the Astro migration project ([2faab74](https://github.com/davidsneighbour/samui-samui.de/commit/2faab74b3f98c222c99bfdf96d54d0e953570cf6)), closes [#691](https://github.com/davidsneighbour/samui-samui.de/issues/691) [#692](https://github.com/davidsneighbour/samui-samui.de/issues/692) [#693](https://github.com/davidsneighbour/samui-samui.de/issues/693) [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723)
* **design:** adopt design.md as the design-token source of truth ([80f2137](https://github.com/davidsneighbour/samui-samui.de/commit/80f21371148ce3624735b1b50d97baef0f1ce6ac))
* mark [#688](https://github.com/davidsneighbour/samui-samui.de/issues/688) and [#716](https://github.com/davidsneighbour/samui-samui.de/issues/716) resolved in MIGRATION.status.md ([855aab2](https://github.com/davidsneighbour/samui-samui.de/commit/855aab28764e027b3a116e1ee4ff9f8cafa283a6))
* mark [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715) resolved in MIGRATION.status.md ([b6121db](https://github.com/davidsneighbour/samui-samui.de/commit/b6121db93d264d88ee40fb5dd9af892e1aa65c0f))
* **migration:** close visual parity milestone ([#692](https://github.com/davidsneighbour/samui-samui.de/issues/692), [#705](https://github.com/davidsneighbour/samui-samui.de/issues/705)) ([54a1885](https://github.com/davidsneighbour/samui-samui.de/commit/54a1885077f4c447e29f86b0833880f069fc2268)), closes [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715)
* record [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706) parity pass findings in MIGRATION.status.md ([2b24ebb](https://github.com/davidsneighbour/samui-samui.de/commit/2b24ebb63b0dbb0e42a01eead29a460d5561657b))
* record [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706) route-group parity pass as complete ([5dedfbd](https://github.com/davidsneighbour/samui-samui.de/commit/5dedfbd42e012800bacd5eee72bc9ed403bb6f3e))
* record [#709](https://github.com/davidsneighbour/samui-samui.de/issues/709) closure and today's content/UX fixes in MIGRATION.status.md ([67152a1](https://github.com/davidsneighbour/samui-samui.de/commit/67152a15f80741edf4e396790281ad32a78b226e)), closes [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706) [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720)
* remove completed dnbhq onboarding note from TODO.md ([04c49e8](https://github.com/davidsneighbour/samui-samui.de/commit/04c49e82f33b268171cba76f1eb8f773b8d3dc25)), closes [#711](https://github.com/davidsneighbour/samui-samui.de/issues/711)
* remove duplicate leftover line in ROADMAP.md ([a353b70](https://github.com/davidsneighbour/samui-samui.de/commit/a353b7006da21203ae82e62c8dead555a0cf8923)), closes [#690](https://github.com/davidsneighbour/samui-samui.de/issues/690)
* remove HUGO-COMPATIBILITY.md ([d5b4930](https://github.com/davidsneighbour/samui-samui.de/commit/d5b4930338646e5df9d0253d43d3ca0729e3e539))
* resolve recovered-astro-main adoption decision ([0bdc19c](https://github.com/davidsneighbour/samui-samui.de/commit/0bdc19c98569af72bd878daed3cb549101766125)), closes [#689](https://github.com/davidsneighbour/samui-samui.de/issues/689) [#690](https://github.com/davidsneighbour/samui-samui.de/issues/690)
* sync MIGRATION.status.md summary with its own detail table ([0062ab3](https://github.com/davidsneighbour/samui-samui.de/commit/0062ab3f764f04e4d3c11145de478c4b7a5545ec)), closes [703/#704](https://github.com/davidsneighbour/samui-samui.de/issues/704)
* sync tracking files with [#702](https://github.com/davidsneighbour/samui-samui.de/issues/702)/[#704](https://github.com/davidsneighbour/samui-samui.de/issues/704) closure and [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706) progress ([aeb5ef2](https://github.com/davidsneighbour/samui-samui.de/commit/aeb5ef28e79cf16d4771dae0eed7b413f14649f9)), closes [#692](https://github.com/davidsneighbour/samui-samui.de/issues/692)
* track manual deployment setup steps in MIGRATION.md ([9dc3c7b](https://github.com/davidsneighbour/samui-samui.de/commit/9dc3c7b187ccf005cb211b4fd0287d00b041817b)), closes [#702](https://github.com/davidsneighbour/samui-samui.de/issues/702) [#709](https://github.com/davidsneighbour/samui-samui.de/issues/709) [#702](https://github.com/davidsneighbour/samui-samui.de/issues/702) [#709](https://github.com/davidsneighbour/samui-samui.de/issues/709)
* update [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715) status in MIGRATION.status.md ([2ab0c97](https://github.com/davidsneighbour/samui-samui.de/commit/2ab0c97bf57299458c572629f50c077edb4c1468))
* update AGENTS.md, README.md, CLAUDE.md, TODO.md for post-migration state ([e647173](https://github.com/davidsneighbour/samui-samui.de/commit/e6471733d4b8dcb28babfd864a7cf2608ac9b36d))
* update migration tracking for [#701](https://github.com/davidsneighbour/samui-samui.de/issues/701)/[#703](https://github.com/davidsneighbour/samui-samui.de/issues/703) closure, file [#716](https://github.com/davidsneighbour/samui-samui.de/issues/716) ([b6947e2](https://github.com/davidsneighbour/samui-samui.de/commit/b6947e22a2769111fc3d46c2845009c25fe88c1e))
* update migration tracking for asset restoration ([adbb745](https://github.com/davidsneighbour/samui-samui.de/commit/adbb745966ecdfefc21c466f4fe749f969c2eef9)), closes [#701](https://github.com/davidsneighbour/samui-samui.de/issues/701)
* update migration tracking for the contact form, fix TODO.md links ([7c962d2](https://github.com/davidsneighbour/samui-samui.de/commit/7c962d2637b54231e0c466fbd806793b5694f107)), closes [#702](https://github.com/davidsneighbour/samui-samui.de/issues/702) [#702](https://github.com/davidsneighbour/samui-samui.de/issues/702)
* update migration tracking for the page-route layer ([777baaf](https://github.com/davidsneighbour/samui-samui.de/commit/777baaf2bf4367bccc6e30c1ff18478bd77bc892)), closes [696-#700](https://github.com/davidsneighbour/samui-samui.de/issues/700) [701-#704](https://github.com/davidsneighbour/samui-samui.de/issues/704) [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715) [#696](https://github.com/davidsneighbour/samui-samui.de/issues/696) [#697](https://github.com/davidsneighbour/samui-samui.de/issues/697) [#698](https://github.com/davidsneighbour/samui-samui.de/issues/698) [#699](https://github.com/davidsneighbour/samui-samui.de/issues/699) [#700](https://github.com/davidsneighbour/samui-samui.de/issues/700)
* update roadmap for [#704](https://github.com/davidsneighbour/samui-samui.de/issues/704) closure ([a697213](https://github.com/davidsneighbour/samui-samui.de/commit/a69721320db12f9450ec2b639d5ef7667d8e2f61)), closes [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715)
* update TODO notes and vscode file nesting ([a8e996c](https://github.com/davidsneighbour/samui-samui.de/commit/a8e996c1b303d86dc0b140cb90d7589e5ad4e873))

### Style

* **blog:** add numbered list pagination ([604f7dd](https://github.com/davidsneighbour/samui-samui.de/commit/604f7dd7be37f141f5ac0e67213c46f86ceabdcc)), closes [#733](https://github.com/davidsneighbour/samui-samui.de/issues/733)
* **blog:** enlarge author bio photo ([4e3bde7](https://github.com/davidsneighbour/samui-samui.de/commit/4e3bde7f33f1aa21a94d71c48df67368ffcf4264)), closes [#732](https://github.com/davidsneighbour/samui-samui.de/issues/732)
* **blog:** update list title and read-more styles ([2249300](https://github.com/davidsneighbour/samui-samui.de/commit/22493000fb6662bc69e066250d2580cfc16eac68)), closes [#731](https://github.com/davidsneighbour/samui-samui.de/issues/731)

### Build

* **deps:** bump nanoid from 3.3.11 to 3.3.16 ([#677](https://github.com/davidsneighbour/samui-samui.de/issues/677)) ([19fa3a5](https://github.com/davidsneighbour/samui-samui.de/commit/19fa3a5d3f5e86510116be0ceb158c6094901c5e))
* **deps:** bump pagefind from 1.4.0 to 1.5.2 ([#674](https://github.com/davidsneighbour/samui-samui.de/issues/674)) ([619ac81](https://github.com/davidsneighbour/samui-samui.de/commit/619ac81379485da8335e7c090bcd647cb4f6fbb4))
* **deps:** bump postcss from 8.5.6 to 8.5.19 ([#681](https://github.com/davidsneighbour/samui-samui.de/issues/681)) ([0b85e59](https://github.com/davidsneighbour/samui-samui.de/commit/0b85e59836dea33a9168be4fc2b7a238da3a48a6))
* **deps:** update caniuse-lite ([1342e35](https://github.com/davidsneighbour/samui-samui.de/commit/1342e35e5fa99d6c57f43202fb8f3a0882d5c6e1))
* **deps:** update package-lock.json ([ef9bbf4](https://github.com/davidsneighbour/samui-samui.de/commit/ef9bbf437c3cb1f9894f8979b82393cb3725ecc3))
* **deps:** upgrade astro to 7.1.1, resolve tar and esbuild advisories ([137ad7b](https://github.com/davidsneighbour/samui-samui.de/commit/137ad7b7835bab868696d4c2a9df59f066ba59be)), closes [#748](https://github.com/davidsneighbour/samui-samui.de/issues/748) [#749](https://github.com/davidsneighbour/samui-samui.de/issues/749) [#747](https://github.com/davidsneighbour/samui-samui.de/issues/747) [#748](https://github.com/davidsneighbour/samui-samui.de/issues/748) [#749](https://github.com/davidsneighbour/samui-samui.de/issues/749)
* **fix:** remove workspace config file ([ea89d05](https://github.com/davidsneighbour/samui-samui.de/commit/ea89d05c8ddd9f3c10c9cbd0b293fac98d079d55))
* onboard to dnbhq shared config packages ([319efa4](https://github.com/davidsneighbour/samui-samui.de/commit/319efa4c0ebc34e18df3eee43026b1dc6729cbf9)), closes [#711](https://github.com/davidsneighbour/samui-samui.de/issues/711)
* track .netlify/state.json, ignore the rest of .netlify/ ([705e093](https://github.com/davidsneighbour/samui-samui.de/commit/705e09343e37160034d40dd9ba97cae1ba5346d5))
* **vscode:** drop Hugo-era file-nesting entries, fix lint-staged JSON glob ([5dbe0e6](https://github.com/davidsneighbour/samui-samui.de/commit/5dbe0e654ced14cbe2fa577abc3208f74c0025b2)), closes [#690](https://github.com/davidsneighbour/samui-samui.de/issues/690)
* **vscode:** update workspace configuration ([7a67d72](https://github.com/davidsneighbour/samui-samui.de/commit/7a67d72c332c69be6dd75bd14f7163e936cbe9ea))
* **vscode:** workspace configuration updates ([18e5694](https://github.com/davidsneighbour/samui-samui.de/commit/18e5694cf3e516a53f53989611b39d84294d6ecf)), closes [#710](https://github.com/davidsneighbour/samui-samui.de/issues/710)
* wire lint/format hooks into git and clean up the resulting backlog ([ff9aa5d](https://github.com/davidsneighbour/samui-samui.de/commit/ff9aa5d04018a070dc5ff51bde9e621266d83b60)), closes [#713](https://github.com/davidsneighbour/samui-samui.de/issues/713)

### Chore

* cleanup of some things ([ea63537](https://github.com/davidsneighbour/samui-samui.de/commit/ea63537046b97b93607e58dd65f2e8d5b4d73bbb))
* **deps:** mark tar and esbuild OSV findings as fixed ([595be79](https://github.com/davidsneighbour/samui-samui.de/commit/595be79a575e8742da332dec3d2cc70058114229)), closes [#748](https://github.com/davidsneighbour/samui-samui.de/issues/748) [#749](https://github.com/davidsneighbour/samui-samui.de/issues/749)
* **deps:** remove gomod ecosystem from dependabot config ([2fd3325](https://github.com/davidsneighbour/samui-samui.de/commit/2fd33252056aa0c22f8dd4bc6c77789e007ee241))
* **deps:** triage remaining OSV scan findings ([89626a5](https://github.com/davidsneighbour/samui-samui.de/commit/89626a5b871127a8f40ec249a3097701da7a3d9b)), closes [747-#750](https://github.com/davidsneighbour/samui-samui.de/issues/750)
* **editor:** reformat settings.json and add peacock color theme ([1a6e4db](https://github.com/davidsneighbour/samui-samui.de/commit/1a6e4db3809367ad762bb123c8fc2ff4215f7cde))
* **fix:** getting things to work again with hugo 0.140.0 ([901b808](https://github.com/davidsneighbour/samui-samui.de/commit/901b808682fa4a2da081c154ddfc325adb314c84))
* format theme font declarations ([bf1836e](https://github.com/davidsneighbour/samui-samui.de/commit/bf1836ea5958bbc5ac3741203de2a178c28183c3)), closes [#742](https://github.com/davidsneighbour/samui-samui.de/issues/742)
* **project:** update project plan ([c548dd4](https://github.com/davidsneighbour/samui-samui.de/commit/c548dd47f94053ca0fb2ebb705901be2c3f756c2)), closes [733-#743](https://github.com/davidsneighbour/samui-samui.de/issues/743) [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) [737/#733](https://github.com/davidsneighbour/samui-samui.de/issues/733) [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745) [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720) [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721) [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722) [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723) [#745](https://github.com/davidsneighbour/samui-samui.de/issues/745)
* **project:** update project plan ([ef351a4](https://github.com/davidsneighbour/samui-samui.de/commit/ef351a4d9e78e413dd348c064e98894fea8b11b3)), closes [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720) [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721) [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722) [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723) [#723](https://github.com/davidsneighbour/samui-samui.de/issues/723)
* **project:** update project plan ([ad2ff0e](https://github.com/davidsneighbour/samui-samui.de/commit/ad2ff0e0bfdf7c8972f894c133163d2657773c41)), closes [#691](https://github.com/davidsneighbour/samui-samui.de/issues/691) [#691](https://github.com/davidsneighbour/samui-samui.de/issues/691) [#706](https://github.com/davidsneighbour/samui-samui.de/issues/706) [#708](https://github.com/davidsneighbour/samui-samui.de/issues/708) [#709](https://github.com/davidsneighbour/samui-samui.de/issues/709) [#718](https://github.com/davidsneighbour/samui-samui.de/issues/718) [#720](https://github.com/davidsneighbour/samui-samui.de/issues/720) [#721](https://github.com/davidsneighbour/samui-samui.de/issues/721) [#722](https://github.com/davidsneighbour/samui-samui.de/issues/722) [720/#721](https://github.com/davidsneighbour/samui-samui.de/issues/721)
* **project:** update project plan ([99710e1](https://github.com/davidsneighbour/samui-samui.de/commit/99710e1239f51dfdcb8815e54138d55523956f7b)), closes [715/#716](https://github.com/davidsneighbour/samui-samui.de/issues/716) [#688](https://github.com/davidsneighbour/samui-samui.de/issues/688) [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715) [#716](https://github.com/davidsneighbour/samui-samui.de/issues/716)
* **project:** update project plan ([a26907f](https://github.com/davidsneighbour/samui-samui.de/commit/a26907fd9caa075de450ac271e513aef0cea9cf9)), closes [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) [#718](https://github.com/davidsneighbour/samui-samui.de/issues/718) [#716](https://github.com/davidsneighbour/samui-samui.de/issues/716) [#704](https://github.com/davidsneighbour/samui-samui.de/issues/704) [#716](https://github.com/davidsneighbour/samui-samui.de/issues/716) [#717](https://github.com/davidsneighbour/samui-samui.de/issues/717) [#718](https://github.com/davidsneighbour/samui-samui.de/issues/718) [#715](https://github.com/davidsneighbour/samui-samui.de/issues/715) [717/#718](https://github.com/davidsneighbour/samui-samui.de/issues/718)
* remove .gitmodules ([e0e5ba0](https://github.com/davidsneighbour/samui-samui.de/commit/e0e5ba04f4d949f76d7b6915476709276af3c487))
* remove unused public system bundle ([9bce8ec](https://github.com/davidsneighbour/samui-samui.de/commit/9bce8ecd4bb0cae741dfba1e2083d120d0af7b1b)), closes [#741](https://github.com/davidsneighbour/samui-samui.de/issues/741)
* **vscode:** stop hiding public/ from the file explorer ([d8f09a2](https://github.com/davidsneighbour/samui-samui.de/commit/d8f09a229f01d23f0a10c8cd76a30d21705062fc))

## [1.2024.7](https://github.com/davidsneighbour/samui-samui.de/compare/v1.2024.6…v1.2024.7) (2025-01-10)

## [1.2024.6](https://github.com/davidsneighbour/samui-samui.de/compare/v1.2024.5…v1.2024.6) (2025-01-10)

## [1.2024.5](https://github.com/davidsneighbour/samui-samui.de/compare/v1.2024.4…v1.2024.5) (2025-01-10)

### Chore

* **config:** add release.json to ignored files ([a5ff55a](https://github.com/davidsneighbour/samui-samui.de/commit/a5ff55a475ecf93400bc2ef2ffff78bce9daa89a))
* **config:** fix .nvmrc version ([24828c1](https://github.com/davidsneighbour/samui-samui.de/commit/24828c1f679dd3121f9c03b2a956e30e23cfeddb))
* **config:** move renovate config ([1862f85](https://github.com/davidsneighbour/samui-samui.de/commit/1862f85162026ce0effa8b30dd8ca779de5d72f4))
* **config:** update engine versions ([e0e4d1d](https://github.com/davidsneighbour/samui-samui.de/commit/e0e4d1de485992bf1adf35af73028e241a604f6e))

### Build system

* **dev-deps:** update nanoid to >=3.3.8 ([fd2503e](https://github.com/davidsneighbour/samui-samui.de/commit/fd2503e0797c494662829989443d4f103231c106))
* **fix:** update build commands ([f313a97](https://github.com/davidsneighbour/samui-samui.de/commit/f313a97d36e28e12a7bfc009052d5e979d321eb0))

## [1.2024.4](https://github.com/davidsneighbour/samui-samui.de/compare/v1.2024.3…v1.2024.4) (2024-12-19)

### Content

* **fix:** remove type frontmatter ([7724f28](https://github.com/davidsneighbour/samui-samui.de/commit/7724f284b534944722e9ede076e2dca126bfd13f))
* update archive setup ([c339a6d](https://github.com/davidsneighbour/samui-samui.de/commit/c339a6dda72c655ef60b3421287e594dcc2a6b87))

### Theme

* **fix:** add matomo hook ([23edab8](https://github.com/davidsneighbour/samui-samui.de/commit/23edab810bc93466affb4fd2e6cb118d42aa975e))
* **fix:** init partial ([658baa1](https://github.com/davidsneighbour/samui-samui.de/commit/658baa130fc0a21d9466d55a01a93009237ea010))
* **fix:** move author configuration ([44e9579](https://github.com/davidsneighbour/samui-samui.de/commit/44e9579700461a0399dab6ad4ce2ef9b608eb337))
* **fix:** pagefind setup ([20951df](https://github.com/davidsneighbour/samui-samui.de/commit/20951df3eb2a136504d09c9f70a4eb018d98b031))
* **fix:** pagination and other configuration fixes ([eaf5b70](https://github.com/davidsneighbour/samui-samui.de/commit/eaf5b7025b7643f59f92378736ea69f9161b9d41))
* **fix:** remove algolia setup ([36f7db9](https://github.com/davidsneighbour/samui-samui.de/commit/36f7db997242c32ee8da568d3b7fcfda71594a4b))

### Refactors

* line endings ([3f37267](https://github.com/davidsneighbour/samui-samui.de/commit/3f372673c8ecc3514c3e20fec7be64e7a8da7910))

### Chore

* **cleanup:** remove unused particles ([fb079d0](https://github.com/davidsneighbour/samui-samui.de/commit/fb079d08df20468ae48a0940a60a2538b4f5c307))
* **config:** add pagefind configuration ([ed80b37](https://github.com/davidsneighbour/samui-samui.de/commit/ed80b37b141107637e83a508872adacd9c9a5f2d))
* **config:** disable older posts for faster build on dev ([57ad0e1](https://github.com/davidsneighbour/samui-samui.de/commit/57ad0e1772ac3e48934fd064cf3bdd6dcd5b9a05))
* **config:** fixes to configuration ([c77a02b](https://github.com/davidsneighbour/samui-samui.de/commit/c77a02b7158e30e37e7da1ee73c25762e285f9ab))
* **config:** proper file extension for postcss config ([fba6ca3](https://github.com/davidsneighbour/samui-samui.de/commit/fba6ca3ad14aee0476b749e68cfe9c286a37949a))
* **config:** remove .env.sample ([fbe8130](https://github.com/davidsneighbour/samui-samui.de/commit/fbe813032a8d780a4c9cb5506b577fe41059bccb))
* **config:** update csp setup ([5c0c972](https://github.com/davidsneighbour/samui-samui.de/commit/5c0c972eac6e22cc05148cc90b654defda26a48e))
* **config:** update workspace configuration ([ea0e3a3](https://github.com/davidsneighbour/samui-samui.de/commit/ea0e3a3e3bdf317a284096cc3678e0733d27891d))
* **config:** update workspace configuration ([c1c5c6f](https://github.com/davidsneighbour/samui-samui.de/commit/c1c5c6fe187ab522b15a3acc2f9a8b0071feedce))
* **config:** update workspace configuration ([6100904](https://github.com/davidsneighbour/samui-samui.de/commit/610090435af695a12db32dda496c2a2823cad7ce))
* **deps:** update dependencies ([6241cf7](https://github.com/davidsneighbour/samui-samui.de/commit/6241cf77098c96c36bbaa023747a4e8e51be0cb5))
* **deps:** update dependencies ([e29a2d8](https://github.com/davidsneighbour/samui-samui.de/commit/e29a2d8a8b22862cd817c0fc931110a9e8101ee7))

### Build system

* **deps:** bump @davidsneighbour/bootstrap-config from 2024.3.33 to 2024.3.34 ([#506](https://github.com/davidsneighbour/samui-samui.de/issues/506)) ([87208cb](https://github.com/davidsneighbour/samui-samui.de/commit/87208cb44e7b3edc128f30472ec907cd4adac2c1))
* **deps:** bump @davidsneighbour/commitlint-config from 2024.3.33 to 2024.3.34 ([#503](https://github.com/davidsneighbour/samui-samui.de/issues/503)) ([866bcfd](https://github.com/davidsneighbour/samui-samui.de/commit/866bcfd2e1c567b57b94ffbae28efa7d3a1719a7))
* **deps:** bump @davidsneighbour/release-config from 2024.3.33 to 2024.3.34 ([#500](https://github.com/davidsneighbour/samui-samui.de/issues/500)) ([301ee7d](https://github.com/davidsneighbour/samui-samui.de/commit/301ee7d42d9e269d7912eaaed4d8817470a04741))
* **deps:** bump @davidsneighbour/tools from 2024.3.33 to 2024.3.34 ([#499](https://github.com/davidsneighbour/samui-samui.de/issues/499)) ([0205a4b](https://github.com/davidsneighbour/samui-samui.de/commit/0205a4be9f9916f5c26571b6f4132f76e76803cb))
* **deps:** bump micromatch from 4.0.7 to 4.0.8 ([#508](https://github.com/davidsneighbour/samui-samui.de/issues/508)) ([08395af](https://github.com/davidsneighbour/samui-samui.de/commit/08395af61f05142aacec165991f8fc2b0acb6e91))
* **deps:** bump nanoid in the npm_and_yarn group across 1 directory ([#632](https://github.com/davidsneighbour/samui-samui.de/issues/632)) ([cf73fd2](https://github.com/davidsneighbour/samui-samui.de/commit/cf73fd2da49cec1b05af301fa0768b253e134498))
* **deps:** bump pagefind from 1.1.0 to 1.2.0 ([#611](https://github.com/davidsneighbour/samui-samui.de/issues/611)) ([0a1f347](https://github.com/davidsneighbour/samui-samui.de/commit/0a1f347594c999ca655b9e07bb614f4e4a1af412))
* **deps:** bump postcss from 8.4.42 to 8.4.49 ([#613](https://github.com/davidsneighbour/samui-samui.de/issues/613)) ([690d03a](https://github.com/davidsneighbour/samui-samui.de/commit/690d03a4b73d7e4528b914411f7345f28c423300))
* **deps:** update dependencies ([2e9d074](https://github.com/davidsneighbour/samui-samui.de/commit/2e9d074a4e81ca8e9074c56e6254429fcbea6b83))
* **deps:** update dependencies ([725a938](https://github.com/davidsneighbour/samui-samui.de/commit/725a93868b33a5eacc713e3e775480492809e337))
* **deps:** update dependencies ([be2d686](https://github.com/davidsneighbour/samui-samui.de/commit/be2d686a1feed79127a43ca549f32f35a0edd107))
* **deps:** update dependencies ([bb1d5b5](https://github.com/davidsneighbour/samui-samui.de/commit/bb1d5b51cab4583d3a2427c51e32633d5838702b))
* **deps:** update dependencies ([e036cd9](https://github.com/davidsneighbour/samui-samui.de/commit/e036cd9f1af1cd351f9315413139d84142b97f1a))
* **deps:** update hugo modules ([065a480](https://github.com/davidsneighbour/samui-samui.de/commit/065a4803d58dbcdefc05a710cf94f794d86ec632))
* **fix:** update submodule setup ([aadfae0](https://github.com/davidsneighbour/samui-samui.de/commit/aadfae0abbf3fd4a939c154b5b83fa7c622a4923))

### CI

* **config:** update dependabot setup ([c4c40ec](https://github.com/davidsneighbour/samui-samui.de/commit/c4c40eca63e14ee85d864f4252b85525c511297f))

## [1.2024.3](https://github.com/davidsneighbour/samui-samui.de/compare/v1.2024.2…v1.2024.3) (2024-08-18)

## [1.2024.2](https://github.com/davidsneighbour/samui-samui.de/compare/v1.2024.1…v1.2024.2) (2024-08-18)

### Chore

* **config:** set nvmrc ([765d73d](https://github.com/davidsneighbour/samui-samui.de/commit/765d73d3dbf460e738174c338e0a9cdafaae0cfc))
* **config:** update editor configuration ([c0bf9f2](https://github.com/davidsneighbour/samui-samui.de/commit/c0bf9f2d3f0de57cf0cf7017b93e7521d430fe38))

## [1.2024.1](https://github.com/davidsneighbour/samui-samui.de/compare/v1.2024.0…v1.2024.1) (2024-08-18)

### Chore

* **config:** fix versioning setup ([abe1e49](https://github.com/davidsneighbour/samui-samui.de/commit/abe1e4935c2bfb569612d7b986d2f918365740be))
