# Interactive maps

Interactive maps use MapLibre GL JS with OpenFreeMap as the initial
MapLibre-compatible style and vector tile provider. MapLibre is loaded from npm,
not from a CDN, and its CSS is imported through the Astro module graph in
`src/components/BaseHead.astro`.

MapLibre is the renderer. OpenFreeMap supplies the initial hosted style document,
tiles, sprites, glyphs, fonts, and related map assets from
`https://tiles.openfreemap.org`. This does not use Google Maps, Mapbox, a Mapbox
token, or an application API key, but it does still send normal connection
metadata such as the visitor IP address to OpenFreeMap infrastructure when a map
is opened.

The reusable component lives at `src/components/MapDialog.astro`. It initially
renders a button, lazy-loads `maplibre-gl` only after the native dialog opens, and
then creates one local HTML marker plus a locally rendered popup. Map coordinates
must be supplied as latitude and longitude props, but MapLibre calls must always
receive coordinates in `[longitude, latitude]` order.

Example:

```astro
---
import MapDialog from '@components/MapDialog.astro';
import { contactMapLocation } from '@data/map-locations';
---

<MapDialog
  buttonLabel="Karte anzeigen"
  dialogTitle="Karte: Koh Samui"
  latitude={contactMapLocation.latitude}
  longitude={contactMapLocation.longitude}
  zoom={contactMapLocation.zoom}
  markerTitle={contactMapLocation.title}
  markerDescription={contactMapLocation.description}
/>
```

Keep reusable map configuration in `src/config/maps.ts`. Keep reusable locations
in structured local data such as `src/data/map-locations.ts`; do not scatter
coordinate literals through page templates. When multiple locations are added,
use a typed structure like:

```ts
export interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  title: string;
  description?: string;
}
```

Future location-list features can build on that shape for `flyTo()` navigation,
external popup activation buttons, GeoJSON layers, marker clustering, regional
map extents, custom styles, and local PMTiles.

The preferred self-hosting path is MapLibre GL JS plus a locally hosted style
document, local sprites and fonts where needed, and a self-hosted regional
Protomaps PMTiles file. Do not describe the current OpenFreeMap integration as
fully self-hosted or completely private; full infrastructure independence starts
with the later PMTiles and local-asset migration.
