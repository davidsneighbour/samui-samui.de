<!-- markdownlint-disable MD013 -->
# Documentation index

## Components

* [Analytics](components/analytics.md) links the official Matomo JavaScript and HTTP Tracking API references used by `Analytics.astro`.
* [Blog list previews](components/blog-list-previews.md) documents rendered HTML excerpts and featured-card behavior in `BlogList.astro`.
* [Component structure](components/structure.md) defines the topic-based `src/components/` folder layout.
* [Giscus comments](components/giscus-comments.md) documents the lazy giscus widget, custom theme URLs, and local-development theme limitations.
* [Footer](components/footer.md) documents the shared footer's social profile links, icons, and accessibility.
* [Header navigation](components/header-navigation.md) documents sticky positioning, footer release, keyboard focus, anchor clearance, and view-transition cleanup.
* [Legacy image presentation](components/legacy-images.md) explains the automatic small-image rendering system for archive images and cover previews.
* [Logo coastline](components/logo-coastline.md) records the OSM snapshot, geographic masters, projection, regeneration, licence, and attribution requirements.
* [Logo kit](components/logo-kit.md) documents the approved island-and-punctuation identity, exports, favicon options, usage rules, and regeneration.
* [Masthead](components/masthead.md) documents the responsive site title, header-owned CSS, and dev-only masthead preview route.
* [Editorial notices](components/notices.md) documents the `Notice.astro` and `<dnb-notice>` rendering pipeline.
* [Person taxonomy link](components/person-link.md) documents the `<PersonLink>`/`<dnb-person>` link from post prose to a `personen` entity page.
* [Post covers](components/post-covers.md) describes optional image, YouTube, and Vimeo cover media rendered by post and list views.
* [Prose reading column](components/prose-reading-column.md) documents the post text measure and the build-time marking that lets embedded media use the full card width.
* [Theme toggle](components/theme-toggle.md) documents the masthead light/dark theme button and its Morphicons icon morph.
* [Tooltips](components/tooltips.md) documents the shared tooltip primitive.
* [Vimeo embed](components/vimeo.md) documents the lazy Vimeo Astro wrapper and raw Markdown custom element.
* [YouTube embed](components/youtube.md) documents the lazy YouTube Astro wrapper and raw Markdown custom element.

## Content

* [Content schema](content/content-schema.md) records current Astro content schema import and loose-schema conventions.
* [Curation frontmatter](content/curation-frontmatter.md) defines the public editorial `curation` frontmatter contract.
* [Flickr photo restoration](content/flickr-photo-restoration.md) records how the archive photos of the deleted Flickr account were restored from the Flickr data export into the post bundles.
* [Frontmatter variables](content/frontmatter-variables.md) indexes all supported content frontmatter properties and links to their focused documentation.
* [German citation dates](content/german-citation-dates.md) documents the staged citation date check and its explicit archive audit.
* [German orthography and grammar](content/german-orthography-and-grammar.md) documents the house spelling policy, the CSpell, Vale, and LanguageTool checks, their baselines, and the triage rules.
* [German umlaut normalisation](content/german-umlaut-normalisation.md) documents the narrow HTML entity replacement script, its npm commands, and pre-commit behaviour.
* [Markdown typography](content/markdown-typography.md) explains the remark typography transform used for post prose.
* [People taxonomy migration](content/people-taxonomy-migration.md) records the migration from free-form `leute` values to canonical people IDs.
* [Post cover migration plan](content/post-cover-migration-plan.md) tracks the archive cover-media migration decisions and audit procedure.
* [Post metadata](content/post-metadata.md) documents Bangkok-time post dates and the shared metadata row.
* [Post relevance](content/post-relevance.md) defines the optional editorial relevance field and frontmatter completion setup.
* [Post paths](content/post-paths.md) explains post bundle storage paths and permalink resolution.
* [Publisher frontmatter](content/publisher-frontmatter.md) documents repo-internal archive-maintenance metadata.
* [Source citations](content/source-citations.md) defines named Markdown footnote citations for sourced posts.
* [Social profile copy](content/social-profiles.md) contains reusable German bio and introduction text for the site's social accounts.
* [Content taxonomies](content/taxonomies.md) explains the `personen`, `orte`, `ereignisse`, and `themen` taxonomy model.
* [Textpattern tag migration](content/textpattern-tags.md) records the sorted legacy-tag inventory, replacement rules, and unresolved historical IDs.
* [Video thumbnail cache](content/video-thumbnail-cache.md) documents the locally cached YouTube/Vimeo poster images, the fetch/verify script, and its lint-staged and GitHub Actions wiring.

## Features

* [Static article maps](features/static-maps.md) documents frontmatter, offline OSM data, generation, automatic attribution, verification, and the legacy migration inventory.

* [Ahrefs audit sample](features/ahrefs-audit-sample.md) documents the generated custom URL-list sample used for Ahrefs Site Audit crawls.
* [Blog archive](features/archiv.md) documents the chronological archive, topic index, indexing choices, and archive data model.
* [About the author](features/about-author.md) documents the unlinked author-page draft, its indexing controls, and the later editorial launch checklist.
* [Contact form](features/contact-form.md) documents contact-form rendering, the `/api/contact` Worker endpoint, its secrets, and Turnstile disclaimer styling.
* [IUMAS](features/iumas.md) documents the four-lane title/subtitle/logo/image history graph at `/iumas/` (formerly `/taglines/`).
* [Interactive maps](features/maps.md) records the MapLibre/OpenFreeMap map stack and data contracts.
* [Life timeline map](features/life-timeline.md) documents the experimental `/timeline/` animated life-timeline map, its sparse-year data schema, and the 2005 plane-journey animation.
* [Life timeline authoring guide](features/life-timeline-authoring.md) is a copy-paste-driven guide to registering places and authoring real timeline entries (simple years, periods, multi-location years, journeys, the finale).
* [Related posts](features/related-posts.md) documents taxonomy scoring, deterministic selection, and single-post discovery links.
* [Search](features/search.md) documents Pagefind search UI placement and index caching.
* [Sound effects](features/sound-effects.md) documents optional Cuelume interaction sounds, persistence, and fallback behavior.
* [Weather widget](features/weather-widget.md) documents the compact, lazy-loaded Koh Samui weather note, its Worker/Open-Meteo proxy, and caching layers.

## Hosting

* [Hosting architecture](hosting/architecture.md) explains where each request runs (DreamHost origin, Cloudflare cache, `/api/*` Worker), why Netlify was replaced, and the development-phase versus steady-state policy.
* [Caching and invalidation](hosting/caching.md) records the edge and browser cache policy and TTL reasoning, the Cloudflare Cache Rules, broad versus selective purging, deterministic builds, cache warming, and cache-status inspection.
* [Deployment](hosting/deployment.md) documents the deploy commands and pipeline, atomic DreamHost releases, release management, rollback, secrets and the Cloudflare token, where deploys run, and the smoke tests.
* [Migration from Netlify](hosting/migration.md) is the cutover runbook: component map, DNS and TLS steps, verification and measurements, rollback, and the Netlify clean-up checklist.
* [Cloudflare MCP server](hosting/cloudflare-mcp.md) documents the project-scoped Cloudflare MCP server and its file-based token authentication.

## Repository

* [Dependency security](dependency-security.md) records safe remediation, package-fragment ownership, and unresolved advisory tracking.
* [Documentation server](documentation-server.md) explains the local Markdown preview server that can run beside the Astro dev server.
* [Link checking](link-checking.md) documents the Lychee wrapper for content Markdown and MDX links.
* [Local development](local-development.md) records local dev-server behavior such as Vite watcher exclusions.
* [Posthaste](posthaste.md) documents repository-local social publishing defaults, credential storage, publishing history, and confirmation rules.
* [Facebook and Instagram publishing](meta-publishing.md) records account requirements, application permissions, integration status, and media requirements.
* [Quality gates](quality-gates.md) explains the repository's npm quality-gate script naming model.
* [Repo-local skills](repo-local-skills.md) documents pattern-based registration for `.agents/skills/ss-*` assistant skills.
