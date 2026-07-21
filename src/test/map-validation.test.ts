import { MAP_CONFIG } from '@config/maps';
import { getMapLocationValidationError } from '@utils/map-validation';
import { describe, expect, it } from 'vitest';

describe('map location validation', () => {
  it('accepts finite coordinates and zoom values inside the configured range', () => {
    expect(
      getMapLocationValidationError({
        latitude: 9.512,
        longitude: 100.013,
        zoom: MAP_CONFIG.defaultZoom,
      }),
    ).toBeUndefined();
  });

  it('rejects invalid coordinate and zoom values', () => {
    expect(
      getMapLocationValidationError({
        latitude: 91,
        longitude: 100.013,
        zoom: MAP_CONFIG.defaultZoom,
      }),
    ).toContain('latitude');

    expect(
      getMapLocationValidationError({
        latitude: 9.512,
        longitude: Number.POSITIVE_INFINITY,
        zoom: MAP_CONFIG.defaultZoom,
      }),
    ).toContain('longitude');

    expect(
      getMapLocationValidationError({
        latitude: 9.512,
        longitude: 100.013,
        zoom: MAP_CONFIG.maxZoom + 1,
      }),
    ).toContain('zoom');
  });
});
