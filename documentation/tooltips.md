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
