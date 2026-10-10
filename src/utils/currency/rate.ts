export const RATE_KEY = 'samui-samui:currency:eur-thb:v1';
export const RATE_URL =
  'https://api.frankfurter.dev/v2/rate/eur/thb?providers=ecb';
export const FRESH_MS = 24 * 60 * 60 * 1000;
export const MAX_AGE_MS = 7 * FRESH_MS;

export interface CurrencyRate {
  version: 1;
  rate: number;
  rateDate: string;
  fetchedAt: string;
  provider: 'ECB';
  source: 'frankfurter';
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export function validRate(value: unknown, now: number): value is CurrencyRate {
  if (!record(value)) return false;
  const timestamp =
    typeof value['fetchedAt'] === 'string'
      ? Date.parse(value['fetchedAt'])
      : NaN;
  return (
    value['version'] === 1 &&
    value['provider'] === 'ECB' &&
    value['source'] === 'frankfurter' &&
    typeof value['rate'] === 'number' &&
    Number.isFinite(value['rate']) &&
    value['rate'] > 0 &&
    validDate(value['rateDate']) &&
    Date.parse(value['rateDate']) <= now &&
    Number.isFinite(timestamp) &&
    timestamp <= now
  );
}

/** One lookup per browser document/session, including a failed lookup. */
export function createRateService(options: {
  fetch: typeof fetch;
  storage: () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  now?: () => number;
}) {
  const now = options.now ?? Date.now;
  let memory: CurrencyRate | undefined;
  let request: Promise<CurrencyRate | undefined> | undefined;
  let attempted = false;
  const usable = (rate: CurrencyRate | undefined) =>
    rate &&
    validRate(rate, now()) &&
    now() - Date.parse(rate.fetchedAt) < MAX_AGE_MS
      ? rate
      : undefined;

  function cached(): CurrencyRate | undefined {
    if (usable(memory)) return memory;
    try {
      const raw = options.storage().getItem(RATE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : undefined;
      if (validRate(parsed, now()) && usable(parsed)) {
        memory = parsed;
        return memory;
      }
      if (raw) options.storage().removeItem(RATE_KEY);
    } catch {
      /* Storage is optional. */
    }
    return undefined;
  }

  function refresh(): Promise<CurrencyRate | undefined> {
    if (request) return request;
    if (attempted) return Promise.resolve(usable(memory));
    attempted = true;
    request = (async () => {
      try {
        const response = await options.fetch(RATE_URL, {
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error('Currency request failed.');
        const data: unknown = await response.json();
        if (!record(data) || data['base'] !== 'EUR' || data['quote'] !== 'THB')
          throw new Error('Invalid currency pair.');
        const rate = {
          fetchedAt: new Date(now()).toISOString(),
          provider: 'ECB',
          rate: data['rate'],
          rateDate: data['date'],
          source: 'frankfurter',
          version: 1,
        };
        if (!validRate(rate, now()))
          throw new Error('Invalid currency response.');
        memory = rate;
        try {
          options.storage().setItem(RATE_KEY, JSON.stringify(rate));
        } catch {
          /* Keep memory. */
        }
      } catch {
        /* Preserve a valid stale rate. */
      }
      return usable(memory);
    })().finally(() => {
      request = undefined;
    });
    return request;
  }

  return {
    lookup() {
      const rate = cached();
      const fresh = rate && now() - Date.parse(rate.fetchedAt) < FRESH_MS;
      return { rate, updated: fresh ? Promise.resolve(rate) : refresh() };
    },
  };
}
