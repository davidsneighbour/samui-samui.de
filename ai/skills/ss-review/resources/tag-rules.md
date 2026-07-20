# Site-wide tag rules

Tags form a controlled vocabulary across the complete website.

## Principles

* Prefer an existing canonical tag over a new synonym.
* Tags describe durable subjects, places, activities, people, events, or recurring themes.
* Tags do not describe content format unless that format is a meaningful site taxonomy.
* Do not add search phrases merely because they might rank.
* Do not create singular/plural, spelling, umlaut/transliteration, German/English, or abbreviation variants without a taxonomy decision.
* Use the spelling and casing already established by the tag collection.
* Avoid tags that apply to almost every post, unless they are intentionally used as a major navigation facet.
* Avoid hyper-specific one-post tags unless the subject is likely to recur or deserves a dedicated archive.

## Review procedure

1. Extract candidate topics from the complete post.
2. Inspect existing tags and tag pages.
3. Inspect related posts.
4. Map each candidate to an existing canonical tag where possible.
5. Identify aliases and near-duplicates.
6. Propose new tags separately; do not silently create them.
7. Record tag decisions in the central registry.

## Central registry

Use, in order of preference:

1. a repository-maintained tag registry
2. the `src/content/tags` collection
3. a generated inventory under `ai/reports/contentrework/tags.json`

The registry should track:

* canonical tag
* slug
* display name
* aliases
* scope note
* post count
* first and latest use
* status: active, merge-candidate, deprecated
* replacement tag when deprecated

## Acceptance criteria

The `tags` category passes when:

* every tag is canonical
* no obvious relevant established tag is missing
* no tag is misleading
* no duplicate alias remains
* any proposed taxonomy change is resolved or explicitly deferred
