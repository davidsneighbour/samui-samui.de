# Posthaste

Posthaste configuration for Samui? Samui! lives in the repository-root `.posthaste.toml`. The default publishing targets are Mastodon and Bluesky. Account creation and authentication are separate setup steps; this configuration does not create accounts or enable scheduled publishing.

## Local files

Run Posthaste from the repository root so configuration discovery and relative paths resolve to this project.

* `.posthaste.toml` contains tracked, non-secret project defaults.
* `.posthaste/.env` is the configured credential file. Git ignores it. Create it only during explicitly authorised credential setup, and never store credential values in TOML or tracked files.
* `.posthaste/posted.jsonl` is the publishing history, created by Posthaste when needed. It remains eligible for version control so published-post records can stay with the project.
* Store future draft text and media under `.posthaste/` so project publishing assets remain in this repository.

No credential file, publishing history, or social account is created by the initial configuration change. Use the consuming skills' default environment variable names unless a future account setup requires an explicit override.

## Configuration and publishing

Threads OAuth was completed on 8 October 2026 for [@samuisamui_de](https://www.threads.com/@samuisamui_de). The user token and account identity were verified through the Threads `/me` API, and credentials are stored only in `.posthaste/.env` with mode `0600`. The token expires on 7 December 2026 at approximately 12:07 Bangkok time. Refresh it before expiry using the Posthaste Threads token helper with `--dotenv .posthaste/.env --write-env --refresh-existing`, after explicit approval for the credential write. The helper rounded the numeric account ID during initial authorisation; the saved `THREADS_USER_ID` was corrected to the exact string returned by `/me`. Check this ID after future authorisations until the helper is fixed. No Threads post was published during authorisation. The [Threads introduction](https://www.threads.com/@samuisamui_de/post/DeOJvminz3w) was subsequently published after explicit instruction, and its account, text, and permalink were verified through the Threads API. Its source is `.posthaste/drafts/hello-threads.txt`, and its publication is retained in `.posthaste/posted.jsonl`. The helper initially returned a URL containing the numeric post ID; the publishing record was corrected to the API-provided permalink.

Reusable bio and introduction text lives in [Social profile copy](content/social-profiles.md).

The Mastodon account is [@samuisamui@mastodon.social](https://mastodon.social/@samuisamui). Account verification through `/api/v1/accounts/verify_credentials` succeeded on 8 October 2026. This verifies the token's account identity; posting permissions are not verified by this read-only request. The introductory post text lives in `.posthaste/drafts/hello-mastodon.txt` and was [published to Mastodon](https://mastodon.social/@samuisamui/117402633120757059) on 8 October 2026 after explicit confirmation. Its publishing record is retained in `.posthaste/posted.jsonl`. The draft contains only post text and is the source of truth for later review and confirmed publishing.

Consuming skill defaults are overridden by global `~/.config/posthaste/config.toml`, then project `.posthaste.toml`, and finally explicit request values. Runtime helpers also support documented environment and command-line overrides. Other global settings may still be inherited; the project configuration overrides default networks and storage paths.

Use `/posthaste-config info` to inspect effective settings and provenance, or `/posthaste-config check` to validate configuration. Use `/posthaste-prepare-link` with a site URL to prepare a post. Publishing, credential writes, automated login, and final publish controls require explicit user confirmation under the Posthaste skill rules.

For the Crosspost Mastodon transport, set `MASTODON_HOST=mastodon.social` without a scheme or account path. Crosspost adds the HTTPS scheme itself. A value such as `https://mastodon.social` fails hostname resolution. The first published introduction used a process environment override for this host value; the credential file was not modified.

The Bluesky account is [samui-samui.de](https://bsky.app/profile/samui-samui.de), with DID `did:plc:uu3mgnbmws3ohip4x54ljaft`. Authentication verified this identity on 8 October 2026. Crosspost uses `BLUESKY_HOST=bsky.social`, `BLUESKY_IDENTIFIER=samui-samui.de`, and an app password in `BLUESKY_PASSWORD`; credential values belong only in the ignored dotenv file. The [Bluesky introduction](https://bsky.app/profile/samui-samui.de/post/3mxdce74gtm2b) was published after explicit approval and verified through the public API. Its source text is `.posthaste/drafts/hello-bluesky.txt`, and its publication is recorded in `.posthaste/posted.jsonl`. It differs from the Mastodon introduction only in the platform greeting.

Reddit credentials verified the account `u/davidsneighbour` on 8 October 2026, with `identity` and `submit` scopes. The configured destination is [r/samuisamui](https://www.reddit.com/r/samuisamui/). This verifies authentication and posting scope; it does not establish Reddit approval coverage or successful submission to the subreddit. The introduction draft is `.posthaste/drafts/hello-reddit.txt`, with the proposed title `Hallo Reddit – Grüße von Koh Samui!`. Use `--to reddit --reddit-post-type self` to submit the introduction as a text post containing the website link rather than the helper's default link post with a separate comment. The dry run succeeded, and the introduction was [published to r/samuisamui](https://www.reddit.com/r/samuisamui/comments/1x0eibb/) on 8 October 2026 after explicit confirmation. The submission API returned success, and `.posthaste/posted.jsonl` retains the publishing record. A separate unauthenticated fetch returned HTTP 403, so public visibility was not independently verified.
