# Static article maps

Static maps are generated editorial illustrations from local OpenStreetMap-derived geography. The browser receives an ordinary Astro-optimised bundled image, with German HTML attribution. No mapping library, tile request, geocoding service, or map-provider connection is used when viewing these maps. Normal builds do not regenerate images, load geographic data, or require the renderer's fonts. The implementation is tracked in [#1797](https://github.com/davidsneighbour/samui-samui.de/issues/1797).

## Add and place a map

Define `maps` in the post's frontmatter, and place `<dnb-map id="house"></dnb-map>` on its own line, separated from surrounding paragraphs by blank lines. The ID selects one resource; unused resources are not automatically displayed. Multiple maps are supported. A minimal example is:

```yaml
maps:
  - id: house
    image: map-house.webp
    alt: Karte des damaligen Hauses im Nordwesten von Koh Samui
    bounds:
      topLeft: { latitude: 9.61125, longitude: 99.88564 }
      bottomRight: { latitude: 9.52660, longitude: 100.05730 }
    points:
      - id: house
        title: Haus Nummer 9
        coordinates: { latitude: 9.578069, longitude: 99.957905 }
```

Map IDs and point IDs use lowercase ASCII slugs starting with a letter. Each map ID, output filename, and point ID must be unique in its scope. `alt` is required and non-empty. An optional `caption` precedes automatic attribution. All visible text must be German. Output filenames accept ASCII letters, digits, underscores, and hyphens, with a `.webp` extension; directory separators and dot segments are forbidden. Files and symlinks outside the content bundle cannot be generator outputs.

Bounds are explicit north-west and south-east corners: the top latitude must be larger, and the left longitude smaller. The schema accepts latitude −90…90 and longitude −180…180; the Web Mercator renderer rejects polar bounds outside ±85.051128°. Antimeridian-crossing maps are not supported. Points must be within the declared frame. The renderer uses a uniform Mercator scale and centres the exact geographic frame, adding parchment margins when its aspect ratio differs from the image. It never stretches geography or silently expands the bounds. Choose an output aspect ratio close to the geographic frame for fewer margins.

`size` defaults to `{ width: 1200, height: 630 }`. Overrides must be integer dimensions between 64 and 4096 pixels. Use dimensions large enough for responsive images; Astro's ordinary Markdown image pipeline controls delivered image variants. The existing wide-media and figure-caption rules control website layout. The map transform sets the existing legacy-image override to `never`, so these images cannot acquire the archive's blurred-image presentation.

## Routes and labels

The canonical complex example is `src/content/posts/2012/07/samui-penang-via-flugzeug-wieder/index.md`. Routes reference existing point IDs and contain at least two points:

```yaml
maps:
  - id: route
    image: map-route.webp
    alt: Karte der Flugverbindung zwischen Koh Samui und Penang
    size: { width: 1200, height: 1000 }
    bounds:
      topLeft: { latitude: 10.1, longitude: 97.2 }
      bottomRight: { latitude: 4.8, longitude: 102.8 }
    points:
      - id: samui
        title: Koh Samui
        coordinates: { latitude: 9.548953, longitude: 100.062447 }
      - id: penang
        title: Penang
        coordinates: { latitude: 5.263234, longitude: 100.484623 }
    routes:
      - points: [samui, penang]
```

Lines are straight segments in the projected illustration, not computed road routes or great-circle flight paths. A point's `label` overrides its title; `label: false` hides the label. `marker.type` defaults to `place`; `route-anchor` suppresses the visible marker while retaining a semantic point for route geometry. The actual Penang post preserves the historical map's distinct marker and line-end coordinates with two additional route anchors. The old source does not establish why those coordinates differed, so migration retains them without inventing a reason.

## Generate and verify

```bash
npm run maps -- --post=2012/07/samui-penang-via-flugzeug-wieder
npm run maps -- --all
npm run maps -- --changed
npm run maps -- --verify
npm run maps -- --verify --post=2009/08/umzug
```

One-post generation processes only that bundle. `--all` explicitly regenerates all declared maps; `--changed` compares each map's recipe fingerprint and generated-file checksum, including frontmatter, dataset, style, renderer source, packaged fonts, and Sharp/encoder versions. It regenerates only missing, changed, or modified outputs. It does not depend on a Git diff, so changes to shared inputs also invalidate affected maps.

The generator creates the declared WebP beside `index.md` and records deterministic provenance in `.static-maps.json` in the same bundle. Commit both files with the frontmatter. Regeneration may overwrite a file owned by that manifest; it refuses to overwrite unrelated images. There are no timestamps in the output or manifest. Identical inputs produce identical bytes in the same renderer environment; encoder or font-library changes can alter bytes across environments, and require explicit regeneration.

`--verify` does not render or read geographic data or font files. It validates all configurations, references, bounds, file locality, actual WebP format and dimensions, frontmatter recipe checksums, image checksums, and provenance. It detects orphaned assets from generator manifests and undeclared reserved `map.webp`/`map-*.webp` files. Remove retired outputs and their manifest entries deliberately. This command is available as an editorial check; it is not yet part of the normal `validate` umbrella.

## Geography and explicit updates

The committed regional dataset is `src/data/static-maps/southern-thailand-malaysia.json`, covering 97°…103° east and 4°…11° north. It contains coastline-derived land polygons clipped from the [OSM land-polygon dataset](https://osmdata.openstreetmap.de/data/land-polygons.html), plus the existing [detailed Koh Samui coastline snapshot](../components/logo-coastline.md). Provenance includes the source archive checksum and the detailed snapshot checksum. Water is the background; land, coastline, selected editorial labels, markers, and routes are drawn locally. No roads, terrain shading, country borders, or automatically selected settlements are claimed by this first dataset. It is an illustration, not a navigation map.

The initial renderer spike compared the existing MapLibre ecosystem with this narrow requirement. [MapLibre Native](https://maplibre.org/maplibre-native/docs/book/platforms/linux/) needs a separate native/headless graphics setup; browser MapLibre needs a browser/WebGL environment and font/glyph handling. PMTiles is useful for regional multizoom tile datasets, but adds tile decoding and style infrastructure for the two current coastline illustrations. SVG geometry rasterised by the already installed Sharp dependency provides the required offline, deterministic CLI without adding a mapping dependency. GeoJSON keeps the local dataset readable and replaceable. A future richer regional dataset can deliberately change this renderer; existing committed article images remain independent of it.

Source updates are editorial network activity, never visitor activity. Download the official simplified EPSG:3857 archive explicitly, then import it with the Node CLI and the operating system's `unzip` executable:

```bash
curl --fail --location --output /tmp/static-map-land.zip https://osmdata.openstreetmap.de/download/simplified-land-polygons-complete-3857.zip
npm run maps:data:update -- --archive=/tmp/static-map-land.zip
```

The importer checks the shapefile header, reads polygon records, converts Mercator coordinates, clips the region, and replaces the simplified Samui polygon with the committed detailed snapshot. It does not regenerate any article. Inspect and commit dataset changes, then explicitly regenerate selected maps when desired. Keep the downloaded archive outside the repository. To extend regional coverage, change the importer's declared bounds deliberately and import an appropriate source; generation fails clearly when article bounds exceed the available region.

Labels use the site's packaged Panton TTF through Sharp/Pango's `fontfile` setting. Labels containing Thai use the self-hosted Anuphan Thai subset from `@fontsource-variable/anuphan`, licensed under SIL OFL. No fonts are downloaded by the generator. Panton remains subject to the repository owner's existing font licence; no separate redistribution grant is assumed. Current labels use German/Latin text, including Malay place names written in Latin script. Tests cover escaped labels and Thai rendering. Complex mixed-script typography and collision avoidance are not navigation-quality features of this first renderer.

## Attribution and licence

The rendering transform always emits `Kartendaten © OpenStreetMap-Mitwirkende`, with the contributor text linked to [OpenStreetMap's copyright page](https://www.openstreetmap.org/copyright). Authors cannot disable or replace this attribution. It is readable HTML outside the image, and does not contact OpenStreetMap until a reader follows the link. The geographic dataset is derived from OpenStreetMap under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/); the regional derivative is committed here for inspection and reuse under that licence. Retain its provenance and attribution when reusing it.

## Migration inventory

The source audit searched the whole repository for `maps.google`, `google.com/maps/api/staticmap`, `maps.googleapis.com`, `staticmap`, and `static-map`. Ordinary text links to Google Maps remain links; they are not static-map embeds. No legacy image handling was deleted.

| Post | Old provider and type | Geographic intent | Old size and alt | Migration |
| --- | --- | --- | --- | --- |
| `2012/07/samui-penang-via-flugzeug-wieder` | Google Static Maps, default map type; image had already been removed in commit `bc7b5a664eaa`. | Markers at Samui (9.548953, 100.062447) and Penang (5.263234, 100.484623); line endpoints (9.54472, 100.06227) and (5.26054, 100.49538). All four positions preserved. | 620 × 280; no alt in the historical image. | Restored as local `map-route.webp`, with required German alt and attribution. |
| `2009/08/umzug` | Google Static Maps, terrain; malformed `hhttps` URL and obsolete API key. | Centre (9.568928, 99.971466), zoom 12, one house marker (9.578069, 99.957905), labelled 9; no route. | 500 × 250; `Map unseres neuen Hauses`. | Local `map-house.webp`; bounds approximate the old zoom-12 frame, preserve the centre and marker, and replace terrain with the documented coastline illustration. Old URL and key removed. |

Privacy regression tests load both real article routes, assert a local decoded image, alt text, attribution, and responsive layout, and fail on any request to mapping hosts. Unit tests cover schema relationships, generation, deterministic bytes, safe output ownership, missing datasets, verification without renderer inputs, orphan detection, and stale configurations.
