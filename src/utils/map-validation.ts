import { MAP_CONFIG } from '@config/maps';

type MapCoordinateInput = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export function isValidLatitude(latitude: number): boolean {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90;
}

export function isValidLongitude(longitude: number): boolean {
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

export function isValidZoom(zoom: number): boolean {
  return (
    Number.isFinite(zoom) &&
    zoom >= MAP_CONFIG.minZoom &&
    zoom <= MAP_CONFIG.maxZoom
  );
}

export function getMapLocationValidationError({
  latitude,
  longitude,
  zoom,
}: MapCoordinateInput): string | undefined {
  if (!isValidLatitude(latitude)) {
    return 'The map latitude must be a finite number between -90 and 90.';
  }

  if (!isValidLongitude(longitude)) {
    return 'The map longitude must be a finite number between -180 and 180.';
  }

  if (!isValidZoom(zoom)) {
    return `The map zoom must be a finite number between ${MAP_CONFIG.minZoom} and ${MAP_CONFIG.maxZoom}.`;
  }

  return undefined;
}
