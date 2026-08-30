interface YearDisplayProps {
  year: number;
}

export function YearDisplay({ year }: YearDisplayProps) {
  return (
    <div className="pointer-events-none absolute right-3 bottom-3 z-10 select-none sm:right-6 sm:bottom-28">
      <p className="rounded-(--radius) border border-border bg-card/80 px-2 py-1 text-2xl leading-none font-normal text-card-foreground [font-variant-numeric:tabular-nums] backdrop-blur-xs sm:px-4 sm:py-2 sm:text-6xl">
        <span className="sr-only">Jahr </span>
        {year}
      </p>
    </div>
  );
}
