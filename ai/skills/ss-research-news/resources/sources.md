<!-- markdownlint-disable title-case-style -->

# Samui Samui research source model

This file explains how recurring research sources work for
`ss-research-news`. It is documentation, not the source database itself.

The research skill must always search beyond the local source files. The local
files are an additive starting point and a way to preserve useful source
discoveries between runs.

## File roles

`resources/sources.md` explains the source system, source format, review flow,
and reliability expectations.

`resources/sources.new.yaml` is the unreviewed source queue. After a report is
returned, append newly found recurring source candidates here in the source
format below. Keep existing entries in place. Do not sort, delete, rewrite, or
promote entries during an ordinary report run.

`resources/sources/*.yaml` contains reviewed, sorted, rescannable source
collections. Each file should cover one topic, beat, language group, or source
family, with enough notes that a future research run can scan it again
intelligently.

## What counts as a source

Collect recurring entry points, not one-off citations.

A source may be:

* a publication;
* an official organisation;
* a government announcement archive;
* an RSS or Atom feed;
* a section, category, tag, topic, or search page;
* an event calendar;
* a newsletter archive;
* a public social profile that is useful for discovery;
* a stable data or procurement search page.

Do not add every article URL to `resources/sources.new.yaml`. Add an article URL
only when it is also the most stable recurring entry point for that source, or
when no better public source URL is available yet.

## Source entry format

Use this YAML format in `resources/sources.new.yaml` and
`resources/sources/*.yaml`:

```yaml
- name: Example publication
  url: https://example.com/
  language:
    - en
  type:
    - local-news
  geographic_scope:
    - koh-samui
    - surat-thani
  strengths:
    - local event announcements
    - municipal reporting
  weaknesses:
    - frequently republishes press releases
  search_notes:
    - use site search
    - also search through external search engines
  active: true
```

Optional fields for discovered sub-sources:

```yaml
- name: Example publication German news section
  url: https://example.com/de/news/
  parent_source: Example publication
  relation: language-section
  language:
    - de
  type:
    - section
    - local-news
  geographic_scope:
    - thailand
  strengths:
    - German-language Thailand coverage
  weaknesses:
    - needs review for originality and update frequency
  search_notes:
    - sibling section discovered from the main Example publication navigation
    - rescan separately because it carries different stories from the English section
  active: true
```

Keep entries factual. Do not invent coverage claims, ownership details, update
frequency, or reliability notes that were not checked.

## Source types

Use one or more of these type values where they fit:

* homepage
* rss
* atom
* section
* tag_page
* topic_page
* search_page
* official_updates
* event_calendar
* social_account
* newsletter_archive
* local-news
* national-news
* international-news
* government
* tourism
* transport
* environment
* entertainment
* business
* data

Add a new type only when the existing vocabulary cannot describe the source
clearly.

## New source queue

At the end of each report run, update `resources/sources.new.yaml` after
presenting the report.

Append every newly found recurring source candidate that is not already present
in either:

* `resources/sources.new.yaml`;
* any reviewed collection in `resources/sources/*.yaml`.

Before appending, compare:

* canonical URL;
* source name;
* parent publication or organisation;
* parent domain;
* whether one entry is merely a narrower page on an already collected source.

If a new candidate is a narrower useful entry point for an existing source, add
it only when the narrower page has distinct rescanning value. Explain that in
`search_notes`.

## Source expansion mode

Source expansion is separate from normal report research. It runs only when
Patrick explicitly asks to look at or expand the source list.

Detailed operating instructions live in `resources/source-expansion.md`.

During source expansion, inspect existing source websites and look for reusable
sub-sources or sibling sources, such as:

* language-specific news sections;
* a second news section with different content;
* RSS or Atom feeds;
* press, announcement, event, tourism, transport, business, environment, or
  entertainment sections;
* official social profiles or newsletter archives linked from the source;
* regional pages for Samui, Surat Thani, Thailand, or Asia.

Append newly found candidates to `resources/sources.new.yaml`, not to reviewed
collections. Use `parent_source` and `relation` for sub-sources so Patrick can
see where they came from and why they might matter.

## Reviewed collections

Reviewed files in `resources/sources/*.yaml` are maintained manually. They are
for sources that Patrick has accepted as useful enough to sort into the working
collection.

Suggested collection files include:

* `official.yaml`
* `local-news.yaml`
* `tourism.yaml`
* `transport.yaml`
* `events.yaml`
* `environment.yaml`
* `business.yaml`
* `german-language.yaml`
* `social-discovery.yaml`

Do not move entries from `resources/sources.new.yaml` into these files unless
explicitly instructed.

## Reliability expectations

Do not assume that inclusion in any source file makes a source reliable for
every topic.

For sensitive or consequential claims, verify against primary or independent
sources. Social accounts, promotional pages, tourism marketing, event listings,
and copied press releases are useful for discovery but usually insufficient as
the only evidence.

For every maintained or reviewed source entry, prefer notes that explain:

* what the source is good for;
* what it is weak at;
* whether it tends to publish original reporting, official announcements,
  rewritten press releases, listings, or discovery hints;
* how to rescan it efficiently;
* whether dates, pagination, language, paywalls, or duplicated content need
  special care.
