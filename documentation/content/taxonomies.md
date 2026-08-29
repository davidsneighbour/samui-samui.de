# Content taxonomies

This website uses five separate taxonomies. Their public labels and URLs are
German:

| Mention | Correct field |
| --- | --- |
| Thaksin Shinawatra | `leute` |
| Koh Samui | `orte` |
| Military coup 2006 | `ereignisse` |
| Politics | `themen` |
| Tourism | `themen` |
| Tsunami 2004 | `ereignisse` |
| Lamai Beach | `orte` |
| Thai holidays page | `feiertage` |

> People, places, events, and holidays are registered entities. Every used value
> needs an entry in the matching content collection. Topics are an open
> editorial taxonomy and can be used without their own collection entry.

## Fields

`leute` describes concrete, identifiable people. `orte` describes concrete
geographic places, sights, buildings, beaches, venues, or administrative areas.
`ereignisse` describes concrete named historical, political, cultural, natural,
or recurring events. `feiertage` describes holiday entries. `themen` describes
general editorial topics, concepts, and keywords.

A person, place, or event is not also added as a topic. Instead, the post gets
the matching registered entity reference and only true general topics:

```yaml
leute:
  - thaksin-shinawatra
themen:
  - politik
  - exil
```

Wrong:

```yaml
leute:
  - thaksin-shinawatra
themen:
  - thaksin-shinawatra
```

## Entries and pages

A collection entry is the canonical data record. A public page is only the
rendering of that record. An entry may be minimal and still be used as a
registered reference. Details can be added later.

Minimal person entry:

```yaml
---
title: Full Name
---
```

Fuller person entry:

```yaml
---
title: Full Name
description: Short factual description.
aliases:
  - Alternative spelling
born: 1949-07-26
---
```

Minimal place:

```yaml
---
title: Place name
---
```

Fuller place:

```yaml
---
title: Lamai
description: Village on the east coast of Koh Samui.
type: dorf
parent: koh-samui
coordinates:
  latitude: 9.4726
  longitude: 100.0454
---
```

Minimal event entry:

```yaml
---
title: Event name
---
```

Fuller event entry:

```yaml
---
title: Military coup in Thailand 2006
description: Military coup against the government of Thaksin Shinawatra.
type: militaerputsch
startDate: 2006-09-19
orte:
  - thailand
  - bangkok
leute:
  - thaksin-shinawatra
---
```

Curated topic entry:

```yaml
---
title: Politics
description: Posts about politics in Thailand.
---
```

The examples show the structure. Fact values are only added when they have been
checked against existing content or reliable sources.

## IDs and filenames

All registered entities use `_index.md` inside a folder. The folder name is the
canonical ID:

```text
src/content/leute/thaksin-shinawatra/_index.md
```

The post reference is:

```yaml
leute:
  - thaksin-shinawatra
```

Do not use:

```yaml
leute:
  - Thaksin Shinawatra
  - thaksin-shinawatra/_index
```

Holiday references in posts point to entries in `src/content/feiertage/`. The
current public holiday surface is the section page at `/feiertage/`, so the
existing `_index.md` entry is referenced as `_index`.

Topics also use short values in posts. An entry in `src/content/themen/` is
optional and only acts as a curated metadata source.

## Aliases

`aliases` are metadata for search, duplicate checks, and editorial migration.
They are not alternate IDs. Posts always use the canonical ID.

## Places

`parent` can point to another place, for example `lamai` pointing to
`koh-samui`. This relationship is metadata, not a URL hierarchy. The public URL
stays flat:

```text
/orte/lamai/
```

## Events

Events are reusable named entities. They are useful when multiple posts can refer
to the same event. `recurring: true` marks recurring events. `endDate` must not
be before `startDate`.

Do not create an event for every passing mention in prose.

## Visibility

`draft: true` suppresses the public page and index-page entry. The entity remains
available as an internal data record.

`noindex: true` still creates a page, sets `robots: noindex,follow`, and removes
the page from the sitemap.

## URLs

The current public URLs are:

```text
/leute/
/leute/[id]/
/orte/
/orte/[id]/
/ereignisse/
/ereignisse/[id]/
/feiertage/
/themen/
/themen/[slug]/
```

The old `/tags/` URLs remain permanent redirects:

```text
/tags/       -> /themen/
/tags/abc/   -> /themen/abc/
```

## Validation

After taxonomy-related content changes, run:

```bash
npm run validate:taxonomies
npm run validate
```

`validate:taxonomies` checks:

* all `leute`, `orte`, `ereignisse`, and `feiertage` in posts;
* `parent` in places;
* `leute` and `orte` in events;
* event date ranges;
* duplicate alias conflicts.

Topics without collection entries are allowed. People, places, events, and
holidays without collection entries are errors.

## Common mistakes

Wrong: display names as references.

```yaml
leute:
  - Thaksin Shinawatra
```

Right:

```yaml
leute:
  - thaksin-shinawatra
```

Wrong: person also added as a topic.

```yaml
leute:
  - thaksin-shinawatra
themen:
  - thaksin-shinawatra
```

Right:

```yaml
leute:
  - thaksin-shinawatra
themen:
  - politik
```

## Migration strategy

The old `tags` values were technically migrated to `themen`. The new separation
of people, places, events, and topics is then applied gradually during editorial
review. Existing posts without `orte` or `ereignisse` remain valid. Places and
events are not inferred automatically from prose.
