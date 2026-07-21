export const MAP_CONFIG = {
  defaultZoom: 15,
  maxZoom: 19,
  minZoom: 0,
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
} as const;

export interface MapPoint {
  slug: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  title: string;
  description: string;
  tags: string[];
}
