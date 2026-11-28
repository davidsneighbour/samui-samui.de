# Impeccable product context and workflow

[PRODUCT.md](../PRODUCT.md) records the site's audience, purpose, editorial priorities, and product constraints. It was created through an owner interview on 28 November 2026. [DESIGN.md](../DESIGN.md) remains the authority for the existing visual system.

## Build preference

Patrick chose comp-first for Codex landing-page and showcase work: review a generated image before implementing the approved composition. `.impeccable/config.json` stores `buildPath: "comp"`. This preference is scoped to Codex by [AGENTS.md](../AGENTS.md); it does not establish a preference for other tools. App screens and documents remain code-first under the skill's rules.

## Historical information

New writing and useful local information are the main editorial priorities. Old posts must make clear that their information may be outdated. PRODUCT.md records this requirement without asserting that the existing interface fully implements it. A future interface change must decide the notice presentation and scope before implementation.

## Live-mode configuration

`.impeccable/live/config.json` targets both existing document layouts, `src/layouts/PageLayout.astro` and `src/layouts/BlogPost.astro`, before `</body>`. Init configured future sessions only; it did not inject a picker, start a server, or verify a live browser session.

The skill's `detect-csp` command returned `shape: null` and no signals during setup, so `cspChecked` is true. This is the detector's result, not a claim that production has no CSP: production headers remain in `public/.htaccess`. Init made no CSP changes. Recheck development CSP if the live picker is blocked in a future session.

## Design hooks

Design hooks are enabled through `impeccable hooks on`, which records `hook.enabled: true` in `.impeccable/config.json` and install consent in the ignored `.impeccable/config.local.json`. The command verified existing Claude and Codex hook manifests; the status output labels the Codex integration `.agents`. The Codex manifest at `.codex/hooks.json` contains the post-edit check and the final deep pass.

Codex must load the hook settings, and the user must approve them through `/hooks` on first use. Restart or reload the session after settings change. Verified manifest wiring does not prove that the current session has executed a hook. Run `impeccable hooks status` to inspect configuration; use `impeccable hooks off` to disable automatic reminders.

## Version control

Keep PRODUCT.md, DESIGN.md, `.impeccable/config.json`, `.impeccable/surfaces/`, `.impeccable/design.json`, `.impeccable/live/config.json`, and `.impeccable/critique/ignore.md` in version control when present. Do not ignore `.impeccable/` as a whole. The runtime directories ignore themselves; `.impeccable/config.local.json` is a developer-local override and stays ignored.
