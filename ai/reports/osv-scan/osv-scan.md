# OSV scan decisions

Human-readable log of `accepted` and `workaround` decisions made during
`dnb-osv-scan` runs. See `memories/osv-scan-ledger.json` for the machine-readable
ledger. Each entry here should be dated and explain the *why* behind the decision.

<!-- Entries are appended below, newest last. -->

## 2026-08-29 - sharp (`GHSA-f88m-g3jw-g9cj`) - workaround

Dependabot alert #331. `netlify-cli` → `@netlify/images` → `ipx` pulls its own
`sharp` copy, and `ipx@3.1.1` declares `"sharp": "^0.34.3"`, which excludes the
patched `0.35.x` line under normal semver — so npm kept installing a second,
vulnerable `sharp@0.34.5` alongside our already-patched top-level `sharp@0.35.4`
devDependency. Added `"sharp": "0.35.4"` to `package.json` `overrides` to force
every install location onto the patched version. Validated with `npm run check`
(format, lint, `astro check`, taxonomy validation, vitest) — all green — and
`npm ls sharp` confirms all three install locations now dedupe to `0.35.4`.
Revisit (`review_after: 2026-11-29`) and promote to `fixed` once `ipx`/`netlify-cli`
bump their declared `sharp` range to `>=0.35.0`, at which point the override can
be dropped.
