// German date formatting shared by FormattedDate.astro and the archive
// pages. Formatted in UTC (not the build machine's local time or a fixed
// Thai offset) to match the day/month/year components already produced by
// z.coerce.date() -- most front matter dates carry a +00:00 offset, a
// minority +07:00, so UTC is the only zone consistent across all posts.
const dayFormatter = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  timeZone: 'UTC',
});
const monthLongFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'long',
  timeZone: 'UTC',
});
const monthShortFormatter = new Intl.DateTimeFormat('de-DE', {
  month: 'short',
  timeZone: 'UTC',
});
const yearFormatter = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'UTC',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

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
