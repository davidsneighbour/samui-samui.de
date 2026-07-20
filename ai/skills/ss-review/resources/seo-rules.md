# SEO rules for samui-samui.De

Ruleset version: `2026-07-20`

Review this file periodically against current primary documentation. Do not automatically change editorial content merely because an SEO tool reports a score.

## Source policy

Prefer current primary sources:

* Google Search Central documentation
* web.dev for web platform performance and image implementation
* Schema.org definitions when validating vocabulary
* Astro documentation for framework-specific output

Do not treat commercial SEO plugin scores as authoritative.

Primary references:

* [https://developers.google.com/search/docs/fundamentals/seo-starter-guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
* [https://developers.google.com/search/docs/fundamentals/get-started-developers](https://developers.google.com/search/docs/fundamentals/get-started-developers)
* [https://developers.google.com/search/docs/appearance/title-link](https://developers.google.com/search/docs/appearance/title-link)
* [https://developers.google.com/search/docs/appearance/snippet](https://developers.google.com/search/docs/appearance/snippet)
* [https://developers.google.com/search/docs/appearance/google-images](https://developers.google.com/search/docs/appearance/google-images)
* [https://developers.google.com/search/docs/appearance/structured-data/article](https://developers.google.com/search/docs/appearance/structured-data/article)
* [https://web.dev/articles/serve-responsive-images](https://web.dev/articles/serve-responsive-images)
* [https://web.dev/learn/html/images](https://web.dev/learn/html/images)

## Per-post SEO review

### Search intent and usefulness

Determine:

* what a reader could reasonably search for
* whether the post satisfies informational, navigational, historical, or personal-interest intent
* whether the page has a clear primary subject
* whether the content offers original experience, observation, images, or historical value

Do not force a diary post into a transactional keyword template.

### Title signals

Check:

* accurate and descriptive title
* unique title
* compact enough to remain understandable when truncated
* primary subject appears naturally where appropriate
* no boilerplate repetition
* no misleading freshness

### Description/snippet input

Check:

* unique, page-specific description
* accurate summary
* useful reason to visit
* no keyword list
* no unsupported promise

Search engines may generate snippets from page content rather than the meta description. The site's 150–170 character target is an editorial convention.

### Main content

Check:

* topic is evident early enough for readers
* visible text explains important visual content
* headings are descriptive and hierarchical
* important context is not available only inside an image, video, canvas, or script
* content is not padded solely to reach a word count
* old content is clearly contextualised where present-day readers could be misled

### Internal links

Check:

* relevant older and newer related posts can be linked naturally
* anchor text explains the destination
* no generic repeated "hier klicken" pattern
* orphan risk is reduced
* archive, tag, person, or topic pages are used when appropriate

### External links

Check:

* source supports the associated statement
* destination is safe and still relevant
* link is not an avoidable redirect
* broken historical links are handled intentionally
* sponsored or user-generated link attributes are applied by site policy when relevant

### Images

Check:

* representative cover
* descriptive filenames where practical
* useful alt text
* image near relevant text
* crawlable image URL
* high-resolution source where available
* responsive derivatives
* intrinsic dimensions or aspect-ratio reservation
* no avoidable layout shift
* no generic cover used where a specific image exists

### Structured-data inputs

Check the source provides valid inputs for the site's `BlogPosting` or `Article` output:

* headline
* canonical page URL
* date published
* date modified when applicable
* author identity
* representative image
* description

The skill should inspect rendered structured data when the local preview or built output is available.

### Indexability and canonicalisation

When rendered output is available, check:

* successful page response
* no accidental `noindex`
* canonical URL matches intended URL
* robots rules do not block required resources
* sitemap contains the canonical URL
* old URL redirects preserve established paths where migration changed routing

### Social metadata

Check:

* Open Graph title and description
* representative `og:image`
* canonical URL
* Twitter/X card fallback when implemented

Social metadata is not a direct ranking guarantee but affects link presentation.

### Technical quality

When tools are available, inspect:

* semantic HTML
* mobile layout
* accessibility failures affecting content understanding
* Core Web Vitals risks, especially image-related LCP and CLS
* broken resources
* hydration or JavaScript failures hiding content
* duplicate titles or descriptions across the site

### Historical content judgement

Old content can remain valuable without being rewritten for current keyword volume.

Assess:

* historical uniqueness
* whether a present-day editorial note improves trust
* whether current search intent is relevant
* whether the page should remain indexed
* whether consolidation, canonicalisation, or `noindex` deserves human discussion

Never deindex solely because a post is old or short.

## Acceptance criteria for clearing `publisher.seo`

All applicable checks pass, or remaining exceptions are:

* explicitly documented
* accepted by the user
* logged with reason and date
* not likely to mislead readers or search engines

Record the ruleset version in the content-rework state.
