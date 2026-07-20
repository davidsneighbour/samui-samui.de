# Work queue definitions

Queues are deterministic and composable.

## Base filters

* `all`: every post
* `year:<yyyy>`: posts in one publication year
* `before:<date>` / `after:<date>`: publication date
* `tag:<tag>`: canonical content tag
* `marker:<name>`: publisher property exists
* `legacy-frontmatter:<name>`: top-level legacy frontmatter property exists
* `unreviewed`: no successful review record
* `ruleset-stale`: latest successful review used an older incompatible ruleset
* `blocked`: latest result is blocked
* `changed-uncommitted`: current batch contains changes

## Ordering

* `oldest-first`: publication date ascending, then path ascending
* `newest-first`: publication date descending, then path ascending
* `path`: path ascending
* `priority`: blocked manual decisions first only when requested, then
  unresolved markers, then unreviewed chronology

Default: `oldest-first`.

## Named queues

### Flickr

Selection:

* `publisher.flickr` exists
* legacy top-level `flickr` exists
* plus reliable source detection of Flickr references

Newly detected unmarked posts appear as "detected, not yet queued" until marker
addition is logged.

Flickr queue work must include original-image recovery from the local Flickr
backup. See `flickr-backup-recovery.md`.

### Covers

Selection:

* `publisher.cover` exists
* or `publisher.covermigration` exists

Keep the reason visible because these markers have different acceptance criteria.

### Metadata

Selection:

* `publisher.description`
* or `publisher.summary`
* or `publisher.tags`

### SEO

Selection:

* `publisher.seo`
* optionally `ruleset-stale` when requested

### Full historical rework

Selection:

* all posts without a successful full review under the chosen baseline
* ordered oldest first unless requested otherwise

## Batch limits

Explicit numeric requests are honoured.

Without a numeric limit, select one post. This protects the manual review
process and prevents a long series of unreviewed automatic rewrites.
