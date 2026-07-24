interface DescriptionPanelProps {
  year: number;
  title: string | undefined;
  description: string | undefined;
  image: string | undefined;
  imageAlt: string | undefined;
  locationLabel: string | undefined;
  journeyStatus: string | undefined;
}

export function DescriptionPanel({
  year,
  title,
  description,
  image,
  imageAlt,
  locationLabel,
  journeyStatus,
}: DescriptionPanelProps) {
  const announcement = [title, description].filter(Boolean).join('. ');

  return (
    <div className="absolute inset-x-3 bottom-20 z-10 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md">
      <div className="flex gap-3 rounded-(--radius) border border-border bg-card/90 p-4 text-card-foreground backdrop-blur-xs">
        {image && (
          <img
            src={image}
            alt={imageAlt ?? ''}
            loading="lazy"
            decoding="async"
            className="size-16 shrink-0 rounded-[calc(var(--radius)-4px)] border border-border object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h2 className="m-0 text-lg font-normal sm:text-xl">{title}</h2>
          )}
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-card-foreground/90">
              {description}
            </p>
          )}
          {locationLabel && (
            <p className="mt-2 text-xs text-muted-foreground">
              {locationLabel}
            </p>
          )}
          {journeyStatus && (
            <p className="mt-2 text-xs font-medium text-primary">
              {journeyStatus}
            </p>
          )}
          {!title && !description && (
            <p className="text-sm text-muted-foreground">
              Keine besonderen Ereignisse für dieses Jahr dokumentiert.
            </p>
          )}
        </div>
      </div>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement ? `Jahr ${year}. ${announcement}` : ''}
      </p>
    </div>
  );
}
