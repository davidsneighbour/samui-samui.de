'use client';

import { useMap } from '@components/ui/map';
import {
  LIFE_TIMELINE_CONFIG,
  type LifeTimelineCameraPadding,
} from '@config/life-timeline';
import type { ResolvedLifeTimelineYear } from '@data/life-timeline';
import { getMapPointBySlug } from '@data/map-points';
import { useEffect, useRef } from 'react';
import { computeBounds, computeJourneyCurve } from './geo';
import {
  animateJourney,
  type JourneyAnimationHandle,
} from './journey-animation';

export interface LifeTimelineCameraProps {
  years: readonly ResolvedLifeTimelineYear[];
  yearIndex: number;
  reducedMotion: boolean;
  uiPadding: Required<LifeTimelineCameraPadding>;
  onSettled: () => void;
}

function sameSlugSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((slug) => set.has(slug));
}

function mergePadding(
  entryPadding: Required<LifeTimelineCameraPadding>,
  uiPadding: Required<LifeTimelineCameraPadding>,
): Required<LifeTimelineCameraPadding> {
  return {
    bottom: Math.max(entryPadding.bottom, uiPadding.bottom),
    left: Math.max(entryPadding.left, uiPadding.left),
    right: Math.max(entryPadding.right, uiPadding.right),
    top: Math.max(entryPadding.top, uiPadding.top),
  };
}

/**
 * Imperative MapLibre camera driver. Renders nothing itself — it watches
 * `yearIndex` and, for every change, cancels any in-flight animation and
 * drives the map (jump/fly/multi-location fit/journey) toward the resolved
 * year's locations and camera, then reports back via `onSettled` so the
 * playback controller can leave the 'transitioning' state.
 */
export function LifeTimelineCamera({
  years,
  yearIndex,
  reducedMotion,
  uiPadding,
  onSettled,
}: LifeTimelineCameraProps) {
  const { map, isLoaded } = useMap();
  const journeyRef = useRef<JourneyAnimationHandle | null>(null);
  const tokenRef = useRef(0);
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;
  // What the map is actually showing right now, as last applied by this
  // effect. `year.locationsChanged` (precomputed once per year at data-build
  // time) only reflects adjacency to the PREVIOUS year in the array — true
  // for sequential Next/auto-advance steps, but wrong for an arbitrary jump
  // (e.g. "jump to the current year") that skips over intervening years. This
  // ref tracks reality instead, so a jump always compares against wherever
  // the camera actually is.
  const appliedLocationSlugsRef = useRef<readonly string[]>([]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    const year = years[yearIndex];
    if (!year) return;

    tokenRef.current += 1;
    const token = tokenRef.current;
    journeyRef.current?.cancel();
    journeyRef.current = null;
    map.stop();

    const settle = () => {
      if (tokenRef.current !== token) return;
      onSettledRef.current();
    };

    const targetSlugs = year.locations.map((location) => location.point);
    const locationsChanged = !sameSlugSet(
      targetSlugs,
      appliedLocationSlugsRef.current,
    );
    appliedLocationSlugsRef.current = targetSlugs;

    // Nothing to animate toward: the active location set is unchanged from
    // wherever the camera currently is (a gap year, a later year inside the
    // same authored period, or re-visiting a jump target). Settle
    // immediately so auto playback doesn't spend a full transitionDuration
    // animating the camera to where it already is.
    if (!locationsChanged) {
      settle();
      return;
    }

    const padding = mergePadding(year.camera.padding, uiPadding);
    const route = year.transition?.route;

    // A journey only replays when this exact year authored it — jumping
    // straight past the authoring year (e.g. via "jump to the current
    // year") intentionally skips the theatrical flight and falls through to
    // a plain camera move below instead.
    if (year.transition?.type === 'journey' && route) {
      const fromPoint = getMapPointBySlug(route.from);
      const toPoint = getMapPointBySlug(route.to);
      const curvedPoints = computeJourneyCurve(
        { lat: fromPoint.latitude, lng: fromPoint.longitude },
        { lat: toPoint.latitude, lng: toPoint.longitude },
        route.curve ?? 0.3,
      );
      journeyRef.current = animateJourney({
        destinationCamera: year.camera,
        duration: reducedMotion
          ? LIFE_TIMELINE_CONFIG.reducedMotionJourneyDuration
          : (route.duration ?? LIFE_TIMELINE_CONFIG.defaultJourneyDuration),
        followVehicle: Boolean(route.followVehicle) && !reducedMotion,
        lineStyle: route.lineStyle ?? 'dashed',
        map,
        onDone: settle,
        padding,
        points: curvedPoints,
        reducedMotion,
      });
      return () => {
        journeyRef.current?.cancel();
      };
    }

    const transitionDuration = reducedMotion
      ? LIFE_TIMELINE_CONFIG.reducedMotionTransitionDuration
      : year.transitionDuration ||
        LIFE_TIMELINE_CONFIG.defaultTransitionDuration;

    if (year.locations.length > 1) {
      const bounds = computeBounds(
        year.locations.map((location) => ({
          lat: location.latitude,
          lng: location.longitude,
        })),
      );
      if (reducedMotion) {
        map.fitBounds(bounds, {
          bearing: year.camera.bearing,
          duration: 0,
          padding,
          pitch: year.camera.pitch,
        });
        settle();
        return;
      }
      map.once('moveend', settle);
      map.fitBounds(bounds, {
        bearing: year.camera.bearing,
        duration: transitionDuration,
        padding,
        pitch: year.camera.pitch,
      });
      return;
    }

    const primary = year.locations[0];
    if (!primary) {
      settle();
      return;
    }

    if (reducedMotion || year.transition?.type === 'jump') {
      map.jumpTo({
        bearing: year.camera.bearing,
        center: [primary.longitude, primary.latitude],
        pitch: year.camera.pitch,
        zoom: year.camera.zoom,
      });
      settle();
      return;
    }

    map.once('moveend', settle);
    map.easeTo({
      bearing: year.camera.bearing,
      center: [primary.longitude, primary.latitude],
      duration: transitionDuration,
      padding,
      pitch: year.camera.pitch,
      zoom: year.camera.zoom,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded, yearIndex, reducedMotion]);

  return null;
}
