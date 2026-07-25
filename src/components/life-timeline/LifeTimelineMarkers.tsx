import { MapMarker, MarkerContent, MarkerPopup } from '@components/ui/map';
import type { ResolvedLifeTimelineLocation } from '@data/life-timeline';
import { cn } from '@utils/cn';

interface LifeTimelineMarkersProps {
  locations: readonly ResolvedLifeTimelineLocation[];
  previousLocations: readonly ResolvedLifeTimelineLocation[];
  showPrevious: boolean;
  isFinale: boolean;
  reducedMotion: boolean;
}

function MarkerDot({ muted, pulse }: { muted: boolean; pulse: boolean }) {
  return (
    <span
      className={cn(
        'relative flex size-4 items-center justify-center rounded-full border-2 border-card',
        muted ? 'bg-muted-foreground/70' : 'bg-primary',
      )}
    >
      {pulse && (
        <span
          aria-hidden="true"
          className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60"
        />
      )}
      {!muted && (
        <span className="size-1.5 rounded-full bg-primary-foreground" />
      )}
    </span>
  );
}

export function LifeTimelineMarkers({
  locations,
  previousLocations,
  showPrevious,
  isFinale,
  reducedMotion,
}: LifeTimelineMarkersProps) {
  return (
    <>
      {showPrevious &&
        previousLocations.map((location) => (
          <MapMarker
            key={`previous-${location.point}`}
            latitude={location.latitude}
            longitude={location.longitude}
            iconAnchor={[8, 8]}
          >
            <MarkerContent>
              <span aria-hidden="true">
                <MarkerDot muted pulse={false} />
              </span>
            </MarkerContent>
          </MapMarker>
        ))}
      {locations.map((location) => {
        const isContext = location.role === 'context';
        return (
          <MapMarker
            key={location.point}
            latitude={location.latitude}
            longitude={location.longitude}
            iconAnchor={[16, 16]}
          >
            <MarkerContent>
              <button
                type="button"
                aria-label={location.label ?? location.pointTitle}
                className="relative flex size-8 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <MarkerDot
                  muted={isContext}
                  pulse={isFinale && !isContext && !reducedMotion}
                />
              </button>
            </MarkerContent>
            <MarkerPopup>
              <div className="rounded-[calc(var(--radius)-4px)] border border-border bg-card p-3 pr-9 text-card-foreground">
                <strong className="block text-sm leading-tight">
                  {location.label ?? location.pointTitle}
                </strong>
              </div>
            </MarkerPopup>
          </MapMarker>
        );
      })}
    </>
  );
}
