# Tooltips

`src/components/ui/tooltip.astro` is the shared tooltip primitive for compact
hover and keyboard-focus hints.

Use the component instead of adding local absolute-positioned tooltip markup.
It positions content with `position: fixed`, opens below the trigger, centers to
the trigger when there is room, and clamps to the viewport so cards with
`overflow-hidden` do not cut it off. The arrow remains aligned to the trigger
even when the tooltip body is clamped away from a viewport edge.

The tooltip surface uses existing design tokens: `muted` background,
`card-foreground` text, `border`, `ring`, and the same small radius calculation
used by badges and small buttons. Triggers are keyboard focusable, expose the
same content through `aria-label`, and close with `Escape`.

Example:

```astro
<Tooltip content="Zusatzinformation">
  <Info slot="trigger" class="size-4" aria-hidden="true" />
</Tooltip>
```

## CSS and script are global, not component-scoped

`tooltip.astro`'s markup relies on the `.tooltip` / `.tooltip__trigger` /
`.tooltip__content` classes and the `[data-tooltip]` positioning/show-hide
controller script, but neither lives in the component's own `<style>` /
`<script>` anymore -- they live in `src/styles/theme.css` and
`src/utils/tooltip/controller.ts` respectively. This is deliberate: the
`<dnb-person>` taxonomy link (`src/utils/taxonomies/person-link.ts`,
[Person taxonomy link](person-link.md)) renders the exact same tooltip
markup from a plain-Markdown rehype transform, which never runs through
Astro's component compiler and so cannot pick up a component-scoped
`<style>` block. Keeping the CSS and controller script global lets that
rehype-built markup reuse `Tooltip`'s exact visual/behavioral contract
instead of inventing a second, divergent tooltip implementation -- see this
file's own "Use the component instead of adding local absolute-positioned
tooltip markup" rule above. The MDX `<PersonLink>` component
(src/components/PersonLink.astro) renders through the same shared builder
too, rather than composing `<Tooltip>` directly, so both integration points
stay byte-identical -- same split as `<Notice>` / `<dnb-notice>`
([Editorial notices](notices.md)).
