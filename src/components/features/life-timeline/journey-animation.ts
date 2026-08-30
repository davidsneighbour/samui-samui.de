import type { LifeTimelineCameraPadding } from '@config/life-timeline';
import type { ResolvedLifeTimelineCamera } from '@data/life-timeline';
import type { Feature, LineString } from 'geojson';
import * as MapLibreGL from 'maplibre-gl';
import {
  bearingBetween,
  computeBounds,
  type LngLat,
  pointAlongCurve,
} from './geo';

const SOURCE_ID = 'life-timeline-journey';
const LINE_LAYER_ID = 'life-timeline-journey-line';

// Decorative plane glyph — aria-hidden, never the sole carrier of journey
// information (the description panel always states the journey in text).
const PLANE_ICON_SVG =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5l-.7.9c-.3.4-.2 1 .2 1.3L9 13l-2 3H4l-1 1.5 3.5 1L8 22l1.5-1v-3l3-2 3.4 5.8c.3.4.9.5 1.3.2l.9-.7c.4-.3.6-.8.5-1.3Z"/></svg>';

function readCssColor(variableName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  return value.length > 0 ? value : fallback;
}

function lineFeature(coordinates: [number, number][]): Feature<LineString> {
  return {
    geometry: { coordinates, type: 'LineString' },
    properties: {},
    type: 'Feature',
  };
}

function safely(operation: () => void): void {
  try {
    operation();
  } catch {
    // The map instance may already be mid-teardown (unmount race); best-effort cleanup.
  }
}

export interface AnimateJourneyOptions {
  map: MapLibreGL.Map;
  points: readonly LngLat[];
  duration: number;
  lineStyle: 'solid' | 'dashed';
  followVehicle: boolean;
  reducedMotion: boolean;
  destinationCamera: ResolvedLifeTimelineCamera;
  padding: Required<LifeTimelineCameraPadding>;
  onDone: () => void;
}

export interface JourneyAnimationHandle {
  cancel: () => void;
}

export function animateJourney({
  map,
  points,
  duration,
  lineStyle,
  followVehicle,
  reducedMotion,
  destinationCamera,
  padding,
  onDone,
}: AnimateJourneyOptions): JourneyAnimationHandle {
  let cancelled = false;
  let rafId: number | undefined;
  let planeMarker: MapLibreGL.Marker | undefined;

  const origin = points[0];
  const destination = points.at(-1);
  const coordinates: [number, number][] = points.map((point) => [
    point.lng,
    point.lat,
  ]);

  const cleanupMarker = () => {
    safely(() => planeMarker?.remove());
    planeMarker = undefined;
  };

  const cleanupLayer = () => {
    safely(() => {
      if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
    });
    safely(() => {
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    });
  };

  const setupLayer = () => {
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, { data: lineFeature([]), type: 'geojson' });
    }
    if (!map.getLayer(LINE_LAYER_ID)) {
      map.addLayer({
        id: LINE_LAYER_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': readCssColor('--color-primary', '#ec7263'),
          'line-dasharray': lineStyle === 'dashed' ? [2, 1.5] : [1, 0],
          'line-width': 2.5,
        },
        source: SOURCE_ID,
        type: 'line',
      });
    }
  };

  const updateLine = (progress: number) => {
    const source = map.getSource(SOURCE_ID) as
      | MapLibreGL.GeoJSONSource
      | undefined;
    if (!source) return;
    const count = Math.max(2, Math.round(coordinates.length * progress));
    source.setData(lineFeature(coordinates.slice(0, count)));
  };

  const ensurePlaneMarker = () => {
    if (planeMarker || !origin) return;
    const element = document.createElement('div');
    element.setAttribute('aria-hidden', 'true');
    element.style.color = readCssColor('--color-primary', '#ec7263');
    element.style.filter = 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.35))';
    element.style.transformOrigin = 'center';
    element.innerHTML = PLANE_ICON_SVG;
    planeMarker = new MapLibreGL.Marker({ element })
      .setLngLat([origin.lng, origin.lat])
      .addTo(map);
  };

  const finishAtDestination = () => {
    if (cancelled) return;
    cleanupMarker();
    if (!destination) {
      cleanupLayer();
      onDone();
      return;
    }
    const method = reducedMotion ? 'jumpTo' : 'easeTo';
    const settle = () => {
      if (cancelled) return;
      cleanupLayer();
      onDone();
    };
    if (method === 'jumpTo') {
      map.jumpTo({
        bearing: destinationCamera.bearing,
        center: [destination.lng, destination.lat],
        pitch: destinationCamera.pitch,
        zoom: destinationCamera.zoom,
      });
      settle();
      return;
    }
    map.once('moveend', settle);
    map.easeTo({
      bearing: destinationCamera.bearing,
      center: [destination.lng, destination.lat],
      duration: Math.max(duration * 0.3, 400),
      padding,
      pitch: destinationCamera.pitch,
      zoom: destinationCamera.zoom,
    });
  };

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    if (rafId !== undefined) cancelAnimationFrame(rafId);
    cleanupMarker();
    cleanupLayer();
  };

  setupLayer();

  if (reducedMotion) {
    updateLine(1);
    finishAtDestination();
    return { cancel };
  }

  if (origin && destination) {
    safely(() => {
      map.fitBounds(computeBounds([origin, destination]), {
        bearing: 0,
        duration: Math.min(duration * 0.25, 900),
        padding,
        pitch: 0,
      });
    });
  }

  ensurePlaneMarker();

  const startTime = performance.now();
  const step = (now: number) => {
    if (cancelled) return;
    const progress = Math.min((now - startTime) / duration, 1);
    updateLine(progress);

    const { position, bearing } = pointAlongCurve(points, progress);
    planeMarker?.setLngLat([position.lng, position.lat]);
    const element = planeMarker?.getElement().firstElementChild as
      | HTMLElement
      | null
      | undefined;
    if (element) element.style.transform = `rotate(${bearing - 90}deg)`;

    if (followVehicle) {
      safely(() => map.jumpTo({ center: [position.lng, position.lat] }));
    }

    if (progress >= 1) {
      finishAtDestination();
      return;
    }
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);

  return { cancel };
}

// Re-exported for callers that only need heading math without a full animation.
export { bearingBetween };
