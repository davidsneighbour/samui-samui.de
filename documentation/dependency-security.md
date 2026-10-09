# Dependency security maintenance

Review both `npm audit --json` and GitHub Dependabot alerts. The two sources can differ while advisory metadata and GitHub's dependency graph update. An npm affected-package count includes dependent packages as well as the libraries with the underlying advisories; do not count each affected parent as a separate vulnerability.

## Package sources

The root manifest is generated from `src/packages/**/*.jsonc`. Dependency versions and overrides belong in those fragments. Keep every fragment defining the same dependency aligned, including duplicate React and type dependencies. Before regeneration, compare the fragments with the current manifest so an earlier direct manifest update is not silently undone. Run `npm run compile:package` after editing the fragments.

Use compatible patch and minor upgrades first. Inspect `npm audit fix --dry-run` before applying fixes. Do not treat `npm audit fix --force` as a safe remediation: it can suggest obsolete parent releases or incompatible major-version changes.

## Security update

On 6 October 2026, [the maintenance issue](https://github.com/davidsneighbour/samui-samui.de/issues/1742) tracks this update. The audit went from 20 distinct advisory IDs to four, and from 77 affected packages to 26. No critical findings remain in the local lockfile. The remaining affected-package counts are four low, two moderate, and 20 high; these include the downstream effects of the four advisories below.

| Package | Previous version | Patched version | Resolution |
| --- | --- | --- | --- |
| `brace-expansion` | 5.0.9 | 5.0.12 | Compatible lockfile update. |
| `fast-uri` | 3.1.6 / 4.1.3 | 3.1.8 / 4.2.1 | Compatible updates on each release line. |
| `fastify` | 5.12.1 | 5.12.5 | Compatible lockfile update. |
| `http-cache-semantics` | 4.2.0 | 4.3.0 | Compatible lockfile update; GitHub's initial advisory snapshot did not yet list the patched version. |
| `js-yaml` | 5.2.2 | 5.4.3 | Update the existing global override. |
| `proxy-addr` | 2.0.7 | 2.0.8 | Compatible lockfile update. |
| `smol-toml` | 1.8.0 | 1.9.0 | Add a same-major override because `markdownlint-cli2` pins 1.8.0 exactly. |

The existing `get-uri` / `basic-ftp` and `release-it` / `undici` overrides are retained in the fragments so regeneration preserves their earlier security fixes. Check parent releases before removing any override, and rerun the audit, quality gate, and production build afterwards.

## Override update

On 9 October 2026, two of the four advisories that the 6 October update left open received overrides in `src/packages/build/package.jsonc`. Both cross the parent's declared range, so each was checked for compatibility before it was added.

| Package | Previous version | Override | Compatibility evidence |
| --- | --- | --- | --- |
| `katex` | 0.16.47 | `0.18.2` (global) | `markdownlint` imports only the `math` syntax extension from `micromark-extension-math`. KaTeX is used only by that package's HTML extension (`lib/html.js`), which `markdownlint` never loads, so KaTeX code does not run. `markdownlint` is the only consumer of `katex` in the tree. |
| `postcss-selector-parser` | 6.0.10 | `7.1.6` (scoped to `@tailwindcss/typography`) | The CSS that the typography plugin generates for `prose`, its size and `invert` variants, element modifiers, and `not-prose` is byte-identical with 6.0.10 and 7.1.6 (compiled with the Tailwind `compile` API before and after the change). |

Remove each override when its parent declares a patched version: `micromark-extension-math` accepting KaTeX 0.18.2 or later, or `@tailwindcss/typography` depending on `postcss-selector-parser` 7.1.6 or later.

The same update also aligned the fragments with the manifest. Earlier direct manifest updates (for example `astro` 7.3.8 and `maplibre-gl` 6.13.0) had not reached the fragments, so `npm run compile:package` would have downgraded 15 packages. The fragments now carry the committed versions.

## Unresolved advisories

| Package | Advisory and issue | Current limit |
| --- | --- | --- |
| `braces` 3.0.3 | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [tracking issue](https://github.com/davidsneighbour/samui-samui.de/issues/1743) | No patched release. `micromatch` and wireit's older `chokidar` still depend on this line. |

It still had no patched release on 9 October 2026 (checked against the GitHub advisory API and the npm registry). This finding remains unresolved. An issue records the follow-up; it does not mean the risk is accepted or mitigated. Fixed local lockfile findings can remain open on GitHub until the committed lockfile reaches the default branch and GitHub refreshes its dependency graph. Do not dismiss those alerts to make the dashboard appear clean.

## Resolved by removal

`node-forge` 1.4.0 ([GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv), [tracking issue](https://github.com/davidsneighbour/samui-samui.de/issues/1744)) had no patched release. It came only through `netlify-cli` → `@netlify/images` → `ipx` → `listhen`, and it left the tree when the [Netlify clean-up](https://github.com/davidsneighbour/samui-samui.de/issues/1784) removed `netlify-cli` (`npm ls node-forge` is empty since 9 October 2026).

## Validation

The production build, strict validation, and all 267 tests passed with the updated dependencies. The full `npm run check` stops at existing formatting failures in 26 Astro files; a separate lint run also identifies three existing heading failures. The owner accepted this known failure for the security commit. [The quality-gate follow-up](https://github.com/davidsneighbour/samui-samui.de/issues/1747) tracks correcting these files.
