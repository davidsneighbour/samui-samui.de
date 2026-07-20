# Inselrundfahrt

## Post

* Path: `src/content/posts/2005/01/2005-01-17-inselrundfahrt/index.md`
* Title: Inselrundfahrt
* Date: 2005-01-17T04:00:00+07:00
* Review mode: fix
* SEO ruleset: 2026-07-20
* Primary topic: Koh Samui island tour
* Likely search intent: historical personal travel account with Koh Samui route photos

## Decision summary

| Area | Result | Action |
| --- | --- | --- |
| Source/frontmatter | pass | Date normalized to UTC+7 and `lastmod` updated. |
| Title | pass | Retained characteristic title. |
| Description | fail | Kept `publisher.description`; full metadata pass still needed. |
| Summary | fail | Kept `publisher.summary`; full metadata pass still needed. |
| Language/body | changed | Corrected visible mojibake in the touched post. |
| Links | pass | No external body links. |
| Tags | fail | Kept `publisher.tags`; taxonomy pass still needed. |
| Cover | pass | Promoted verified local Flickr original as bundled image cover. |
| Cover migration | pass | Removed legacy covermigration marker after replacing the leading legacy image. |
| Flickr | pass | Recovered all five matched Flickr originals from the local backup. |
| SEO | fail | Kept `publisher.seo`; full SEO review still needed. |
| Editorial note | pass | No current-info note required for this image recovery pass. |

## Applied changes

* Copied five verified Flickr originals into the post bundle:
  * `ringroad-in-the-south-64439142.jpg`
  * `first-time-at-lipa-noi-64439106.jpg`
  * `food-safe-district-64439149.jpg`
  * `samui-3951822257.jpg`
  * `first-step-into-the-gulf-of-thailand-64439158.jpg`
* Added `cover` frontmatter using `ringroad-in-the-south-64439142.jpg`.
* Replaced legacy `/wp-content/old-images/21.jpg` through `/25.jpg` references.
* Added concise alt text for the remaining body images.
* Removed `publisher.cover` and `publisher.covermigration`.
* Kept `publisher.description`, `publisher.summary`, `publisher.tags`, and `publisher.seo`.

## Flickr matches

| Legacy image | Flickr photo | Backup original |
| --- | --- | --- |
| `/wp-content/old-images/21.jpg` | `64439142` - ringroad in the south | `/home/patrick/Documents/Pictures/FlickrBackup/data-download-1/ringroad-in-the-south_64439142_o.jpg` |
| `/wp-content/old-images/22.jpg` | `64439106` - 1st time at Lipa Noi | `/home/patrick/Documents/Pictures/FlickrBackup/data-download-1/1st-time-at-lipa-noi_64439106_o.jpg` |
| `/wp-content/old-images/23.jpg` | `64439149` - food-safe district! | `/home/patrick/Documents/Pictures/FlickrBackup/data-download-1/food-safe-district_64439149_o.jpg` |
| `/wp-content/old-images/24.jpg` | `3951822257` - Samui | `/home/patrick/Documents/Pictures/FlickrBackup/data-download-6/samui_3951822257_o.jpg` |
| `/wp-content/old-images/25.jpg` | `64439158` - 1st step into the gulf of thailand | `/home/patrick/Documents/Pictures/FlickrBackup/data-download-1/1st-step-into-the-gulf-of-thailand_64439158_o.jpg` |

## January 2005 inventory note

The month has 34 posts. Nine posts contained local image references before this
batch. Confirmed Flickr-origin matches were found for `Inselrundfahrt` and
`Gegensätze?`; only `Inselrundfahrt` was recovered in this batch. `Ein Bild`,
`Hausbeschau`, `Bürobeschau`, `Learning to fly`, `Learning to drive`,
`Gegensätze?`, `Der Neue im Team`, and `Grumpy without a cup` still need either
backup recovery or an explicit decision to keep their existing local legacy
files.

## Publisher markers

```yaml
keep:
  description: Full metadata pass still needed.
  summary: Full metadata pass still needed.
  tags: Taxonomy pass still needed.
  seo: Full SEO review still needed.
remove:
  cover: Verified bundled image cover is present.
  covermigration: Legacy leading image was replaced by the bundled cover model.
```

## State record

```json
{
  "path": "src/content/posts/2005/01/2005-01-17-inselrundfahrt/index.md",
  "reviewedAt": "2026-07-20T14:10:00+07:00",
  "ruleset": "2026-07-20",
  "result": "changed",
  "markersAdded": [],
  "markersKept": ["description", "summary", "tags", "seo"],
  "markersRemoved": ["cover", "covermigration"],
  "changedFields": ["date", "cover", "lastmod", "publisher", "bodyImages", "body"],
  "unresolved": ["description", "summary", "tags", "seo"]
}
```
