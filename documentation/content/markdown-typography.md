# Markdown typography

Post Markdown uses a local remark plugin,
`src/scripts/remark/typography.ts`, to restore Hugo-style prose shortcuts that
are not part of CommonMark itself:

| Source text | Rendered character |
| --- | --- |
| `---` | `\u2014` em dash |
| `--` | `\u2013` en dash |
| `-` | unchanged hyphen |

The plugin is wired through Astro's current Markdown processor API in
`astro.config.ts`:

```ts
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDnbTypography],
      rehypePlugins: [rehypeRaw, rehypeLegacyImages, rehypeDnbNotice],
    }),
  },
});
```

Astro's older `markdown.remarkPlugins`, `markdown.rehypePlugins`, `markdown.gfm`,
and `markdown.smartypants` config keys are deprecated in Astro 7.1 and are not
used for new Markdown pipeline changes.

The transform visits only mdast `text` nodes. Inline code, fenced code, block
HTML, raw HTML tags/attributes, and frontmatter are separate nodes and are
intentionally not changed. Text between inline HTML tags still counts as normal
paragraph text and receives the same typography replacements as surrounding
prose.

Additional plain-text replacements can be added by extending the ordered
replacement list in `remarkDnbTypography`; longer patterns should appear before
shorter patterns when they overlap.
