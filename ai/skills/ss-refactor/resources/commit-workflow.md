# Batch commit workflow

## Preconditions

Before preparing a commit:

* list every modified file
* separate content changes from generated resume state
* run repository-required formatting, validation, tests, and content checks
* confirm no unrelated changes are included
* confirm every changed post has a review record
* confirm marker removals correspond to passed acceptance criteria
* confirm the GitHub issue the commit should reference

## Commit cadence

The normal repository policy says finished work should be committed. During a
global content-rework session, this workflow explicitly overrides that cadence:
do not commit every five minutes or after every reviewed post unless the user
chooses that mode.

At the start of a long content-rework session, ask:

```text
Should I keep one bulk commit for this session, or commit after each reviewed
post?
```

Default to one bulk commit at the end of the session. For a large or risky
session, propose a small number of coherent commits split by topic, year, image
recovery, or tooling changes.

## Commit subject

```text
content(refactor): content rework
```

## Commit body

Use this structure:

```text
Reworked posts:

- YYYY-MM-DD — Post title
  - description and summary revised
  - tags aligned with the canonical taxonomy
  - cover migrated and verified
  - SEO and editorial review completed

- YYYY-MM-DD — Another post title
  - Flickr source investigation recorded
  - broken links corrected
  - historical editorial note added

Ruleset: ss-review SEO <version>
Batch: <batch-id>
See #<issue>
```

List only work actually included in the commit.

## Commit boundaries

Prefer coherent, reviewable batches. Split the batch when:

* it becomes difficult to review
* tag taxonomy changes affect many otherwise unrelated posts
* image asset recovery produces large binary changes
* code/tooling changes are required
* a migration changes site behaviour rather than content alone

Tooling changes should normally use a separate commit from content rework.
