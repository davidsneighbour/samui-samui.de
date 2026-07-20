# Image and cover rules

## Cover

A suitable cover is:

* representative of the post
* based on the best verified available source
* correctly referenced by current frontmatter
* locally available when repository policy requires bundling
* accompanied by useful alt text
* accompanied by caption/attribution when needed
* free of avoidable text overlays and extreme aspect ratios
* usable in the site's required responsive contexts

A historical low-resolution image may still be the correct cover. Quality limitations are not permission to fabricate detail.

## Body images

Check:

* file exists
* reference resolves
* image is not an avoidable duplicate or inferior derivative
* dimensions are appropriate
* width and height/aspect ratio can be determined by the image pipeline
* alt text describes purpose and content
* decorative images use the repository's decorative-image convention
* caption and credit are present when needed
* nearby text gives the image context
* old embeds are migrated or intentionally retained

## Alt text

Alt text must:

* describe the image's meaningful content and purpose in context
* be concise but sufficient
* avoid "Bild von" unless the distinction matters
* avoid keyword stuffing
* not duplicate a nearby caption verbatim when that adds no value
* preserve names and places when reliably known

## Source quality

When duplicates exist:

1. compare pixel dimensions
2. compare compression and artefacts
3. compare crop completeness
4. compare metadata and provenance
5. retain the best source as the archival original
6. let the site image pipeline create derivatives

Do not assume the largest file size is the best original.

## Flickr

Flickr resolution is a provenance and recovery task, not merely a broken-link
task. During the global content rework, recover the original from the local
Flickr backup before clearing the marker. See `publisher-markers.md` and
`ai/skills/ss-refactor/resources/flickr-backup-recovery.md`.
