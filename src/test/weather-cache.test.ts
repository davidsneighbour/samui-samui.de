import { WEATHER_BROWSER_CACHE } from '@config/weather';
import {
  readWeatherCache,
  writeWeatherCache,
} from '@utils/weather/browser-cache';
import type { WeatherSnapshot } from '@utils/weather/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const STORAGE_KEY = 'samui-weather:v1:koh-samui-west';

function minimalSnapshot(): WeatherSnapshot {
  return {
    current: {
      apparentTemperatureCelsius: null,
      cloudCoverPercent: null,
      isDay: true,
      observedAt: '2026-07-25T17:45',
      precipitationMillimetres: 0,
      rainMillimetres: 0,
      relativeHumidityPercent: null,
      temperatureCelsius: 30,
      weatherCode: 0,
      windSpeedKilometresPerHour: null,
    },
    generatedAt: '2026-07-25T17:45:00.000Z',
    hourly: [],
    location: {
      id: 'koh-samui-west',
      label: 'Westen von Koh Samui',
      latitude: 9.578488,
      longitude: 99.958293,
      timezone: 'Asia/Bangkok',
    },
    provider: { id: 'open-meteo', label: 'Open-Meteo' },
    schemaVersion: 1,
  };
}

class MemoryStorage implements Storage {
  #store = new Map<string, string>();

  get length(): number {
    return this.#store.size;
  }

  clear(): void {
    this.#store.clear();
  }

  getItem(key: string): string | null {
    return this.#store.has(key) ? (this.#store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return [...this.#store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.#store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.#store.set(key, value);
  }
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal('localStorage', storage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('weather browser cache', () => {
  it('returns a fresh entry within the fresh window', () => {
    const snapshot = minimalSnapshot();
    writeWeatherCache(STORAGE_KEY, snapshot);

    const state = readWeatherCache(STORAGE_KEY, WEATHER_BROWSER_CACHE);

    expect(state).toEqual({ snapshot, status: 'fresh' });
  });

  it('returns a stale-but-usable entry between fresh and stale windows', () => {
    const snapshot = minimalSnapshot();
    const storedAt =
      Date.now() - (WEATHER_BROWSER_CACHE.freshForMilliseconds + 1000);
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, snapshot, storedAt }),
    );

    const state = readWeatherCache(STORAGE_KEY, WEATHER_BROWSER_CACHE);

    expect(state).toEqual({ snapshot, status: 'stale' });
  });

  it('discards an entry older than the stale window', () => {
    const snapshot = minimalSnapshot();
    const storedAt =
      Date.now() - (WEATHER_BROWSER_CACHE.staleForMilliseconds + 1000);
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, snapshot, storedAt }),
    );

    expect(readWeatherCache(STORAGE_KEY, WEATHER_BROWSER_CACHE)).toEqual({
      status: 'empty',
    });
  });

  it('discards an entry with the wrong schema version', () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 99,
        snapshot: minimalSnapshot(),
        storedAt: Date.now(),
      }),
    );

    expect(readWeatherCache(STORAGE_KEY, WEATHER_BROWSER_CACHE)).toEqual({
      status: 'empty',
    });
  });

  it('discards malformed JSON', () => {
    storage.setItem(STORAGE_KEY, '{not json');

    expect(readWeatherCache(STORAGE_KEY, WEATHER_BROWSER_CACHE)).toEqual({
      status: 'empty',
    });
  });

  it('treats a storage exception as an empty cache', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
      setItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
    });

    expect(readWeatherCache(STORAGE_KEY, WEATHER_BROWSER_CACHE)).toEqual({
      status: 'empty',
    });
    expect(() =>
      writeWeatherCache(STORAGE_KEY, minimalSnapshot()),
    ).not.toThrow();
  });
});
