<!-- markdownlint-disable title-case-style -->

# Source expansion mode

Use this subfunction only when Patrick explicitly asks to inspect or expand the
source list. Do not run it as part of an ordinary news research report.

Trigger examples:

* "have a look at our sources"
* "expand our sources"
* "scan the source list"
* "find sub-sources"
* "check whether these sources have other useful sections"

## Inputs

Accept one or more of:

* all entries in `resources/sources.new.yaml`;
* entries from one reviewed collection in `resources/sources/*.yaml`;
* entries matching a topic, language, source type, domain, or parent source;
* source entries or URLs supplied directly by Patrick.

## Inspection

For each selected source, inspect it as a reusable source entry point. Look for:

* sibling news sections;
* language-specific sections;
* RSS or Atom feeds;
* topic, tag, category, archive, search, press, event, tourism, transport,
  environment, entertainment, business, or official-update pages;
* official social profiles and newsletter archives;
* regional pages for Samui, Surat Thani, Thailand, or Asia;
* more stable entry points than the currently collected URL.

Do not collect every article URL. Collect a page only when it has recurring
rescanning value.

## Candidate handling

Append new candidates to `resources/sources.new.yaml`.

Keep existing entries. Do not sort, delete, rewrite, or promote entries during
source expansion unless Patrick explicitly asks for that maintenance step.

Before appending, compare by:

* canonical URL;
* source name;
* parent domain;
* parent publication or organisation;
* whether a broader or narrower entry already exists.

Use optional sub-source fields when useful:

```yaml
parent_source: Example publication
relation: language-section
```

Good `relation` values include:

* `language-section`
* `sibling-news-section`
* `rss-feed`
* `topic-page`
* `event-calendar`
* `press-archive`
* `official-profile`
* `regional-section`
* `search-page`

## Output

Return a short German summary with:

* inspected sources;
* newly added source candidates;
* useful candidates already present;
* sources that could not be inspected;
* follow-up decisions for Patrick.
