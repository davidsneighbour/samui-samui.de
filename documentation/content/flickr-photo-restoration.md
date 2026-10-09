# Flickr photo restoration

From 2005 to 2013 most archive photos were hosted on the Flickr account `schreibblogade` and embedded from Flickr's image servers. The account is deleted, so the embeds were broken, and every view still sent the visitor's IP address to Flickr. In October 2026 the photos were restored from the owner's Flickr data export and stored in the post bundles ([#1790](https://github.com/davidsneighbour/samui-samui.de/issues/1790), decision in [#1780](https://github.com/davidsneighbour/samui-samui.de/issues/1780)).

## Source

The Flickr data export is a local backup (not in the repository). It holds one file per photo in its original size, named either `<title-slug>_<photo-id>_o.<ext>` or, for titles without Latin characters, `<photo-id>_<secret>_o.<ext>`. It also holds `photo_<photo-id>.json` metadata files with the Flickr title, description, and dates. Flickr image URLs contain the same photo ID (`//farmN.static.flickr.com/<server>/<photo-id>_<secret>.jpg`), which is how embeds were matched to backup files.

## Result

* 419 of 423 embedded photo IDs were found in the backup and restored.
* Three embedded photos belong to other Flickr users (`silpakhon`, `mrpokx5`, `cospho`). Their photo pages are still live, so the posts now link to the photo page instead of embedding the image.
* One own photo ("The Boss", `99923689`, post `2006/02/derchef`) is not in the backup. Its embed was removed.

After the restoration no built page loads an image from a Flickr host. Check with:

```bash
npm run build
grep -rhoE '<img\b[^>]*src="(https?:)?//[^/"]*flickr\.com' dist --include=*.html | wc -l   # expect 0
```

## How the photos are stored

* Each photo is a file next to the post's `index.md`, named `<title-slug>-<photo-id>.<ext>` (or `flickr-<photo-id>.<ext>` when the Flickr title has no Latin characters).
* Photos are scaled to a long edge of at most 2560 px (JPEG quality 88, EXIF orientation applied). This is twice the largest image breakpoint in `astro.config.ts` (1280 px), so the site shows the same quality as with the originals, while the repository grows by about 300 MB instead of about 940 MB. None of the originals contained GPS data. The Flickr backup stays the archival master copy.
* The embeds are Markdown images (`![alt](./file.jpg)`), not raw HTML. Astro only processes relative images in Markdown image syntax; a raw HTML `<img src="./file.jpg">` would be copied into the page unchanged and the file would not be published.
* The visible caption that followed most Flickr embeds is kept as a plain paragraph below the image. The old HTML wrappers (`div.flickr`, `div.media image`) are removed.

## Links to flickr pages

Text links to the deleted account, photo pages, sets, and tags are dead. Following the [#1780](https://github.com/davidsneighbour/samui-samui.de/issues/1780) options:

* When the linked photo is now embedded in another post, the link points to that post.
* Otherwise the link is removed and its text kept. Sentences that only pointed to Flickr (for example "Mehr Photos bei Flickr") are removed.

About 20 text links pointed to own photos that are in the backup but not embedded anywhere. They were not restored as images; that remains possible later.

## Related fixes in the same posts

The pre-commit hook checks links and language in every staged post, so the restored posts also received:

* Wayback Machine snapshot URLs for dead source links (mostly The Nation), or removal of the link where no snapshot exists.
* Spelling, comma, case, and typography fixes, house dictionary entries, and per-post `grammar-ignore` and `cspell:ignore` exceptions, as described in [German orthography and grammar](german-orthography-and-grammar.md).
* Normal paragraphs for 27 posts whose text was indented under a removed HTML wrapper and therefore rendered as a code block.
* Repairs of characters that the archive import had broken into question marks, where the correct text was certain (for example the Thai caption of `2007/04/wir-waren-alle-drei-beim-friseur` from the Flickr metadata).

The Creative Commons badge of the wallpaper posts is stored in `public/images/creative-commons/`, and the two images of the former domain `die.schreibbloga.de` load from `public/wp-content/old-images/`.
