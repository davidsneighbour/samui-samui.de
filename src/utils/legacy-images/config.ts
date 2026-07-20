// Central configuration for the legacy-image presentation system. Tune these
// values here rather than hard-coding thresholds at each call site -- see
// documentation/legacy-images.md for what each value controls and why.
export interface LegacyImageConfig {
  /** Below this intrinsic width, treat the source as a plain thumbnail rather than a photograph. */
  thumbnailMaximumWidth: number;
  /** Below this intrinsic width, a source is never "useful" enough for standard presentation. */
  minimumUsefulWidth: number;
  /** A source narrower than `expectedRenderedWidth * minimumSourceRatio` is classified as legacy. */
  minimumSourceRatio: number;
  /** The foreground image in legacy mode is never scaled up beyond `intrinsicWidth * maximumForegroundUpscale`. */
  maximumForegroundUpscale: number;
  /** Width, in pixels, of the generated decorative background derivative. */
  blurDerivativeWidth: number;
  /** CSS blur radius, in pixels, applied to the decorative background. */
  blurRadius: number;
}

// 896px is the widest a post's hero image ever renders (see BlogPost.astro /
// PostCover.astro's default `sizes`); 720px sits comfortably below that as a
// "still fine, no treatment needed" floor without being so low that mid-size
// legacy scans (e.g. 640-wide) slip through as "standard".
export const defaultLegacyImageConfig: LegacyImageConfig = {
  blurDerivativeWidth: 32,
  blurRadius: 24,
  maximumForegroundUpscale: 1,
  minimumSourceRatio: 0.8,
  minimumUsefulWidth: 720,
  thumbnailMaximumWidth: 320,
};

export type LegacyImagePresentationMode = 'standard' | 'legacy' | 'thumbnail';

export type LegacyImageOverride = 'auto' | 'always' | 'never';
