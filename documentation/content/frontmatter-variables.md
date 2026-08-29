# Frontmatter variables

This is the index of frontmatter properties accepted by the Astro content
schema in `src/content.config.ts`. Keep the detailed rules in the focused
documentation files linked from the "Documentation" column; this page is a
stub-level map so agents and editors can find the right contract quickly.

When adding, removing, or changing a frontmatter property, update this file in
the same change set as the schema and focused documentation update.

## Shared properties

These fields come from the shared base frontmatter schema and can appear on
content collections that extend it.

| Property | Collections | Shape | Documentation |
| --- | --- | --- | --- |
| `title` | posts, people, places, events, topics, holidays, sitewide snippets | Required string. | [Content schema](content-schema.md) |
| `description` | posts, people, places, events, topics, holidays, sitewide snippets | Optional string. | [Content schema](content-schema.md) |

## Posts

Post entries live in `src/content/posts/**/index.md`. The post schema is loose
so unknown legacy migration fields are preserved, but new supported fields
should be listed here and documented in a focused file.

| Property | Shape | Stub | Documentation |
| --- | --- | --- | --- |
| `cover` | Optional object. | Public post/list cover media. Uses one of the image, YouTube, or Vimeo shapes below. | [Post covers](../components/post-covers.md), [Legacy image presentation](../components/legacy-images.md) |
| `cover.type` | Required when `cover` exists. | `image`, `youtube`, or `vimeo`. | [Post covers](../components/post-covers.md) |
| `cover.src` | Required for image covers. | Bundle-local image file name only; no paths. | [Post covers](../components/post-covers.md) |
| `cover.caption` | Optional string. | Preferred visible media caption for new cover entries. | [Post covers](../components/post-covers.md) |
| `cover.alt` | Optional string. | Image alt text; falls back through cover caption and post title. | [Post covers](../components/post-covers.md) |
| `cover.title` | Optional string. | Legacy image caption alias, or video title fallback when `caption` is missing. | [Post covers](../components/post-covers.md) |
| `cover.legacyPresentation` | Optional enum. | Per-cover image presentation override: `auto`, `always`, or `never`. | [Legacy image presentation](../components/legacy-images.md) |
| `cover.video` | Required for YouTube and Vimeo covers. | YouTube or Vimeo video id; strings and numbers are accepted. | [Post covers](../components/post-covers.md) |
| `cover.params` | Optional string. | Extra YouTube player URL parameters. | [Post covers](../components/post-covers.md), [YouTube embed](../components/youtube.md) |
| `cover.startAt` | Optional string. | Vimeo start offset. | [Post covers](../components/post-covers.md), [Vimeo embed](../components/vimeo.md) |
| `cover.hash` | Optional string. | Vimeo unlisted-video hash. | [Post covers](../components/post-covers.md), [Vimeo embed](../components/vimeo.md) |
| `cover.autoload` | Optional boolean. | Video-cover facade loads the iframe when it scrolls into view. | [Post covers](../components/post-covers.md) |
| `cover.autoplay` | Optional boolean. | Autoplays a video cover when used together with `autoload`. | [Post covers](../components/post-covers.md) |
| `curation` | Optional object. | Public editorial curation metadata. | [Curation frontmatter](curation-frontmatter.md) |
| `curation.anniversary` | Optional object. | Date-based curation branch. | [Curation frontmatter](curation-frontmatter.md) |
| `curation.anniversary.status` | Required when `curation.anniversary` exists. | `include`, `exclude`, or `review`. | [Curation frontmatter](curation-frontmatter.md) |
| `curation.anniversary.note` | Optional string. | Short editorial note explaining the anniversary decision. | [Curation frontmatter](curation-frontmatter.md) |
| `date` | Required date. | Publication timestamp, interpreted in Thailand time. | [Post metadata](post-metadata.md), [Post paths](post-paths.md) |
| `dsq_thread_id` | Optional array. | Legacy Disqus thread ids retained from migration data. | [Content schema](content-schema.md) |
| `ereignisse` | Array of event references, default `[]`. | Registered event ids associated with the post. | [Content taxonomies](taxonomies.md) |
| `featured_image` | Optional string. | Legacy absolute public image path retained for migrated posts. | [Legacy image presentation](../components/legacy-images.md) |
| `lastmod` | Optional date. | Last-modified timestamp, interpreted in Thailand time. | [Post metadata](post-metadata.md) |
| `legacyImages` | Enum, default `auto`. | Post-level legacy image presentation override: `auto`, `always`, or `never`. | [Legacy image presentation](../components/legacy-images.md) |
| `leute` | Array of people references, default `[]`. | Registered person ids associated with the post. | [Content taxonomies](taxonomies.md) |
| `options` | Object, default `{ featured: true }`. | Post display options. | [Blog list previews](../components/blog-list-previews.md) |
| `options.featured` | Boolean, default `true`. | Set to `false` to opt a post out of the homepage lead-article slot. | [Blog list previews](../components/blog-list-previews.md) |
| `orte` | Array of place references, default `[]`. | Registered place ids associated with the post. | [Content taxonomies](taxonomies.md) |
| `publisher` | Optional loose object. | Repo-internal archive-maintenance metadata, never rendered publicly. | [Publisher frontmatter](publisher-frontmatter.md) |
| `publisher.status` | Optional string. | Free-form internal work-queue label. | [Publisher frontmatter](publisher-frontmatter.md) |
| `publisher.covermigration` | Optional boolean. | Internal marker for posts needing cover migration review. | [Post covers](../components/post-covers.md), [Post cover migration plan](post-cover-migration-plan.md), [Publisher frontmatter](publisher-frontmatter.md) |
| `publisher.textpattern` | Optional boolean. | Internal marker for legacy Textpattern tags found by publisher tooling. | [Publisher frontmatter](publisher-frontmatter.md) |
| `resources` | Optional array. | Legacy Hugo-style resource metadata retained during cover migration. | [Post covers](../components/post-covers.md), [Post cover migration plan](post-cover-migration-plan.md) |
| `resources.name` | Optional string. | Legacy resource name. | [Post cover migration plan](post-cover-migration-plan.md) |
| `resources.src` | Required string within a resource. | Legacy resource source path. | [Post cover migration plan](post-cover-migration-plan.md) |
| `resources.title` | Optional string. | Legacy resource title or caption. | [Post cover migration plan](post-cover-migration-plan.md) |
| `summary` | Optional string. | Fallback preview text when rendered post HTML is unavailable. | [Blog list previews](../components/blog-list-previews.md) |
| `themen` | Array of strings, default `[]`. | Open topic ids associated with the post. | [Content taxonomies](taxonomies.md) |
| `url` | Optional string. | Explicit legacy permalink; otherwise the URL is derived from date and folder slug. | [Post paths](post-paths.md) |
| `video` | Optional string. | Legacy post-level video field retained from migration data. | [Content schema](content-schema.md), [Post covers](../components/post-covers.md) |

## People

People entries live in `src/content/leute/**/_index.md`.

| Property | Shape | Stub | Documentation |
| --- | --- | --- | --- |
| `aliases` | Array of strings, default `[]`. | Alternative names or spellings. | [Content taxonomies](taxonomies.md) |
| `born` | Optional date. | Birth date when known and verified. | [Content taxonomies](taxonomies.md) |
| `died` | Optional date. | Death date when known and verified. | [Content taxonomies](taxonomies.md) |
| `draft` | Boolean, default `false`. | Draft-state marker for entity entries. | [Content schema](content-schema.md), [Content taxonomies](taxonomies.md) |
| `image` | Optional string. | Entity image path or identifier. | [Content schema](content-schema.md) |
| `noindex` | Boolean, default `false`. | Search-engine indexing override for entity pages. | [Content schema](content-schema.md) |
| `subtitle` | Optional string. | Short descriptor (e.g. a role) shown as a tooltip by the `<dnb-person>`/`<PersonLink>` taxonomy link. | [Person taxonomy link](../components/person-link.md) |

## Places

Place entries live in `src/content/orte/**/_index.md`.

| Property | Shape | Stub | Documentation |
| --- | --- | --- | --- |
| `aliases` | Array of strings, default `[]`. | Alternative names or spellings. | [Content taxonomies](taxonomies.md) |
| `coordinates` | Optional object. | Geographic coordinates. | [Content taxonomies](taxonomies.md), [Interactive maps](../features/maps.md) |
| `coordinates.latitude` | Required number when `coordinates` exists. | Latitude between -90 and 90. | [Content taxonomies](taxonomies.md), [Interactive maps](../features/maps.md) |
| `coordinates.longitude` | Required number when `coordinates` exists. | Longitude between -180 and 180. | [Content taxonomies](taxonomies.md), [Interactive maps](../features/maps.md) |
| `draft` | Boolean, default `false`. | Draft-state marker for entity entries. | [Content schema](content-schema.md), [Content taxonomies](taxonomies.md) |
| `noindex` | Boolean, default `false`. | Search-engine indexing override for entity pages. | [Content schema](content-schema.md) |
| `parent` | Optional place reference. | Parent place id, such as an island, city, province, or country. | [Content taxonomies](taxonomies.md) |
| `type` | Optional enum. | Place type such as `land`, `insel`, `stadt`, `strand`, or `sonstiges`. | [Content taxonomies](taxonomies.md) |

## Events

Event entries live in `src/content/ereignisse/**/_index.md`.

| Property | Shape | Stub | Documentation |
| --- | --- | --- | --- |
| `aliases` | Array of strings, default `[]`. | Alternative names or spellings. | [Content taxonomies](taxonomies.md) |
| `draft` | Boolean, default `false`. | Draft-state marker for event entries. | [Content schema](content-schema.md), [Content taxonomies](taxonomies.md) |
| `endDate` | Optional date. | Event end date; must not be before `startDate`. | [Content taxonomies](taxonomies.md) |
| `leute` | Array of people references, default `[]`. | Registered people associated with the event. | [Content taxonomies](taxonomies.md) |
| `noindex` | Boolean, default `false`. | Search-engine indexing override for event pages. | [Content schema](content-schema.md) |
| `orte` | Array of place references, default `[]`. | Registered places associated with the event. | [Content taxonomies](taxonomies.md) |
| `recurring` | Boolean, default `false`. | Marks recurring events. | [Content taxonomies](taxonomies.md) |
| `startDate` | Optional date. | Event start date. | [Content taxonomies](taxonomies.md) |
| `type` | Optional enum. | Event type such as `wahl`, `militaerputsch`, `festival`, or `sonstiges`. | [Content taxonomies](taxonomies.md) |

## Topics

Topic entries live in `src/content/themen/**/_index.md`.

| Property | Shape | Stub | Documentation |
| --- | --- | --- | --- |
| `aliases` | Array of strings, default `[]`. | Alternative topic labels. | [Content taxonomies](taxonomies.md) |
| `slug` | Optional string. | Explicit topic slug override. | [Content taxonomies](taxonomies.md), [Content schema](content-schema.md) |

## Holidays

Holiday entries live in `src/content/feiertage/**/_index.md`.

| Property | Shape | Stub | Documentation |
| --- | --- | --- | --- |
| `date` | Optional date. | Holiday date. | [Content schema](content-schema.md) |

## Sitewide snippets

Sitewide snippets live in `src/content/sitewide/**/index.md` and are consumed by
templates rather than routed as standalone pages.

| Property | Shape | Stub | Documentation |
| --- | --- | --- | --- |
| `image` | Optional optimized image. | Bundle-local image used by the consuming template. | [Content schema](content-schema.md) |
| `imagetitle` | Optional string. | Image title or alt/caption source used by the consuming template. | [Content schema](content-schema.md) |
| `lastmod` | Optional date. | Last-modified timestamp for the snippet. | [Content schema](content-schema.md), [Post metadata](post-metadata.md) |
