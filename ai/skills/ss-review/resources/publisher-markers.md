# Publisher marker semantics

The `publisher` block is repository-internal work-queue metadata. It is not rendered on the website.

## Canonical rule

A category marker exists only while work in that category remains unresolved.

```yaml
publisher:
  description: true
  cover: true
```

means that description and cover work remain.

When the category passes its acceptance criteria, remove that property. When the final property is removed, remove the empty `publisher` object.

Do not use marker absence as durable evidence that a post has been reviewed.
Review history and ruleset versions belong in
`ai/reports/contentrework/state.json` when the global rework is active.

## Supported markers

### `publisher.description`

Add or keep when:

* `description` is missing
* it is generic, duplicated, misleading, keyword-stuffed, or weak
* it does not accurately represent the complete post
* it violates the repository's editorial field rules
* a human decision is required

Remove only when `description` passes all acceptance criteria.

### `publisher.summary`

Add or keep when:

* `summary` is missing where required
* it is not useful as visible archive/card copy
* it is truncated, generic, duplicated, misleading, or poorly written
* it violates the configured length range without a justified exception

Remove only when `summary` passes all acceptance criteria.

### `publisher.cover`

Add or keep when:

* the post has no suitable cover and should have one
* cover frontmatter is invalid
* the cover is unrelated, broken, inaccessible, badly cropped, or missing metadata
* the best available original has not been identified
* the cover requires a manual editorial choice

Remove only when the cover is valid, representative, correctly described, and uses the best verified available source.

### `publisher.tags`

Add or keep when:

* tags are absent where useful
* tags are overly broad, duplicated, inconsistent, misspelled, or one-off variants
* a proposed tag requires a site-wide taxonomy decision
* existing tags do not represent the post's durable topics

Remove only when tags conform to the controlled site-wide vocabulary.

### `publisher.seo`

Add or keep when:

* any item in the full SEO review fails
* a technical check cannot be completed
* search intent or indexing treatment needs a human decision
* title, metadata, content structure, links, images, structured-data inputs, or canonical/indexability signals require work

Remove only after the complete SEO ruleset passes or every remaining exception is explicitly accepted and logged.

### `publisher.covermigration`

Add or keep when:

* a legacy cover reference still needs conversion to the bundled cover model
* the source asset has not been moved into the post bundle
* the migrated cover has not been verified
* legacy and new cover mechanisms conflict
* migration documentation identifies unfinished work

Remove only when migration is complete and verified in source and rendered output.

This marker is migration-specific. Do not add it to a new post already using the current cover model.

### `publisher.flickr`

Add or keep when:

* the post references Flickr directly or indirectly
* a Flickr-hosted original may exist
* a migrated local image may be a reduced copy of a Flickr original
* attribution, source, licence, or original quality needs verification
* an old Flickr embed or URL remains unresolved
* the matching original has not yet been recovered from the local Flickr backup

During the global content rework, the local backup at
`/home/patrick/Documents/Pictures/FlickrBackup` is authoritative. Remove the
marker only when the original has been found there, copied into the post folder,
and the post no longer depends on Flickr. If matching requires human judgement,
keep the marker and record the candidate files.

## Legacy values

Existing markers may be strings, numbers, or booleans. Interpret any present supported property as an unresolved queue marker unless repository documentation explicitly defines a different value.

Do not mass-normalize legacy values during an unrelated post review. When touching the marker for a reviewed post, normalize unresolved markers to `true`.

## Additional findings

Do not invent arbitrary publisher properties during routine review.

When a recurring category is not covered by the supported markers:

1. record it in the review report
2. log it in content-rework state
3. propose a new marker definition
4. add the new marker only after the taxonomy is accepted
