# Editorial frontmatter fields

## `description`

Purpose:

* canonical meta description input
* social/search summary fallback
* concise explanation of the specific post

Rules:

* target 150 to 170 characters including spaces
* allow a justified exception when natural German requires slightly less or more
* one or two complete, readable sentences
* unique to this post
* accurately represent the whole post
* mention the primary topic naturally
* include Koh Samui, Thailand, a place, event, or person only when materially relevant
* no keyword lists
* no generic site slogan
* no clickbait
* no invented current relevance
* no repeated title with no additional information
* no hallucination

The length target is a site editorial rule, not a claim that search engines enforce a fixed maximum.

## `summary`

Purpose:

* visible teaser in archive, search, tag, or listing contexts
* editorial bridge from title to article

Rules:

* ommit if the article is less than 500 characters long
* target 300 to 350 characters including spaces
* readable without surrounding context
* introduce the post to make the reader click and read the full post
* preserve the author's tone where practical
* avoid spoilers only when the post depends on narrative progression
* do not start every summary with the same formula
* must differ from `description`
* if identical to `description` omit it and keep `description` which will replace it automatically

## Title

There is no rigid character count, but keep it under 60 characters if a longer title is required. Optimise for clarity, distinctiveness, and truthful relevance.

Flag titles that are:

* empty or malformed
* indistinguishable from another post
* dependent on missing context
* misleading
* primarily punctuation or internal shorthand
* stuffed with repeated search terms

## Dates

* every post MUST contain a `date` field.
* preserve the original publication instant unless the user explicitly asks to
  correct an incorrect date.
* set or update `lastmod` only according to repository policy.
* an editorial note may state the review date without altering the historical
  publication date.
* post calendar decisions MUST use Thailand time (`Asia/Bangkok`, UTC+07:00).
* new or edited `date` and `lastmod` fields MUST use the fixed
  `YYYY-MM-DDTHH:mm:ss+07:00` format: zero-padded, 24-hour time, seconds
  required, no milliseconds, explicit `+07:00`.
* when normalising a legacy offset, preserve the instant. For example,
  `2012-01-24T17:31:43+00:00` becomes `2012-01-25T00:31:43+07:00`.
* flag other date fields and remove or rename if required.
