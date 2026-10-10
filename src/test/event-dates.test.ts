import { describe, expect, it } from 'vitest';
import { collections } from '../content.config';
import { groupEventsByYear } from '../utils/taxonomies/event-dates';

const schema = collections.ereignisse.schema;
if (!schema || typeof schema === 'function') {
  throw new Error('Expected a direct event frontmatter schema.');
}

describe('event calendar dates', () => {
  it('preserves date-only strings, including leap days and equal endpoints', () => {
    const result = schema.parse({
      endDate: '2024-02-29',
      startDate: '2024-02-29',
      title: 'Test',
    });
    expect(result.startDate).toBe('2024-02-29');
    expect(result.endDate).toBe('2024-02-29');
  });

  it.each([
    '2023-02-29',
    '2024-04-31',
    '2024-13-01',
    '2024-01-00',
    '2024-1-01',
    '2024',
    '2024-02',
    '2024-02-29T00:00:00+07:00',
    new Date('2024-02-29'),
    2024,
    null,
  ])('rejects non-calendar-date input %s for either field', (value) => {
    for (const field of ['startDate', 'endDate']) {
      expect(schema.safeParse({ [field]: value, title: 'Test' }).success).toBe(
        false,
      );
    }
  });

  it('allows undated entries and an end date without a start date', () => {
    expect(schema.safeParse({ title: 'Test' }).success).toBe(true);
    expect(
      schema.safeParse({ endDate: '2024-01-01', title: 'Test' }).success,
    ).toBe(true);
  });

  it('rejects an end date before the start, including across years', () => {
    expect(
      schema.safeParse({
        endDate: '2023-12-31',
        startDate: '2024-01-01',
        title: 'Test',
      }).success,
    ).toBe(false);
  });
});

describe('event archive years', () => {
  it('groups by the start year, orders dates descending, and keeps undated events last', () => {
    const entries = [
      { data: { title: 'Zebra' }, id: 'undated-z' },
      { data: { startDate: '2020-01-01', title: 'Early' }, id: 'early' },
      { data: { startDate: '2024-02-29', title: 'Zebra' }, id: 'same-z' },
      { data: { endDate: '2025-01-01', title: 'Alpha' }, id: 'undated-a-2025' },
      { data: { startDate: '2024-02-29', title: 'Alpha' }, id: 'same-a' },
      { data: { startDate: '2024-12-31', title: 'Late' }, id: 'late' },
      { data: { startDate: '2024-02-29', title: 'Alpha' }, id: 'same-a-2' },
    ];
    const originalOrder = entries.map((entry) => entry.id);
    const groups = groupEventsByYear(entries);
    expect(groups.map((group) => group.year)).toEqual(['2024', '2020', null]);
    expect(
      groups.map((group) => group.events.map((event) => event.id)),
    ).toEqual([
      ['late', 'same-a', 'same-a-2', 'same-z'],
      ['early'],
      ['undated-a-2025', 'undated-z'],
    ]);
    expect(entries.map((entry) => entry.id)).toEqual(originalOrder);
  });

  it('handles an empty archive', () => {
    expect(groupEventsByYear([])).toEqual([]);
  });
});
