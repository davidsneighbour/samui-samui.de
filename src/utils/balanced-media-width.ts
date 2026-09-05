// Pure search logic for BlogList.astro's balanced-media-width feature
// (documentation/components/blog-list-previews.md). Kept free of DOM access
// so it can be unit tested with a synthetic `measure` callback -- the real
// callback (src/scripts/balanced-media.ts) writes the candidate width to a
// CSS custom property and reads back the resulting media/content heights.

export interface BalanceMeasurement {
  contentHeightPx: number;
  mediaHeightPx: number;
}

export interface BalanceSearchOptions {
  /** Highest ratio (fraction of row width) considered for the media column. */
  maxRatio?: number;
  /** How many candidate widths to measure before giving up. */
  maxIterations?: number;
  /** Lowest ratio (fraction of row width) considered for the media column. */
  minRatio?: number;
  /** Height difference, in px, treated as "balanced enough" to stop early. */
  toleranceHeightPx?: number;
}

export interface BalanceSearchResult {
  heightDifferencePx: number;
  iterations: number;
  ratio: number;
}

const DEFAULT_MIN_RATIO = 1 / 3;
const DEFAULT_MAX_RATIO = 1 / 2;
const DEFAULT_TOLERANCE_HEIGHT_PX = 8;
const DEFAULT_MAX_ITERATIONS = 6;

/**
 * Searches the media-column width ratio between `minRatio` and `maxRatio`
 * for the value that comes closest to equal media/content heights, calling
 * `measure(ratio)` at each candidate.
 *
 * This samples `maxIterations` evenly spaced ratios across the range rather
 * than bisecting on the sign of `mediaHeight - contentHeight`. A sign-based
 * bisection assumes widening the media column always narrows the height
 * gap whenever media is currently shorter than content -- true when content
 * height is flat or shrinks as its column narrows, but false for a long
 * excerpt whose height grows *faster* than the media as the text column
 * narrows and wraps more. In that case a sign-based search converges on the
 * wrong bound (widest instead of narrowest). An evenly spaced sweep costs no
 * extra measurements for the common case, stays within the same bounded
 * iteration budget, and finds the true minimum regardless of which
 * direction the gap trends in.
 */
export function findBalancedMediaWidthRatio(
  measure: (ratio: number) => BalanceMeasurement,
  options: BalanceSearchOptions = {},
): BalanceSearchResult {
  const {
    maxRatio = DEFAULT_MAX_RATIO,
    maxIterations = DEFAULT_MAX_ITERATIONS,
    minRatio = DEFAULT_MIN_RATIO,
    toleranceHeightPx = DEFAULT_TOLERANCE_HEIGHT_PX,
  } = options;

  const sampleCount = Math.max(2, maxIterations);
  let best: BalanceSearchResult = {
    heightDifferencePx: Number.POSITIVE_INFINITY,
    iterations: 0,
    ratio: minRatio,
  };

  for (let index = 0; index < sampleCount; index += 1) {
    const ratio =
      minRatio + ((maxRatio - minRatio) * index) / (sampleCount - 1);
    const { contentHeightPx, mediaHeightPx } = measure(ratio);
    const heightDifferencePx = Math.abs(mediaHeightPx - contentHeightPx);

    if (heightDifferencePx < best.heightDifferencePx) {
      best = { heightDifferencePx, iterations: index + 1, ratio };
    }

    if (heightDifferencePx <= toleranceHeightPx) {
      return best;
    }
  }

  return best;
}
