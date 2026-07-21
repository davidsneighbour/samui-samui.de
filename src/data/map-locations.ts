import type { MapLocation } from '@config/maps';

export const contactMapLocation = {
  description: 'Initial MapLibre and OpenFreeMap integration.',
  id: 'koh-samui',
  latitude: 9.512,
  longitude: 100.013,
  title: 'Koh Samui',
  zoom: 10,
} as const satisfies MapLocation;
