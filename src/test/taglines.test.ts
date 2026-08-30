import {
  buildTaglineTimeline,
  deriveCurrentTagline,
  getTaglineValidationErrors,
  sortTaglines,
  type Tagline,
} from '@data/taglines';
import { describe, expect, it } from 'vitest';

function tagline(overrides: Partial<Tagline> = {}): Tagline {
  return {
    from: '2000-01-01',
    precision: 'day',
    text: 'Ein Beispiel-Tagline',
    ...overrides,
  };
}

describe('tagline validation', () => {
  it('rejects an empty array', () => {
    expect(getTaglineValidationErrors([])).not.toEqual([]);
  });

  it('rejects entries with empty tagline text', () => {
    const errors = getTaglineValidationErrors([tagline({ text: '   ' })]);
    expect(
      errors.some((message) => message.includes('must not be empty')),
    ).toBe(true);
  });

  it('rejects raw HTML markup in text', () => {
    const errors = getTaglineValidationErrors([
      tagline({ text: 'Notizen <em>und so</em>' }),
    ]);
    expect(errors.some((message) => message.includes('raw HTML markup'))).toBe(
      true,
    );
  });

  it('rejects HTML entities in text', () => {
    const errors = getTaglineValidationErrors([
      tagline({ text: 'Notizen &amp; Gedanken' }),
    ]);
    expect(errors.some((message) => message.includes('HTML entity'))).toBe(
      true,
    );
  });

  it('accepts a literal ampersand in text', () => {
    const errors = getTaglineValidationErrors([
      tagline({ text: 'Notizen & Gedanken' }),
    ]);
    expect(errors).toEqual([]);
  });

  it('rejects HTML entities in note and source.note', () => {
    const noteErrors = getTaglineValidationErrors([
      tagline({ note: 'Ersetzt &nbsp;durch Leerzeichen' }),
    ]);
    expect(noteErrors.some((message) => message.includes('.note'))).toBe(true);

    const sourceNoteErrors = getTaglineValidationErrors([
      tagline({
        source: { note: 'Kopiert aus &quot;Archiv&quot;', type: 'memory' },
      }),
    ]);
    expect(
      sourceNoteErrors.some((message) => message.includes('source.note')),
    ).toBe(true);
  });

  it('rejects invalid dates', () => {
    const errors = getTaglineValidationErrors([
      tagline({ from: '2019-02-30' }),
    ]);
    expect(errors.some((message) => message.includes('not a valid'))).toBe(
      true,
    );
  });

  it('rejects duplicate known start dates', () => {
    const errors = getTaglineValidationErrors([
      tagline({ from: '2010-01-01' }),
      tagline({ from: '2010-01-01' }),
    ]);
    expect(errors.some((message) => message.includes('duplicates'))).toBe(true);
  });

  it('requires from to be null when precision is unknown', () => {
    const errors = getTaglineValidationErrors([
      tagline({ from: '2010-01-01', precision: 'unknown' }),
    ]);
    expect(errors.some((message) => message.includes('must be null'))).toBe(
      true,
    );
  });

  it('accepts an undated entry with unknown precision', () => {
    const errors = getTaglineValidationErrors([
      tagline({ from: null, precision: 'unknown' }),
    ]);
    expect(errors).toEqual([]);
  });
});

describe('sortTaglines', () => {
  it('sorts entries chronologically, oldest first, with unknown dates first', () => {
    const sorted = sortTaglines([
      tagline({ from: '2019-07-04', text: 'newest' }),
      tagline({ from: null, precision: 'unknown', text: 'undated' }),
      tagline({ from: '2007-04-01', text: 'oldest known' }),
    ]);

    expect(sorted.map((entry) => entry.text)).toEqual([
      'undated',
      'oldest known',
      'newest',
    ]);
  });
});

describe('deriveCurrentTagline', () => {
  it('selects the newest known tagline as current', () => {
    const current = deriveCurrentTagline([
      tagline({ from: '2007-04-01', text: 'oldest' }),
      tagline({ from: '2019-07-04', text: 'newest' }),
      tagline({ from: '2012-09-14', text: 'middle' }),
    ]);

    expect(current.text).toBe('newest');
  });

  it('treats an undated entry as older than every known date', () => {
    const current = deriveCurrentTagline([
      tagline({ from: null, precision: 'unknown', text: 'undated' }),
      tagline({ from: '2019-07-04', text: 'newest' }),
    ]);

    expect(current.text).toBe('newest');
  });
});

describe('buildTaglineTimeline', () => {
  it('derives the previous entry end date from the next start date (day precision)', () => {
    const timeline = buildTaglineTimeline([
      tagline({ from: '2007-04-01', text: 'first' }),
      tagline({ from: '2012-09-14', text: 'second' }),
      tagline({ from: '2019-07-04', text: 'third' }),
    ]);

    const byText = Object.fromEntries(
      timeline.map((entry) => [entry.text, entry]),
    );

    expect(byText['first']?.displayPeriod).toBe(
      '1. April 2007 - 13. September 2012',
    );
    expect(byText['second']?.displayPeriod).toBe(
      '14. September 2012 - 3. Juli 2019',
    );
    expect(byText['third']?.displayPeriod).toBe('seit 4. Juli 2019');
    expect(byText['third']?.isCurrent).toBe(true);
  });

  it('is ordered newest first', () => {
    const timeline = buildTaglineTimeline([
      tagline({ from: '2007-04-01', text: 'first' }),
      tagline({ from: '2019-07-04', text: 'second' }),
    ]);

    expect(timeline.map((entry) => entry.text)).toEqual(['second', 'first']);
  });

  it('handles month precision', () => {
    const timeline = buildTaglineTimeline([
      tagline({ from: '2008-06-01', precision: 'month', text: 'monthly' }),
      tagline({ from: '2019-07-04', text: 'current' }),
    ]);

    const monthly = timeline.find((entry) => entry.text === 'monthly');
    expect(monthly?.displayDate).toBe('Juni 2008');
  });

  it('handles year precision', () => {
    const timeline = buildTaglineTimeline([
      tagline({ from: '2008-01-01', precision: 'year', text: 'yearly' }),
      tagline({ from: '2019-07-04', text: 'current' }),
    ]);

    const yearly = timeline.find((entry) => entry.text === 'yearly');
    expect(yearly?.displayDate).toBe('ca. 2008');
  });

  it('handles an unknown oldest entry', () => {
    const timeline = buildTaglineTimeline([
      tagline({ from: null, precision: 'unknown', text: 'oldest' }),
      tagline({ from: '2019-07-04', text: 'current' }),
    ]);

    const oldest = timeline.find((entry) => entry.text === 'oldest');
    expect(oldest?.displayDate).toBe('Datum noch unbekannt');
    expect(oldest?.displayPeriod).toBe('davor');
    expect(oldest?.isCurrent).toBe(false);
  });
});
