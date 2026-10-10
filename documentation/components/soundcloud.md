# SoundCloud replacement

The owner decided in [the media review](https://github.com/davidsneighbour/samui-samui.de/issues/1805) to replace the direct SoundCloud player in `src/content/posts/2018/02/in-der-mitte-des-lebens/index.md` with [the YouTube video supplied in the issue comment](https://github.com/davidsneighbour/samui-samui.de/issues/1805#issuecomment-6097082209). The selected video is `d8TgCmngOqY`, "The Sun’s Gone Dim and the Sky’s Turned Black", by Jóhann Jóhannsson. YouTube’s oEmbed response confirms the title and the artist’s Topic channel; the owner supplied and approved this replacement.

The post uses the existing [`dnb-youtube` component](youtube.md), with an accessible title, a German play label, and a [locally cached poster](../content/video-thumbnail-cache.md). The player connects to `www.youtube-nocookie.com` only after activation. No new component or provider permission is required.

No SoundCloud embeds remain. `public/.htaccess` no longer permits `w.soundcloud.com` in `frame-src`, and the privacy policy no longer describes a SoundCloud integration. Historical outbound SoundCloud links in other posts remain ordinary links.

## Verification

The production build and standard quality gate passed, including 410 tests. A Chromium check against the built article applied the exact CSP from `public/.htaccess`: the poster loaded from a local generated asset, no SoundCloud or YouTube requests occurred on load, hover, or focus, and activation created the selected `youtube-nocookie.com` iframe. The same checks passed after client-side navigation in a fresh browser context. The checks establish component loading and network timing; they do not establish complete playback or provider privacy suitability after activation. Production deployment remains separate.
