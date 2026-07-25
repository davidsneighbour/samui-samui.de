import {
  formatKohSamuiTime,
  formatWeatherClockTime,
  formatWeatherHourLabel,
  parseWeatherTimestamp,
  readLocalHour,
} from '@utils/weather/format-weather-time';
import { describe, expect, it } from 'vitest';

const BANGKOK = 'Asia/Bangkok';

describe('parseWeatherTimestamp', () => {
  it('resolves an offset-less Open-Meteo timestamp to the correct UTC instant', () => {
    // 17:45 in Bangkok (UTC+7, no DST) is 10:45 UTC -- independent of
    // whatever timezone the executing runtime happens to be in.
    expect(parseWeatherTimestamp('2026-07-25T17:45').toISOString()).toBe(
      '2026-07-25T10:45:00.000Z',
    );
  });

  it('passes through a timestamp that already carries an explicit offset', () => {
    expect(
      parseWeatherTimestamp('2026-07-25T17:45:00+07:00').toISOString(),
    ).toBe('2026-07-25T10:45:00.000Z');
  });

  it('is unaffected by the runtime not being in Bangkok time', () => {
    // Simulates "visitor running in a different timezone": the parsed
    // instant must not depend on process.env.TZ / the browser's own zone.
    const originalTz = process.env['TZ'];
    process.env['TZ'] = 'America/New_York';
    try {
      expect(parseWeatherTimestamp('2026-07-25T17:45').toISOString()).toBe(
        '2026-07-25T10:45:00.000Z',
      );
    } finally {
      if (originalTz === undefined) delete process.env['TZ'];
      else process.env['TZ'] = originalTz;
    }
  });
});

describe('readLocalHour', () => {
  it('reads the Bangkok wall-clock hour directly from the string', () => {
    expect(readLocalHour('2026-07-25T09:05')).toBe(9);
    expect(readLocalHour('2026-07-25T23:50')).toBe(23);
  });

  it('handles the midnight boundary correctly', () => {
    expect(readLocalHour('2026-07-26T00:15')).toBe(0);
  });
});

describe('formatWeatherClockTime', () => {
  it('formats the "Wetterstand" reading time in Asia/Bangkok', () => {
    expect(formatWeatherClockTime('2026-07-25T17:45', BANGKOK)).toBe('17:45');
  });

  it('formats correctly across the midnight boundary', () => {
    expect(formatWeatherClockTime('2026-07-25T23:50', BANGKOK)).toBe('23:50');
    expect(formatWeatherClockTime('2026-07-26T00:15', BANGKOK)).toBe('00:15');
  });
});

describe('formatWeatherHourLabel', () => {
  it('formats an hour label for the summary sentence', () => {
    // German de-DE hour-numeric formatting already includes the "Uhr" unit
    // (unlike the hour+minute formatter), so summarise-weather.ts must not
    // append a second one -- see its describeFutureRain().
    expect(formatWeatherHourLabel('2026-07-25T19:00', BANGKOK)).toBe('19 Uhr');
  });
});

describe('formatKohSamuiTime', () => {
  it('formats an absolute instant as current Koh Samui time', () => {
    // 2026-07-25T10:45:00.000Z is 17:45 in Bangkok (UTC+7).
    const instant = new Date('2026-07-25T10:45:00.000Z');
    expect(formatKohSamuiTime(instant, BANGKOK)).toBe('17:45');
  });
});
