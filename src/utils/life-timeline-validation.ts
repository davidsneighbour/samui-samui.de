import type { LifeTimelineEntry } from '@config/life-timeline';
import { isValidZoom } from '@utils/map-validation';

interface ValidationContext {
  knownPointSlugs: ReadonlySet<string>;
  currentYear: number;
  startYear: number;
}

function entryLabel(entry: LifeTimelineEntry): string {
  return `life-timeline entry (year ${entry.year})`;
}

function isFiniteDuration(value: unknown): boolean {
  return (
    value === undefined || (Number.isFinite(value) && (value as number) >= 0)
  );
}

function hasUsableContent(entry: LifeTimelineEntry): boolean {
  return Boolean(
    (entry.title && entry.title.trim().length > 0) ||
      (entry.description && entry.description.trim().length > 0) ||
      entry.camera ||
      entry.transition,
  );
}

function validateEntryShape(
  entry: LifeTimelineEntry,
  context: ValidationContext,
): string[] {
  const errors: string[] = [];
  const label = entryLabel(entry);

  if (!Number.isInteger(entry.year)) {
    errors.push(`${label}: "year" must be an integer.`);
  } else {
    if (entry.year < context.startYear) {
      errors.push(`${label}: "year" must not be before ${context.startYear}.`);
    }
    if (entry.year > context.currentYear && !entry.allowFutureYear) {
      errors.push(
        `${label}: "year" (${entry.year}) is after the current year (${context.currentYear}). Set "allowFutureYear" to author it deliberately.`,
      );
    }
  }

  if (
    entry.endYear !== undefined &&
    (!Number.isInteger(entry.endYear) || entry.endYear < entry.year)
  ) {
    errors.push(
      `${label}: "endYear" (${entry.endYear}) must be an integer greater than or equal to "year".`,
    );
  }

  if (!Array.isArray(entry.locations) || entry.locations.length === 0) {
    errors.push(`${label}: "locations" must contain at least one entry.`);
  } else {
    for (const location of entry.locations) {
      if (!location.point || typeof location.point !== 'string') {
        errors.push(`${label}: a location is missing its "point" slug.`);
      } else if (!context.knownPointSlugs.has(location.point)) {
        errors.push(
          `${label}: unknown map-point slug "${location.point}" in "locations". Register it in src/data/map-points.json first.`,
        );
      }
    }
  }

  if (!isFiniteDuration(entry.duration)) {
    errors.push(`${label}: "duration" must be a finite number >= 0.`);
  }
  if (!isFiniteDuration(entry.transitionDuration)) {
    errors.push(`${label}: "transitionDuration" must be a finite number >= 0.`);
  }
  if (!isFiniteDuration(entry.pauseAfterTransition)) {
    errors.push(
      `${label}: "pauseAfterTransition" must be a finite number >= 0.`,
    );
  }

  if (entry.camera?.zoom !== undefined && !isValidZoom(entry.camera.zoom)) {
    errors.push(
      `${label}: "camera.zoom" (${entry.camera.zoom}) is out of range.`,
    );
  }

  const route = entry.transition?.route;
  if (route) {
    if (!route.from || !context.knownPointSlugs.has(route.from)) {
      errors.push(
        `${label}: journey "route.from" references an unknown map-point slug "${route.from}".`,
      );
    }
    if (!route.to || !context.knownPointSlugs.has(route.to)) {
      errors.push(
        `${label}: journey "route.to" references an unknown map-point slug "${route.to}".`,
      );
    }
    if (route.from && route.to && route.from === route.to) {
      errors.push(
        `${label}: journey "route.from" and "route.to" must not be the same map point.`,
      );
    }
    if (!isFiniteDuration(route.duration)) {
      errors.push(
        `${label}: journey "route.duration" must be a finite number >= 0.`,
      );
    }
  }

  if (!hasUsableContent(entry)) {
    errors.push(
      `${label}: has no usable content (no title, description, camera, or transition) — it would be indistinguishable from an unauthored year.`,
    );
  }

  if (entry.image && !entry.imageAlt?.trim()) {
    errors.push(`${label}: "image" is set but "imageAlt" is missing.`);
  }

  return errors;
}

/**
 * "Period" entries (those with `endYear` or `currentLocation`) claim a
 * range of years and must not overlap another period's range. Plain
 * one-off "moment" entries (no `endYear`, no `currentLocation`) are exempt
 * — several moments deliberately sharing the same year (e.g. a birth and a
 * naming ceremony both in 1975) is the whole point of that shape, and a
 * moment is also allowed to sit inside an ongoing period's range (a single
 * one-off event interrupting an otherwise continuous period).
 */
function isPeriodLikeEntry(entry: LifeTimelineEntry): boolean {
  return entry.endYear !== undefined || entry.currentLocation === true;
}

function validateNoOverlaps(entries: readonly LifeTimelineEntry[]): string[] {
  const errors: string[] = [];
  const periods = entries
    .filter(isPeriodLikeEntry)
    .sort((a, b) => a.year - b.year);

  for (let index = 0; index < periods.length; index += 1) {
    const current = periods[index];
    if (!current) continue;
    const currentEnd = current.currentLocation
      ? Number.POSITIVE_INFINITY
      : (current.endYear ?? current.year);

    for (
      let otherIndex = index + 1;
      otherIndex < periods.length;
      otherIndex += 1
    ) {
      const other = periods[otherIndex];
      if (!other) continue;

      if (other.year > currentEnd) continue;

      if (other.year === current.year) {
        errors.push(
          `Duplicate life-timeline period entries for year ${current.year}.`,
        );
        continue;
      }

      errors.push(
        `life-timeline period entries overlap: year ${current.year}${
          current.endYear ? `–${current.endYear}` : ''
        }${current.currentLocation ? '+' : ''} overlaps year ${other.year}${
          other.endYear ? `–${other.endYear}` : ''
        }.`,
      );
    }
  }

  return errors;
}

export function getLifeTimelineValidationErrors(
  entries: readonly LifeTimelineEntry[],
  context: ValidationContext,
): string[] {
  const errors: string[] = [];

  for (const entry of entries) {
    errors.push(...validateEntryShape(entry, context));
  }

  errors.push(...validateNoOverlaps(entries));

  return errors;
}
