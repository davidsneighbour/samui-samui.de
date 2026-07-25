// Second cache layer, in the visitor's browser, on top of the Netlify
// shared CDN cache -- see documentation/features/weather-widget.md#browser-cache
// for the freshness policy this implements. `localStorage` access is always
// wrapped: private browsing, quota limits, or a locked-down browser profile
// can all make it throw or be unavailable, and the widget must keep working
// (just without persistence) rather than fail.

import type { WeatherBrowserCachePolicy } from '@config/weather';
import type { WeatherSnapshot } from './types';

const CACHE_SCHEMA_VERSION = 1;

interface WeatherCacheEntry {
  schemaVersion: 1;
  storedAt: number;
  snapshot: WeatherSnapshot;
}

export type WeatherCacheState =
  | { status: 'fresh'; snapshot: WeatherSnapshot }
  | { status: 'stale'; snapshot: WeatherSnapshot }
  | { status: 'empty' };

function isValidSnapshotShape(value: unknown): value is WeatherSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record['schemaVersion'] === 1 &&
    typeof record['current'] === 'object' &&
    record['current'] !== null &&
    Array.isArray(record['hourly']) &&
    typeof record['location'] === 'object' &&
    record['location'] !== null
  );
}

function isValidCacheEntry(value: unknown): value is WeatherCacheEntry {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    record['schemaVersion'] === CACHE_SCHEMA_VERSION &&
    typeof record['storedAt'] === 'number' &&
    Number.isFinite(record['storedAt']) &&
    isValidSnapshotShape(record['snapshot'])
  );
}

/** Exported for tests -- classifies an already-parsed entry by age. */
export function classifyCacheEntry(
  entry: WeatherCacheEntry,
  nowMilliseconds: number,
  policy: WeatherBrowserCachePolicy,
): WeatherCacheState {
  const ageMilliseconds = nowMilliseconds - entry.storedAt;
  if (ageMilliseconds < 0 || ageMilliseconds > policy.staleForMilliseconds) {
    return { status: 'empty' };
  }
  if (ageMilliseconds <= policy.freshForMilliseconds) {
    return { snapshot: entry.snapshot, status: 'fresh' };
  }
  return { snapshot: entry.snapshot, status: 'stale' };
}

export function readWeatherCache(
  storageKey: string,
  policy: WeatherBrowserCachePolicy,
): WeatherCacheState {
  try {
    if (typeof localStorage === 'undefined') return { status: 'empty' };
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { status: 'empty' };

    const parsed: unknown = JSON.parse(raw);
    if (!isValidCacheEntry(parsed)) return { status: 'empty' };

    return classifyCacheEntry(parsed, Date.now(), policy);
  } catch {
    // Malformed JSON, a SecurityError from a locked-down storage policy, or
    // any other storage failure -- treat exactly like "no cache entry".
    return { status: 'empty' };
  }
}

export function writeWeatherCache(
  storageKey: string,
  snapshot: WeatherSnapshot,
): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const entry: WeatherCacheEntry = {
      schemaVersion: CACHE_SCHEMA_VERSION,
      snapshot,
      storedAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(entry));
  } catch {
    // Quota exceeded, storage disabled, private-mode restrictions, etc. --
    // the widget still works for this page view, it just won't persist.
  }
}
