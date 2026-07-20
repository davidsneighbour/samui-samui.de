// German date formatting shared by FormattedDate.astro and the archive pages.
// Posts describe life on Koh Samui, so calendar dates are interpreted in
// Thailand time even when legacy frontmatter serialises the instant as +00:00.
export const POST_TIME_ZONE = 'Asia/Bangkok';

export interface PostDateParts {
  day: number;
  dayPadded: string;
  month: number;
  monthIndex: number;
  monthPadded: string;
  year: number;
}

const dayFormatter = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  timeZone: POST_TIME_ZONE,
});
const monthLongFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  timeZone: POST_TIME_ZONE,
});
const monthShortFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'short',
  timeZone: POST_TIME_ZONE,
});
const yearFormatter = new Intl.DateTimeFormat('de-DE', {
  timeZone: POST_TIME_ZONE,
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: POST_TIME_ZONE,
});
const postDatePartsFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: POST_TIME_ZONE,
  year: 'numeric',
});
const postTimePartsFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  second: '2-digit',
  timeZone: POST_TIME_ZONE,
});

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export type DateDurationUnit = 'years' | 'months' | 'days';

export interface DateDurationParts {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalDays: number;
}

export interface DateDurationFormatOptions {
  sinceDate: Date | string;
  untilDate?: Date | string;
  unit?: DateDurationUnit;
  format?: string;
}

export function getPostDateParts(date: Date): PostDateParts {
  const parts = Object.fromEntries(
    postDatePartsFormatter
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);

  if (!year || !month || !day) {
    throw new Error(
      `Could not format post date parts for ${date.toISOString()}`,
    );
  }

  return {
    day,
    dayPadded: String(day).padStart(2, '0'),
    month,
    monthIndex: month - 1,
    monthPadded: String(month).padStart(2, '0'),
    year,
  };
}

export function formatPostTimestamp(date: Date): string {
  const { dayPadded, monthPadded, year } = getPostDateParts(date);
  const parts = Object.fromEntries(
    postTimePartsFormatter
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const hour = parts.hour;
  const minute = parts.minute;
  const second = parts.second;

  if (!hour || !minute || !second) {
    throw new Error(
      `Could not format post time parts for ${date.toISOString()}`,
    );
  }

  return `${year}-${monthPadded}-${dayPadded}T${hour}:${minute}:${second}+07:00`;
}

function parseDateInput(input: Date | string, label: string): Date {
  if (input instanceof Date) {
    if (Number.isNaN(input.valueOf())) {
      throw new Error(`Invalid ${label}: Date is invalid.`);
    }
    return new Date(
      Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()),
    );
  }

  const dateOnlyMatch = dateOnlyPattern.exec(input);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const parsed = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day)),
    );
    if (
      parsed.getUTCFullYear() !== Number(year) ||
      parsed.getUTCMonth() !== Number(month) - 1 ||
      parsed.getUTCDate() !== Number(day)
    ) {
      throw new Error(`Invalid ${label}: "${input}" is not a real date.`);
    }
    return parsed;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`Invalid ${label}: "${input}" is not a valid date.`);
  }
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    ),
  );
}

function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addUtcMonths(date: Date, months: number): Date {
  const startYear = date.getUTCFullYear();
  const startMonth = date.getUTCMonth();
  const targetMonthIndex = startMonth + months;
  const targetYear = startYear + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const targetDay = Math.min(
    date.getUTCDate(),
    daysInUtcMonth(targetYear, targetMonth),
  );

  return new Date(Date.UTC(targetYear, targetMonth, targetDay));
}

export function getDateDurationParts(
  sinceDate: Date | string,
  untilDate: Date | string = new Date(),
): DateDurationParts {
  const since = parseDateInput(sinceDate, 'sinceDate');
  const until = parseDateInput(untilDate, 'untilDate');

  if (since.valueOf() > until.valueOf()) {
    throw new Error('sinceDate must be on or before untilDate.');
  }

  let totalMonths =
    (until.getUTCFullYear() - since.getUTCFullYear()) * 12 +
    (until.getUTCMonth() - since.getUTCMonth());

  while (totalMonths > 0 && addUtcMonths(since, totalMonths) > until) {
    totalMonths -= 1;
  }

  const monthAnchor = addUtcMonths(since, totalMonths);
  const totalDays = Math.floor(
    (until.valueOf() - since.valueOf()) / millisecondsPerDay,
  );
  const days = Math.floor(
    (until.valueOf() - monthAnchor.valueOf()) / millisecondsPerDay,
  );

  return {
    days,
    months: totalMonths % 12,
    totalDays,
    totalMonths,
    years: Math.floor(totalMonths / 12),
  };
}

export function formatDateDuration({
  format,
  sinceDate,
  unit = 'years',
  untilDate,
}: DateDurationFormatOptions): string {
  const parts = getDateDurationParts(sinceDate, untilDate);

  if (format) {
    return format.replace(/%%|%[ymdMD]/g, (token) => {
      if (token === '%%') return '%';
      if (token === '%y') return String(parts.years);
      if (token === '%m') return String(parts.months);
      if (token === '%d') return String(parts.days);
      if (token === '%M') return String(parts.totalMonths);
      if (token === '%D') return String(parts.totalDays);
      return token;
    });
  }

  if (unit === 'months') return String(parts.totalMonths);
  if (unit === 'days') return String(parts.totalDays);
  return String(parts.years);
}

export function formatMonthLong(date: Date): string {
  return monthLongFormatter.format(date);
}

export function formatMonthShort(date: Date): string {
  return monthShortFormatter.format(date);
}

export function formatDate(date: Date, { extended = false } = {}): string {
  const day = dayFormatter.format(date);
  const month = monthLongFormatter.format(date);
  const year = yearFormatter.format(date);
  const base = `${day}. ${month} ${year}`;
  return extended ? `${base} um ${timeFormatter.format(date)} Uhr` : base;
}
