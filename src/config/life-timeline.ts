// Shared types and tunable defaults for the /timeline/ life-timeline map.
// Keep this file limited to the data contract and timing/camera defaults —
// component mechanics (state machine, MapLibre wiring) live under
// src/components/features/life-timeline/. See documentation/features/life-timeline.md
// for the full schema writeup and editing guide.

export type LifeTimelineLocationRole =
  | 'primary'
  | 'previous'
  | 'destination'
  | 'context';

export interface LifeTimelineLocation {
  /** Slug into src/data/map-points.json. Coordinates are never duplicated here. */
  point: string;
  label?: string;
  role?: LifeTimelineLocationRole;
}

export interface LifeTimelineCameraPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface LifeTimelineCamera {
  zoom?: number;
  pitch?: number;
  bearing?: number;
  padding?: LifeTimelineCameraPadding;
}

export type LifeTimelineTransitionType =
  | 'jump'
  | 'fly'
  | 'multi-location'
  | 'journey';

export interface LifeTimelineJourney {
  /** Map-point slug the journey departs from. */
  from: string;
  /** Map-point slug the journey arrives at. */
  to: string;
  transport: 'plane';
  /** 0 = straight line, higher values arc the route further off the great circle. */
  curve?: number;
  duration?: number;
  lineStyle?: 'solid' | 'dashed';
  followVehicle?: boolean;
}

export interface LifeTimelineTransition {
  type?: LifeTimelineTransitionType;
  showPreviousLocation?: boolean;
  route?: LifeTimelineJourney;
}

export interface LifeTimelineEntry {
  /**
   * The calendar year this entry belongs to. Multiple entries MAY share the
   * same `year` — each becomes its own step in the story, played in the
   * order they appear in the data file (e.g. two separate 1975 moments: a
   * birth and, later that year, a naming/christening ceremony). Only
   * "period" entries (those setting `endYear` or `currentLocation`) may not
   * share or overlap a year range with another period entry.
   */
  year: number;
  /**
   * Optional period end year (inclusive). When set, this entry's title,
   * description, and camera stay active for every year from `year` through
   * `endYear` instead of only the single authored year. A one-off moment
   * that shares its year with other entries should leave this unset.
   */
  endYear?: number;
  title?: string;
  description?: string;
  /** Path to a representative photo for this moment. Required alongside `imageAlt`. */
  image?: string;
  /** Accessible alt text for `image`. Validated as required whenever `image` is set. */
  imageAlt?: string;
  locations: LifeTimelineLocation[];
  /** How long this entry stays on screen during auto playback, in ms. */
  duration?: number;
  /** Camera transition duration when arriving at this entry, in ms. */
  transitionDuration?: number;
  /** Extra pause after the transition settles, before advancing, in ms. */
  pauseAfterTransition?: number;
  camera?: LifeTimelineCamera;
  transition?: LifeTimelineTransition;
  /**
   * Marks this entry as the present-day finale. Its period is implicitly
   * open-ended: it keeps applying through whatever the current year is at
   * render time, regardless of `endYear`, so the data file never needs a
   * yearly edit just to keep pace with the calendar.
   */
  currentLocation?: boolean;
  /** Escape hatch for deliberately authoring a not-yet-reached year. */
  allowFutureYear?: boolean;
}

export const LIFE_TIMELINE_CONFIG = {
  cityZoom: 11,
  countryZoom: 6,
  /** ms an authored entry holds on screen before advancing, when unset. */
  defaultEntryDuration: 2400,
  /** ms for the special 2005 plane journey, when unset. */
  defaultJourneyDuration: 5200,
  /** ms paused after a transition settles, when unset. */
  defaultPauseAfterTransition: 400,
  /** ms for a camera transition when unset. */
  defaultTransitionDuration: 1600,
  /** ms per year advanced during auto playback for years with no authored entry. */
  defaultYearDuration: 900,
  /** ms paused on the opening 1974 view before auto playback starts. */
  introPauseDuration: 900,
  maxZoom: 18,
  minZoom: 0,
  multiLocationPadding: {
    bottom: 176,
    left: 64,
    right: 64,
    top: 96,
  },
  reducedMotionJourneyDuration: 400,
  reducedMotionPauseAfterTransition: 150,
  /** Reduced-motion overrides: short, not instantaneous, so context is still visible. */
  reducedMotionTransitionDuration: 250,
  regionZoom: 4,
  startYear: 1974,
  /** Lowest zoom used for the initial full-world view, tuned for narrow mobile viewports. */
  worldZoom: 0.55,
} as const;
