# Person taxonomy link

A reusable inline link from post prose to a `leute` entity page (issue
number 1672): renders the entity's page link, a trailing `user-round` icon,
and -- when the entity has a `subtitle` -- a hover/keyboard-focus tooltip
showing it, reusing the shared [`Tooltip`](tooltips.md) component's exact
markup, CSS, and controller script.

There are two integration points that both call into the same builder, so
they always produce identical markup for equivalent input -- same split as
[editorial notices](notices.md):

* **MDX**: `src/components/PersonLink.astro`, used as
  `<PersonLink id="...">Name</PersonLink>` inside `.mdx` files. Not named
  `<Person>`: that name is already taken by `src/components/Person.astro`
  (a schema.org `Person` block used on the legal pages, an unrelated
  component).
* **Plain Markdown**: a `<dnb-person>` custom element,
  `<dnb-person id="...">Name</dnb-person>`, transformed at build time by the
  rehype plugin `src/scripts/rehype/person-link.ts` (`rehypeDnbPerson`),
  wired into `astro.config.ts`'s `markdown.rehypePlugins` (after
  `rehypeRaw`, same requirement as `rehypeDnbNotice`). This is the
  integration point actually used by the archive today, since posts are
  `.md`, not `.mdx`.

Both call `buildPersonLinkHast()` / `personLinkHastToHtml()`
(`src/utils/taxonomies/person-link.ts`), which:

1. Reads the referenced `leute` entity's frontmatter directly from disk
   (`src/content/leute/<id>/_index.md`, no `astro:content` -- unavailable
   to the rehype integration point, same pattern as
   `src/utils/taxonomies/validation.ts`).
2. Throws a build error if the id has no entry (`Unknown leute id "..."`)
   or is a draft (`leute/[slug].astro`'s `getStaticPaths` skips drafts, so
   linking to one would 404).
3. Builds the link (`<a href="/leute/<id>/">`) with the tag's own body as
   the visible label -- not the entity's `title` -- plus a trailing
   `user-round` icon (`lucide-static`, via the same `buildLucideIconHast()`
   used by notices).
4. When the entity has a `subtitle`, wraps it in the exact
   `.tooltip`/`.tooltip__trigger`/`.tooltip__content` markup `Tooltip.astro`
   itself renders (its `interactive` mode, since the trigger here is
   already a focusable `<a>` -- see Footer.astro's sound-toggle button for
   the same pattern) and appends the shared controller script
   (`src/utils/tooltip/controller.ts`), idempotent via its own `window`
   flag guard so repeating it for multiple `<dnb-person>` occurrences on
   one page is harmless.

## Usage

MDX:

```mdx
Vorsitzender ist <PersonLink id="anutin-charnvirakul">Anutin Charnvirakul</PersonLink>.
```

Plain Markdown:

```html
Vorsitzender ist <dnb-person id="anutin-charnvirakul">Anutin Charnvirakul</dnb-person>.
```

Both render:

```html
Vorsitzender ist <a href="/leute/anutin-charnvirakul/">Anutin Charnvirakul<svg .../></a>.
```

-- plus the tooltip markup and controller script when the entity's
frontmatter has a `subtitle`.

## The `subtitle` frontmatter field

Optional on `leute` entries only (`src/content.config.ts`'s `leute`
collection schema), e.g. a person's role. Not rendered anywhere else on the
site -- see [Frontmatter variables](../content/frontmatter-variables.md).
Do not add one to an entry purely to demonstrate the tooltip: AGENTS.md's
taxonomy rules say not to invent facts for entity entries, and this field is
no exception.

```yaml
---
title: Some Person
subtitle: Some role or descriptor
---
```

## Why not just use `<Tooltip>` directly for the rehype path

[Tooltips](tooltips.md) says to use the shared component instead of local
tooltip markup, and the MDX/rehype split here follows that: both paths
render the exact same `.tooltip`/`.tooltip__trigger`/`.tooltip__content`
markup, CSS, and controller script `Tooltip.astro` itself uses -- that CSS
and script were moved out of the component (into `src/styles/theme.css` and
`src/utils/tooltip/controller.ts`) specifically so this raw, rehype-built
HTML can reuse them, since it never runs through Astro's component compiler
and so can't pick up a component-scoped `<style>` block. Neither `Tooltip`
usage's own visual behavior changed -- only where the CSS/script text lives.
