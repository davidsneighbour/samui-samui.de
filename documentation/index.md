# Documentation index

## Components

* [Blog list previews](components/blog-list-previews.md) documents rendered HTML
  excerpts and featured-card behavior in `BlogList.astro`.
* [Legacy image presentation](components/legacy-images.md) explains the
  automatic small-image rendering system for archive images and cover previews.
* [Editorial notices](components/notices.md) documents the `Notice.astro` and
  `<dnb-notice>` rendering pipeline.
* [Post covers](components/post-covers.md) describes optional image, YouTube,
  and Vimeo cover media rendered by post and list views.
* [Tooltips](components/tooltips.md) documents the shared tooltip primitive.
* [Vimeo embed](components/vimeo.md) documents the lazy Vimeo Astro wrapper and
  raw Markdown custom element.
* [YouTube embed](components/youtube.md) documents the lazy YouTube Astro wrapper
  and raw Markdown custom element.

## Content

* [Content schema](content/content-schema.md) records current Astro content
  schema import and loose-schema conventions.
* [Curation frontmatter](content/curation-frontmatter.md) defines the public
  editorial `curation` frontmatter contract.
* [Markdown typography](content/markdown-typography.md) explains the remark
  typography transform used for post prose.
* [People taxonomy migration](content/people-taxonomy-migration.md) records the
  migration from free-form `leute` values to canonical people IDs.
* [Post cover migration plan](content/post-cover-migration-plan.md) tracks the
  archive cover-media migration decisions and audit procedure.
* [Post metadata](content/post-metadata.md) documents Bangkok-time post dates and
  the shared metadata row.
* [Post paths](content/post-paths.md) explains post bundle storage paths and
  permalink resolution.
* [Publisher frontmatter](content/publisher-frontmatter.md) documents
  repo-internal archive-maintenance metadata.
* [Source citations](content/source-citations.md) defines named Markdown
  footnote citations for sourced posts.
* [Content taxonomies](content/taxonomies.md) explains the `leute`, `orte`,
  `ereignisse`, and `themen` taxonomy model.

## Features

* [Blog archive](features/archiv.md) documents the chronological archive,
  topic index, indexing choices, and archive data model.
* [Contact form](features/contact-form.md) documents contact-form rendering and
  Turnstile disclaimer styling.
* [Interactive maps](features/maps.md) records the MapLibre/OpenFreeMap map
  stack and data contracts.
* [Search](features/search.md) documents Pagefind search UI placement and index
  caching.

## Repository

* [Documentation server](documentation-server.md) explains the local Markdown
  preview server that can run beside the Astro dev server.
* [Link checking](link-checking.md) documents the Lychee wrapper for content
  Markdown and MDX links.
* [Quality gates](quality-gates.md) explains the repository's npm quality-gate
  script naming model.
* [Repo-local skills](repo-local-skills.md) documents pattern-based registration
  for `ai/skills/ss-*` assistant skills.
