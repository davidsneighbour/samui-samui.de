# Interactive maps

Interactive maps use a local mapcn-style React component layer on top of
MapLibre GL JS, with OpenFreeMap as the initial MapLibre-compatible style and
vector tile provider. MapLibre is loaded from npm, not from a CDN, and MapLibre
CSS is imported through the local mapcn component module graph.

MapLibre is the renderer. OpenFreeMap supplies the initial hosted style document,
tiles, sprites, glyphs, fonts, and related map assets from
`https://tiles.openfreemap.org`. This does not use Google Maps, Mapbox, a Mapbox
token, or an application API key, but it does still send normal connection
metadata such as the visitor IP address to OpenFreeMap infrastructure when a map
component loads.

The mapcn-style primitive lives at `src/components/ui/map.tsx`. It exposes
`MapCanvas`, `MapMarker`, `MarkerContent`, `MarkerPopup`, and `MapControls`
wrappers for MapLibre. The contact-page implementation lives at
`src/components/ContactMap.tsx` and is hydrated from `/kontakt/` with
`client:visible`, so it is displayed inline below the contact form rather than
opened from a button.

Map coordinates in data files are stored as named `latitude` and `longitude`
fields, but MapLibre calls must always receive coordinates in
`[longitude, latitude]` order.

Example:

```tsx
---
import ContactMap from '@components/ContactMap';
import { getMapPointBySlug } from '@data/map-points';
---

<ContactMap point={getMapPointBySlug('dnb-hq')} client:visible />
```

Keep reusable map configuration in `src/config/maps.ts`. Keep reusable locations
in `src/data/map-points.json`; do not scatter coordinate literals through page
templates. Each point must have:

```ts
export interface MapPoint {
  slug: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  title: string;
  description: string;
  tags: string[];
}
```

The map UI adapts the site design tokens from `DESIGN.md`: card and border
tokens frame the map, `primary` marks points, `muted` styles metadata, and the
MapLibre-generated controls/popups are normalized in `src/styles/theme.css`.

Future location-list features can build on the JSON registry for `flyTo()`
navigation, external popup activation buttons, GeoJSON layers, marker
clustering, regional map extents, custom styles, and local PMTiles.

The preferred self-hosting path is MapLibre GL JS plus a locally hosted style
document, local sprites and fonts where needed, and a self-hosted regional
Protomaps PMTiles file. Do not describe the current OpenFreeMap integration as
fully self-hosted or completely private; full infrastructure independence starts
with the later PMTiles and local-asset migration.
