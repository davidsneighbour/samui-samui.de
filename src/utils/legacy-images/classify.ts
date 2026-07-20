import type { LegacyImageConfig, LegacyImagePresentationMode } from './config';

export interface ClassifyImageInput {
  intrinsicWidth: number;
  intrinsicHeight: number;
  /** The width the image is expected to render at, e.g. the post content column. */
  expectedRenderedWidth: number;
  /**
   * Combined override, already resolved from per-image > frontmatter >
   * "auto" precedence by the caller. "always" forces the general blurred
   * treatment (`legacy`); "never" forces `standard`. `thumbnail` is never
   * produced by an override, only by automatic classification of very small
   * sources.
   */
  override?: 'auto' | 'always' | 'never' | undefined;
}

export function classifyImagePresentation(
  input: ClassifyImageInput,
  config: LegacyImageConfig,
): LegacyImagePresentationMode {
  if (input.override === 'never') return 'standard';
  if (input.override === 'always') return 'legacy';

  const { intrinsicWidth, expectedRenderedWidth } = input;

  if (intrinsicWidth <= config.thumbnailMaximumWidth) return 'thumbnail';

  if (
    intrinsicWidth < config.minimumUsefulWidth ||
    intrinsicWidth < expectedRenderedWidth * config.minimumSourceRatio
  ) {
    return 'legacy';
  }

  return 'standard';
}

/**
 * Resolves the three-state override chain: a per-image override wins over a
 * post-level frontmatter override, which wins over "auto" (no forced mode).
 */
export function resolveOverride(
  perImage: 'auto' | 'always' | 'never' | undefined,
  postLevel: 'auto' | 'always' | 'never' | undefined,
): 'auto' | 'always' | 'never' {
  if (perImage && perImage !== 'auto') return perImage;
  if (postLevel && postLevel !== 'auto') return postLevel;
  return 'auto';
}

/** The maximum on-screen width the foreground image may occupy in legacy mode. */
export function foregroundMaxWidth(
  intrinsicWidth: number,
  config: LegacyImageConfig,
): number {
  return Math.round(intrinsicWidth * config.maximumForegroundUpscale);
}

/** The maximum on-screen height the foreground image may occupy in legacy mode. */
export function foregroundMaxHeight(
  intrinsicHeight: number,
  config: LegacyImageConfig,
): number {
  return Math.round(intrinsicHeight * config.maximumForegroundUpscale);
}
