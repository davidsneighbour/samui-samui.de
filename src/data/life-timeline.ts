import {
  LIFE_TIMELINE_CONFIG,
  type LifeTimelineCamera,
  type LifeTimelineCameraPadding,
  type LifeTimelineEntry,
  type LifeTimelineLocation,
  type LifeTimelineTransition,
} from '@config/life-timeline';
import { getMapPointBySlug, mapPoints } from '@data/map-points';
import { POST_TIME_ZONE } from '@utils/dates';
import { getLifeTimelineValidationErrors } from '@utils/life-timeline-validation';
import rawLifeTimeline from './life-timeline.json';

const currentYearFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: POST_TIME_ZONE,
  year: 'numeric',
});

/** The site's subject lives on Koh Samui, so "now" for the timeline finale uses Thailand time, matching the rest of the site's date model. */
export function getLifeTimelineCurrentYear(): number {
  return Number(currentYearFormatter.format(new Date()));
}

function isLocation(value: unknown): value is LifeTimelineLocation {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['point'] === 'string' &&
    (candidate['label'] === undefined ||
      typeof candidate['label'] === 'string') &&
    (candidate['role'] === undefined || typeof candidate['role'] === 'string')
  );
}

function isCameraPadding(value: unknown): value is LifeTimelineCameraPadding {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (['top', 'right', 'bottom', 'left'] as const).every(
    (key) => candidate[key] === undefined || typeof candidate[key] === 'number',
  );
}

function isCamera(value: unknown): value is LifeTimelineCamera {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate['zoom'] === undefined ||
      typeof candidate['zoom'] === 'number') &&
    (candidate['pitch'] === undefined ||
      typeof candidate['pitch'] === 'number') &&
    (candidate['bearing'] === undefined ||
      typeof candidate['bearing'] === 'number') &&
    isCameraPadding(candidate['padding'])
  );
}

function isTransition(value: unknown): value is LifeTimelineTransition {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const route = candidate['route'];
  const routeIsValid =
    route === undefined ||
    (typeof route === 'object' &&
      route !== null &&
      typeof (route as Record<string, unknown>)['from'] === 'string' &&
      typeof (route as Record<string, unknown>)['to'] === 'string' &&
      (route as Record<string, unknown>)['transport'] === 'plane');

  return (
    (candidate['type'] === undefined ||
      typeof candidate['type'] === 'string') &&
    (candidate['showPreviousLocation'] === undefined ||
      typeof candidate['showPreviousLocation'] === 'boolean') &&
    routeIsValid
  );
}

function isLifeTimelineEntry(value: unknown): value is LifeTimelineEntry {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate['year'] === 'number' &&
    (candidate['endYear'] === undefined ||
      typeof candidate['endYear'] === 'number') &&
    (candidate['title'] === undefined ||
      typeof candidate['title'] === 'string') &&
    (candidate['description'] === undefined ||
      typeof candidate['description'] === 'string') &&
    (candidate['image'] === undefined ||
      typeof candidate['image'] === 'string') &&
    (candidate['imageAlt'] === undefined ||
      typeof candidate['imageAlt'] === 'string') &&
    Array.isArray(candidate['locations']) &&
    candidate['locations'].every(isLocation) &&
    (candidate['duration'] === undefined ||
      typeof candidate['duration'] === 'number') &&
    (candidate['transitionDuration'] === undefined ||
      typeof candidate['transitionDuration'] === 'number') &&
    (candidate['pauseAfterTransition'] === undefined ||
      typeof candidate['pauseAfterTransition'] === 'number') &&
    isCamera(candidate['camera']) &&
    isTransition(candidate['transition']) &&
    (candidate['currentLocation'] === undefined ||
      typeof candidate['currentLocation'] === 'boolean') &&
    (candidate['allowFutureYear'] === undefined ||
      typeof candidate['allowFutureYear'] === 'boolean')
  );
}

function parseLifeTimelineEntries(value: unknown): LifeTimelineEntry[] {
  if (!Array.isArray(value) || !value.every(isLifeTimelineEntry)) {
    throw new Error(
      'Life-timeline data must match the LifeTimelineEntry schema.',
    );
  }
  return value;
}

const parsedEntries = parseLifeTimelineEntries(rawLifeTimeline);
const knownPointSlugs = new Set(mapPoints.map((point) => point.slug));

const validationErrors = getLifeTimelineValidationErrors(parsedEntries, {
  currentYear: getLifeTimelineCurrentYear(),
  knownPointSlugs,
  startYear: LIFE_TIMELINE_CONFIG.startYear,
});

if (validationErrors.length > 0) {
  throw new Error(
    `Invalid src/data/life-timeline.json:\n${validationErrors.join('\n')}`,
  );
}

export const lifeTimelineEntries: LifeTimelineEntry[] = [...parsedEntries].sort(
  (a, b) => a.year - b.year,
);

export interface ResolvedLifeTimelineLocation extends LifeTimelineLocation {
  latitude: number;
  longitude: number;
  pointTitle: string;
}

export interface ResolvedLifeTimelineCamera {
  zoom: number;
  pitch: number;
  bearing: number;
  padding: Required<LifeTimelineCameraPadding>;
}

export interface ResolvedLifeTimelineYear {
  year: number;
  title: string | undefined;
  description: string | undefined;
  image: string | undefined;
  imageAlt: string | undefined;
  locations: ResolvedLifeTimelineLocation[];
  camera: ResolvedLifeTimelineCamera;
  duration: number;
  transitionDuration: number;
  pauseAfterTransition: number;
  transition: LifeTimelineTransition | undefined;
  currentLocation: boolean;
  /** Whether this step has its own authored (or period-covering) content, vs. an inherited gap year. */
  isEntryYear: boolean;
  /** Whether the active location set changed compared to the previous step. */
  locationsChanged: boolean;
}

const defaultCamera: ResolvedLifeTimelineCamera = {
  bearing: 0,
  padding: { bottom: 0, left: 0, right: 0, top: 0 },
  pitch: 0,
  zoom: LIFE_TIMELINE_CONFIG.worldZoom,
};

function resolveLocation(
  location: LifeTimelineLocation,
): ResolvedLifeTimelineLocation {
  const point = getMapPointBySlug(location.point);
  return {
    ...location,
    latitude: point.latitude,
    longitude: point.longitude,
    pointTitle: point.title,
  };
}

function sameLocationSet(
  a: readonly ResolvedLifeTimelineLocation[],
  b: readonly ResolvedLifeTimelineLocation[],
): boolean {
  if (a.length !== b.length) return false;
  const aSlugs = new Set(a.map((location) => location.point));
  return b.every((location) => aSlugs.has(location.point));
}

function mergeCamera(
  previous: ResolvedLifeTimelineCamera,
  override: LifeTimelineCamera | undefined,
): ResolvedLifeTimelineCamera {
  if (!override) return previous;
  return {
    bearing: override.bearing ?? previous.bearing,
    padding: {
      bottom: override.padding?.bottom ?? previous.padding.bottom,
      left: override.padding?.left ?? previous.padding.left,
      right: override.padding?.right ?? previous.padding.right,
      top: override.padding?.top ?? previous.padding.top,
    },
    pitch: override.pitch ?? previous.pitch,
    zoom: override.zoom ?? previous.zoom,
  };
}

/**
 * "Period" entries (`endYear` or `currentLocation`) claim a range of years.
 * Plain one-off "moment" entries don't — several moments may share the same
 * year, and a moment may also sit inside an ongoing period's range. See
 * the matching guard in src/utils/life-timeline-validation.ts.
 */
function isPeriodLikeEntry(entry: LifeTimelineEntry): boolean {
  return entry.endYear !== undefined || entry.currentLocation === true;
}

function findLastPeriodAtOrBefore(
  periods: readonly LifeTimelineEntry[],
  year: number,
): LifeTimelineEntry | undefined {
  let active: LifeTimelineEntry | undefined;
  for (const entry of periods) {
    if (entry.year > year) break;
    active = entry;
  }
  return active;
}

/**
 * Expands the sparse authored entries into one resolved step per calendar
 * year from LIFE_TIMELINE_CONFIG.startYear through currentYear — except a
 * year with multiple authored "moment" entries expands into that many
 * steps instead of one, played in the order they appear in the data file
 * (e.g. a 1975 birth followed by a 1975 naming ceremony). Years without
 * their own entry inherit the most recent active location and camera, carry
 * no title/description unless an ongoing period entry covers them, and use
 * the default per-year gap duration. An entry marked `currentLocation: true`
 * implicitly stays active through currentYear regardless of `endYear`, so
 * the finale never needs a yearly data edit.
 */
export function buildLifeTimelineYears(
  entries: readonly LifeTimelineEntry[],
  currentYear: number,
): ResolvedLifeTimelineYear[] {
  const sortedAll = [...entries].sort((a, b) => a.year - b.year);
  const sortedPeriods = sortedAll.filter(isPeriodLikeEntry);

  const entriesByYear = new Map<number, LifeTimelineEntry[]>();
  for (const entry of sortedAll) {
    const list = entriesByYear.get(entry.year);
    if (list) list.push(entry);
    else entriesByYear.set(entry.year, [entry]);
  }

  const years: ResolvedLifeTimelineYear[] = [];
  let previousLocations: ResolvedLifeTimelineLocation[] = [];
  let previousCamera = defaultCamera;

  const emitEntryStep = (entry: LifeTimelineEntry, year: number): void => {
    const resolvedLocations = entry.locations.map(resolveLocation);
    const locationsChanged = !sameLocationSet(
      resolvedLocations,
      previousLocations,
    );
    const camera = mergeCamera(previousCamera, entry.camera);

    years.push({
      camera,
      currentLocation: Boolean(entry.currentLocation) && year === currentYear,
      description: entry.description,
      duration: entry.duration ?? LIFE_TIMELINE_CONFIG.defaultEntryDuration,
      image: entry.image,
      imageAlt: entry.imageAlt,
      isEntryYear: true,
      locations: resolvedLocations,
      locationsChanged,
      pauseAfterTransition:
        entry.pauseAfterTransition ??
        LIFE_TIMELINE_CONFIG.defaultPauseAfterTransition,
      title: entry.title,
      transition: locationsChanged ? entry.transition : undefined,
      transitionDuration:
        entry.transitionDuration ??
        LIFE_TIMELINE_CONFIG.defaultTransitionDuration,
      year,
    });

    previousLocations = resolvedLocations;
    previousCamera = camera;
  };

  for (
    let year = LIFE_TIMELINE_CONFIG.startYear;
    year <= currentYear;
    year += 1
  ) {
    const entriesThisYear = entriesByYear.get(year);

    if (entriesThisYear && entriesThisYear.length > 0) {
      for (const entry of entriesThisYear) emitEntryStep(entry, year);
      continue;
    }

    // Gap year: no entry of its own. Title/description/image only show
    // while an ongoing period entry still covers this year.
    const activePeriod = findLastPeriodAtOrBefore(sortedPeriods, year);
    const periodEnd = activePeriod
      ? activePeriod.currentLocation
        ? currentYear
        : (activePeriod.endYear ?? activePeriod.year)
      : undefined;
    const isWithinPeriod =
      activePeriod !== undefined && year <= (periodEnd ?? activePeriod.year);

    // Re-derive location/camera from the period entry itself (rather than
    // blindly carrying forward whatever was last emitted) so the story
    // correctly returns to the period's place after a one-off moment
    // interrupted it for a single year.
    const resolvedLocations = isWithinPeriod
      ? activePeriod.locations.map(resolveLocation)
      : previousLocations;
    const locationsChanged =
      isWithinPeriod && !sameLocationSet(resolvedLocations, previousLocations);
    const camera = isWithinPeriod
      ? mergeCamera(previousCamera, activePeriod.camera)
      : previousCamera;

    years.push({
      camera,
      currentLocation:
        Boolean(activePeriod?.currentLocation) && year === currentYear,
      description: isWithinPeriod ? activePeriod?.description : undefined,
      duration: LIFE_TIMELINE_CONFIG.defaultYearDuration,
      image: isWithinPeriod ? activePeriod?.image : undefined,
      imageAlt: isWithinPeriod ? activePeriod?.imageAlt : undefined,
      isEntryYear: isWithinPeriod,
      locations: resolvedLocations,
      locationsChanged,
      pauseAfterTransition: 0,
      title: isWithinPeriod ? activePeriod?.title : undefined,
      transition: undefined,
      transitionDuration: 0,
      year,
    });

    previousLocations = resolvedLocations;
    previousCamera = camera;
  }

  // Edge case: if currentYear itself has authored moment(s), the branch
  // above already emitted steps for it and `continue`d past the gap-year
  // branch — so an ongoing currentLocation period's finale flag would never
  // get attached to any step. Append one more synthetic step so "the very
  // last step is the finale" always holds.
  const lastStep = years.at(-1);
  if (lastStep && !lastStep.currentLocation) {
    const activePeriod = findLastPeriodAtOrBefore(sortedPeriods, currentYear);
    if (activePeriod?.currentLocation) {
      years.push({
        camera: previousCamera,
        currentLocation: true,
        description: activePeriod.description,
        duration: LIFE_TIMELINE_CONFIG.defaultYearDuration,
        image: activePeriod.image,
        imageAlt: activePeriod.imageAlt,
        isEntryYear: true,
        locations: previousLocations,
        locationsChanged: false,
        pauseAfterTransition: 0,
        title: activePeriod.title,
        transition: undefined,
        transitionDuration: 0,
        year: currentYear,
      });
    }
  }

  return years;
}

export function getLifeTimelineYears(): ResolvedLifeTimelineYear[] {
  return buildLifeTimelineYears(
    lifeTimelineEntries,
    getLifeTimelineCurrentYear(),
  );
}
