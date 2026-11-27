export type Availability =
  | 'available'
  | 'unavailable'
  | 'unknown'
  | 'restricted';
export interface MediaHistory {
  provider: 'youtube' | 'vimeo';
  id: string;
  url: string;
  title?: string | undefined;
  description?: string | undefined;
  author?: string | undefined;
  published?: string | undefined;
  thumbnail?: string | undefined;
  firstChecked?: string | undefined;
  lastChecked: string;
  lastAvailable?: string | undefined;
  availability: Availability;
  consecutiveFailures: number;
  files: string[];
}
export type MediaCache = Record<string, MediaHistory>;
export function availabilityFromStatus(status: number): Availability {
  if (status >= 200 && status < 300) return 'available';
  if (status === 404 || status === 410) return 'unavailable';
  if (status === 401 || status === 403) return 'restricted';
  return 'unknown';
}
/** Inconclusive checks break the sequence; they never confirm disappearance. */
export function updateMediaHistory(
  previous: MediaHistory | undefined,
  observation: MediaHistory,
): MediaHistory {
  const result = { ...previous, ...observation };
  for (const field of [
    'title',
    'description',
    'author',
    'published',
    'thumbnail',
  ] as const) {
    result[field] = observation[field]?.trim() || previous?.[field];
  }
  result.firstChecked =
    previous?.firstChecked ??
    (observation.availability === 'available'
      ? observation.lastChecked
      : undefined);
  result.lastAvailable =
    observation.availability === 'available'
      ? observation.lastChecked
      : previous?.lastAvailable;
  result.consecutiveFailures =
    observation.availability === 'unavailable'
      ? (previous?.consecutiveFailures ?? 0) + 1
      : 0;
  result.files = [
    ...new Set([...(previous?.files ?? []), ...observation.files]),
  ].sort();
  return result;
}
export function mediaCandidate(
  files: string[],
  status: string | undefined,
  cache: MediaCache,
): 'candidate' | 'restoration-candidate' | undefined {
  const media = Object.values(cache).filter((entry) =>
    entry.files.some((file) => files.includes(file)),
  );
  if (
    status !== 'relic' &&
    media.some(
      (entry) =>
        entry.availability === 'unavailable' && entry.consecutiveFailures >= 2,
    )
  )
    return 'candidate';
  if (
    status === 'relic' &&
    media.length > 0 &&
    media.every((entry) => entry.availability === 'available')
  )
    return 'restoration-candidate';
  return undefined;
}
