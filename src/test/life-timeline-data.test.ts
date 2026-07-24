import type { LifeTimelineEntry } from '@config/life-timeline';
import {
  buildLifeTimelineYears,
  getLifeTimelineCurrentYear,
  getLifeTimelineYears,
  lifeTimelineEntries,
} from '@data/life-timeline';
import { describe, expect, it } from 'vitest';

const ORIGIN = 'todo-birthplace';
const DESTINATION = 'dnb-hq';

describe('buildLifeTimelineYears', () => {
  it('generates one resolved year per calendar year through the given current year', () => {
    const years = buildLifeTimelineYears(
      [{ locations: [{ point: ORIGIN }], year: 1974 }],
      2000,
    );
    expect(years).toHaveLength(2000 - 1974 + 1);
    expect(years[0]?.year).toBe(1974);
    expect(years.at(-1)?.year).toBe(2000);
  });

  it('lets a gap year inherit the most recent active location with no title/description', () => {
    const entries: LifeTimelineEntry[] = [
      { locations: [{ point: ORIGIN }], title: 'A', year: 1980 },
      { locations: [{ point: DESTINATION }], title: 'B', year: 1990 },
    ];
    const years = buildLifeTimelineYears(entries, 1995);
    const gapYear = years.find((year) => year.year === 1985);

    expect(gapYear?.locations[0]?.point).toBe(ORIGIN);
    expect(gapYear?.title).toBeUndefined();
    expect(gapYear?.description).toBeUndefined();
  });

  it('keeps a period entry active from year through endYear, then drops its text', () => {
    const entries: LifeTimelineEntry[] = [
      {
        description: 'Kindheitsjahre',
        endYear: 1985,
        locations: [{ point: ORIGIN }],
        title: 'Kindheit',
        year: 1980,
      },
    ];
    const years = buildLifeTimelineYears(entries, 1990);

    expect(years.find((year) => year.year === 1980)?.title).toBe('Kindheit');
    expect(years.find((year) => year.year === 1985)?.title).toBe('Kindheit');
    expect(years.find((year) => year.year === 1986)?.title).toBeUndefined();
    // Location keeps carrying forward even after the period's text ends.
    expect(years.find((year) => year.year === 1986)?.locations[0]?.point).toBe(
      ORIGIN,
    );
  });

  it('extends a currentLocation entry through the dynamic current year regardless of endYear', () => {
    const entries: LifeTimelineEntry[] = [
      {
        currentLocation: true,
        description: 'Angekommen',
        locations: [{ point: DESTINATION }],
        title: 'Umzug',
        year: 2005,
      },
    ];
    const years = buildLifeTimelineYears(entries, 2030);
    const finalYear = years.at(-1);

    expect(finalYear?.year).toBe(2030);
    expect(finalYear?.currentLocation).toBe(true);
    expect(finalYear?.title).toBe('Umzug');
    // Only the very last year is flagged as the finale.
    expect(years.find((year) => year.year === 2020)?.currentLocation).toBe(
      false,
    );
  });

  it('only holds the slow authored-entry pace on the anchor year, not the years it keeps applying to', () => {
    const entries: LifeTimelineEntry[] = [
      {
        currentLocation: true,
        duration: 2600,
        locations: [{ point: DESTINATION }],
        title: 'Umzug',
        year: 2005,
      },
    ];
    const years = buildLifeTimelineYears(entries, 2010);

    expect(years.find((year) => year.year === 2005)?.duration).toBe(2600);
    expect(years.find((year) => year.year === 2006)?.duration).not.toBe(2600);
  });

  it('only flags a transition and locationsChanged on the year the active location actually changes', () => {
    const entries: LifeTimelineEntry[] = [
      { locations: [{ point: ORIGIN }], year: 1974 },
      {
        locations: [{ point: DESTINATION }],
        transition: { type: 'journey' },
        year: 2005,
      },
    ];
    const years = buildLifeTimelineYears(entries, 2006);

    expect(years.find((year) => year.year === 1974)?.locationsChanged).toBe(
      true,
    );
    expect(years.find((year) => year.year === 2004)?.locationsChanged).toBe(
      false,
    );
    expect(years.find((year) => year.year === 2005)?.locationsChanged).toBe(
      true,
    );
    expect(years.find((year) => year.year === 2005)?.transition?.type).toBe(
      'journey',
    );
    expect(
      years.find((year) => year.year === 2006)?.transition,
    ).toBeUndefined();
  });

  it('expands multiple moments sharing a year into that many steps, in file order', () => {
    const entries: LifeTimelineEntry[] = [
      {
        locations: [{ point: ORIGIN }],
        title: 'Geburt',
        year: 1975,
      },
      {
        locations: [{ point: DESTINATION }],
        title: 'Taufe',
        year: 1975,
      },
    ];
    const years = buildLifeTimelineYears(entries, 1980);
    const stepsFor1975 = years.filter((year) => year.year === 1975);

    expect(stepsFor1975).toHaveLength(2);
    expect(stepsFor1975[0]?.title).toBe('Geburt');
    expect(stepsFor1975[0]?.locations[0]?.point).toBe(ORIGIN);
    expect(stepsFor1975[1]?.title).toBe('Taufe');
    expect(stepsFor1975[1]?.locations[0]?.point).toBe(DESTINATION);
    // The second moment's location differs from the first, so it gets its
    // own transition; a later gap year (1976) inherits from the *last*
    // moment of 1975.
    expect(stepsFor1975[1]?.locationsChanged).toBe(true);
    expect(years.find((year) => year.year === 1976)?.locations[0]?.point).toBe(
      DESTINATION,
    );
  });

  it('lets a one-off moment interrupt an ongoing period without losing the period afterward', () => {
    const entries: LifeTimelineEntry[] = [
      {
        endYear: 1998,
        locations: [{ point: ORIGIN }],
        title: 'Schulzeit',
        year: 1992,
      },
      {
        locations: [{ point: DESTINATION }],
        title: 'Kurzbesuch',
        year: 1995,
      },
    ];
    const years = buildLifeTimelineYears(entries, 2000);

    expect(years.find((year) => year.year === 1994)?.title).toBe('Schulzeit');
    expect(years.find((year) => year.year === 1995)?.title).toBe('Kurzbesuch');
    expect(years.find((year) => year.year === 1995)?.locations[0]?.point).toBe(
      DESTINATION,
    );
    // The period resumes on the very next year, even though a moment
    // interrupted it — including snapping the location back.
    expect(years.find((year) => year.year === 1996)?.title).toBe('Schulzeit');
    expect(years.find((year) => year.year === 1996)?.locations[0]?.point).toBe(
      ORIGIN,
    );
  });
});

describe('the real life-timeline dataset', () => {
  it('is valid and spans 1974 through the dynamically computed current year', () => {
    const currentYear = getLifeTimelineCurrentYear();
    const years = getLifeTimelineYears();

    expect(years[0]?.year).toBe(1974);
    expect(years.at(-1)?.year).toBe(currentYear);
    expect(years).toHaveLength(currentYear - 1974 + 1);
  });

  it('reaches the current-location finale on the very last year', () => {
    const years = getLifeTimelineYears();
    expect(years.at(-1)?.currentLocation).toBe(true);
  });

  it('parses every entry from the committed JSON file', () => {
    expect(lifeTimelineEntries.length).toBeGreaterThan(0);
    expect(lifeTimelineEntries[0]?.year).toBe(1974);
  });
});
