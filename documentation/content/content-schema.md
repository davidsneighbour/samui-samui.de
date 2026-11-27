# Content schema

Astro content collections are defined in `src/content.config.ts`.

Import collection helpers and Zod separately:

```ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
```

Do not import `z` from `astro:content`; that compatibility export is deprecated and makes `astro check` report `ts(6385)` warnings for every schema use.

For loose frontmatter schemas that preserve unknown legacy fields, use `.loose()` or `z.looseObject()` instead of the deprecated `.passthrough()`.

Post relevance uses an optional enum in the post collection schema. Astro generates the corresponding `CollectionEntry<'posts'>` literal union and editor JSON schema from this definition; see [Post relevance](post-relevance.md) for the editorial contract and completion setup.

## Digital relic lifecycle

The optional `relic` frontmatter property records an editorial review: `status: not-relic` or `status: relic`, a required `reviewed` calendar date, and an optional non-empty `note`. The `relic` state also requires one enumerated `reason`. Absence means unreviewed. See [Digital relics](digital-relics.md) for the full schema, publisher review and restoration commands, preserved media metadata, weekly checks, and candidate reports.
