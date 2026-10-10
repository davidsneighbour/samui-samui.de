import type { HistoricalCurrency } from './historical-schema.ts';

export type { HistoricalCurrency } from './historical-schema.ts';

import { getPostDateParts } from '../dates.ts';

export interface ResolvedHistoricalCurrency extends HistoricalCurrency {
  schema: 1;
  requestedDate: string;
  resolvedFor: string;
  dateBasis: 'publication' | 'override';
  rateDate: string;
  base: 'EUR';
  quote: 'THB';
  rate: number;
  provider: 'ECB';
  source: 'frankfurter';
}

export function publicationDate(value: Date | string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf()))
    throw new Error('Invalid post publication date.');
  const parts = getPostDateParts(date);
  return `${parts.year}-${parts.monthPadded}-${parts.dayPadded}`;
}

export function requestedCurrencyDate(
  currency: Pick<
    HistoricalCurrency,
    'requestedDate' | 'dateBasis' | 'resolvedFor'
  >,
  date: Date | string,
) {
  const usePublication =
    !currency.requestedDate ||
    (currency.dateBasis === 'publication' &&
      currency.requestedDate === currency.resolvedFor);
  return {
    dateBasis: usePublication
      ? ('publication' as const)
      : ('override' as const),
    requestedDate: usePublication
      ? publicationDate(date)
      : validCalendarDate(currency.requestedDate)
        ? currency.requestedDate
        : (() => {
            throw new Error('Invalid requested date.');
          })(),
  };
}

export function resolveHistoricalCurrency(
  value: unknown,
  date?: Date | string,
): ResolvedHistoricalCurrency | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return undefined;
  const data = value as HistoricalCurrency;
  if (
    data.mode !== 'historical' ||
    !validCalendarDate(data.requestedDate) ||
    !validCalendarDate(data.rateDate) ||
    data.rateDate > data.requestedDate ||
    typeof data.rate !== 'number' ||
    !Number.isFinite(data.rate) ||
    data.rate <= 0 ||
    typeof data.compareCurrent !== 'boolean' ||
    !['publication', 'override'].includes(data.dateBasis ?? '')
  )
    return undefined;
  if (
    data.schema !== 1 ||
    !data.requestedDate ||
    data.resolvedFor !== data.requestedDate ||
    !data.dateBasis ||
    !data.rateDate ||
    !data.rate ||
    data.base !== 'EUR' ||
    data.quote !== 'THB' ||
    data.provider !== 'ECB' ||
    data.source !== 'frankfurter'
  )
    return undefined;
  if (
    date &&
    requestedCurrencyDate(data, date).requestedDate !== data.resolvedFor
  )
    return undefined;
  return data as ResolvedHistoricalCurrency;
}

/** Static, escaped by Astro on the nearest article/component scope. */
export function serialiseHistoricalCurrency(
  value: unknown,
  date?: Date | string,
): string | undefined {
  const resolved = resolveHistoricalCurrency(value, date);
  return resolved ? JSON.stringify(resolved) : undefined;
}

export function validCalendarDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
