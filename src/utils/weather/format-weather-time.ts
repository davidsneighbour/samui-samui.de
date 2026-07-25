// Time formatting for the weather widget. Mirrors the pattern in
// src/utils/dates.ts (explicit `timeZone` on every Intl.DateTimeFormat,
// never the visitor's local timezone) but parameterised by the weather
// location's own timezone so a future second Koh Samui location -- or a
// provider migration -- can't accidentally format times in the wrong zone.
//
// Open-Meteo returns `current.time`/`hourly.time` as local wall-clock
// strings for the requested `timezone` param (e.g. "2026-07-25T17:45"),
// with no UTC offset suffix. Handing that straight to `new Date(...)` is a
// bug: per the ECMA-262 Date Time String Format, an offset-less date-time
// string is parsed as local time *in the runtime executing the code* --
// which on a Netlify function is UTC, and in a visitor's browser is
// whatever timezone they're in. Either way it is very unlikely to be
// Bangkok, so every weather timestamp must go through
// `parseWeatherTimestamp` below instead of a bare `new Date(string)`.

import { WEATHER_LOCATION_UTC_OFFSET } from '@config/weather';

const OFFSET_SUFFIX_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/;
const hourMinuteFormatterCache = new Map<string, Intl.DateTimeFormat>();
const hourOnlyFormatterCache = new Map<string, Intl.DateTimeFormat>();

function hourMinuteFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = hourMinuteFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
      timeZone,
    });
    hourMinuteFormatterCache.set(timeZone, formatter);
  }
  return formatter;
}

function hourOnlyFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = hourOnlyFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('de-DE', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone,
    });
    hourOnlyFormatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/**
 * Parses an Open-Meteo local wall-clock timestamp (no UTC offset) into an
 * unambiguous instant, regardless of the calling runtime's own timezone.
 * Asia/Bangkok has no DST, so `WEATHER_LOCATION_UTC_OFFSET` ("+07:00") is a
 * safe fixed offset today. A future location in a DST-observing timezone
 * would need real timezone-database math instead of a fixed constant --
 * see documentation/features/weather-widget.md#time-handling.
 *
 * Already-qualified timestamps (with a "Z" or explicit offset) are passed
 * through untouched.
 */
export function parseWeatherTimestamp(isoLocalTimestamp: string): Date {
  const hasOffset = OFFSET_SUFFIX_PATTERN.test(isoLocalTimestamp);
  return new Date(
    hasOffset
      ? isoLocalTimestamp
      : `${isoLocalTimestamp}${WEATHER_LOCATION_UTC_OFFSET}`,
  );
}

/**
 * Reads the local hour (0-23) directly out of an Open-Meteo local wall-clock
 * timestamp string, without any Date/timezone round-trip. Used for
 * time-of-day wording ("Vormittag"/"Nachmittag"/"Abend") where only the
 * Bangkok wall-clock hour matters, not an absolute instant.
 */
export function readLocalHour(isoLocalTimestamp: string): number {
  const match = /T(\d{2}):/.exec(isoLocalTimestamp);
  if (!match || !match[1]) {
    throw new Error(`Cannot read local hour from "${isoLocalTimestamp}".`);
  }
  return Number(match[1]);
}

/** "17:45" -- the provider's "Wetterstand" reading time, in the given timezone. */
export function formatWeatherClockTime(
  isoLocalTimestamp: string,
  timeZone: string,
): string {
  return hourMinuteFormatter(timeZone).format(
    parseWeatherTimestamp(isoLocalTimestamp),
  );
}

/** "18:03" -- current time in the given timezone, for the "Ortszeit" line. */
export function formatKohSamuiTime(date: Date, timeZone: string): string {
  return hourMinuteFormatter(timeZone).format(date);
}

/** "19" -- bare hour number used inside a sentence like "Gegen 19 Uhr ...". */
export function formatWeatherHourLabel(
  isoLocalTimestamp: string,
  timeZone: string,
): string {
  return hourOnlyFormatter(timeZone).format(
    parseWeatherTimestamp(isoLocalTimestamp),
  );
}
