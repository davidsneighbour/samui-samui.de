// The legacy/thumbnail canvas is always as wide as its container (the
// blurred background fills that width), but its *height* tracks the
// foreground image's own display height plus a fixed margin -- not an
// aspect-ratio derived from the container width. Deriving height from
// container-width/ratio badly over-stretches small landscape scans (a
// 4:3 photo in an 864px-wide column produces a 648px-tall canvas) and is
// even worse for portrait sources. A fixed pixel height is also more
// exact for CLS purposes than `aspect-ratio`, since it doesn't depend on
// the element's rendered width being known first.
export const LEGACY_IMAGE_FRAME_VERTICAL_PADDING = 32;

// Safety ceiling (relative to the content column width) so a corrupt or
// unusually tall/narrow source can't produce a pathologically tall canvas.
const MAX_FRAME_HEIGHT_RATIO = 1.5;

/** Canvas height, in pixels: the foreground's display height plus vertical padding, capped relative to the column it renders in. */
export function computeFrameHeight(
  foregroundHeight: number,
  expectedRenderedWidth: number,
): number {
  const padded = foregroundHeight + LEGACY_IMAGE_FRAME_VERTICAL_PADDING * 2;
  return Math.round(
    Math.min(padded, expectedRenderedWidth * MAX_FRAME_HEIGHT_RATIO),
  );
}

export const LEGACY_IMAGE_FRAME_CLASS = 'legacy-image-frame';
export const LEGACY_IMAGE_FRAME_THUMBNAIL_CLASS =
  'legacy-image-frame--thumbnail';
export const LEGACY_IMAGE_BG_CLASS = 'legacy-image-bg';
export const LEGACY_IMAGE_SCRIM_CLASS = 'legacy-image-scrim';
export const LEGACY_IMAGE_FG_CLASS = 'legacy-image-fg';
