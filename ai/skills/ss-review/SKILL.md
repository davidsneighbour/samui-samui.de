---
name: ss-review
description: Review one samui-samui.de blog post for editorial quality, metadata, SEO, taxonomies, links, images, cover migration, Flickr references, and repository-specific content standards. Use for existing posts and new drafts, with or without publisher frontmatter.
---

<!-- markdownlint-disable title-case-style -->

# ss-review

Review exactly one blog post from `samui-samui.de`.

This is the atomic content-review skill. It may be invoked directly for a
single post or by `ss-refactor` as part of a queue. Do not select another post
and do not manage a batch.

## Scope

Inspect:

* frontmatter validity and completeness
* title
* description
* summary
* body language and readability
* factual and historical context
* headings and document structure
* internal and external links
* taxonomies and site-wide taxonomy consistency
* cover configuration and cover migration
* all body images
* Flickr references and recoverable originals
* on-page and technical SEO signals visible from the source
* editorial notes needed for outdated or historical content

Preserve the author's voice, the historical character of the post, and the
original publication date. Do not silently rewrite history.

## Required inputs

Resolve one post from one of:

* an explicit repository path
* a currently open post
* a slug
* a URL that maps unambiguously to a post
* content supplied directly by the user

For a new draft, review the supplied content even when `publisher` frontmatter
is absent.

## Authoritative repository context

Before changing content, inspect these when present:

1. `AGENTS.md`
2. the post schema in `src/content.config.ts`
3. repository documentation relevant to posts, images, covers, Markdown, and
   editorial notes
4. `ai/skills/ss-review/resources/*.md`
5. the taxonomy documentation and topic collection
6. neighbouring posts when useful for terminology and internal links

The most specific repository instruction wins.

## Operating modes

### Audit mode

Use when the user asks to check, inspect, audit, or report.

* Do not modify files.
* Return the structured review report.
* Recommend exact changes.
* Explain publisher marker changes that would follow.

### Fix mode

Use when the user asks to fix, rework, update, or prepare the post.

* Review first.
* Make only justified changes.
* Preserve meaning and voice.
* Update `lastmod` only when repository policy requires it.
* Update publisher markers according to `resources/publisher-markers.md`.
* Return the structured review report plus a concise change summary.

### Publication mode

Use for a new or recently written post.

* Run the complete review without requiring publisher markers.
* Do not add migration-only markers merely because they are absent.
* Treat the post as current content unless the user says otherwise.

## Review sequence

### 1. Load context

Read the full post, frontmatter, referenced local assets, and relevant
repository rules.

Identify:

* post date and historical period
* primary subject
* likely search intent
* named entities, places, people, businesses, and events
* whether the post is diary, travel information, opinion, news commentary,
  reference content, or mixed

### 2. Validate source integrity

Check:

* valid YAML frontmatter
* valid schema fields and types
* no accidental content loss
* no broken Markdown or HTML
* no unresolved migration artefacts
* no unsupported embedded services
* dates, URLs, and asset paths use repository conventions

Do not normalize unrelated frontmatter formatting unless necessary.

### 3. Review the title

The title must:

* accurately describe the post
* remain faithful to the author's voice
* be distinguishable from other site titles
* avoid keyword stuffing
* use the primary topic naturally when appropriate
* make sense outside the archive context
* not invent certainty, urgency, or relevance absent from the post

Do not replace a characteristic personal title merely to satisfy generic SEO
advice. Suggest a more descriptive title only when the existing title
materially obscures the topic.

### 4. Review `description`

Follow `resources/editorial-fields.md`.

`description` is the canonical search/social description. It must be unique,
factual, useful, and specific to the post.

### 5. Review `summary`

Follow `resources/editorial-fields.md`.

`summary` is visible editorial copy used by the site. It may overlap with
`description`, but should read naturally in archive cards and lists.

### 6. Review the body

Follow `resources/editorial-rules.md`.

Correct:

* spelling
* punctuation
* malformed encodings and HTML entities
* obvious grammatical errors
* broken paragraphs and headings
* confusing references that can be clarified without changing the historical
  record
* obsolete embeds or presentation artefacts

Do not erase period language, dated observations, or personal tone merely
because they are old.

When information is outdated, prefer an editorial note over rewriting the
original claim as though it had always been current.

### 7. Review taxonomies

Follow `resources/tag-rules.md`.

Use the four German taxonomies documented in
`documentation/taxonomien.md`. Compare proposed topics against existing topics
and related posts, and use registered `leute`, `orte`, and `ereignisse`
references for concrete people, places, and named events.

### 8. Review images and cover

Follow `resources/image-rules.md`.

Inspect:

* cover existence and configuration
* cover relevance
* cover migration state
* local source quality
* dimensions and aspect ratio
* meaningful alt text
* captions and attribution
* duplicate or inferior source files
* body image references
* layout or performance risks visible from source

Never upscale or fabricate a historical photo as though it were an original. AI
restoration or generated replacements require explicit user approval and clear
editorial handling.

### 9. Review Flickr state

Follow `resources/publisher-markers.md`.

Search the post, source URLs, captions, shortcodes, HTML, image names, and
surrounding migration documentation for Flickr references.

A Flickr marker means manual source recovery or verification is still required.
Do not clear it solely because the visible page renders.

### 10. Run SEO review

Follow `resources/seo-rules.md`.

SEO is a holistic pass. It is not satisfied merely by having a title,
description, and taxonomies.

### 11. Determine editorial note requirements

Recommend an editorial note when:

* practical information is no longer current
* a business, route, venue, law, price, service, or website has changed
* an old external link is intentionally retained for historical context
* a historical prediction or developing event needs a present-day outcome
* an image, embed, or source is unavailable
* Thailand-specific legal or political context warrants caution

Do not add a note for age alone.

### 12. Update publisher markers

Use `resources/publisher-markers.md`.

Markers represent unresolved work, not proof of completion. Remove a marker
only when its defined acceptance criteria are satisfied. Add a marker when the
review finds unresolved work in that category.

Durable review history belongs in the content-rework resume state when
`ss-review` is invoked by `ss-refactor` for the global rework. Ordinary
single-post reviews do not need content-rework state.

## Required output

Use the contract in `resources/review-output.md`.

Always state:

* pass/fail/needs-decision for every review area
* exact proposed or applied changes
* publisher markers to add, keep, or remove
* unresolved manual decisions
* SEO ruleset version used
* tag registry version or snapshot used when available

## Safety and restraint

* Never bulk-edit posts.
* Never fabricate facts, dates, quotes, locations, image provenance, or
  historical outcomes.
* Never change the post's original publication date to make it appear current.
* Never remove attribution.
* Never clear a marker based on assumption.
* Never publish, commit, or push from an ordinary single-post review unless
  explicitly requested or invoked through a workflow that includes that
  permission.
