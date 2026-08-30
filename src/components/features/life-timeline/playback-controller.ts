import type { ResolvedLifeTimelineYear } from '@data/life-timeline';

export type LifeTimelinePlaybackState =
  | 'idle'
  | 'playing'
  | 'paused'
  | 'transitioning'
  | 'completed';

export interface LifeTimelinePlaybackSnapshot {
  yearIndex: number;
  playbackState: LifeTimelinePlaybackState;
}

type Listener = (snapshot: LifeTimelinePlaybackSnapshot) => void;
type ResumeState = 'playing' | 'paused' | 'completed';

/**
 * Framework-agnostic playback state machine driving the life-timeline year
 * index. Kept independent of React so the advance/pause/navigation/timer
 * logic can be unit tested directly with vitest fake timers. The paired
 * React hook (useLifeTimelinePlayback) wraps an instance of this class.
 *
 * Every index change enters 'transitioning' first; the caller (the
 * MapLibre camera effect) must call settleTransition() once its camera
 * animation actually finishes, at which point playback resumes (or
 * completes/pauses). This keeps the logical "which year is active" state
 * separate from "is the camera still moving" state, per the project's
 * state-model requirement.
 */
export class LifeTimelinePlaybackController {
  private snapshot: LifeTimelinePlaybackSnapshot = {
    playbackState: 'idle',
    yearIndex: 0,
  };
  private timer: ReturnType<typeof setTimeout> | undefined;
  private pendingResumeState: ResumeState = 'paused';
  private readonly listeners = new Set<Listener>();
  private readonly years: readonly ResolvedLifeTimelineYear[];

  constructor(years: readonly ResolvedLifeTimelineYear[]) {
    this.years = years;
  }

  private get maxIndex(): number {
    return Math.max(this.years.length - 1, 0);
  }

  getSnapshot(): LifeTimelinePlaybackSnapshot {
    return this.snapshot;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(next: LifeTimelinePlaybackSnapshot): void {
    this.snapshot = next;
    for (const listener of this.listeners) listener(next);
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private scheduleAdvance(): void {
    this.clearTimer();
    const year = this.years[this.snapshot.yearIndex];
    const duration = year?.duration ?? 0;
    this.timer = setTimeout(() => this.advance(), duration);
  }

  private advance(): void {
    if (this.snapshot.playbackState !== 'playing') return;
    this.goTo(this.snapshot.yearIndex + 1, 'playing');
  }

  private goTo(index: number, resumeState: ResumeState): void {
    this.clearTimer();
    const clamped = Math.min(Math.max(index, 0), this.maxIndex);
    // Landing exactly on the final year is always 'completed', regardless of
    // how it was reached (auto-advance, Next, or jumping straight to the
    // end) — there is nothing further forward to play from there.
    const finalResumeState: ResumeState =
      clamped >= this.maxIndex ? 'completed' : resumeState;
    this.pendingResumeState = finalResumeState;
    this.emit({ playbackState: 'transitioning', yearIndex: clamped });
  }

  /** Call once the camera/marker animation for the current transition has visually settled. */
  settleTransition(): void {
    if (this.snapshot.playbackState !== 'transitioning') return;
    this.emit({ ...this.snapshot, playbackState: this.pendingResumeState });
    if (this.pendingResumeState === 'playing') this.scheduleAdvance();
  }

  /**
   * Moves out of the initial 'idle' state into the first camera transition
   * (world view → 1974) and, once it settles, continues straight into
   * automatic playback — matching the "automatic mode begins at 1974"
   * default described by the timeline spec.
   */
  start(): void {
    if (this.snapshot.playbackState !== 'idle') return;
    this.pendingResumeState = 'playing';
    this.emit({ playbackState: 'transitioning', yearIndex: 0 });
  }

  play(): void {
    if (this.snapshot.yearIndex >= this.maxIndex) return;
    if (this.snapshot.playbackState === 'playing') return;
    if (this.snapshot.playbackState === 'transitioning') {
      this.pendingResumeState = 'playing';
      return;
    }
    this.emit({ ...this.snapshot, playbackState: 'playing' });
    this.scheduleAdvance();
  }

  pause(): void {
    this.clearTimer();
    if (this.snapshot.playbackState === 'completed') return;
    this.pendingResumeState = 'paused';
    if (this.snapshot.playbackState === 'transitioning') return;
    this.emit({ ...this.snapshot, playbackState: 'paused' });
  }

  next(): void {
    this.goTo(this.snapshot.yearIndex + 1, 'paused');
  }

  previous(): void {
    this.goTo(this.snapshot.yearIndex - 1, 'paused');
  }

  /** Jumps straight to the final (current-day) year, pausing automatic playback. */
  goToEnd(): void {
    this.goTo(this.maxIndex, 'paused');
  }

  /** Returns to 1974. Camera animates back; playback does not auto-resume (per spec, restart is a distinct action from play). */
  restart(): void {
    this.clearTimer();
    this.pendingResumeState = 'paused';
    this.emit({ playbackState: 'transitioning', yearIndex: 0 });
  }

  destroy(): void {
    this.clearTimer();
    this.listeners.clear();
  }
}
