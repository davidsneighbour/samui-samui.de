import {
  bearingBetween,
  computeBounds,
  computeJourneyCurve,
  pointAlongCurve,
} from '@components/features/life-timeline/geo';
import { describe, expect, it } from 'vitest';

describe('computeJourneyCurve', () => {
  it('starts at the origin and ends at the destination', () => {
    const from = { lat: 10, lng: 100 };
    const to = { lat: 9, lng: 99 };
    const points = computeJourneyCurve(from, to, 0.3);

    expect(points[0]).toEqual(from);
    expect(points.at(-1)).toEqual(to);
  });

  it('bows away from a straight line when curve is non-zero', () => {
    const from = { lat: 0, lng: 0 };
    const to = { lat: 0, lng: 10 };
    const straight = computeJourneyCurve(from, to, 0);
    const curved = computeJourneyCurve(from, to, 0.4);
    const midStraight = straight[Math.floor(straight.length / 2)];
    const midCurved = curved[Math.floor(curved.length / 2)];

    expect(midStraight?.lat).toBeCloseTo(0);
    expect(Math.abs(midCurved?.lat ?? 0)).toBeGreaterThan(0.1);
  });
});

describe('pointAlongCurve', () => {
  it('returns the start and end points at progress 0 and 1', () => {
    const points = computeJourneyCurve(
      { lat: 0, lng: 0 },
      { lat: 0, lng: 10 },
      0,
    );
    expect(pointAlongCurve(points, 0).position).toEqual(points[0]);
    expect(pointAlongCurve(points, 1).position).toEqual(points.at(-1));
  });

  it('clamps progress outside the 0–1 range', () => {
    const points = computeJourneyCurve(
      { lat: 0, lng: 0 },
      { lat: 0, lng: 10 },
      0,
    );
    expect(pointAlongCurve(points, -1).position).toEqual(points[0]);
    expect(pointAlongCurve(points, 2).position).toEqual(points.at(-1));
  });
});

describe('bearingBetween', () => {
  it('reports due east as 90 degrees', () => {
    expect(bearingBetween({ lat: 0, lng: 0 }, { lat: 0, lng: 10 })).toBeCloseTo(
      90,
      0,
    );
  });

  it('reports due north as 0 degrees', () => {
    expect(bearingBetween({ lat: 0, lng: 0 }, { lat: 10, lng: 0 })).toBeCloseTo(
      0,
      0,
    );
  });
});

describe('computeBounds', () => {
  it('returns the min/max envelope of the given points', () => {
    const bounds = computeBounds([
      { lat: 9, lng: 100 },
      { lat: 51, lng: 13 },
    ]);
    expect(bounds).toEqual([
      [13, 9],
      [100, 51],
    ]);
  });
});
