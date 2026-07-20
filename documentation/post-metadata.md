# Post metadata

`src/components/BlogPostMeta.astro` owns the shared metadata row used below post
titles on single post pages and blog list cards.

The visible date line shows the publish date inline with the Lucide
`CalendarDays` icon. When `updatedDate` is available, the row adds a Lucide
`CalendarCheck` icon after the publish date. The update timestamp stays out of
the normal text flow and is revealed as a tooltip when the icon is hovered or
receives keyboard focus.

The tooltip text keeps the German wording `Zuletzt aktualisiert am` followed by
the same extended date formatting as the publish date when the component's
`extended` prop is enabled.
