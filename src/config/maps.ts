export const MAP_CONFIG = {
  defaultZoom: 15,
  maxZoom: 19,
  minZoom: 0,
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
} as const;

export interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  title: string;
  description?: string;
}

export interface MapDialogPayload {
  dialogTitle: string;
  latitude: number;
  longitude: number;
  zoom: number;
  markerTitle: string;
  markerDescription?: string;
}
