import { findBalancedMediaWidthRatio } from '@utils/balanced-media-width';
import { describe, expect, it } from 'vitest';

// Models a card at a fixed row width where media height is exactly
// proportional to its ratio (fixed aspect ratio) and content height is
// looked up from a step function keyed by ratio, mimicking discrete text
// reflow. `contentHeightAt` only needs entries at the ratios the bisection
// will actually visit for the given min/max bounds.
function measurerFor(
  rowWidthPx: number,
  mediaAspectHeightPerWidth: number,
  contentHeightAt: (ratio: number) => number,
) {
  const calls: number[] = [];
  const measure = (ratio: number) => {
    calls.push(ratio);
    return {
      contentHeightPx: contentHeightAt(ratio),
      mediaHeightPx: rowWidthPx * ratio * mediaAspectHeightPerWidth,
    };
  };
  return { calls, measure };
}

describe('findBalancedMediaWidthRatio', () => {
  it('stays near one-third when already balanced at the minimum ratio', () => {
    // 16:9 video in a 900px row: at ratio 1/3 media height ~= 168.75px.
    // Content height barely changes with width here, so anything wider than
    // 1/3 immediately overshoots.
    const { calls, measure } = measurerFor(900, 9 / 16, () => 169);

    const result = findBalancedMediaWidthRatio(measure);

    expect(result.ratio).toBeCloseTo(1 / 3, 1);
    expect(result.heightDifferencePx).toBeLessThanOrEqual(8);
    expect(calls.length).toBeLessThanOrEqual(6);
  });

  it('finds a solution strictly between one-third and one-half', () => {
    // Content height shrinks steadily as the media column (and therefore
    // its own content column) grows, crossing the media-height line exactly
    // at ratio 0.4 (one of the evenly spaced default samples).
    const { measure } = measurerFor(
      900,
      9 / 16,
      (ratio) => 402.5 - ratio * 500,
    );

    const result = findBalancedMediaWidthRatio(measure);

    expect(result.ratio).toBeGreaterThan(1 / 3);
    expect(result.ratio).toBeLessThan(1 / 2);
    expect(result.heightDifferencePx).toBeLessThanOrEqual(8);
  });

  it('chooses the one-half boundary when no balance point exists below it', () => {
    // Content stays far taller than media across the whole allowed range.
    const { measure } = measurerFor(900, 9 / 16, () => 900);

    const result = findBalancedMediaWidthRatio(measure);

    expect(result.ratio).toBeCloseTo(1 / 2, 1);
  });

  it('remains at/near one-third for long content', () => {
    // Long content: narrowing the text column (by widening the media) makes
    // it wrap more and grow taller, while media height barely catches up --
    // so content stays far taller than media across the whole allowed
    // range, and the closest approach to balance is at the narrowest
    // (one-third) media width.
    const { measure } = measurerFor(900, 9 / 16, (ratio) => 2000 + ratio * 800);

    const result = findBalancedMediaWidthRatio(measure);

    expect(result.ratio).toBeCloseTo(1 / 3, 1);
  });

  it('never calls measure more than maxIterations times', () => {
    const { calls, measure } = measurerFor(
      900,
      9 / 16,
      (ratio) => 600 - ratio * 800,
    );

    findBalancedMediaWidthRatio(measure, { maxIterations: 3 });

    expect(calls.length).toBeLessThanOrEqual(3);
  });

  it('stops as soon as the difference is within tolerance', () => {
    let calls = 0;
    const measure = () => {
      calls += 1;
      // First candidate ratio (the midpoint, 0.4166...) already balances.
      return { contentHeightPx: 500, mediaHeightPx: 500 };
    };

    const result = findBalancedMediaWidthRatio(measure, {
      toleranceHeightPx: 8,
    });

    expect(calls).toBe(1);
    expect(result.heightDifferencePx).toBe(0);
  });
});
