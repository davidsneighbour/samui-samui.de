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

## Unresolved advisories

| Package | Advisory and issue | Current limit |
| --- | --- | --- |
| `braces` 3.0.3 | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [tracking issue](https://github.com/davidsneighbour/samui-samui.de/issues/1743) | No patched release. `micromatch` and wireit's older `chokidar` still depend on this line. |
| `node-forge` 1.4.0 | [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv), [tracking issue](https://github.com/davidsneighbour/samui-samui.de/issues/1744) | No patched release; retained through `listhen`. |
| `katex` 0.16.47 | [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7), [tracking issue](https://github.com/davidsneighbour/samui-samui.de/issues/1745) | Patch starts at 0.18.2, outside `micromark-extension-math`'s supported `^0.16.0` range. |
| `postcss-selector-parser` 6.0.10 | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf), [tracking issue](https://github.com/davidsneighbour/samui-samui.de/issues/1746) | Patch starts at 7.1.6; `@tailwindcss/typography` pins 6.0.10. A parser major migration needs separate compatibility work. |

These findings remain unresolved. An issue records the follow-up; it does not mean the risk is accepted or mitigated. Fixed local lockfile findings can remain open on GitHub until the committed lockfile reaches the default branch and GitHub refreshes its dependency graph. Do not dismiss those alerts to make the dashboard appear clean.

## Validation

The production build, strict validation, and all 267 tests passed with the updated dependencies. The full `npm run check` stops at existing formatting failures in 26 Astro files; a separate lint run also identifies three existing heading failures. The owner accepted this known failure for the security commit. [The quality-gate follow-up](https://github.com/davidsneighbour/samui-samui.de/issues/1747) tracks correcting these files.
