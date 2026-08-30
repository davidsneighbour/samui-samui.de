import {
  MapCanvas,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from '@components/ui/map';
import { MAP_CONFIG, type MapPoint } from '@config/maps';
import { getMapLocationValidationError } from '@utils/map-validation';

interface Props {
  point: MapPoint;
}

export default function ContactMap({ point }: Props) {
  const zoom = point.zoom ?? MAP_CONFIG.defaultZoom;
  const validationError = getMapLocationValidationError({
    latitude: point.latitude,
    longitude: point.longitude,
    zoom,
  });

  if (validationError) {
    return (
      <p className="rounded-(--radius) border border-border bg-muted p-4 text-sm text-muted-foreground">
        Die Karte ist wegen ungültiger Koordinaten nicht verfügbar.
      </p>
    );
  }

  return (
    <section
      className="mt-10 border-t border-border pt-8"
      aria-labelledby="contact-map-title"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="contact-map-title"
            className="m-0 text-2xl font-normal text-card-foreground"
          >
            Karte
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {point.title}: {point.latitude.toFixed(6)},{' '}
            {point.longitude.toFixed(6)}
          </p>
        </div>
        {point.tags.length > 0 && (
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {point.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-[calc(var(--radius)-4px)] bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag.toLocaleUpperCase('de-DE')}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="h-[22rem] overflow-hidden rounded-(--radius) border border-border bg-muted sm:h-[28rem]">
        <MapCanvas
          center={[point.longitude, point.latitude]}
          zoom={zoom}
          maxZoom={MAP_CONFIG.maxZoom}
          minZoom={MAP_CONFIG.minZoom}
          styles={{
            dark: MAP_CONFIG.styleUrl,
            light: MAP_CONFIG.styleUrl,
          }}
          className="mapcn-samui"
        >
          <MapControls />
          <MapMarker
            latitude={point.latitude}
            longitude={point.longitude}
            iconAnchor={[16, 16]}
          >
            <MarkerContent>
              <button
                type="button"
                aria-label={point.title}
                className="relative flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <span className="size-2.5 rounded-full bg-primary-foreground" />
              </button>
            </MarkerContent>
            <MarkerPopup defaultOpen>
              <div className="relative rounded-[calc(var(--radius)-4px)] border border-border bg-card p-4 pr-10 text-card-foreground">
                <strong className="block text-sm leading-tight">
                  {point.title}
                </strong>
                {point.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                )}
              </div>
            </MarkerPopup>
          </MapMarker>
        </MapCanvas>
      </div>
    </section>
  );
}
