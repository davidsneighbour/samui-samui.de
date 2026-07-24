'use client';

import { DescriptionPanel } from '@components/life-timeline/DescriptionPanel';
import { LifeTimelineCamera } from '@components/life-timeline/LifeTimelineCamera';
import { LifeTimelineMarkers } from '@components/life-timeline/LifeTimelineMarkers';
import { PlaybackControls } from '@components/life-timeline/PlaybackControls';
import { useLifeTimelinePlayback } from '@components/life-timeline/useLifeTimelinePlayback';
import { useReducedMotion } from '@components/life-timeline/useReducedMotion';
import { YearDisplay } from '@components/life-timeline/YearDisplay';
import { MapCanvas, MapControls } from '@components/ui/map';
import {
  LIFE_TIMELINE_CONFIG,
  type LifeTimelineCameraPadding,
} from '@config/life-timeline';
import { MAP_CONFIG } from '@config/maps';
import { getLifeTimelineYears } from '@data/life-timeline';
import { getMapPointBySlug } from '@data/map-points';
import { useEffect, useMemo, useState } from 'react';

const WORLD_CENTER: [number, number] = [10, 15];

const MOBILE_UI_PADDING: Required<LifeTimelineCameraPadding> = {
  bottom: 260,
  left: 24,
  right: 24,
  top: 60,
};

const DESKTOP_UI_PADDING: Required<LifeTimelineCameraPadding> = {
  bottom: 220,
  left: 80,
  right: 80,
  top: 90,
};

function useUiPadding(): Required<LifeTimelineCameraPadding> {
  const [padding, setPadding] = useState(DESKTOP_UI_PADDING);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 640px)');
    const update = () =>
      setPadding(query.matches ? DESKTOP_UI_PADDING : MOBILE_UI_PADDING);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return padding;
}

function formatLocationLabel(
  locations: readonly { label?: string; pointTitle: string }[],
): string | undefined {
  if (locations.length === 0) return undefined;
  const names = locations.map(
    (location) => location.label ?? location.pointTitle,
  );
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} und ${names.at(-1)}`;
}

export default function LifeTimelineMap() {
  const years = useMemo(() => getLifeTimelineYears(), []);
  const reducedMotion = useReducedMotion();
  const uiPadding = useUiPadding();
  const { yearIndex, playbackState, controller } =
    useLifeTimelinePlayback(years);

  useEffect(() => {
    const delay = reducedMotion ? 0 : LIFE_TIMELINE_CONFIG.introPauseDuration;
    const timer = setTimeout(() => controller.start(), delay);
    return () => clearTimeout(timer);
    // The controller instance is stable for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const activeYear = years[yearIndex];
  const previousYear = years[yearIndex - 1];

  if (!activeYear) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        Für die Zeitreise sind keine Daten verfügbar.
      </p>
    );
  }

  const isTransitioning = playbackState === 'transitioning';
  const showPreviousLocation =
    isTransitioning && Boolean(activeYear.transition?.showPreviousLocation);
  const isJourneyInFlight =
    isTransitioning && activeYear.transition?.type === 'journey';

  const journeyStatus = (() => {
    if (!isJourneyInFlight || !activeYear.transition?.route) return undefined;
    const from = getMapPointBySlug(activeYear.transition.route.from);
    const to = getMapPointBySlug(activeYear.transition.route.to);
    return `Unterwegs von ${from.title} nach ${to.title} …`;
  })();

  return (
    <div className="relative h-full w-full">
      {/*
        MapLibre's own stylesheet sets `.maplibregl-map { position: relative }`,
        which — loaded after Tailwind's utilities — wins the cascade tie over an
        `absolute` utility applied directly to that same element, turning
        `inset-0` into a no-op offset instead of a stretch. Keeping the
        absolute-positioning wrapper on a plain, non-MapLibre-styled div avoids
        that collision entirely.
      */}
      <div className="absolute inset-0">
        <MapCanvas
          center={WORLD_CENTER}
          zoom={LIFE_TIMELINE_CONFIG.worldZoom}
          minZoom={LIFE_TIMELINE_CONFIG.minZoom}
          maxZoom={LIFE_TIMELINE_CONFIG.maxZoom}
          styles={{ dark: MAP_CONFIG.styleUrl, light: MAP_CONFIG.styleUrl }}
          className="mapcn-samui h-full w-full"
        >
          <MapControls position="top-right" />
          <LifeTimelineCamera
            years={years}
            yearIndex={yearIndex}
            reducedMotion={reducedMotion}
            uiPadding={uiPadding}
            onSettled={() => controller.settleTransition()}
          />
          <LifeTimelineMarkers
            locations={activeYear.locations}
            previousLocations={previousYear?.locations ?? []}
            showPrevious={showPreviousLocation}
            isFinale={activeYear.currentLocation}
            reducedMotion={reducedMotion}
          />
        </MapCanvas>
      </div>

      <YearDisplay year={activeYear.year} />

      <DescriptionPanel
        year={activeYear.year}
        title={activeYear.title}
        description={activeYear.description}
        image={activeYear.image}
        imageAlt={activeYear.imageAlt}
        locationLabel={formatLocationLabel(activeYear.locations)}
        journeyStatus={journeyStatus}
      />

      <PlaybackControls
        isPlaying={playbackState === 'playing'}
        isCompleted={playbackState === 'completed'}
        canGoPrevious={yearIndex > 0}
        canGoNext={yearIndex < years.length - 1}
        onPlay={() => controller.play()}
        onPause={() => controller.pause()}
        onPrevious={() => controller.previous()}
        onNext={() => controller.next()}
        onRestart={() => controller.restart()}
        onGoToEnd={() => controller.goToEnd()}
      />

      {activeYear.currentLocation && playbackState === 'completed' && (
        <p role="status" className="sr-only">
          Die Zeitreise ist beim aktuellen Wohnort angekommen.
        </p>
      )}
    </div>
  );
}
