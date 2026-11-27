# Lost content

`src/components/content/post/LostContent.astro` marks an individual gap without classifying the whole post. It renders a German inline `span` with `role="note"`, `lang="de"`, readable square brackets, inherited text colour, and italic emphasis. There is no client script or live announcement. Generic annotations are ignored by Pagefind.

## Plain markdown

Posts use `index.md`. Use an explicit closing tag:

```html
<dnb-lost-content type="text" language="th"></dnb-lost-content>
```

The rehype plugin runs after raw HTML parsing and calls the same renderer as the Astro component. It supports use within an existing paragraph.

## Astro and MDX

Import the component explicitly:

```astro
import LostContent from '@components/content/post/LostContent.astro';
```

```html
<LostContent type="text" language="th" />
```

`type` accepts `text`, `image`, `video`, `audio`, or `unknown` (default). Invalid types fail the build. Messages are respectively `[Originaltext nicht mehr rekonstruierbar.]`, `[Ursprüngliche Abbildung nicht mehr verfügbar.]`, `[Ursprüngliches Video nicht mehr verfügbar.]`, `[Ursprüngliche Tonaufnahme nicht mehr verfügbar.]`, and `[Originalinhalt nicht mehr rekonstruierbar.]`.

Optional `language` identifies the missing original using a language tag, for example `th` or `en`. Thai text produces `[Thailändischer Originaltext nicht mehr rekonstruierbar.]`. Other combinations append a German language name, for example `Originalsprache: Englisch.` Invalid language tags fail the build. The annotation itself remains German, so it never receives `lang="th"`.

Preserve the original source in a non-rendered comment or another durable source record. Do not nest HTML comments. Do not reconstruct missing text or assert an encoding cause without verified evidence. The [relic lifecycle](../content/digital-relics.md) describes classification separately. Fu Noi is the reference Markdown example.
