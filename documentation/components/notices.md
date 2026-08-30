# Editorial notices

A reusable "editorial notice" system for static annotations on post content -- historical context, corrections, discontinued services, legal disclaimers, warnings. Notices are static asides (`role="note"`), not dynamically inserted alerts, and render identically with JavaScript disabled.

There are two integration points that resolve through the same central resolver and render function, so they always produce the same markup for equivalent input:

* **MDX**: `src/components/Notice.astro`, used as `<Notice slug="..." />` inside `.mdx` files (imported like any other Astro component).
* **Plain Markdown**: a `<dnb-notice>` custom element, transformed at build time by the rehype plugin `src/scripts/rehype/notices.ts` (`rehypeDnbNotice`), wired into `astro.config.ts`'s `markdown.rehypePlugins` (after `rehypeRaw`, same requirement as `rehypeLegacyImages` -- see [Legacy image presentation](legacy-images.md)). This is what most of the 20-year post archive uses, since those posts are `.md`, not `.mdx`, and `[...slug].astro` renders their `<Content />` with no MDX component registration.

Both call into `src/utils/notices/`:

* `schema.ts` -- `NoticeDefinition`, `NoticeVariant`, Zod schemas.
* `registry.ts` -- loads and validates `src/data/notices.yaml` (`loadNoticeRegistry`, `getNoticeSlugs`).
* `resolve.ts` -- `resolveNotice()`, the shared precedence resolver.
* `markdown.ts` -- safe Markdown-to-hast rendering for title/description (`renderNoticeTitle`, `renderNoticeDescription`), plus `parseHtmlFragment()` for the MDX slot case (see below).
* `icons.ts` -- Lucide icon name validation and hast `<svg>` generation (`isValidLucideIconName`, `buildLucideIconHast`).
* `render.ts` -- `buildNoticeHast()`, the single function that builds the final `<aside>` (+ optional dismiss `<script>`) hast nodes; both integration points call this and either splice the hast nodes directly into a tree (rehype) or stringify them via `hast-util-to-html` for `set:html` (Notice.astro).
* `styles.ts` -- the Tailwind utility-class strings used by `render.ts` (kept out of `theme.css`; see "Styling" below).

## Registry

`src/data/notices.yaml` -- a flat map keyed by slug:

```yaml
flickr-nicht-mehr-verwendet:
  title: "Redaktionsnotiz"
  description: >-
    Flickr wird von dieser Website heute nicht mehr verwendet. Der folgende Absatz beschreibt den damaligen Stand und bleibt aus historischen Gründen unverändert.
  icon: "camera-off"
  variant: "historical"
```

Schema (`src/utils/notices/schema.ts`):

| Field | Type | Required | Notes |
| ------------- | ------------------------------------------------------ | -------- | ------------------------------------------------------ |
| `title` | `string` | yes | Markdown source (inline only -- see "Rendering"). |
| `description` | `string` | yes | Markdown source (block-level). |
| `icon` | `string` | yes | A [Lucide](https://lucide.dev/icons) name, kebab-case. |
| `variant` | `note \| historical \| legal \| correction \| warning` | no | Default `note`. |
| `dismissible` | `boolean` | no | Default `false`. |

The registry is parsed with the `yaml` package's default `uniqueKeys: true` (duplicate slugs are a hard parse error), then validated with Zod (`noticeRegistrySchema`), then every `icon` is checked against `lucide-static`'s icon set. Any failure throws a single `Error` with the offending slug(s), so `astro dev`/`astro build` fails loudly rather than silently dropping or mangling a notice. `loadNoticeRegistry()` caches its result per process/registry path; call `clearNoticeRegistryCache()` between fixtures in tests.

Initial slugs (`src/data/notices.yaml`):

* `flickr-nicht-mehr-verwendet` -- used by the 2005 Big Buddha post (see below).
* `keine-rechtsberatung` -- no-legal-advice disclaimer (`legal`).
* `historische-informationen-koennen-veraltet-sein` -- generic "this archive post may be outdated" notice (`historical`).
* `aktualisierung-verfuegbar` -- "a newer/corrected article exists" (`correction`, `dismissible: true`).

Only `flickr-nicht-mehr-verwendet` is actually placed in content; the other three exist as a representative registry, per the task's request not to insert demo notices into unrelated posts.

## Icons

Icon geometry comes from `lucide-static`'s `icon-nodes.json` (`src/utils/notices/icons.ts`), pinned to the same release as `@lucide/astro` (used elsewhere on the site, e.g. `Header.astro`, `badge.astro`-adjacent components). `@lucide/astro`'s icon exports are Astro component factories that only render inside Astro's own SSR pipeline, which a remark/rehype transform is not -- `lucide-static` ships the identical icon set as plain SVG node data, so `buildLucideIconHast()` can build the exact same `<svg>` markup (same `viewBox`, stroke attributes, `lucide lucide-<name>` classes as `@lucide/astro`'s `defaultAttributes.ts`) from either integration point. Unsupported names fail the registry build (see above) or, for ad hoc/attribute-supplied icons, fail `resolveNotice()` directly with `Unsupported Lucide icon "<name>"`.

## MDX usage

```mdx
<Notice slug="flickr-nicht-mehr-verwendet" />
```

```mdx
<Notice slug="flickr-nicht-mehr-verwendet" title="Hinweis zum ursprünglichen Beitrag" />
```

Ad hoc, no slug (all required fields supplied directly):

```mdx
<Notice title="Keine Rechtsberatung" description="Dieser Abschnitt gibt ausschließlich meine persönliche Meinung wieder." icon="scale" variant="legal" />
```

Dismissible:

```mdx
<Notice slug="aktualisierung-verfuegbar" dismissible />
```

Props (`src/components/Notice.astro`): `slug?`, `title?`, `description?`, `icon?`, `variant?`, `dismissible?`, `dismissLabel?`, `class?`.

## Plain markdown usage

```html
<dnb-notice slug="flickr-nicht-mehr-verwendet"></dnb-notice>
```

```html
<dnb-notice slug="flickr-nicht-mehr-verwendet" title="Hinweis zum ursprünglichen Beitrag"></dnb-notice>
```

Body content as a description override:

```html
<dnb-notice slug="flickr-nicht-mehr-verwendet"> Diese **abweichende Beschreibung** ersetzt nur die konfigurierte Beschreibung. </dnb-notice>
```

Supported attributes mirror the MDX props: `slug`, `title`, `description`, `icon`, `variant`, `dismissible` (boolean attribute -- presence, or any value other than `"false"`, means true), `dismiss-label` (or `dismissLabel`).

`rehypeDnbNotice` runs after `rehypeRaw` (already required by `rehypeLegacyImages`), so `<dnb-notice>` is a real hast element by the time it visits the tree -- attributes and structure are read from the parsed AST, not regexed out of raw text. A single-line `<dnb-notice slug="..." />` gets auto-wrapped in a `<p>` by CommonMark (unknown tags aren't block-level per the CommonMark HTML-block rules); the plugin detects and unwraps that `<p>` when it contains nothing but the notice, so the block-level `<aside>` never ends up nested inside a `<p>`.

Body-content extraction concatenates the element's own text content and re-renders it through the same Markdown pipeline as the registry's `description` field, so inline formatting (bold, links, code) touching the opening/closing tags renders correctly for the common single-paragraph case shown above. A body split across a blank line (multiple paragraphs) still renders, just without the original paragraph break -- keep `<dnb-notice>` body overrides to a single paragraph for predictable results.

## Override precedence

1. Explicit component property / attribute (`title`, `description`, …).
2. Body content (MDX default slot / `<dnb-notice>` element body) as a description override.
3. Registry value (via `slug`).
4. Component default (`variant: "note"`, `dismissible: false`, `dismissLabel: "Hinweis schließen"`).

Implemented once in `resolveNotice()` (`src/utils/notices/resolve.ts`), called by both integration points. An unknown `slug` throws immediately, with the offending slug, the source file (when known), and the full list of valid slugs. A slug-less ("ad hoc") notice missing `title`, `description`, or `icon` throws listing exactly which field(s) are missing. Neither case renders an empty or partial notice.

`resolveNotice()` also reports which source won as `descriptionSource` (`'prop' | 'body' | 'registry'`). Both integration points render `'prop'`/`'registry'` descriptions as Markdown source (`renderNoticeDescription()`). For `'body'`, `Notice.astro` uses the already-compiled slot HTML directly (`parseHtmlFragment()`) instead of re-parsing it as Markdown, because MDX has already run its own Markdown compiler over `<Notice>`'s children by the time Astro renders this component; the `<dnb-notice>` rehype transform, which never sees pre-compiled HTML, always treats its extracted body text as Markdown source. Both paths render equivalent HTML for equivalent authored content -- see `src/test/notices-canonical-equivalence.test.ts`, which asserts byte-identical output for the same slug/overrides across both pipelines.

## Safe rendering

`title`/`description` (registry values, explicit props/attributes, and `<dnb-notice>` body text) are rendered through `unified().use(remarkParse) .use(remarkGfm).use(remarkRehype)` with `allowDangerousHtml` left at its default (falsy): raw HTML tags in that Markdown source are dropped entirely (their surrounding plain text is kept, escaped) rather than passed through as executable markup. The registry is repo-controlled content, not user input, but this keeps it consistent with the rest of the Markdown pipeline's trust model rather than opening a new raw-HTML surface. The MDX slot-content case is the one exception, and is safe for a different reason: it's already-compiled output from Astro's own trusted MDX pipeline, not re-parsed as Markdown at all.

## Accessibility

* `<aside role="note" aria-labelledby="...">` -- not `role="alert"` (notices are static editorial annotations, not dynamic alerts).
* The heading id is a deterministic hash of the notice's own resolved content (title, icon, variant, description), so the same notice always gets the same id (stable) while distinct notices on one page don't collide (unique) -- no shared counter/state needed across either integration point.
* The icon is `aria-hidden="true"`.
* The heading text includes a visually-hidden variant announcement (e.g. "Historischer Hinweis: ") ahead of the title, so variants are distinguishable to screen readers without a second visible label or a duplicated title.
* Heading level: the title renders as a `<p>`, not an `<h2>`/`<h3>`, so notices never disrupt the surrounding article's heading hierarchy.

## Dismissible notices

`dismissible: false` (the default) renders no close button and no related `<script>`. `dismissible: true` renders an accessible `<button aria-label="…">` (default label `Hinweis schließen`, overridable via `dismissLabel`/`dismiss-label`) plus a small inline `<script>` that hides that occurrence's `<aside>` (`hidden` attribute) on click, scoped via `data-dnb-notice-dismiss` / `data-dnb-notice` and guarded by a `window` flag so repeating the script for multiple dismissible notices on one page is a harmless no-op rather than duplicate listeners. There's no persistence (matches the task spec: no localStorage/cookie unless an existing convention requires it -- `ConstructionBanner.astro`'s localStorage dismissal is a one-off UI pattern, not a site-wide convention). Without JavaScript, the button renders but does nothing -- the notice stays visible, which is the correct fallback for an editorial annotation.

## Styling

Base container mirrors the muted, bordered treatment already used by tag badges (`src/components/ui/badge.astro`'s `muted` variant / `ThemaBadges.astro`) and the author-bio `bg-muted` surface in `BlogPost.astro`: `bg-muted`, `border-border` (or `border-primary/40` for `legal`/`warning`, the only variant-specific colour), `rounded-(--radius)`, `text-card-foreground`. No new design tokens, no `box-shadow` (see DESIGN.md). Classes live in `src/utils/notices/styles.ts` as plain Tailwind utility strings (same "utility string in a `.ts` file, picked up by Tailwind's scanner" pattern as `src/utils/prose.ts`'s `proseClasses`) -- `render.ts` is reachable from `astro.config.ts` (via the rehype plugin), so it can only use relative imports and plain npm packages, not the `@utils/*`/`@components/*` Vite aliases; hence a dedicated small module instead of importing `cn()` or a `.astro` file.

`not-prose` on the container opts the notice out of the site's global `proseClasses` margins; `NOTICE_DESCRIPTION_CLASSES` in `styles.ts` restores just enough spacing (paragraph gaps, list markers/indent, link/code styling) via Tailwind arbitrary-variant selectors for the description's own rendered Markdown to stay legible without the prose plugin's larger vertical rhythm.

## Adding a notice

1. Add an entry to `src/data/notices.yaml` (or write an ad hoc notice with no slug, if it's a one-off).
2. Reference it: `<Notice slug="..." />` in `.mdx`, or `<dnb-notice slug="..."></dnb-notice>` in `.md`.
3. Run `npm run build` (or `astro dev`) -- an invalid registry entry or unknown slug fails immediately with an actionable error.
