# Site-wide taxonomy rules

Themen form the open editorial topic vocabulary across the complete website.
People, places, and events are registered entities; see
`documentation/taxonomien.md`.

## Principles

* Prefer an existing canonical topic over a new synonym.
* Themen describe durable general subjects, concepts, activities, and recurring themes.
* Themen do not describe content format unless that format is a meaningful site taxonomy.
* Concrete people, places, and named events belong in `leute`, `orte`, or `ereignisse`, not in `themen`.
* Do not add search phrases merely because they might rank.
* Do not create singular/plural, spelling, umlaut/transliteration, German/English, or abbreviation variants without a taxonomy decision.
* Use the spelling and casing already established by the topic collection.
* Avoid topics that apply to almost every post, unless they are intentionally used as a major navigation facet.
* Avoid hyper-specific one-post topics unless the subject is likely to recur or deserves a dedicated archive.

## Review procedure

1. Extract candidate topics from the complete post.
2. Inspect existing topics and topic pages.
3. Inspect related posts.
4. Map each candidate to an existing canonical topic where possible.
5. Identify aliases and near-duplicates.
6. Propose new topics separately; do not silently create them.
7. Record taxonomy decisions in the central registry.

## Central registry

Use, in order of preference:

1. a repository-maintained topic registry
2. the `src/content/themen` collection
3. a generated inventory under `ai/reports/contentrework/tags.json`

The registry should track:

* canonical topic
* slug
* display name
* aliases
* scope note
* post count
* first and latest use
* status: active, merge-candidate, deprecated
* replacement topic when deprecated

## Acceptance criteria

The `themen` category passes when:

* every topic is canonical
* no obvious relevant established topic is missing
* no topic is misleading
* no duplicate alias remains
* any proposed taxonomy change is resolved or explicitly deferred
