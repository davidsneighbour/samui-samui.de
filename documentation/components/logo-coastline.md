# Logo coastline source

The production Koh Samui outline is derived from a committed OpenStreetMap coastline snapshot retrieved on 8 October 2026. This replaces the owner-supplied SVG whose original source could not be established. The owner's recollection of a Wikipedia map remains unverified; it is not the provenance of the replacement. The work is tracked in [#1749](https://github.com/davidsneighbour/samui-samui.de/issues/1749).

## Source package

`src/assets/geography/koh-samui/` contains the following files:

* `source/way-476906866.osm` and `source/way-1156240705.osm`: original OSM API responses, including node coordinates and way metadata.
* `provenance.json`: retrieval date, source URLs, SHA-256 checksums, way versions, edit timestamps, projection settings, and vertex count.
* `coastline.geojson`: one closed Polygon ring with 2,133 vertices, plus the closing coordinate. Coordinates retain the source precision and use longitude, latitude order.
* `coastline.svg`: a detailed, north-up outline for vector artwork.
* `LICENCE.txt`: source attribution and links to the applicable database licence.

The two source ways join by shared node IDs. The generator rejects missing nodes, conflicting coordinates, ambiguous continuations, unconnected ways, and coordinates outside the expected island region. The extract contains only this coastline, not the island's roads, buildings, administrative boundary, or neighbouring islands. This is the coastline represented in OSM at the saved versions, not a surveyed boundary or a guarantee of geographic accuracy.

## Rebuild and refresh

Run from the repository root with the installed Node version:

```bash
node src/scripts/brand/build-coastline.ts
node src/scripts/brand/build-logo-kit.ts
```

Both commands operate offline. The first assembles the original XML ways into GeoJSON and projects them into the legacy 413 × 431 source canvas. It also writes `src/assets/koh-samui-outline-main.svg`, which remains the logo pipeline's input. The local equirectangular projection uses a standard parallel of 9.5°N and a central meridian of 100°E, with north upwards. Uniform scaling fits the contour inside the existing bounds of x = 19–393 and y = 19–411, centred at (206, 215). SVG coordinates are rounded to four decimal places; GeoJSON is not simplified or rounded further.

The second command applies the established 7-unit and 16-unit simplification tolerances in source-canvas units, retaining the four extrema as anchors so responsive bounds stay aligned (50 vertices for the main mark and 20 for the small cut), then the existing 0.52 scale and translation into the 256-unit logo canvas. It refreshes the coastline in the selected masters while retaining the approved Panton punctuation holes and lettering. The detailed masthead retains the full contour. Logo geometry is a derivative for identification, not a geographic data source.

A future refresh is a deliberate source update, not part of a normal build. Fetch the source URLs in `provenance.json`, follow any changed coastline endpoints through the OSM API if needed, and save the complete connected ring as original responses. Update the retrieval date in both generators, inspect changed geometry, rebuild, validate, and commit the snapshot and derivatives together. Preserve previous versions through Git. Do not silently mix snapshots with conflicting shared-node coordinates.

## Licence and attribution

Source data: © OpenStreetMap contributors, available under the [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). See [OpenStreetMap copyright](https://www.openstreetmap.org/copyright) and the [OSMF attribution guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines).

The stored geographic data and its database derivatives retain the ODbL notice. The licence of source data does not automatically become the licence of every rendered logo or the independent Panton lettering. Exported SVG metadata records the coastline source. The website provides a visible, linked German coastline credit in the `Kartendaten` section of the Impressum (`/kleingedrucktes/impressum/`), which the shared footer links from every page. The OSMF guidelines accept attribution "in a location where customarily attribution would be expected by the users of the produced work"; a site's legal notice is such a location, and it avoids repeating the credit on every page. SVG metadata and repository notes alone are not treated as public attribution.

For redistributed maps and substantial data extracts, retain the source and licence notices, and fulfil applicable ODbL obligations. The OSMF guidelines provide exceptions for small thumbnails/icons and some static images; this package does not rely on those exceptions for the entire identity. For printed work, include the copyright URL in the relevant credits. For physical merchandise, the guidelines require attribution on packaging, at the point of sale, and, where possible, on the item or its label. A Git commit or SVG metadata alone does not satisfy those presentation requirements.

The missing source of the historical SVG remains unknown. Historical comparison studies and generated presentation illustrations are not newly sourced coastline masters; use the current production SVGs for new work. Font permission, trademark clearance, and other independent rights are outside this coastline replacement.
