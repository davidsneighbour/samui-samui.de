# Masthead

`src/components/Header.astro` owns the site masthead, including the title,
tagline, header search control, navigation, and all masthead-specific CSS.

The site title uses the `setup.title` value from `src/data/setup.json`, split
into word spans for presentation. The accessible name stays the full title,
`Samui? Samui!`.

## Responsive title

Below 576px viewport width, the title is forced into two lines:

```text
Samui?
Samui!
```

The mobile font size uses `clamp(4.75rem, 25vw, 9.375rem)`, so it can grow
towards a 150px maximum without filling the whole screen. The word spans are
block-level in this range to avoid mid-word breaks. The first line,
`Samui?`, is scaled to `0.96em` on mobile because the fixed title's question
mark otherwise sits too close to the right edge on very small devices.

At 576px and wider, the words return to one line. The masthead then follows
the legacy Bootstrap-style steps documented in `DESIGN.md`: 68px at 576px,
92px at 768px, 125px at 992px, 149px at 1200px, and 172px at 1400px.
Both words use the same font size again in this range.

This implementation does not use Pretext. The title is intentionally fixed as
`Samui? Samui!`, so static markup plus CSS gives the required one-line and
two-line states without adding runtime JavaScript.

## Development preview

The dev server exposes `/tests/masthead` for visual checks. It shows boxed
iframe previews at common viewport widths, so each preview has its own media
query environment. The frame URL is `/tests/masthead-frame`.

The route is declared in `src/pages/tests/[...path].astro`. `getStaticPaths()`
returns no paths in production builds, so `npm run build` does not emit the
testing page.

## Automated checks

`npm run test:e2e` runs the Playwright masthead checks in `tests/`. The test
starts the Astro dev server, opens `/tests/masthead-frame`, and checks that:

* widths below 576px render two word lines,
* widths at and above 576px render one word line,
* the mobile `Samui?` line is slightly smaller than `Samui!`,
* the title keeps the header photo clipped into the text,
* the masthead does not cause horizontal overflow, and
* the mobile title stays below the test height budget.
