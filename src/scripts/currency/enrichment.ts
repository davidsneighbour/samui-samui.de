import fs from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';
import {
  type ResolvedHistoricalCurrency,
  requestedCurrencyDate,
  resolveHistoricalCurrency,
} from '../../utils/currency/historical.ts';
import { calendarDate } from '../../utils/currency/historical-schema.ts';
import { RATE_URL } from '../../utils/currency/rate.ts';

export function hasCurrencyComponent(body: string): boolean {
  const prose = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, '')
    .replace(/`[^`\n]*`/g, '');
  return (
    /<dnb-currency\b[^>]*\bamount\s*=/i.test(prose) ||
    /<Currency\b[^>]*\bamount\s*=/m.test(prose)
  );
}

export function createHistoricalLookup(fetcher: typeof fetch = fetch) {
  const cache = new Map<string, Promise<{ rateDate: string; rate: number }>>();
  return (requestedDate: string) => {
    calendarDate.parse(requestedDate);
    if (!cache.has(requestedDate))
      cache.set(
        requestedDate,
        (async () => {
          // Frankfurter normally returns the preceding reference day itself.
          // Explicitly step backwards if the provider returns no observation.
          for (let days = 0; days <= 14; days++) {
            const candidate = new Date(`${requestedDate}T00:00:00Z`);
            candidate.setUTCDate(candidate.getUTCDate() - days);
            const date = candidate.toISOString().slice(0, 10);
            const response = await fetcher(`${RATE_URL}&date=${date}`, {
              signal: AbortSignal.timeout(10000),
            });
            if (response.status === 404) continue;
            if (!response.ok)
              throw new Error(
                `Historical rate request returned HTTP ${response.status}.`,
              );
            const data: unknown = await response.json();
            if (!data || typeof data !== 'object')
              throw new Error('Malformed historical response.');
            const row = data as Record<string, unknown>;
            const rateDate = calendarDate.parse(row['date']);
            if (
              row['base'] !== 'EUR' ||
              row['quote'] !== 'THB' ||
              typeof row['rate'] !== 'number' ||
              !Number.isFinite(row['rate']) ||
              row['rate'] <= 0 ||
              rateDate > date
            )
              throw new Error('Invalid historical observation.');
            return { rate: row['rate'], rateDate };
          }
          throw new Error('No preceding reference rate within 14 days.');
        })(),
      );
    return cache.get(requestedDate) as Promise<{
      rateDate: string;
      rate: number;
    }>;
  };
}

export async function atomicWrite(
  file: string,
  original: string,
  replacement: string,
) {
  const temporary = `${file}.currency-${process.pid}.tmp`;
  try {
    const stat = await fs.stat(file);
    await fs.writeFile(temporary, replacement, { flag: 'wx', mode: stat.mode });
    if ((await fs.readFile(file, 'utf8')) !== original)
      throw new Error(
        'Post changed during enrichment; refusing to overwrite it.',
      );
    await fs.rename(temporary, file);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

export type EnrichmentCategory =
  | 'historical currency configured'
  | 'currency component found but no currency mode configured'
  | 'already enriched'
  | 'invalid frontmatter'
  | 'rate lookup failed'
  | 'no currency component found'
  | 'updated';
export interface EnrichmentResult {
  file: string;
  category: EnrichmentCategory;
  error?: string;
}
export async function enrichPost(
  file: string,
  options: {
    write: boolean;
    force?: boolean;
    lookup: ReturnType<typeof createHistoricalLookup>;
    writer?: typeof atomicWrite;
  },
): Promise<EnrichmentResult> {
  const result = (
    category: EnrichmentCategory,
    error?: string,
  ): EnrichmentResult =>
    error ? { category, error, file } : { category, file };
  let source: string;
  let match: RegExpMatchArray;
  let document: ReturnType<typeof parseDocument>;
  let data: Record<string, unknown>;
  try {
    source = await fs.readFile(file, 'utf8');
    const found = source.match(/^(---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$))/);
    if (!found) throw new Error('Missing frontmatter.');
    match = found;
    document = parseDocument(match[2] ?? '');
    if (document.errors.length) throw new Error(document.errors[0]?.message);
    const parsed: unknown = document.toJS();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new Error('Frontmatter must be a mapping.');
    data = parsed as Record<string, unknown>;
  } catch (error) {
    return result('invalid frontmatter', String(error));
  }
  const body = source.slice(match[0].length);
  if (!hasCurrencyComponent(body)) return result('no currency component found');
  const value = data['currency'];
  if (value === undefined)
    return result('currency component found but no currency mode configured');
  if (
    !value ||
    typeof value !== 'object' ||
    (value as Record<string, unknown>)['mode'] !== 'historical'
  )
    return result('invalid frontmatter', 'currency.mode must be historical.');
  const currency = value as Record<string, unknown>;
  let target: ReturnType<typeof requestedCurrencyDate>;
  try {
    if (typeof data['date'] !== 'string' && !(data['date'] instanceof Date))
      throw new Error('Missing publication date.');
    if (currency['requestedDate'] !== undefined)
      calendarDate.parse(currency['requestedDate']);
    if (
      currency['compareCurrent'] !== undefined &&
      typeof currency['compareCurrent'] !== 'boolean'
    )
      throw new Error('compareCurrent must be boolean.');
    target = requestedCurrencyDate(
      {
        dateBasis: currency['dateBasis'] as
          | 'publication'
          | 'override'
          | undefined,
        requestedDate: currency['requestedDate'] as string | undefined,
        resolvedFor: currency['resolvedFor'] as string | undefined,
      },
      data['date'],
    );
    if (resolveHistoricalCurrency(currency, data['date']) && !options.force)
      return result('already enriched');
  } catch (error) {
    return result('invalid frontmatter', String(error));
  }
  if (!options.write) return result('historical currency configured');
  try {
    const observation = await options.lookup(target.requestedDate);
    const complete: ResolvedHistoricalCurrency = {
      compareCurrent: currency['compareCurrent'] === true,
      mode: 'historical',
      schema: 1,
      ...target,
      resolvedFor: target.requestedDate,
      ...observation,
      base: 'EUR',
      provider: 'ECB',
      quote: 'THB',
      source: 'frankfurter',
    };
    if (!resolveHistoricalCurrency(complete))
      throw new Error('Resolved metadata failed validation.');
    document.set('currency', complete);
    const newline = match[1]?.includes('\r\n') ? '\r\n' : '\n';
    const frontmatter = document
      .toString({ lineWidth: 0 })
      .trimEnd()
      .replace(/\n/g, newline);
    const replacement = `${match[1]}${frontmatter}${match[3]}${body}`;
    await (options.writer ?? atomicWrite)(file, source, replacement);
    return result('updated');
  } catch (error) {
    return result('rate lookup failed', String(error));
  }
}

export async function findPosts(inputs: string[]): Promise<string[]> {
  const files: string[] = [];
  async function walk(input: string) {
    const stat = await fs.stat(input);
    if (stat.isDirectory()) {
      for (const entry of (await fs.readdir(input)).sort())
        await walk(path.join(input, entry));
    } else if (/\.mdx?$/.test(input)) files.push(input);
  }
  for (const input of inputs) await walk(input);
  return [...new Set(files)].sort();
}

export async function runEnrichment(
  argv: string[],
  archive = false,
): Promise<number> {
  const allowed = new Set(['--write', '--audit', '--force', '--lookup']);
  for (const arg of argv)
    if (arg.startsWith('--') && !allowed.has(arg))
      throw new Error(`Unknown option: ${arg}`);
  const write = archive ? argv.includes('--write') : !argv.includes('--audit');
  if (argv.includes('--audit') && argv.includes('--write'))
    throw new Error('Choose --audit or --write.');
  const files = await findPosts(
    argv.filter((arg) => !arg.startsWith('--')).length
      ? argv.filter((arg) => !arg.startsWith('--'))
      : ['src/content/posts'],
  );
  const lookup = createHistoricalLookup();
  const results: EnrichmentResult[] = [];
  for (const file of files) {
    const result = await enrichPost(file, {
      force: argv.includes('--force'),
      lookup,
      write,
    });
    if (
      !write &&
      argv.includes('--lookup') &&
      result.category === 'historical currency configured'
    ) {
      const data = parseDocument(
        (await fs.readFile(file, 'utf8')).match(
          /^---\r?\n([\s\S]*?)\r?\n---/,
        )?.[1] ?? '',
      ).toJS() as Record<string, unknown>;
      try {
        await lookup(
          requestedCurrencyDate(
            data['currency'] as never,
            data['date'] as string,
          ).requestedDate,
        );
      } catch (error) {
        result.category = 'rate lookup failed';
        result.error = String(error);
      }
    }
    results.push(result);
  }
  console.log(`Currency enrichment: ${files.length} posts scanned`);
  for (const category of [...new Set(results.map((row) => row.category))])
    console.log(
      `${category}: ${results.filter((row) => row.category === category).length}`,
    );
  for (const row of results)
    if (row.category !== 'no currency component found')
      console.log(
        `${row.category}: ${row.file}${row.error ? ` — ${row.error}` : ''}`,
      );
  return results.some(
    (row) =>
      row.category === 'invalid frontmatter' ||
      row.category === 'rate lookup failed',
  )
    ? 1
    : 0;
}
