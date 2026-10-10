import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  atomicWrite,
  createHistoricalLookup,
  enrichPost,
  hasCurrencyComponent,
  runEnrichment,
} from '../scripts/currency/enrichment';
import {
  publicationDate,
  requestedCurrencyDate,
  resolveHistoricalCurrency,
} from '../utils/currency/historical';
import { historicalCurrencySchema } from '../utils/currency/historical-schema';

const directories: string[] = [];
afterEach(async () => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  for (const dir of directories.splice(0))
    await fs.rm(dir, { force: true, recursive: true });
});
const body =
  '\nPrice: <dnb-currency amount="100" currency="THB">100 ฿</dnb-currency>\n\nUnchanged prose.\n';
async function fixture(
  currency = '  mode: historical',
  postDate = '2005-01-19T22:00:00+00:00',
) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'currency-enrich-'));
  directories.push(dir);
  const file = path.join(dir, 'index.md');
  const source = `---\ntitle: Test\ndate: ${postDate}\ncurrency:\n${currency}\n---\n${body}`;
  await fs.writeFile(file, source);
  return { file, source };
}
const response = (date = '2005-01-20', rate = 49.862) =>
  new Response(JSON.stringify({ base: 'EUR', date, quote: 'THB', rate }));
const complete = {
  base: 'EUR',
  compareCurrent: false,
  dateBasis: 'publication',
  mode: 'historical',
  provider: 'ECB',
  quote: 'THB',
  rate: 49.862,
  rateDate: '2005-01-20',
  requestedDate: '2005-01-20',
  resolvedFor: '2005-01-20',
  schema: 1,
  source: 'frankfurter',
} as const;

describe('historical contract', () => {
  it('uses the Bangkok calendar and explicit overrides', () => {
    expect(publicationDate('2005-01-19T22:00:00Z')).toBe('2005-01-20');
    expect(
      requestedCurrencyDate({}, '2005-01-19T22:00:00Z').requestedDate,
    ).toBe('2005-01-20');
    expect(
      requestedCurrencyDate({ requestedDate: '2005-01-18' }, '2005-01-20')
        .requestedDate,
    ).toBe('2005-01-18');
  });
  it('accepts pending mode, rejects invalid rates/dates/pairs, and detects stale snapshots', () => {
    expect(
      historicalCurrencySchema.parse({ mode: 'historical' }).compareCurrent,
    ).toBe(false);
    expect(resolveHistoricalCurrency(complete, '2005-01-20')).toEqual(complete);
    expect(
      resolveHistoricalCurrency({ ...complete, requestedDate: '2005-01-21' }),
    ).toBeUndefined();
    expect(resolveHistoricalCurrency(complete, '2005-01-21')).toBeUndefined();
    expect(
      historicalCurrencySchema.safeParse({
        ...complete,
        rateDate: '2005-01-21',
      }).success,
    ).toBe(false);
    for (const rate of [0, -1, NaN, Infinity])
      expect(
        historicalCurrencySchema.safeParse({ ...complete, rate }).success,
      ).toBe(false);
    expect(
      historicalCurrencySchema.safeParse({ ...complete, base: 'THB' }).success,
    ).toBe(false);
    expect(
      historicalCurrencySchema.safeParse({
        ...complete,
        requestedDate: '2005-02-30',
      }).success,
    ).toBe(false);
    expect(
      requestedCurrencyDate(
        { ...complete, requestedDate: '2005-01-18' },
        '2005-01-20',
      ),
    ).toEqual({ dateBasis: 'override', requestedDate: '2005-01-18' });
  });
  it('detects explicit HTML and MDX but ignores examples and comments', () => {
    expect(hasCurrencyComponent(body)).toBe(true);
    expect(
      hasCurrencyComponent('<Currency amount={100} currency="EUR" />'),
    ).toBe(true);
    expect(hasCurrencyComponent('<!-- <dnb-currency amount="100"> -->')).toBe(
      false,
    );
    expect(
      hasCurrencyComponent('```html\n<dnb-currency amount="100">\n```'),
    ).toBe(false);
    expect(hasCurrencyComponent('`<Currency amount={25} />`')).toBe(false);
    expect(hasCurrencyComponent('100 ฿')).toBe(false);
  });
  it('does not assemble markup across ignored regions', () => {
    for (const ignored of [
      '<!-- example -->',
      '`example`',
      '\n```html\nexample\n```\n',
    ]) {
      expect(
        hasCurrencyComponent(`<dnb-${ignored}currency amount="100">`),
      ).toBe(false);
      expect(hasCurrencyComponent(`<Curr${ignored}ency amount={100} />`)).toBe(
        false,
      );
    }
    expect(
      hasCurrencyComponent(
        '<!<!-- example -->-- <dnb-currency amount="100"> -->',
      ),
    ).toBe(true);
    expect(
      hasCurrencyComponent('<!-- example -->\n<Currency amount={100} />'),
    ).toBe(true);
  });
});

describe('historical lookup', () => {
  it('deduplicates requested dates and accepts the provider weekend fallback', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response('2005-01-21', 50.116));
    const lookup = createHistoricalLookup(fetcher);
    const first = lookup('2005-01-23');
    expect(lookup('2005-01-23')).toBe(first);
    expect(await first).toEqual({ rate: 50.116, rateDate: '2005-01-21' });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[0]).toContain(
      'providers=ecb&date=2005-01-23',
    );
  });
  it('walks backwards across a missing holiday observation', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockResolvedValueOnce(response('2005-01-19'));
    expect(await createHistoricalLookup(fetcher)('2005-01-20')).toEqual({
      rate: 49.862,
      rateDate: '2005-01-19',
    });
    expect(fetcher.mock.calls[1]?.[0]).toContain('date=2005-01-19');
  });
  it.each([
    { date: '2005-01-21', rate: 40 },
    { date: '2005-01-20', rate: 0 },
    { date: '2005-02-30', rate: 40 },
    { base: 'THB', date: '2005-01-20', rate: 40 },
  ])('rejects invalid/later observations', async (data) => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ base: 'EUR', quote: 'THB', ...data })),
      );
    await expect(
      createHistoricalLookup(fetcher)('2005-01-20'),
    ).rejects.toThrow();
  });
  it('bounds unavailable history and caches failures within a run', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('', { status: 404 }));
    const lookup = createHistoricalLookup(fetcher);
    await expect(lookup('2005-01-20')).rejects.toThrow('14 days');
    await expect(lookup('2005-01-20')).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(15);
  });
});

describe('enrichment', () => {
  it('audits without requests or writes, enriches atomically, and repeats unchanged', async () => {
    const { file, source } = await fixture();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => response());
    const lookup = createHistoricalLookup(fetcher);
    expect((await enrichPost(file, { lookup, write: false })).category).toBe(
      'historical currency configured',
    );
    expect(fetcher).not.toHaveBeenCalled();
    expect(await fs.readFile(file, 'utf8')).toBe(source);
    expect((await enrichPost(file, { lookup, write: true })).category).toBe(
      'updated',
    );
    const enriched = await fs.readFile(file, 'utf8');
    expect(enriched.slice(enriched.indexOf('\n---\n') + 5)).toBe(body);
    expect(enriched).toContain('requestedDate: 2005-01-20');
    expect((await enrichPost(file, { lookup, write: true })).category).toBe(
      'already enriched',
    );
    expect(await fs.readFile(file, 'utf8')).toBe(enriched);
    const forced = createHistoricalLookup(fetcher);
    expect(
      (await enrichPost(file, { force: true, lookup: forced, write: true }))
        .category,
    ).toBe('updated');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('recomputes edited requested dates and publication defaults', async () => {
    const { file } = await fixture();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async (input) =>
        response(new URL(String(input)).searchParams.get('date') ?? ''),
      );
    await enrichPost(file, {
      lookup: createHistoricalLookup(fetcher),
      write: true,
    });
    await fs.writeFile(
      file,
      (await fs.readFile(file, 'utf8')).replace(
        '2005-01-19T22:00:00+00:00',
        '2005-01-20T22:00:00+00:00',
      ),
    );
    expect(
      (
        await enrichPost(file, {
          lookup: createHistoricalLookup(fetcher),
          write: true,
        })
      ).category,
    ).toBe('updated');
    expect(await fs.readFile(file, 'utf8')).toContain(
      'requestedDate: 2005-01-21',
    );
    await fs.writeFile(
      file,
      (await fs.readFile(file, 'utf8')).replace(
        'requestedDate: 2005-01-21',
        'requestedDate: 2005-01-18',
      ),
    );
    await enrichPost(file, {
      lookup: createHistoricalLookup(fetcher),
      write: true,
    });
    expect(await fs.readFile(file, 'utf8')).toContain('dateBasis: override');
  });
  it('never opts in unmarked posts, and leaves failed lookups unchanged', async () => {
    const { file, source } = await fixture();
    const lookup = createHistoricalLookup(
      vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')),
    );
    expect((await enrichPost(file, { lookup, write: true })).category).toBe(
      'rate lookup failed',
    );
    expect(await fs.readFile(file, 'utf8')).toBe(source);
    await fs.writeFile(
      file,
      source.replace('currency:\n  mode: historical\n', ''),
    );
    expect((await enrichPost(file, { lookup, write: true })).category).toBe(
      'currency component found but no currency mode configured',
    );
  });
  it('reports malformed frontmatter and write failures without corruption', async () => {
    const { file, source } = await fixture();
    const lookup = createHistoricalLookup(
      vi.fn<typeof fetch>().mockImplementation(async () => response()),
    );
    expect(
      (
        await enrichPost(file, {
          lookup,
          write: true,
          writer: async () => {
            throw new Error('disk');
          },
        })
      ).category,
    ).toBe('rate lookup failed');
    expect(await fs.readFile(file, 'utf8')).toBe(source);
    await fs.writeFile(file, '---\ntitle: [broken\n---\n' + body);
    expect((await enrichPost(file, { lookup, write: true })).category).toBe(
      'invalid frontmatter',
    );
  });
  it('preserves file permissions and refuses to overwrite concurrent edits', async () => {
    const { file, source } = await fixture();
    await fs.chmod(file, 0o755);
    await atomicWrite(file, source, source + '\n');
    expect((await fs.stat(file)).mode & 0o777).toBe(0o755);
    await expect(atomicWrite(file, source, 'wrong')).rejects.toThrow('changed');
    expect(await fs.readFile(file, 'utf8')).toBe(source + '\n');
    expect(await fs.readdir(path.dirname(file))).toEqual(['index.md']);
  });
  it('returns failure status while continuing to other files', async () => {
    const good = await fixture();
    const bad = await fixture();
    await fs.writeFile(bad.file, '---\nbad: [\n---\n' + body);
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => response()),
    );
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    expect(await runEnrichment([bad.file, good.file, '--write'], true)).toBe(1);
    expect(await fs.readFile(good.file, 'utf8')).toContain(
      'resolvedFor: 2005-01-20',
    );
  });
});
