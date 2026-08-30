# Curation frontmatter

Blog posts MAY use `curation` frontmatter for editorial decisions that affect where a post can be deliberately surfaced outside the normal chronological archive.

This block is for public-facing content curation, not internal work queues. Use `publisher` for repo-internal maintenance flags that are never rendered on the site.

## Contract

`curation` is a typed parent object. Each child branch represents one curated surface or feature. New branches MUST be added to `src/content.config.ts` and documented here before posts start using them.

The current schema defines only the `anniversary` branch:

```yaml
curation:
  anniversary:
    status: include
    note: "Still captures the old Samui mood well."
```

## Anniversary

`curation.anniversary` marks whether a post is suitable for future date-based archive features such as "Heute vor 10 Jahren" or "Heute vor 20 Jahren".

The branch has these fields:

* `status` (required): `include`, `exclude`, or `review`. Editorial decision for anniversary surfaces.
* `note` (optional): string. Editor note explaining the decision or future display context.

Status rules:

* `include` means the post is hand-picked and safe to surface in an anniversary feature.
* `exclude` means the post SHOULD NOT be surfaced by anniversary features, even if the date matches.
* `review` means the post looks like a possible candidate but needs a human pass before it can be surfaced.
* Missing `curation.anniversary` means the post has not been reviewed for this feature yet. It MUST NOT be treated as `include`.

Feature implementations SHOULD start conservatively by querying only posts with `curation.anniversary.status: include`. Broader modes, such as showing every matching post except explicit `exclude`, MUST be a deliberate feature decision, not the default interpretation of missing metadata.

## Future branches

Potential future branches, such as curated series or homepage placement, SHOULD live under the same parent:

```yaml
curation:
  anniversary:
    status: include
  series:
    status: review
```

The example above is illustrative only. `series` is not part of the schema yet. When it becomes real, define its fields and rules here in the same change that updates the content schema.
