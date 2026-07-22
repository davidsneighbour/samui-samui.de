# Publisher frontmatter

`publisher` is repo-internal post metadata for archive maintenance queues. It is
never rendered on the public site and may use ad hoc boolean, string, or number
properties when a migration or review batch needs a durable marker.

Manage these values with the publisher CLI:

```bash
npm run publisher -- list
npm run publisher -- set status need-work --year=2005
npm run publisher -- unset status --year=2005
```

`set` and `unset` require at least one filter. `list` may run without filters.
Available filters include year, path, current `publisher.status`, topic, and
special content filters for known archive cleanup queues.

## Textpattern tags

Posts that still contain legacy Textpattern link or footnote tags are marked
with:

```yaml
publisher:
  textpattern: true
```

Use the built-in filter to maintain this queue:

```bash
npm run publisher -- set textpattern true --textpattern-tags
npm run publisher -- list --textpattern-tags
```

The `--textpattern-tags` filter scans the full post file, including legacy
frontmatter fields, and matches these inline tag openings with or without
attributes:

* `<txp:gho_permalink>`
* `<txp:permlink>`
* `<txp:footnote>`

Do not automatically convert these posts from the marker alone.
`gho_permalink` and `permlink` values need manual research because the original
Textpattern IDs are no longer sufficient source data. `footnote` tags may be
converted to Markdown footnotes only after the affected post is reviewed.
