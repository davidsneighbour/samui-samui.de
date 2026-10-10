import { describe, expect, it, vi } from 'vitest';
import {
  convertCurrency,
  formatConversion,
  formatCurrency,
  formatRateDate,
} from '../utils/currency/conversion';
import {
  type CurrencyRate,
  createRateService,
  FRESH_MS,
  MAX_AGE_MS,
  RATE_KEY,
  RATE_URL,
} from '../utils/currency/rate';

const now = Date.parse('2026-10-10T12:00:00Z');
const cached = (age = 0): CurrencyRate => ({
  fetchedAt: new Date(now - age).toISOString(),
  provider: 'ECB',
  rate: 37.574,
  rateDate: '2026-10-09',
  source: 'frankfurter',
  version: 1,
});
function setup(
  raw?: string,
  response: unknown = {
    base: 'EUR',
    date: '2026-10-09',
    quote: 'THB',
    rate: 40,
  },
) {
  const storage = {
    getItem: vi.fn(() => raw ?? null),
    removeItem: vi.fn(),
    setItem: vi.fn(),
  };
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response(JSON.stringify(response)));
  const service = createRateService({
    fetch: fetcher,
    now: () => now,
    storage: () => storage,
  });
  return { fetcher, service, storage };
}

describe('currency conversion', () => {
  it('converts both directions, decimals, and zero', () => {
    expect(convertCurrency(1000, 'THB', 40)).toBe(25);
    expect(convertCurrency(25.5, 'EUR', 40)).toBe(1020);
    expect(convertCurrency(0, 'THB', 40)).toBe(0);
    expect(convertCurrency(-10, 'EUR', 40)).toBe(-400);
    expect(formatConversion(1000, 'THB', 37.574)).toBe('ca. 26,61\u00a0€');
    expect(formatConversion(25, 'EUR', 37.574)).toBe('ca. 939\u00a0฿');
    expect(formatCurrency(1000, 'EUR')).toBe('1.000,00\u00a0€');
  });
  it.each([0, -1, NaN, Infinity])('rejects rate %s', (rate) => {
    expect(() => convertCurrency(1, 'THB', rate)).toThrow();
  });
  it('rejects invalid amounts, currency, and overflow', () => {
    expect(() => convertCurrency(NaN, 'EUR', 40)).toThrow();
    expect(() => formatCurrency(1, 'USD' as 'EUR')).toThrow();
    expect(() => convertCurrency(Number.MAX_VALUE, 'EUR', 40)).toThrow();
  });
});

describe('currency cache', () => {
  it('uses fresh fetchedAt even with an older reference date without fetching', async () => {
    const value = { ...cached(), rateDate: '2026-10-02' };
    const { service, fetcher } = setup(JSON.stringify(value));
    expect(service.lookup().rate).toEqual(value);
    expect(await service.lookup().updated).toEqual(value);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('serves stale immediately, refreshes once, and stores valid results', async () => {
    const value = cached(FRESH_MS);
    const { service, storage, fetcher } = setup(JSON.stringify(value));
    const first = service.lookup();
    expect(first.rate).toEqual(value);
    const second = service.lookup();
    expect(second.updated).toBe(first.updated);
    expect((await first.updated)?.rate).toBe(40);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      RATE_URL,
      expect.objectContaining({
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      }),
    );
    expect(storage.setItem).toHaveBeenCalledWith(RATE_KEY, expect.any(String));
  });
  it.each([FRESH_MS, MAX_AGE_MS - 1, MAX_AGE_MS, MAX_AGE_MS + 1])(
    'falls back only inside seven days (%s)',
    async (age) => {
      const { service, fetcher } = setup(JSON.stringify(cached(age)));
      fetcher.mockRejectedValue(new Error('offline'));
      expect(await service.lookup().updated).toEqual(
        age < MAX_AGE_MS ? cached(age) : undefined,
      );
      await service.lookup().updated;
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );
  it.each([
    'broken',
    '{}',
    JSON.stringify({ ...cached(), version: 2 }),
    JSON.stringify({ ...cached(), fetchedAt: '2027-01-01' }),
  ])('ignores invalid cache %s', async (raw) => {
    const { service } = setup(raw);
    expect(service.lookup().rate).toBeUndefined();
    expect((await service.lookup().updated)?.rate).toBe(40);
  });
  it.each([
    {},
    { base: 'THB', date: '2026-10-09', quote: 'EUR', rate: 40 },
    { base: 'EUR', date: '2026-02-30', quote: 'THB', rate: 40 },
    { base: 'EUR', date: '2026-10-09', quote: 'THB', rate: 0 },
  ])('never replaces stale cache with invalid response', async (response) => {
    const value = cached(FRESH_MS);
    const { service, storage } = setup(JSON.stringify(value), response);
    expect(await service.lookup().updated).toEqual(value);
    expect(storage.setItem).not.toHaveBeenCalled();
  });
  it('handles HTTP failure and unavailable storage', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('', { status: 503 }));
    const service = createRateService({
      fetch: fetcher,
      now: () => now,
      storage: () => {
        throw new Error('blocked');
      },
    });
    expect(await service.lookup().updated).toBeUndefined();
    await service.lookup().updated;
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('keeps a successful response in memory when storage fails', async () => {
    const { fetcher } = setup();
    const service = createRateService({
      fetch: fetcher,
      now: () => now,
      storage: () => {
        throw new Error('blocked');
      },
    });
    expect((await service.lookup().updated)?.rate).toBe(40);
    expect(service.lookup().rate?.rate).toBe(40);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

it('labels the actual reference date rather than the fetch date or today', () => {
  expect(formatRateDate('2026-10-09')).toBe(
    'EZB-Referenzkurs vom 9. Oktober 2026',
  );
  expect(formatRateDate('2005-01-20')).toBe(
    'EZB-Referenzkurs vom 20. Januar 2005',
  );
});
