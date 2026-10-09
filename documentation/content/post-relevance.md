# Post relevance

Posts may declare a top-level `relevance` field to describe their intended value beyond the moment of publication. It is an editorial classification, not a quality score or a taxonomy.

| Value | Meaning |
| --- | --- |
| `enduring` | Intended to remain worth reading years later, such as guides, substantial essays, or lasting observations. |
| `contextual` | Valuable mainly within its historical or time context, such as contemporary events or changing conditions. |
| `moment` | A snapshot of life, such as a daily observation, photograph, or short anecdote. |
| `ephemeral` | A brief reaction or notice with little intended lasting relevance. |

```yaml
---
title: Ein bleibender Blick auf Samui
date: 2026-10-09T12:00:00+07:00
relevance: enduring
---
```

Only these four exact, lower-case strings are valid. Omit the property to leave a post unclassified. There is no default and no `unclassified` enum value; blank YAML values (`relevance:`), `null`, numbers, and other strings are invalid. Existing posts and newly generated posts remain unclassified until an editor makes an explicit decision. The post generator therefore does not insert this field.

The schema in `src/content.config.ts` owns this contract. Astro infers `CollectionEntry<'posts'>['data']['relevance']` as `'enduring' | 'contextual' | 'moment' | 'ephemeral' | undefined`. Do not maintain a second hand-written type or enum. This change adds no badges, scoring, ranking, search boosts, archive filtering, or hidden posts.

## Editor completion

The project already enables `experimental.contentIntellisense` in `astro.config.ts` and recommends the Astro VS Code extension (`astro-build.astro-vscode`). The workspace setting `astro.content-intellisense: true` enables its frontmatter support. Run `npm run astro -- sync` after checkout or schema changes, or run the development server, to generate `.astro/collections/posts.schema.json` and the collection-to-file map. These generated files are ignored and must not be committed.

In VS Code, open the repository root, install or enable the recommended Astro extension, open a collected `src/content/posts/**/index.md` file, and request completion after `relevance:` followed by a space (Ctrl+Space) to see the four values. Reload the editor or restart its language server if it retains an old schema. Other editors need Astro language server support with the `contentIntellisense: true` initialisation option. Plain Markdown editors and the separate Front Matter extension do not automatically gain this support from TypeScript types alone. Suggestions depend on the editor and extension being enabled; content validation still runs through `npm run validate:content` and the build pipeline.

See [Astro content IntelliSense](https://docs.astro.build/en/reference/experimental-flags/content-intellisense/) for the upstream editor requirements.
