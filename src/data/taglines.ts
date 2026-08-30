import rawTaglines from './taglines.json';

export type TaglineDatePrecision = 'day' | 'month' | 'year' | 'unknown';

export type TaglineSourceType =
  | 'git'
  | 'wayback'
  | 'screenshot'
  | 'backup'
  | 'memory'
  | 'other';

export interface TaglineSource {
  type: TaglineSourceType;
  reference?: string;
  url?: string;
  note?: string;
}

export interface Tagline {
  text: string;
  from: string | null;
  precision: TaglineDatePrecision;
  source?: TaglineSource;
  note?: string;
}

export interface TaglineTimelineEntry extends Tagline {
  isCurrent: boolean;
  /** e.g. "4. Juli 2019", "Juli 2019", "ca. 2008", or "Datum noch unbekannt". */
  displayDate: string;
  /** e.g. "seit 4. Juli 2019", "1. April 2007 - 13. September 2012", or "davor". */
  displayPeriod: string;
  sourceUrl: string | undefined;
}

const DATE_PRECISIONS: readonly TaglineDatePrecision[] = [
  'day',
  'month',
  'year',
  'unknown',
];

const SOURCE_TYPES: readonly TaglineSourceType[] = [
  'git',
  'wayback',
  'screenshot',
  'backup',
  'memory',
  'other',
];

const GITHUB_REPO_URL = 'https://github.com/davidsneighbour/samui-samui.de';
const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

// These are historical calendar dates, not timestamps, so every formatter
// pins timeZone: 'UTC' -- otherwise Intl would render the Date.UTC() value
// in the host's local timezone and could shift the displayed day backward.
const dayFormatter = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
});
const monthFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
});
const yearFormatter = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'UTC',
  year: 'numeric',
});

function isRealIsoDate(value: string): boolean {
  const match = dateOnlyPattern.exec(value);
  if (!match) return false;
  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function parseIsoDateUtc(value: string): Date {
  const match = dateOnlyPattern.exec(value);
  if (!match) throw new Error(`Invalid ISO date: "${value}"`);
  const [, yearStr, monthStr, dayStr] = match;
  return new Date(
    Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr)),
  );
}

function subtractOneUtcDay(date: Date): Date {
  return new Date(date.valueOf() - millisecondsPerDay);
}

function formatIsoDate(value: string, precision: TaglineDatePrecision): string {
  const date = parseIsoDateUtc(value);
  if (precision === 'day') return dayFormatter.format(date);
  if (precision === 'month') return monthFormatter.format(date);
  return `ca. ${yearFormatter.format(date)}`;
}

function isTaglineSource(value: unknown): value is TaglineSource | undefined {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    SOURCE_TYPES.includes(candidate['type'] as TaglineSourceType) &&
    (candidate['reference'] === undefined ||
      typeof candidate['reference'] === 'string') &&
    (candidate['url'] === undefined || typeof candidate['url'] === 'string') &&
    (candidate['note'] === undefined || typeof candidate['note'] === 'string')
  );
}

const HTML_TAG_PATTERN = /<\/?[a-z][a-z0-9-]*(\s[^<>]*)?>/i;
const HTML_ENTITY_PATTERN = /&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/;

/**
 * `text`/`note` values are rendered as plain text (Astro auto-escapes them),
 * so raw markup can't cause an XSS issue -- this only catches copy-paste
 * mistakes from HTML sources (Wayback captures, old templates) that would
 * otherwise show up on the page as literal "&amp;" or "<em>" instead of the
 * character they were meant to represent.
 */
function findMarkupIssue(value: string): string | undefined {
  if (HTML_TAG_PATTERN.test(value)) return 'must not contain raw HTML markup';
  if (HTML_ENTITY_PATTERN.test(value)) {
    return 'must not contain an HTML entity -- use the plain character instead';
  }
  return undefined;
}

function isTaglineShape(value: unknown): value is Tagline {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['text'] === 'string' &&
    (candidate['from'] === null || typeof candidate['from'] === 'string') &&
    DATE_PRECISIONS.includes(candidate['precision'] as TaglineDatePrecision) &&
    isTaglineSource(candidate['source']) &&
    (candidate['note'] === undefined || typeof candidate['note'] === 'string')
  );
}

/** Pure validation over raw, untyped JSON -- safe to unit-test with fixtures. */
export function getTaglineValidationErrors(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    return ['Tagline data must be a non-empty array.'];
  }

  const errors: string[] = [];
  const seenDates = new Set<string>();

  value.forEach((entry, index) => {
    const label = `taglines[${index}]`;

    if (!isTaglineShape(entry)) {
      errors.push(`${label} does not match the Tagline schema.`);
      return;
    }

    if (entry.text.trim().length === 0) {
      errors.push(`${label}.text must not be empty.`);
    }

    const textIssue = findMarkupIssue(entry.text);
    if (textIssue) errors.push(`${label}.text ${textIssue}.`);

    if (entry.note) {
      const noteIssue = findMarkupIssue(entry.note);
      if (noteIssue) errors.push(`${label}.note ${noteIssue}.`);
    }

    if (entry.source?.note) {
      const sourceNoteIssue = findMarkupIssue(entry.source.note);
      if (sourceNoteIssue) {
        errors.push(`${label}.source.note ${sourceNoteIssue}.`);
      }
    }

    if (entry.precision === 'unknown') {
      if (entry.from !== null) {
        errors.push(`${label}.from must be null when precision is "unknown".`);
      }
      return;
    }

    if (entry.from === null) {
      errors.push(`${label}.from is required unless precision is "unknown".`);
      return;
    }

    if (!isRealIsoDate(entry.from)) {
      errors.push(
        `${label}.from "${entry.from}" is not a valid YYYY-MM-DD date.`,
      );
      return;
    }

    if (seenDates.has(entry.from)) {
      errors.push(
        `${label}.from "${entry.from}" duplicates another entry's start date.`,
      );
      return;
    }

    seenDates.add(entry.from);
  });

  return errors;
}

export function parseTaglines(value: unknown): Tagline[] {
  const errors = getTaglineValidationErrors(value);
  if (errors.length > 0) {
    throw new Error(`Invalid src/data/taglines.json:\n${errors.join('\n')}`);
  }
  return value as Tagline[];
}

/** Oldest first. Undated ("unknown") entries sort before every known date. */
export function sortTaglines(entries: readonly Tagline[]): Tagline[] {
  return [...entries].sort((a, b) => {
    if (a.from === b.from) return 0;
    if (a.from === null) return -1;
    if (b.from === null) return 1;
    return a.from.localeCompare(b.from);
  });
}

/** The newest dated entry is always the current tagline. */
export function deriveCurrentTagline(entries: readonly Tagline[]): Tagline {
  const sorted = sortTaglines(entries);
  const current = [...sorted].reverse().find((entry) => entry.from !== null);
  const fallback = current ?? sorted.at(-1);
  if (!fallback) throw new Error('No taglines available.');
  return fallback;
}

export function getTaglineSourceUrl(
  source: TaglineSource | undefined,
): string | undefined {
  if (!source) return undefined;
  if (source.url) return source.url;
  if (source.type === 'git' && source.reference) {
    return `${GITHUB_REPO_URL}/commit/${source.reference}`;
  }
  return undefined;
}

/** Newest first, with derived display labels and period ranges. */
export function buildTaglineTimeline(
  entries: readonly Tagline[],
): TaglineTimelineEntry[] {
  const chronological = sortTaglines(entries);
  const current = deriveCurrentTagline(entries);

  const timeline = chronological.map((tagline, index) => {
    const next = chronological[index + 1];
    const isCurrent = tagline === current;

    const displayDate =
      tagline.from === null
        ? 'Datum noch unbekannt'
        : formatIsoDate(tagline.from, tagline.precision);

    let displayPeriod: string;
    if (isCurrent) {
      displayPeriod = `seit ${displayDate}`;
    } else if (tagline.from === null) {
      displayPeriod = next ? 'davor' : displayDate;
    } else if (next?.from) {
      const endLabel =
        next.precision === 'day'
          ? dayFormatter.format(subtractOneUtcDay(parseIsoDateUtc(next.from)))
          : formatIsoDate(next.from, next.precision);
      displayPeriod = `${displayDate} - ${endLabel}`;
    } else {
      displayPeriod = displayDate;
    }

    return {
      ...tagline,
      displayDate,
      displayPeriod,
      isCurrent,
      sourceUrl: getTaglineSourceUrl(tagline.source),
    };
  });

  return timeline.reverse();
}

export const taglines: Tagline[] = parseTaglines(rawTaglines);

export function getTaglines(): Tagline[] {
  return sortTaglines(taglines);
}

export function getCurrentTagline(): Tagline {
  return deriveCurrentTagline(taglines);
}

export function getTaglineTimeline(): TaglineTimelineEntry[] {
  return buildTaglineTimeline(taglines);
}

export const currentTagline = getCurrentTagline();
