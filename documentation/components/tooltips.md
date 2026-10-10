# Tooltips

`src/components/ui/tooltip.astro` is the shared tooltip primitive for compact hover and keyboard-focus hints.

Use the component instead of adding local absolute-positioned tooltip markup. It positions content with `position: fixed`, prefers opening above the trigger, falls back below when only that side has enough space, centers to the trigger when there is room, and clamps to the viewport so cards with `overflow-hidden` do not cut it off. The arrow remains aligned to the trigger even when the tooltip body is clamped away from a viewport edge.

The tooltip surface uses existing design tokens: `muted` background, `card-foreground` text, `border`, `ring`, and the same small radius calculation used by badges and small buttons. Triggers are keyboard focusable, expose the same content through `aria-label`, and close with `Escape`.

Example:

```astro
<Tooltip content="Zusatzinformation">
  <Info slot="trigger" class="size-4" aria-hidden="true" />
</Tooltip>
```

## CSS and script are global, not component-scoped

`tooltip.astro`'s markup relies on the `.tooltip` / `.tooltip__trigger` / `.tooltip__content` classes and the `[data-tooltip]` positioning/show-hide controller script, but neither lives in the component's own `<style>` / `<script>` anymore -- they live in `src/styles/theme.css` and `src/utils/tooltip/controller.ts` respectively. This is deliberate: the `<dnb-person>` taxonomy link (`src/utils/taxonomies/person-link.ts`, [Person taxonomy link](person-link.md)) renders the exact same tooltip markup from a plain-Markdown rehype transform, which never runs through Astro's component compiler and so cannot pick up a component-scoped `<style>` block. Keeping the CSS and controller script global lets that rehype-built markup reuse `Tooltip`'s exact visual/behavioral contract instead of inventing a second, divergent tooltip implementation -- see this file's own "Use the component instead of adding local absolute-positioned tooltip markup" rule above. The MDX `<PersonLink>` component (src/components/content/person/PersonLink.astro) renders through the same shared builder too, rather than composing `<Tooltip>` directly, so both integration points stay byte-identical -- same split as `<Notice>` / `<dnb-notice>` ([Editorial notices](notices.md)).

## Content placement rule

Content tooltips must prefer the top, as required by DESIGN.md. The component defaults to `placement="top"`; raw shared-tooltip markup should set `data-tooltip-placement="top"` or omit the preference. The shared controller resolves available viewport space before each opening and on scroll or resize, falls back to the other side when needed, and updates `data-tooltip-resolved-placement` so the arrow follows the actual placement. Explicit bottom placement remains available for surfaces outside content.

## Read-only comparison popovers

Historical currency comparison panels reuse the shared controller and accessible tooltip role. When a content element carries `popover="manual"`, the controller opens it before measuring, closes it on dismissal, and clears open hints before Astro swaps the page. Browsers without the native API use the existing fixed tooltip behaviour. The comparison contains read-only information, with no dialog semantics or extra tab stops. See [Historical currency](../content/historical-currency.md).
