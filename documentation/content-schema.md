# Content schema

Astro content collections are defined in `src/content.config.ts`.

Import collection helpers and Zod separately:

```ts
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
```

Do not import `z` from `astro:content`; that compatibility export is deprecated
and makes `astro check` report `ts(6385)` warnings for every schema use.

For loose frontmatter schemas that preserve unknown legacy fields, use
`.loose()` or `z.looseObject()` instead of the deprecated `.passthrough()`.
