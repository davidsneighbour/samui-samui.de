import { cn } from '@utils/cn';
import {
  ChevronsRight,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  isCompleted: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  onGoToEnd: () => void;
}

const buttonClass =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-(--radius) border border-border bg-card/90 text-card-foreground backdrop-blur-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 sm:size-11';

export function PlaybackControls({
  isPlaying,
  isCompleted,
  canGoPrevious,
  canGoNext,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onRestart,
  onGoToEnd,
}: PlaybackControlsProps) {
  return (
    <div
      role="group"
      aria-label="Zeitreise-Steuerung"
      className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-6 sm:gap-2"
    >
      <button
        type="button"
        className={buttonClass}
        onClick={onRestart}
        aria-label="Von vorn beginnen"
        title="Von vorn beginnen"
      >
        <RotateCcw aria-hidden="true" className="size-4 sm:size-5" />
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Vorheriges Jahr"
        title="Vorheriges Jahr"
      >
        <SkipBack aria-hidden="true" className="size-4 sm:size-5" />
      </button>
      {isPlaying ? (
        <button
          type="button"
          className={cn(
            buttonClass,
            'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
          onClick={onPause}
          aria-label="Pausieren"
          title="Pausieren"
        >
          <Pause aria-hidden="true" className="size-4 sm:size-5" />
        </button>
      ) : (
        <button
          type="button"
          className={cn(
            buttonClass,
            'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
          onClick={onPlay}
          disabled={isCompleted}
          aria-label="Abspielen"
          title="Abspielen"
        >
          <Play aria-hidden="true" className="size-4 sm:size-5" />
        </button>
      )}
      <button
        type="button"
        className={buttonClass}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Nächstes Jahr"
        title="Nächstes Jahr"
      >
        <SkipForward aria-hidden="true" className="size-4 sm:size-5" />
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={onGoToEnd}
        disabled={!canGoNext}
        aria-label="Zum aktuellen Jahr springen"
        title="Zum aktuellen Jahr springen"
      >
        <ChevronsRight aria-hidden="true" className="size-4 sm:size-5" />
      </button>
    </div>
  );
}
