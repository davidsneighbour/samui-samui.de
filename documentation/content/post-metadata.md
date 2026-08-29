# Post metadata

`src/components/BlogPostMeta.astro` owns the shared metadata row used below post
titles on single post pages and blog list cards.

## Timezone

All post calendar metadata is interpreted in Thailand time (`Asia/Bangkok`,
UTC+07:00). This applies to publication dates, update dates, archive grouping,
Pagefind year filters, and generated post permalinks. Code that needs
calendar `year`, `month`, or `day` values must use `getPostDateParts()` from
`src/utils/dates.ts` rather than raw UTC or local-time `Date` getters.

New or edited post frontmatter `date` and `lastmod` values must use the fixed
format:

```text
YYYY-MM-DDTHH:mm:ss+07:00
```

The timestamp is zero-padded, uses 24-hour time, includes seconds, omits
milliseconds, and always carries the explicit `+07:00` offset. When converting a
legacy timestamp, preserve the instant: `2012-01-24T17:31:43+00:00` becomes
`2012-01-25T00:31:43+07:00`.

Existing legacy timestamps with other offsets may remain until touched. They
are still interpreted through the Bangkok calendar helpers at render time.

## Display

The visible date line shows the publish date inline with the Lucide
`CalendarDays` icon. When `updatedDate` is available, the row adds a Lucide
`CalendarCheck` icon after the publish date. The update timestamp stays out of
the normal text flow and is revealed through `src/components/ui/tooltip.astro`
when the icon is hovered or receives keyboard focus.

The tooltip text keeps the German wording `Aktualisiert am` followed by
the same extended date formatting as the publish date when the component's
`extended` prop is enabled.

Single post pages render a breadcrumb below the visible metadata row and above
the taxonomy list. The trail uses `Startseite`, the Bangkok calendar year linked
to `/archiv/YYYY/`, and the current post title as the active page item.

`src/components/PostTaxonomyGroups.astro` renders the taxonomy groups below the
breadcrumb as compact flex rows. Each row keeps the German taxonomy label and
its linked values on the same line where space allows, with values wrapping
within the row on narrow screens. The rows are ordered `Orte`, `Ereignisse`,
`Feiertage`, and `Personen`, and empty groups are hidden. `Themen` are not
shown in this block because the metadata line already renders them.
