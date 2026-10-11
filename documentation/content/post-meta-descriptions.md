<!-- markdownlint-disable MD013 -->
# Post meta descriptions

Individual post pages select their meta description in this order: a non-blank `description`, a non-blank `summary` (the existing editorial excerpt field), or the first 160 characters of readable rendered post content. Explicit descriptions and summaries retain their full length. Whitespace is collapsed to single spaces.

The content fallback reads the rendered HTML, decodes entities, preserves inline text, and separates block text. It excludes comments, scripts, styles, templates, hidden text, code blocks, and video/audio embeds. It does not use image alt text or media URLs. The excerpt stops at a word boundary within 160 Unicode characters; an unbroken longer string is cut at the limit. Shortened content ends with `…`, included within the 160-character limit. Complete content of 160 characters or fewer has no added ellipsis. If the post has no usable text, the site description is used instead of repeating the title.

`src/utils/post-meta-description.ts` owns selection and excerpt extraction. The post route passes its result to `BlogPost.astro`, and `BaseHead.astro` uses the same value for the standard description, Open Graph description, and Twitter description. This changes metadata only; post copy, visible blog-list previews, and other page types retain their existing behaviour.

Tests in `src/test/post-meta-description.test.ts` cover precedence, blank values, HTML extraction, whitespace, word boundaries, Unicode, and empty content.
