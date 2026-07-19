<!-- markdownlint-disable-next-line title-case-style -->
# samui-samui.de

[![Netlify](https://img.shields.io/netlify/49963b4d-bb9f-411f-a9b8-521a5e3a2b42?color=%2300AD9F&logo=netlify&style=for-the-badge)](https://app.netlify.com/sites/samui-samui-de/deploys)[![GitHub issues](https://img.shields.io/github/issues-raw/davidsneighbour/samui-samui.de?logo=github&style=for-the-badge)](https://github.com/davidsneighbour/samui-samui.de/issues) ![LasCHanges](https://img.shields.io/github/last-commit/davidsneighbour/samui-samui.de?color=%23ff7700&logo=github&style=for-the-badge) [![Codacy Badge](https://img.shields.io/codacy/grade/1aa52a19ae5b42efa80f04157a29ae8d?logo=codacy&style=for-the-badge)](https://www.codacy.com/gh/davidsneighbour/samui-samui.de/dashboard) ![License](https://img.shields.io/github/license/davidsneighbour/samui-samui.de?logo=github&style=for-the-badge) [![Gitter Chatroom](https://img.shields.io/gitter/room/dnb-org/community?color=%23ed1965&logo=gitter&style=for-the-badge)](https://gitter.im/dnb-org/community) ![Latest Version](https://img.shields.io/github/v/tag/davidsneighbour/samui-samui.de?color=%23ed1965&label=Release&logoColor=%23ffffff&sort=semver&style=for-the-badge)

Website and content for [samui-samui.de](https://samui-samui.de).

* [Local commands](#local-commands)
* [Setup](#setup)
* [Giscus](#giscus)

## Local commands

Astro static site, deployed to Netlify:

```bash
npm install
npm run dev      # astro dev, local preview
npm run build    # astro check && astro build, then pagefind indexing
```

## Setup

This site is a static Astro build with one Netlify Function for the contact
form. Complete the manual setup below before a production deploy through
Netlify, the Netlify CLI, or any future `npm run deploy` wrapper. The current
`package.json` does not define a `deploy` script.

### Local `.env`

Create a local `.env` file for contact-form testing. The file is ignored by Git
and must never be committed. Mirror the same keys in the Netlify dashboard for
production and deploy previews that should send real email.

Required variables:

| Variable | Used by | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | Netlify Function | Secret token from the [Resend API Keys dashboard](https://resend.com/api-keys). Use a sending-scoped key when possible. |
| `CONTACT_EMAIL_FROM` | Netlify Function | Verified sender address in Resend, usually on the `samui-samui.de` sending domain. |
| `CONTACT_EMAIL_TO` | Netlify Function | Recipient address for contact form submissions. |
| `TURNSTILE_SECRET` | Netlify Function | Private secret from the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile). |
| `TURNSTILE_SITE_KEY` | Astro build | Public site key from the same Turnstile widget. Astro renders it into the contact form. |

Optional variables:

| Variable | Default | Notes |
| --- | --- | --- |
| `CONTACT_EMAIL_BCC` | none | Comma-separated BCC recipients. |
| `CONTACT_EMAIL_SUBJECT_PREFIX` | `Samui? Samui!` | Prefix for contact notification subjects. |
| `CONTACT_EMAIL_TIMEZONE` | `Asia/Bangkok` | IANA time zone for timestamps in notification emails. |

Use `npm run dev` for the static Astro site. Use Netlify CLI's `netlify dev`
when the contact form itself needs to run locally with the Netlify Function.

### Netlify deployment, DNS, and functions

The connected Netlify site is
[samui-samui-de](https://app.netlify.com/sites/samui-samui-de/overview). The
checked-in `netlify.toml` defines the production build:

* Build command: `npm run build`
* Publish directory: `dist`
* Functions directory: `netlify/functions`

Manual Netlify checks before production deploys:

1. Link the local checkout to the existing Netlify site with `netlify link`, or
   authenticate the CLI with `netlify login`. For non-interactive use, create a
   Netlify personal access token under
   [Applications > Personal access tokens](https://app.netlify.com/user/applications#personal-access-tokens)
   and expose it locally as `NETLIFY_AUTH_TOKEN`.
2. Confirm deploy settings in the
   [Netlify deploys dashboard](https://app.netlify.com/sites/samui-samui-de/deploys)
   and keep them aligned with `netlify.toml`.
3. Configure production domains, DNS records, HTTPS, and redirects in
   [Netlify domain management](https://app.netlify.com/sites/samui-samui-de/domain-management).
   If using Netlify DNS, copy existing records such as mail records before
   delegating nameservers.
4. Add the environment variables in
   [Netlify environment variables](https://app.netlify.com/sites/samui-samui-de/configuration/env).
   `TURNSTILE_SITE_KEY` must be available to Builds. `RESEND_API_KEY`,
   `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`, `TURNSTILE_SECRET`, and the optional
   contact-email variables must be available to Functions. If the UI does not
   require explicit scopes, using all scopes is fine.
5. After changing environment variables, trigger a fresh deploy so the build-time
   site key and runtime function secrets are both current.
6. Inspect the
   [Netlify Functions dashboard](https://app.netlify.com/sites/samui-samui-de/functions)
   after deployment and submit one real contact-form test from `/kontakt/`.

### Turnstile captcha

Create one Turnstile widget in the
[Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
for `samui-samui.de`. Use Managed mode unless there is a specific reason to
change it, add the production hostname, and add preview/local hostnames only if
those environments need end-to-end form tests. Copy the widget's site key to
`TURNSTILE_SITE_KEY` and its secret key to `TURNSTILE_SECRET`.

The contact form loads Turnstile only when `TURNSTILE_SITE_KEY` exists. The
Netlify Function still requires `TURNSTILE_SECRET` and rejects submissions whose
Turnstile token cannot be verified.

### Resend email sending

Set up the sending domain or sender identity in the
[Resend dashboard](https://resend.com/domains), then create the production API
key in the [Resend API Keys dashboard](https://resend.com/api-keys). The sender
configured as `CONTACT_EMAIL_FROM` must be allowed by Resend, and
`CONTACT_EMAIL_TO` should be the mailbox that receives site enquiries.
If Resend asks for DNS records to verify the sending domain, add them in Netlify
DNS or the current authoritative DNS provider before deploying.

After the first production deploy with these variables, send one contact-form
message and verify both the browser success state and the delivered email.

## Giscus

`giscus.json` belongs at the repository root, not in `public/`. Giscus reads
additional configuration from the public GitHub repository named in
`src/components/Giscus.astro`, while Astro only copies `public/` files to the
live site.

Manual Giscus checks before production deploys:

1. Install or confirm the [giscus GitHub App](https://github.com/apps/giscus) for
   `davidsneighbour/samui-samui.de`.
2. Confirm GitHub Discussions are enabled for the repository.
3. Confirm `src/components/Giscus.astro` still matches the public repository,
   category, and mapping expected by `giscus.json`.

See `AGENTS.md` for the full command/architecture reference.
