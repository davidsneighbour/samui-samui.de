import { LifeTimelinePlaybackController } from '@components/features/life-timeline/playback-controller';
import type { ResolvedLifeTimelineYear } from '@data/life-timeline';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function makeYear(
  year: number,
  duration: number,
  overrides: Partial<ResolvedLifeTimelineYear> = {},
): ResolvedLifeTimelineYear {
  return {
    camera: {
      bearing: 0,
      padding: { bottom: 0, left: 0, right: 0, top: 0 },
      pitch: 0,
      zoom: 4,
    },
    currentLocation: false,
    description: undefined,
    duration,
    image: undefined,
    imageAlt: undefined,
    isEntryYear: true,
    locations: [],
    locationsChanged: false,
    pauseAfterTransition: 0,
    title: undefined,
    transition: undefined,
    transitionDuration: 0,
    year,
    ...overrides,
  };
}

const YEARS = [makeYear(2000, 100), makeYear(2001, 200), makeYear(2002, 150)];

describe('LifeTimelinePlaybackController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts idle at year index 0', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    expect(controller.getSnapshot()).toEqual({
      playbackState: 'idle',
      yearIndex: 0,
    });
  });

  it('start() enters transitioning and settleTransition() resumes into playing', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.start();
    expect(controller.getSnapshot().playbackState).toBe('transitioning');

    controller.settleTransition();
    expect(controller.getSnapshot().playbackState).toBe('playing');
  });

  it("advances automatically after each year's duration once playing", () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.start();
    controller.settleTransition();

    vi.advanceTimersByTime(100);
    expect(controller.getSnapshot()).toEqual({
      playbackState: 'transitioning',
      yearIndex: 1,
    });

    controller.settleTransition();
    expect(controller.getSnapshot().playbackState).toBe('playing');

    vi.advanceTimersByTime(200);
    expect(controller.getSnapshot().yearIndex).toBe(2);
  });

  it('completes at the final year instead of looping back to the start', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.start();
    controller.settleTransition();
    vi.advanceTimersByTime(100);
    controller.settleTransition();
    vi.advanceTimersByTime(200);
    controller.settleTransition();

    expect(controller.getSnapshot()).toEqual({
      playbackState: 'completed',
      yearIndex: 2,
    });

    // No further advancing timer should be pending.
    vi.advanceTimersByTime(10_000);
    expect(controller.getSnapshot().yearIndex).toBe(2);
  });

  it('pause() stops automatic advancement', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.start();
    controller.settleTransition();

    controller.pause();
    expect(controller.getSnapshot().playbackState).toBe('paused');

    vi.advanceTimersByTime(10_000);
    expect(controller.getSnapshot().yearIndex).toBe(0);
  });

  it('next() and previous() navigate and pause automatic playback', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.start();
    controller.settleTransition();

    controller.next();
    expect(controller.getSnapshot()).toEqual({
      playbackState: 'transitioning',
      yearIndex: 1,
    });
    controller.settleTransition();
    expect(controller.getSnapshot().playbackState).toBe('paused');

    // Auto-advance must not have been scheduled after a manual move.
    vi.advanceTimersByTime(10_000);
    expect(controller.getSnapshot().yearIndex).toBe(1);

    controller.previous();
    controller.settleTransition();
    expect(controller.getSnapshot()).toEqual({
      playbackState: 'paused',
      yearIndex: 0,
    });
  });

  it('does not move before the first year or past the last year', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.previous();
    expect(controller.getSnapshot().yearIndex).toBe(0);

    controller.start();
    controller.settleTransition();
    controller.next();
    controller.settleTransition();
    controller.next();
    controller.settleTransition();
    controller.next();
    controller.settleTransition();
    expect(controller.getSnapshot().yearIndex).toBe(2);
  });

  it('goToEnd() jumps straight to the final year, pausing automatic playback, and marks it completed', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.start();
    controller.settleTransition();

    controller.goToEnd();
    expect(controller.getSnapshot()).toEqual({
      playbackState: 'transitioning',
      yearIndex: 2,
    });
    controller.settleTransition();
    expect(controller.getSnapshot()).toEqual({
      playbackState: 'completed',
      yearIndex: 2,
    });

    // No auto-advance should have been scheduled past the end.
    vi.advanceTimersByTime(10_000);
    expect(controller.getSnapshot().yearIndex).toBe(2);
  });

  it('restart() returns to year index 0 without auto-resuming playback', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.start();
    controller.settleTransition();
    vi.advanceTimersByTime(100);
    controller.settleTransition();

    controller.restart();
    expect(controller.getSnapshot()).toEqual({
      playbackState: 'transitioning',
      yearIndex: 0,
    });
    controller.settleTransition();
    expect(controller.getSnapshot()).toEqual({
      playbackState: 'paused',
      yearIndex: 0,
    });

    vi.advanceTimersByTime(10_000);
    expect(controller.getSnapshot().yearIndex).toBe(0);
  });

  it('destroy() clears any pending advance timer', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    controller.start();
    controller.settleTransition();

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    controller.destroy();
    expect(vi.getTimerCount()).toBe(0);

    vi.advanceTimersByTime(10_000);
    expect(controller.getSnapshot().yearIndex).toBe(0);
  });

  it('unsubscribed listeners stop receiving updates', () => {
    const controller = new LifeTimelinePlaybackController(YEARS);
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.start();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    controller.settleTransition();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
