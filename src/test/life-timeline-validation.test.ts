import type { LifeTimelineEntry } from '@config/life-timeline';
import { getLifeTimelineValidationErrors } from '@utils/life-timeline-validation';
import { describe, expect, it } from 'vitest';

const knownPointSlugs = new Set(['origin', 'destination']);
const baseContext = { currentYear: 2026, knownPointSlugs, startYear: 1974 };

function entry(overrides: Partial<LifeTimelineEntry>): LifeTimelineEntry {
  return {
    description: 'Ein Beispieltext.',
    locations: [{ point: 'origin' }],
    year: 2000,
    ...overrides,
  };
}

describe('life-timeline validation', () => {
  it('accepts a well-formed entry', () => {
    expect(getLifeTimelineValidationErrors([entry({})], baseContext)).toEqual(
      [],
    );
  });

  it('rejects years before the configured start year', () => {
    const errors = getLifeTimelineValidationErrors(
      [entry({ year: 1970 })],
      baseContext,
    );
    expect(errors.some((message) => message.includes('before 1974'))).toBe(
      true,
    );
  });

  it('rejects years after the current year unless explicitly allowed', () => {
    const errors = getLifeTimelineValidationErrors(
      [entry({ year: 2030 })],
      baseContext,
    );
    expect(
      errors.some((message) => message.includes('after the current year')),
    ).toBe(true);

    expect(
      getLifeTimelineValidationErrors(
        [entry({ allowFutureYear: true, year: 2030 })],
        baseContext,
      ),
    ).toEqual([]);
  });

  it('rejects an endYear before year', () => {
    const errors = getLifeTimelineValidationErrors(
      [entry({ endYear: 1990, year: 2000 })],
      baseContext,
    );
    expect(errors.some((message) => message.includes('endYear'))).toBe(true);
  });

  it('rejects entries with missing locations', () => {
    const errors = getLifeTimelineValidationErrors(
      [entry({ locations: [] })],
      baseContext,
    );
    expect(
      errors.some((message) => message.includes('at least one entry')),
    ).toBe(true);
  });

  it('rejects unknown map-point slugs', () => {
    const errors = getLifeTimelineValidationErrors(
      [entry({ locations: [{ point: 'nowhere' }] })],
      baseContext,
    );
    expect(
      errors.some((message) => message.includes('unknown map-point slug')),
    ).toBe(true);
  });

  it('allows multiple one-off moments to share the same year', () => {
    const errors = getLifeTimelineValidationErrors(
      [
        entry({ title: 'Geburt', year: 2000 }),
        entry({ title: 'Taufe', year: 2000 }),
      ],
      baseContext,
    );
    expect(errors).toEqual([]);
  });

  it('allows a one-off moment to sit inside an ongoing period', () => {
    const errors = getLifeTimelineValidationErrors(
      [
        entry({ endYear: 2005, title: 'Schulzeit', year: 2000 }),
        entry({ title: 'Kurzbesuch', year: 2003 }),
      ],
      baseContext,
    );
    expect(errors).toEqual([]);
  });

  it('rejects two period entries claiming the exact same year', () => {
    const errors = getLifeTimelineValidationErrors(
      [
        entry({ endYear: 2005, year: 2000 }),
        entry({ endYear: 2004, year: 2000 }),
      ],
      baseContext,
    );
    expect(errors.some((message) => message.includes('Duplicate'))).toBe(true);
  });

  it('rejects overlapping period ranges', () => {
    const errors = getLifeTimelineValidationErrors(
      [
        entry({ endYear: 2005, year: 2000 }),
        entry({ endYear: 2008, year: 2003 }),
      ],
      baseContext,
    );
    expect(errors.some((message) => message.includes('overlap'))).toBe(true);
  });

  it('rejects negative durations', () => {
    const errors = getLifeTimelineValidationErrors(
      [entry({ duration: -100 })],
      baseContext,
    );
    expect(errors.some((message) => message.includes('"duration"'))).toBe(true);
  });

  it('rejects out-of-range camera zoom', () => {
    const errors = getLifeTimelineValidationErrors(
      [entry({ camera: { zoom: 999 } })],
      baseContext,
    );
    expect(errors.some((message) => message.includes('camera.zoom'))).toBe(
      true,
    );
  });

  it('rejects a journey route with identical origin and destination', () => {
    const errors = getLifeTimelineValidationErrors(
      [
        entry({
          transition: {
            route: { from: 'origin', to: 'origin', transport: 'plane' },
            type: 'journey',
          },
        }),
      ],
      baseContext,
    );
    expect(
      errors.some((message) =>
        message.includes('must not be the same map point'),
      ),
    ).toBe(true);
  });

  it('rejects a journey route referencing an unknown map point', () => {
    const errors = getLifeTimelineValidationErrors(
      [
        entry({
          transition: {
            route: { from: 'origin', to: 'nowhere', transport: 'plane' },
            type: 'journey',
          },
        }),
      ],
      baseContext,
    );
    expect(errors.some((message) => message.includes('route.to'))).toBe(true);
  });

  it('rejects entries with no usable content', () => {
    const contentlessEntry: LifeTimelineEntry = {
      locations: [{ point: 'origin' }],
      year: 2000,
    };
    const errors = getLifeTimelineValidationErrors(
      [contentlessEntry],
      baseContext,
    );
    expect(
      errors.some((message) => message.includes('no usable content')),
    ).toBe(true);
  });

  it('rejects an image without alt text', () => {
    const errors = getLifeTimelineValidationErrors(
      [entry({ image: '/assets/timeline/1975-geburt.jpg' })],
      baseContext,
    );
    expect(errors.some((message) => message.includes('imageAlt'))).toBe(true);
  });

  it('accepts an image with alt text', () => {
    const errors = getLifeTimelineValidationErrors(
      [
        entry({
          image: '/assets/timeline/1975-geburt.jpg',
          imageAlt: 'Schwarzweißfoto von 1975',
        }),
      ],
      baseContext,
    );
    expect(errors).toEqual([]);
  });
});
