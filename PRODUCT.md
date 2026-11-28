# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Readers interested in Samui, Thailand, and Patrick Kollitsch's life and experiences. They visit for personal writing and useful local information.

## Product purpose

Samui? Samui! publishes Patrick's German-language writing about everyday life on Koh Samui, Thailand, and subjects that interest him. Prioritise new writing and useful local information while keeping the long-running personal archive available.

Success means readers can discover new writing, find useful local information, and understand when an older account may no longer reflect present conditions. No numerical success targets have been agreed.

## Positioning

A personal account rooted in Patrick's life on Koh Samui since 2005, with an archive that records how both the island and the author change over time. The author page explicitly defines the site as personal rather than a company website or a conventional travel guide.

## Operating context

Visitors read individual articles, browse chronological and subject archives, use site search, and learn about the author. The public content language is German. Post calendar dates use Thailand time (`Asia/Bangkok`).

## Capabilities and constraints

* Publish new writing and useful local information without losing the historical archive.
* Old posts MUST make clear that their information may be outdated. Publication dates and historical context must remain understandable; do not present historical observations, prices, services, or advice as verified current facts.
* The exact presentation and scope of outdated-information notices remain an open design decision. This product record establishes the requirement; it does not claim that all existing posts already satisfy it.
* Preserve existing content and historical URLs under the repository's content-preservation rules.
* Keep people, places, named events, and general topics distinct. Public topic labels use `Themen`.
* Follow the established static Astro architecture, privacy rules, and third-party connection boundaries in [AGENTS.md](AGENTS.md).

## Brand commitments

The name is Samui? Samui!. Existing editorial guidance calls for first-person writing, dry humour, specific observations, and a personal rather than promotional voice. Preserve the author's perspective and supplied wording. Visual tokens and component rules belong in [DESIGN.md](DESIGN.md).

## Evidence on hand

* [Author page](src/pages/ueber-mich.mdx): the author's account of moving to Samui, everyday life, the site's purpose, and its subjects.
* [Author-page documentation](documentation/features/about-author.md): the established editorial tone and boundaries.
* `src/content/posts/`: the historical writing and local observations; presence in the archive is not proof of current accuracy.
* `src/content/sitewide/authorfooter/`: the short biography and local author portrait.
* [README](README.md): the existing site architecture and archive-maintenance workflow.

## Product principles

* Give new personal writing and useful local information priority.
* Make the age and possible obsolescence of historical information clear.
* Keep the author's lived experience and individual voice central.
* Preserve the archive as a record of its time rather than silently treating it as current guidance.

The audience, priorities, and outdated-information requirement were confirmed during init on 28 November 2026. Supporting product facts, including the web platform, come from the repository sources linked above.
