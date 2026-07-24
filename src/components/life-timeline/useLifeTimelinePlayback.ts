'use client';

import type { ResolvedLifeTimelineYear } from '@data/life-timeline';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { LifeTimelinePlaybackController } from './playback-controller';

export function useLifeTimelinePlayback(
  years: readonly ResolvedLifeTimelineYear[],
) {
  const controllerRef = useRef<LifeTimelinePlaybackController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = new LifeTimelinePlaybackController(years);
  }
  const controller = controllerRef.current;

  useEffect(() => {
    return () => controller.destroy();
    // The controller instance and its `years` snapshot are fixed at mount —
    // src/data/life-timeline.ts is a static build-time data source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snapshot = useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getSnapshot(),
    () => controller.getSnapshot(),
  );

  return { ...snapshot, controller };
}
