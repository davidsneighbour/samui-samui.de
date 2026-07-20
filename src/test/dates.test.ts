import {
  formatDate,
  formatDateDuration,
  formatMonthLong,
  formatMonthShort,
  formatPostTimestamp,
  getDateDurationParts,
  getPostDateParts,
} from '@utils/dates';
import { describe, expect, it } from 'vitest';

describe('dates', () => {
  it('formats a long German month name', () => {
    expect(formatMonthLong(new Date(Date.UTC(2007, 8, 18)))).toBe('September');
  });

  it('formats a short German month name', () => {
    expect(formatMonthShort(new Date(Date.UTC(2007, 8, 18)))).toBe('Sep');
  });

  it('formats a full date', () => {
    expect(formatDate(new Date(Date.UTC(2007, 8, 18)))).toBe(
      '18. September 2007',
    );
  });

  it('formats an extended date with time', () => {
    expect(
      formatDate(new Date(Date.UTC(2007, 8, 18, 14, 30)), { extended: true }),
    ).toBe('18. September 2007 um 21:30 Uhr');
  });

  it('extracts post date parts in Bangkok time', () => {
    expect(getPostDateParts(new Date('2012-01-24T17:31:43+00:00'))).toEqual({
      day: 25,
      dayPadded: '25',
      month: 1,
      monthIndex: 0,
      monthPadded: '01',
      year: 2012,
    });
  });

  it('serializes post timestamps with the fixed Bangkok offset', () => {
    expect(formatPostTimestamp(new Date('2012-01-24T17:31:43+00:00'))).toBe(
      '2012-01-25T00:31:43+07:00',
    );
  });

  it('calculates complete years, remaining months, and remaining days', () => {
    expect(getDateDurationParts('2005-01-08', '2026-07-20')).toEqual({
      days: 12,
      months: 6,
      totalDays: 7863,
      totalMonths: 258,
      years: 21,
    });
  });

  it('does not count the next year before the anniversary date', () => {
    expect(getDateDurationParts('2005-01-08', '2026-01-07')).toMatchObject({
      days: 30,
      months: 11,
      years: 20,
    });
  });

  it('clamps month anchors for end-of-month start dates', () => {
    expect(getDateDurationParts('2024-01-31', '2024-03-01')).toMatchObject({
      days: 1,
      months: 1,
      years: 0,
    });
  });

  it('formats duration tokens with remainder and total values', () => {
    expect(
      formatDateDuration({
        format: '%y Jahre, %m Monate, und %d Tage (%M Monate / %D Tage)',
        sinceDate: '2005-01-08',
        untilDate: '2026-07-20',
      }),
    ).toBe('21 Jahre, 6 Monate, und 12 Tage (258 Monate / 7863 Tage)');
  });

  it('returns a single total unit when no custom format is provided', () => {
    expect(
      formatDateDuration({
        sinceDate: '2005-01-08',
        unit: 'months',
        untilDate: '2026-07-20',
      }),
    ).toBe('258');
  });

  it('throws for impossible date-only input', () => {
    expect(() => getDateDurationParts('2026-02-31', '2026-07-20')).toThrow(
      /not a real date/,
    );
  });
});
