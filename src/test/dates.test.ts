import { formatDate, formatMonthLong, formatMonthShort } from '@utils/dates';
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
    ).toBe('18. September 2007 um 14:30 Uhr');
  });
});
