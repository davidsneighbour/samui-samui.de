'use client';

import type { MapOptions, MarkerOptions, PopupOptions } from 'maplibre-gl';
import * as MapLibreGL from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@utils/cn';
import { X } from 'lucide-react';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import {
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

MapLibreGL.setWorkerUrl(mapLibreWorkerUrl);

type Theme = 'light' | 'dark';
type MapStyleOption = string | MapLibreGL.StyleSpecification;

export type MapRef = MapLibreGL.Map;

export interface MapViewport {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

interface MapContextValue {
  isLoaded: boolean;
  map: MapLibreGL.Map | null;
  resolvedTheme: Theme;
}

const MapContext = createContext<MapContextValue | null>(null);

export function useMap(): MapContextValue {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a Map component');
  }
  return context;
}

function getDocumentTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const root = document.documentElement;
  if (root.dataset['theme'] === 'light' || root.classList.contains('light')) {
    return 'light';
  }
  return 'dark';
}

function useResolvedTheme(themeProp?: Theme): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(() =>
    getDocumentTheme(),
  );

  useEffect(() => {
    if (themeProp) return;

    const observer = new MutationObserver(() => {
      setDetectedTheme(getDocumentTheme());
    });

    observer.observe(document.documentElement, {
      attributeFilter: ['class', 'data-theme'],
      attributes: true,
    });

    return () => observer.disconnect();
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return {
    bearing: map.getBearing(),
    center: [center.lng, center.lat],
    pitch: map.getPitch(),
    zoom: map.getZoom(),
  };
}

function useStableStyle(style: MapStyleOption): MapStyleOption {
  const key = useMemo(() => JSON.stringify(style), [style]);
  return useMemo(() => style, [key, style]);
}

export interface MapProps
  extends Omit<MapOptions, 'container' | 'style' | 'center' | 'zoom'> {
  children?: ReactNode;
  className?: string;
  center: [number, number];
  loading?: boolean;
  onViewportChange?: (viewport: MapViewport) => void;
  styles: {
    dark: MapStyleOption;
    light: MapStyleOption;
  };
  theme?: Theme;
  zoom: number;
}

function DefaultLoader(): ReactNode {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/70 backdrop-blur-xs">
      <div className="flex gap-1" aria-label="Karte wird geladen">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function DefaultError(): ReactNode {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-card p-4 text-center text-sm text-muted-foreground">
      Die Karte konnte nicht geladen werden.
    </div>
  );
}

export const MapCanvas = forwardRef<MapRef, MapProps>(function MapCanvas(
  {
    children,
    className,
    center,
    theme: themeProp,
    styles,
    loading = false,
    onViewportChange,
    zoom,
    ...props
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const resolvedTheme = useResolvedTheme(themeProp);
  const lightStyle = useStableStyle(styles.light);
  const darkStyle = useStableStyle(styles.dark);
  const currentStyleRef = useRef<MapStyleOption | null>(null);
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  useImperativeHandle(ref, () => mapInstance as MapLibreGL.Map, [mapInstance]);

  useEffect(() => {
    if (!containerRef.current) return;

    const initialStyle = resolvedTheme === 'dark' ? darkStyle : lightStyle;
    currentStyleRef.current = initialStyle;

    let map: MapLibreGL.Map;
    try {
      map = new MapLibreGL.Map({
        attributionControl: { compact: true },
        center,
        container: containerRef.current,
        renderWorldCopies: false,
        style: initialStyle,
        zoom,
        ...props,
      });
    } catch {
      // WebGL unavailable/blocked, or the worker script failed to boot.
      setHasError(true);
      return;
    }

    let hasLoadedOnce = false;
    const loadHandler = () => {
      hasLoadedOnce = true;
      setIsLoaded(true);
    };
    const moveHandler = () => onViewportChangeRef.current?.(getViewport(map));
    // MapLibre reports fatal init failures (bad style, no WebGL context) and
    // transient runtime errors (a single missing tile while panning) through
    // the same 'error' event. Without any handling the loading skeleton
    // spins forever on a fatal failure; treating every error as fatal would
    // instead hide an already-working map behind the error state on a
    // harmless tile miss. Only errors before the first successful load are
    // treated as fatal.
    const errorHandler = () => {
      if (!hasLoadedOnce) setHasError(true);
    };

    map.on('load', loadHandler);
    map.on('move', moveHandler);
    map.on('error', errorHandler);
    setMapInstance(map);

    return () => {
      map.off('load', loadHandler);
      map.off('move', moveHandler);
      map.off('error', errorHandler);
      map.remove();
      setIsLoaded(false);
      setHasError(false);
      setMapInstance(null);
    };
    // MapLibre owns the mounted instance lifecycle; prop syncing happens below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance) return;
    const nextStyle = resolvedTheme === 'dark' ? darkStyle : lightStyle;
    if (currentStyleRef.current === nextStyle) return;
    currentStyleRef.current = nextStyle;
    mapInstance.setStyle(nextStyle, { diff: false });
  }, [darkStyle, lightStyle, mapInstance, resolvedTheme]);

  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.jumpTo({ center, zoom });
  }, [center, mapInstance, zoom]);

  const contextValue = useMemo(
    () => ({
      isLoaded,
      map: mapInstance,
      resolvedTheme,
    }),
    [isLoaded, mapInstance, resolvedTheme],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn('relative h-full w-full overflow-hidden', className)}
      >
        {hasError ? (
          <DefaultError />
        ) : (
          (!isLoaded || loading) && <DefaultLoader />
        )}
        {mapInstance && !hasError && children}
      </div>
    </MapContext.Provider>
  );
});

interface MarkerContextValue {
  map: MapLibreGL.Map | null;
  marker: MapLibreGL.Marker;
}

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext(): MarkerContextValue {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error('Marker components must be used within MapMarker');
  }
  return context;
}

export interface MapMarkerProps extends Omit<MarkerOptions, 'element'> {
  children: ReactNode;
  latitude: number;
  longitude: number;
  /**
   * Pixel coordinate within the icon's own box (measured from its top-left
   * corner) that should sit exactly on the lat/long point — e.g. `[16, 16]`
   * for the center of a 32px icon, or `[16, 32]` for the tip of a 32px-tall
   * pin. Takes precedence over `anchor`/`offset` when set.
   */
  iconAnchor?: [number, number];
}

export function MapMarker({
  children,
  latitude,
  longitude,
  iconAnchor,
  ...markerOptions
}: MapMarkerProps): ReactNode {
  const { map } = useMap();
  const marker = useMemo(
    () =>
      new MapLibreGL.Marker({
        ...(iconAnchor
          ? { anchor: 'top-left', offset: [-iconAnchor[0], -iconAnchor[1]] }
          : {}),
        ...markerOptions,
        element: document.createElement('div'),
      }).setLngLat([longitude, latitude]),
    // Marker options are treated as initial construction options, as in mapcn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);

  useEffect(() => {
    marker.setLngLat([longitude, latitude]);
  }, [latitude, longitude, marker]);

  const contextValue = useMemo(() => ({ map, marker }), [map, marker]);

  return (
    <MarkerContext.Provider value={contextValue}>
      {children}
    </MarkerContext.Provider>
  );
}

export interface MarkerContentProps {
  children?: ReactNode;
  className?: string;
}

export function MarkerContent({
  children,
  className,
}: MarkerContentProps): ReactNode {
  const { marker } = useMarkerContext();

  return createPortal(
    <div className={cn('relative cursor-pointer', className)}>
      {children ?? <DefaultMarkerIcon />}
    </div>,
    marker.getElement(),
  );
}

function DefaultMarkerIcon(): ReactNode {
  return (
    <span className="block size-4 rounded-full border-2 border-card bg-primary" />
  );
}

export interface MarkerPopupProps extends PopupOptions {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function MarkerPopup({
  children,
  className,
  defaultOpen = false,
  closeButton = false,
  offset = 28,
  ...popupOptions
}: MarkerPopupProps): ReactNode {
  const { map, marker } = useMarkerContext();
  const [container] = useState(() => document.createElement('div'));
  const popup = useMemo(
    () =>
      new MapLibreGL.Popup({
        closeButton,
        closeOnClick: true,
        focusAfterOpen: false,
        offset,
        ...popupOptions,
      }).setDOMContent(container),
    [closeButton, container, offset, popupOptions],
  );

  useEffect(() => {
    marker.setPopup(popup);
    if (defaultOpen && map) {
      popup.setLngLat(marker.getLngLat()).addTo(map);
    }
    return () => {
      popup.remove();
    };
  }, [defaultOpen, map, marker, popup]);

  return createPortal(
    <div className={cn('map-popup min-w-48', className)}>
      <button
        type="button"
        aria-label="Popup schließen"
        className="absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-sm text-card-foreground/70 transition-colors before:absolute before:-inset-2.5 before:content-[''] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => popup.remove()}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
      {children}
    </div>,
    container,
  );
}

export interface MapControlsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showCompass?: boolean;
  showZoom?: boolean;
}

export function MapControls({
  position = 'top-right',
  showCompass = true,
  showZoom = true,
}: MapControlsProps): null {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    const control = new MapLibreGL.NavigationControl({
      showCompass,
      showZoom,
    });
    map.addControl(control, position);
    return () => {
      map.removeControl(control);
    };
  }, [map, position, showCompass, showZoom]);

  return null;
}
