import { type MapPoint } from '@config/maps';
import rawMapPoints from './map-points.json';

function isMapPoint(value: unknown): value is MapPoint {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['slug'] === 'string' &&
    typeof candidate['latitude'] === 'number' &&
    typeof candidate['longitude'] === 'number' &&
    typeof candidate['title'] === 'string' &&
    typeof candidate['description'] === 'string' &&
    Array.isArray(candidate['tags']) &&
    candidate['tags'].every((tag) => typeof tag === 'string') &&
    (candidate['zoom'] === undefined || typeof candidate['zoom'] === 'number')
  );
}

function parseMapPoints(value: unknown): MapPoint[] {
  if (!Array.isArray(value) || !value.every(isMapPoint)) {
    throw new Error('Map point data must match the MapPoint schema.');
  }

  return value;
}

export const mapPoints = parseMapPoints(rawMapPoints);

export function getMapPointBySlug(slug: string): MapPoint {
  const point = mapPoints.find((item) => item.slug === slug);
  if (!point) {
    throw new Error(`Map point not found: ${slug}`);
  }
  return point;
}
