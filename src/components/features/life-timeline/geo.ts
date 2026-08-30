// Small local geometry helpers for the 2005 journey animation. Deliberately
// not a geodesic/great-circle library — a quadratic-bezier arc in plain
// lng/lat space is visually indistinguishable at this zoom level and avoids
// pulling in a geospatial dependency for one feature.

export interface LngLat {
  lng: number;
  lat: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** Builds a curved polyline from `from` to `to`, bowed perpendicular to the line by `curve` (0 = straight). */
export function computeJourneyCurve(
  from: LngLat,
  to: LngLat,
  curve: number,
  segments = 64,
): LngLat[] {
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;
  const distance = Math.hypot(dx, dy) || 1;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const control: LngLat = {
    lat: (from.lat + to.lat) / 2 + normalY * distance * curve,
    lng: (from.lng + to.lng) / 2 + normalX * distance * curve,
  };

  const points: LngLat[] = [];
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const oneMinusT = 1 - t;
    points.push({
      lat:
        oneMinusT * oneMinusT * from.lat +
        2 * oneMinusT * t * control.lat +
        t * t * to.lat,
      lng:
        oneMinusT * oneMinusT * from.lng +
        2 * oneMinusT * t * control.lng +
        t * t * to.lng,
    });
  }
  return points;
}

/** Initial compass bearing (degrees, 0–360) from point `a` to point `b`. */
export function bearingBetween(a: LngLat, b: LngLat): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export interface JourneyPoint {
  position: LngLat;
  bearing: number;
}

/** Position and heading at `progress` (0–1) along a precomputed curve. */
export function pointAlongCurve(
  points: readonly LngLat[],
  progress: number,
): JourneyPoint {
  if (points.length < 2) {
    const only = points[0] ?? { lat: 0, lng: 0 };
    return { bearing: 0, position: only };
  }

  const clamped = Math.min(Math.max(progress, 0), 1);
  const scaled = clamped * (points.length - 1);
  const index = Math.min(Math.floor(scaled), points.length - 2);
  const a = points[index] as LngLat;
  const b = points[index + 1] as LngLat;
  const localT = scaled - index;

  return {
    bearing: bearingBetween(a, b),
    position: {
      lat: a.lat + (b.lat - a.lat) * localT,
      lng: a.lng + (b.lng - a.lng) * localT,
    },
  };
}

export type LngLatBounds = [[number, number], [number, number]];

/** Bounding box `[[west, south], [east, north]]` covering all given points. */
export function computeBounds(locations: readonly LngLat[]): LngLatBounds {
  const lngs = locations.map((location) => location.lng);
  const lats = locations.map((location) => location.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}
