# ToDo's

This file is the scratchpad inbox for rough, unclear, or intentionally unprocessed
notes. GitHub Issues are the source of truth for actionable work; see `ROADMAP.md`
for the generated issue index.

## Cleanup public folder

* public/assets/system seems to be unused. either explain use or remove

## Tags as badges

Redesign tags as badges. all uppercase or smallcaps. use [https://ui.shadcn.com/docs/components/base/badge](https://ui.shadcn.com/docs/components/base/badge)

## Giscus.Json confusion

it appears that giscus.json should be in the live site. in repo root it is not. Where does it belong? If in site root then move to public/giscus.json

## Create a process/plugin that replaces characters on save/commit/etc

This is a german blog. I work with an english keyboard. Sometimes to write umlauts I write `&uuml;` instead. Replace with the proper character for this instead of the translation of it. Would be nice if this could be done automatically in VSCode or via linting on commit.

## Blog post title as component

Adapt the blog post title as component, reuse. Make it uppercase and weight 600.

## Meta info for blog posts as component

Adapt the meta info (under the title) for blog posts as component.

## Pagination design on list pages

Put the pagination with prev and next and the numbered navigation into a box like the articles (yellowish background, max width).

Use the pagination component with numbered buttons instead of the page 1 of 100 system.
[https://ui.shadcn.com/docs/components/base/pagination](https://ui.shadcn.com/docs/components/base/pagination)
