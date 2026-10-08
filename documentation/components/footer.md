# Footer

`src/components/layout/footer/Footer.astro` is the shared site footer. It includes links to the Samui? Samui! [Mastodon](https://mastodon.social/@samuisamui) and [Bluesky](https://bsky.app/profile/samui-samui.de) profiles above the sound toggle and copyright line.

The social links use Mastodon and Bluesky SVGs from the installed `@iconify-json/simple-icons` collection, rendered at build time through `astro-icon`. They require no browser-side icon requests or social embeds. Each link has a German accessible name, a decorative icon, a 44px hit area, and a visible keyboard focus indicator. Links open in a new tab or window with `target="_blank"` and `rel="me noopener noreferrer"`. Their accessible names and titles announce the new tab, and `me` identifies the site's profiles.

The links reuse the existing foreground, accent, primary, background, medium radius, and spacing tokens. Profile URLs are public presentation data; the footer does not read Posthaste credentials or dotenv files. Analytics remains at the existing end-of-page position.
