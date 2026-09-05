import fs from 'node:fs';
import path from 'node:path';
import {
  buildIumasTimeline,
  deriveCurrentIumasEntry,
  getCurrentIumasValue,
  getIumasValidationErrors,
  IUMAS_TYPES,
  type IumasEntry,
  type IumasEntryType,
  sortIumasEntries,
} from '@data/iumas';
import { describe, expect, it } from 'vitest';

function entry(overrides: Partial<IumasEntry> = {}): IumasEntry {
  return {
    from: '2000-01-01',
    precision: 'day',
    type: 'subtitle',
    value: 'Ein Beispiel-Wert',
    ...overrides,
  } as IumasEntry;
}

describe('IUMAS validation', () => {
  it('rejects an empty array', () => {
    expect(getIumasValidationErrors([])).not.toEqual([]);
  });

  it('accepts each of the four event types', () => {
    const errors = getIumasValidationErrors(
      IUMAS_TYPES.map((type, index) =>
        entry({ from: `200${index}-01-01`, type, value: `Wert ${type}` }),
      ),
    );
    expect(errors).toEqual([]);
  });

  it('rejects an unknown event type', () => {
    const errors = getIumasValidationErrors([
      entry({ type: 'unknown' as IumasEntryType }),
    ]);
    expect(errors.some((message) => message.includes('does not match'))).toBe(
      true,
    );
  });

  it('rejects entries with empty value', () => {
    const errors = getIumasValidationErrors([entry({ value: '   ' })]);
    expect(
      errors.some((message) => message.includes('must not be empty')),
    ).toBe(true);
  });

  it('rejects raw HTML markup in value', () => {
    const errors = getIumasValidationErrors([
      entry({ value: 'Notizen <em>und so</em>' }),
    ]);
    expect(errors.some((message) => message.includes('raw HTML markup'))).toBe(
      true,
    );
  });

  it('rejects HTML entities in value', () => {
    const errors = getIumasValidationErrors([
      entry({ value: 'Notizen &amp; Gedanken' }),
    ]);
    expect(errors.some((message) => message.includes('HTML entity'))).toBe(
      true,
    );
  });

  it('accepts a literal ampersand in value', () => {
    const errors = getIumasValidationErrors([
      entry({ value: 'Notizen & Gedanken' }),
    ]);
    expect(errors).toEqual([]);
  });

  it('rejects HTML entities in note and source.note', () => {
    const noteErrors = getIumasValidationErrors([
      entry({ note: 'Ersetzt &nbsp;durch Leerzeichen' }),
    ]);
    expect(noteErrors.some((message) => message.includes('.note'))).toBe(true);

    const sourceNoteErrors = getIumasValidationErrors([
      entry({
        source: { note: 'Kopiert aus &quot;Archiv&quot;', type: 'memory' },
      }),
    ]);
    expect(
      sourceNoteErrors.some((message) => message.includes('source.note')),
    ).toBe(true);
  });

  it('rejects invalid dates', () => {
    const errors = getIumasValidationErrors([entry({ from: '2019-02-30' })]);
    expect(errors.some((message) => message.includes('not a valid'))).toBe(
      true,
    );
  });

  it('rejects an invalid precision', () => {
    const errors = getIumasValidationErrors([
      entry({ precision: 'century' as never }),
    ]);
    expect(errors.some((message) => message.includes('does not match'))).toBe(
      true,
    );
  });

  it('rejects invalid source data', () => {
    const errors = getIumasValidationErrors([
      entry({ source: { type: 'carrier-pigeon' as never } }),
    ]);
    expect(errors.some((message) => message.includes('does not match'))).toBe(
      true,
    );
  });

  it('requires from to be null when precision is unknown', () => {
    const errors = getIumasValidationErrors([
      entry({ from: '2010-01-01', precision: 'unknown' }),
    ]);
    expect(errors.some((message) => message.includes('must be null'))).toBe(
      true,
    );
  });

  it('accepts an undated entry with unknown precision', () => {
    const errors = getIumasValidationErrors([
      entry({ from: null, precision: 'unknown' }),
    ]);
    expect(errors).toEqual([]);
  });

  it('accepts several events sharing one date across types', () => {
    const errors = getIumasValidationErrors(
      IUMAS_TYPES.map((type) =>
        entry({ from: '2026-08-29', type, value: `Wert ${type}` }),
      ),
    );
    expect(errors).toEqual([]);
  });

  it('rejects a true duplicate (same type, date, and value)', () => {
    const errors = getIumasValidationErrors([
      entry({ from: '2010-01-01', value: 'Gleicher Wert' }),
      entry({ from: '2010-01-01', value: 'Gleicher Wert' }),
    ]);
    expect(errors.some((message) => message.includes('duplicates'))).toBe(true);
  });

  it('does not reject two different values on the same date', () => {
    const errors = getIumasValidationErrors([
      entry({ from: '2010-01-01', value: 'Erster Wert' }),
      entry({ from: '2010-01-01', value: 'Zweiter Wert' }),
    ]);
    expect(errors).toEqual([]);
  });
});

describe('sortIumasEntries', () => {
  it('sorts entries chronologically, oldest first, with unknown dates first', () => {
    const sorted = sortIumasEntries([
      entry({ from: '2019-07-04', value: 'newest' }),
      entry({ from: null, precision: 'unknown', value: 'undated' }),
      entry({ from: '2007-04-01', value: 'oldest known' }),
    ]);

    expect(sorted.map((item) => item.value)).toEqual([
      'undated',
      'oldest known',
      'newest',
    ]);
  });
});

describe('deriveCurrentIumasEntry', () => {
  it('selects the newest known entry as current', () => {
    const current = deriveCurrentIumasEntry([
      entry({ from: '2007-04-01', value: 'oldest' }),
      entry({ from: '2019-07-04', value: 'newest' }),
      entry({ from: '2012-09-14', value: 'middle' }),
    ]);

    expect(current?.value).toBe('newest');
  });

  it('treats an undated entry as older than every known date', () => {
    const current = deriveCurrentIumasEntry([
      entry({ from: null, precision: 'unknown', value: 'undated' }),
      entry({ from: '2019-07-04', value: 'newest' }),
    ]);

    expect(current?.value).toBe('newest');
  });

  it('returns undefined for an empty set (a lane with no entries yet)', () => {
    expect(deriveCurrentIumasEntry([])).toBeUndefined();
  });
});

describe('buildIumasTimeline', () => {
  it('derives the previous entry end date from the next start date within the same type', () => {
    const timeline = buildIumasTimeline([
      entry({ from: '2007-04-01', value: 'first' }),
      entry({ from: '2012-09-14', value: 'second' }),
      entry({ from: '2019-07-04', value: 'third' }),
    ]);

    const byValue = Object.fromEntries(
      timeline.map((item) => [item.value, item]),
    );

    expect(byValue['first']?.displayPeriod).toBe(
      '1. April 2007 - 13. September 2012',
    );
    expect(byValue['second']?.displayPeriod).toBe(
      '14. September 2012 - 3. Juli 2019',
    );
    expect(byValue['third']?.displayPeriod).toBe('seit 4. Juli 2019');
    expect(byValue['third']?.isCurrent).toBe(true);
  });

  it('does not let an unrelated event type affect a period range', () => {
    const timeline = buildIumasTimeline([
      entry({ from: '2019-07-04', type: 'subtitle', value: 'subtitle A' }),
      entry({ from: '2021-01-01', type: 'image', value: 'image A' }),
      entry({ from: '2026-08-29', type: 'subtitle', value: 'subtitle B' }),
    ]);

    const byValue = Object.fromEntries(
      timeline.map((item) => [item.value, item]),
    );

    expect(byValue['subtitle A']?.displayPeriod).toBe(
      '4. Juli 2019 - 28. August 2026',
    );
    expect(byValue['subtitle B']?.isCurrent).toBe(true);
    expect(byValue['image A']?.isCurrent).toBe(true);
  });

  it('is ordered newest first, globally, across types', () => {
    const timeline = buildIumasTimeline([
      entry({ from: '2007-04-01', type: 'subtitle', value: 'first' }),
      entry({ from: '2019-07-04', type: 'image', value: 'second' }),
    ]);

    expect(timeline.map((item) => item.value)).toEqual(['second', 'first']);
  });

  it('breaks ties on equal dates using the deterministic type order', () => {
    const timeline = buildIumasTimeline([
      entry({ from: '2026-08-29', type: 'image', value: 'image' }),
      entry({ from: '2026-08-29', type: 'title', value: 'title' }),
      entry({ from: '2026-08-29', type: 'subtitle', value: 'subtitle' }),
      entry({ from: '2026-08-29', type: 'logo', value: 'logo' }),
    ]);

    expect(timeline.map((item) => item.value)).toEqual([
      'title',
      'logo',
      'subtitle',
      'image',
    ]);
  });

  it('derives multiple simultaneous current values, one per type', () => {
    const timeline = buildIumasTimeline([
      entry({ from: '2005-01-01', type: 'title', value: 'title' }),
      entry({ from: '2010-01-01', type: 'logo', value: 'logo' }),
      entry({ from: '2019-07-04', type: 'subtitle', value: 'subtitle' }),
      entry({ from: '2021-01-01', type: 'image', value: 'image' }),
    ]);

    expect(timeline.every((item) => item.isCurrent)).toBe(true);
  });

  it('handles month precision', () => {
    const timeline = buildIumasTimeline([
      entry({ from: '2008-06-01', precision: 'month', value: 'monthly' }),
      entry({ from: '2019-07-04', value: 'current' }),
    ]);

    const monthly = timeline.find((item) => item.value === 'monthly');
    expect(monthly?.displayDate).toBe('Juni 2008');
  });

  it('handles year precision', () => {
    const timeline = buildIumasTimeline([
      entry({ from: '2008-01-01', precision: 'year', value: 'yearly' }),
      entry({ from: '2019-07-04', value: 'current' }),
    ]);

    const yearly = timeline.find((item) => item.value === 'yearly');
    expect(yearly?.displayDate).toBe('ca. 2008');
  });

  it('handles an unknown oldest entry', () => {
    const timeline = buildIumasTimeline([
      entry({ from: null, precision: 'unknown', value: 'oldest' }),
      entry({ from: '2019-07-04', value: 'current' }),
    ]);

    const oldest = timeline.find((item) => item.value === 'oldest');
    expect(oldest?.displayDate).toBe('Datum noch unbekannt');
    expect(oldest?.displayPeriod).toBe('davor');
    expect(oldest?.isCurrent).toBe(false);
  });

  it('derives a Git commit source URL', () => {
    const timeline = buildIumasTimeline([
      entry({
        source: { reference: 'abc1234', type: 'git' },
        value: 'sourced',
      }),
    ]);

    expect(timeline[0]?.sourceUrl).toBe(
      'https://github.com/davidsneighbour/samui-samui.de/commit/abc1234',
    );
  });
});

describe('getCurrentIumasValue', () => {
  it('retrieves the current subtitle, matching what the masthead renders', () => {
    const current = getCurrentIumasValue('subtitle');
    expect(current).toBeDefined();
    expect(current?.type).toBe('subtitle');
    expect(typeof current?.value).toBe('string');
  });

  it('retrieves the current title', () => {
    const current = getCurrentIumasValue('title');
    expect(current?.value).toBe('samui-samui.de');
  });

  it('retrieves the current header image', () => {
    const current = getCurrentIumasValue('image');
    expect(current?.value).toBe('/assets/header/header-201906.jpg');
  });

  it('returns undefined for a lane with no recorded entries yet (logo)', () => {
    expect(getCurrentIumasValue('logo')).toBeUndefined();
  });
});

describe('/taglines/ redirect', () => {
  it('permanently redirects /taglines/ to /iumas/ in netlify.toml', () => {
    const netlifyToml = fs.readFileSync(
      path.resolve(import.meta.dirname, '../../netlify.toml'),
      'utf8',
    );

    expect(netlifyToml).toMatch(
      /from\s*=\s*"\/taglines\/"\s*\n\s*to\s*=\s*"\/iumas\/"\s*\n\s*status\s*=\s*301/,
    );
  });
});
