# Content rework state

This directory stores generated inventory, resume state, and durable review
history for the long-running samui-samui.de content rework.

The `publisher` frontmatter block is a work queue: a property exists while work
remains. It is not a permanent review certificate.

Use this directory only for the finite global rework of all posts. Ordinary
single-post reviews do not need state here.

Files:

* `state.json`: rebuildable aggregate counts and active queue state
* `posts.jsonl`: append-only review history
* `tags.json`: generated tag registry plus accepted taxonomy decisions
* `batches/`: open and completed batch manifests
* `reports/`: detailed single-post review reports

Do not infer that a post was reviewed merely because it has no publisher markers.

The initial baseline was generated from the current repository content:

* posts: `src/content/posts/**/index.md`
* tags: `src/content/tags/**/_index.md`
* review history: `posts.jsonl`

`posts.jsonl` starts empty because no post-level review events have happened in
this workflow yet.
