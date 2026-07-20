import {
  classifyImagePresentation,
  foregroundMaxHeight,
  foregroundMaxWidth,
  resolveOverride,
} from '@utils/legacy-images/classify';
import { defaultLegacyImageConfig } from '@utils/legacy-images/config';
import { describe, expect, it } from 'vitest';

const config = defaultLegacyImageConfig;

describe('classifyImagePresentation', () => {
  it('classifies a source with sufficient intrinsic dimensions as standard', () => {
    expect(
      classifyImagePresentation(
        {
          expectedRenderedWidth: 720,
          intrinsicHeight: 800,
          intrinsicWidth: 1200,
        },
        config,
      ),
    ).toBe('standard');
  });

  it('classifies a source narrower than minimumUsefulWidth as legacy', () => {
    expect(
      classifyImagePresentation(
        {
          expectedRenderedWidth: 720,
          intrinsicHeight: 315,
          intrinsicWidth: 420,
        },
        config,
      ),
    ).toBe('legacy');
  });

  it('classifies a source narrower than expectedRenderedWidth * minimumSourceRatio as legacy even above minimumUsefulWidth', () => {
    // 750 >= minimumUsefulWidth (720), but < 1000 * 0.8 (800)
    expect(
      classifyImagePresentation(
        {
          expectedRenderedWidth: 1000,
          intrinsicHeight: 500,
          intrinsicWidth: 750,
        },
        config,
      ),
    ).toBe('legacy');
  });

  it('classifies an extremely small source as thumbnail regardless of expected rendered width', () => {
    expect(
      classifyImagePresentation(
        {
          expectedRenderedWidth: 720,
          intrinsicHeight: 75,
          intrinsicWidth: 100,
        },
        config,
      ),
    ).toBe('thumbnail');
  });

  it('respects portrait sources on their own terms (no landscape/portrait mixup)', () => {
    // Portrait 400x1200: width alone is under minimumUsefulWidth (720) but
    // above thumbnailMaximumWidth (320), so it's legacy, not thumbnail --
    // classification is width-driven regardless of the tall aspect ratio.
    expect(
      classifyImagePresentation(
        {
          expectedRenderedWidth: 720,
          intrinsicHeight: 1200,
          intrinsicWidth: 400,
        },
        config,
      ),
    ).toBe('legacy');
  });

  it('forces legacy when override is "always", even for an otherwise-standard source', () => {
    expect(
      classifyImagePresentation(
        {
          expectedRenderedWidth: 720,
          intrinsicHeight: 800,
          intrinsicWidth: 1200,
          override: 'always',
        },
        config,
      ),
    ).toBe('legacy');
  });

  it('forces standard when override is "never", even for a tiny source', () => {
    expect(
      classifyImagePresentation(
        {
          expectedRenderedWidth: 720,
          intrinsicHeight: 75,
          intrinsicWidth: 100,
          override: 'never',
        },
        config,
      ),
    ).toBe('standard');
  });
});

describe('resolveOverride', () => {
  it('prefers the per-image override over the post-level override', () => {
    expect(resolveOverride('always', 'never')).toBe('always');
  });

  it('falls back to the post-level override when the per-image override is "auto" or unset', () => {
    expect(resolveOverride('auto', 'never')).toBe('never');
    expect(resolveOverride(undefined, 'always')).toBe('always');
  });

  it('resolves to "auto" when neither override is set', () => {
    expect(resolveOverride(undefined, undefined)).toBe('auto');
    expect(resolveOverride('auto', 'auto')).toBe('auto');
  });
});

describe('foregroundMaxWidth / foregroundMaxHeight', () => {
  it('never upscales beyond the configured factor (1x by default)', () => {
    expect(foregroundMaxWidth(420, config)).toBe(420);
    expect(foregroundMaxHeight(315, config)).toBe(315);
  });

  it('scales with a custom maximumForegroundUpscale', () => {
    const upscaledConfig = { ...config, maximumForegroundUpscale: 1.5 };
    expect(foregroundMaxWidth(420, upscaledConfig)).toBe(630);
    expect(foregroundMaxHeight(315, upscaledConfig)).toBe(473);
  });
});
