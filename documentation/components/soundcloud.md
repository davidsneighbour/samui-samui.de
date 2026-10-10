# SoundCloud audio embed

The archive post `src/content/posts/2018/02/in-der-mitte-des-lebens/index.md` currently contains a direct SoundCloud iframe for track `36535141`. The owner authorised restoring its CSP permission as an interim archive repair, pending [the privacy and media-component review](https://github.com/davidsneighbour/samui-samui.de/issues/1805).

## Current behaviour

The iframe loads `https://w.soundcloud.com/player/` when the article renders. It is not click-to-connect. Its playback and privacy suitability have not been established by adding a CSP permission. The provider's [privacy policy](https://soundcloud.com/pages/privacy) and [cookie policy](https://soundcloud.com/pages/cookies) are the starting points for the review.

`public/.htaccess` permits exactly `https://w.soundcloud.com` in `frame-src`. No SoundCloud host was added to the parent page's `script-src`, `connect-src`, or other directives. The embedded document controls its own subresource requests; the parent page's permission is not a list of every host the player might contact. The privacy policy at `src/pages/kleingedrucktes/datenschutzerklaerung.mdx` discloses this direct-load integration and includes a source comment linking the pending review.

## Required decision

Research player requests, cookies, storage, analytics, and account behaviour. Then retain SoundCloud only through a coordinated shared media component with the site's required privacy behaviour, replace it with a video of the same recording through the existing click-to-connect integration, or remove it. Keep the component, CSP, and privacy policy aligned with the selected behaviour. Remove the SoundCloud permission and disclosure if the site no longer embeds SoundCloud.

## Related archive cleanup

The Reuters image in `src/content/posts/2013/08/angeblich-nur-50-000-liter/index.md` was copied byte-for-byte from its full-size WordPress upload into the post bundle and converted to a Markdown image, preserving its alternative text and Reuters credit. The original upload remains available. The owner removed the Facebook publishing metadata in `src/content/posts/2012/07/somchai-somsak-und-somporn/index.md`; its avatar reference occurred inside that metadata, not in the article body. These resolved entries were removed from [the legacy-markup audit](../content/legacy-markup-audit.md).

Historical prose is preserved under the owner-approved scoped archive-cleanup exception. Content-language findings remain editorial debt; no blanket suppressions or hook configuration changes are introduced. The cleanup commit skips its pre-commit hook invocation after separate validation.

## Validation

The production build and standard quality gate passed, including all 409 tests. A browser check applying the exact configured CSP allowed the SoundCloud iframe with a stubbed provider response; real playback and provider privacy behaviour remain unverified. The bundled Reuters image decoded successfully, generated Astro `srcset` derivatives, and retained its visible credit. Its bundled source matches the original upload bytes. The Facebook post contains no Facebook reference after the owner’s metadata removal. Scoped content checks reported 13 spelling findings, zero grammar findings, and zero Vale findings in the two edited archive posts; the existing prose remains unchanged.
