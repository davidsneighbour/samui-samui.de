# Hugo Compatibility

This repository requires **Hugo v0.140.2 (extended)**. Not v0.163.x. Not "whatever
`hugo` happened to resolve to on your machine today." v0.140.2.

## Why this file exists

Because someone (me, at some point) ran this repo against Hugo v0.163.3, and it
did not go well:

- Deprecated/removed config keys (`privacy.twitter.*`, `languageCode`,
  `module.mounts.excludeFiles`, `imaging.quality`) started throwing warnings and
  errors.
- The `schema` module's JSON-LD partials (`website.html`, `breadcrumblist.html`)
  blew up the Go `html/template` escaper with `{{range}} branches end in
  different contexts`.
- The `hooks` module's `func/hook.html` calls `partials.Include`/
  `partials.IncludeCached` with a path that already contains the `partials/`
  prefix those functions add themselves, which apparently used to be tolerated
  and now just fails with "partial not found."
- The `netlification` module has the exact same double-prefix bug in
  `dnb-netlification/redirection.html`.
- Recent Hugo also runs PostCSS through Node with `--permission`, which is a
  fun surprise the first time `browserslist` tries to look at a file one
  directory above the project and gets denied by Hugo's own sandbox.

None of that is this project's fault, exactly, but none of it is going to get
fixed here either, since this project is being migrated away from Hugo
entirely. So: pin the Hugo version, move on with your life.

## What to do

```bash
hugo version
# hugo v0.140.2-... — good, carry on
# anything else — go install v0.140.2 and stop tempting fate
```

If you must use a newer Hugo for some reason, expect to re-discover everything
above yourself, because it will not be fixed forward in this repo.
