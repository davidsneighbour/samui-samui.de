# Flickr backup recovery

Use this resource only during the global content rework when a post has
`publisher.flickr`, a legacy top-level `flickr` marker, or a reliable Flickr
reference detected from source.

## Backup layout

The local Flickr account backup is authoritative for these posts:

* root: `/home/patrick/Documents/Pictures/FlickrBackup`
* JSON metadata:
  `/home/patrick/Documents/Pictures/FlickrBackup/72157723297596066_987e05b0837f_part1`
* original files:
  * `/home/patrick/Documents/Pictures/FlickrBackup/data-download-1`
  * `/home/patrick/Documents/Pictures/FlickrBackup/data-download-2`
  * `/home/patrick/Documents/Pictures/FlickrBackup/data-download-3`
  * `/home/patrick/Documents/Pictures/FlickrBackup/data-download-4`
  * `/home/patrick/Documents/Pictures/FlickrBackup/data-download-5`
  * `/home/patrick/Documents/Pictures/FlickrBackup/data-download-6`
  * `/home/patrick/Documents/Pictures/FlickrBackup/data-download-7`

All Flickr images used by the old site must exist somewhere in this backup.
Never modify or move files inside the backup.

## Matching inputs

For each Flickr-marked post, extract every signal from the post source:

* Flickr photo page URL and numeric photo ID
* static image URL, farm/server path, and basename
* title attributes and link-reference titles
* `alt` text, captions, and visible labels
* surrounding post date and topic
* displayed dimensions
* local reduced or migrated image files already in the post folder

Then inspect the JSON metadata and data-download folders for matching originals.

## Matching rules

Prefer deterministic matches in this order:

1. exact Flickr photo ID in JSON metadata
2. metadata URL or original URL matching the post's Flickr URL
3. title, date, dimensions, and filename-like tokens matching one candidate
4. visual/manual comparison against the reduced website image

File names may differ between the website and the backup. A direct hash match
is often impossible because the website image may be smaller or recompressed.
Do not reject a candidate only because its name or hash differs.

If more than one plausible original remains, stop and record the manual choice.

## Copy and replace

When the original is verified:

1. copy the original image from the backup into the same folder as the post's
   `index.md`
2. keep a descriptive, stable local filename
3. update the post to reference the local file instead of Flickr
4. use normal post-bundled image handling so Astro can create processed images
5. preserve meaningful alt text, captions, and attribution when still relevant
6. remove obsolete Flickr-only notices or wrappers only when no Flickr
   dependency remains

Copy files only. Never move originals out of the backup.

## Completion criteria

Remove `publisher.flickr` only when:

* every Flickr image/reference in the post has a verified backup outcome
* every required original has been copied into the post folder
* post source no longer depends on Flickr URLs or embeds
* rendered output uses the local bundled image
* the recovery outcome is recorded in content-rework resume state

If the original cannot be matched during the session, keep `publisher.flickr`
and record the unresolved candidates, search terms, and reason for the block.
