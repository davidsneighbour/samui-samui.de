// Layer 4 (client half): lazy-load lifecycle and DOM rendering for
// <dnb-weather-widget>. Mirrors the <dnb-giscus> custom-element +
// IntersectionObserver pattern already used in src/components/features/comments/Giscus.astro
// -- see documentation/features/weather-widget.md#lazy-loading-lifecycle for
// the full trigger/cache/render sequence this implements.
//
// Deliberately framework-free: this is a small vanilla custom element, not a
// hydrated island, so the widget never pulls in a client:* framework
// runtime just to show a few lines of text.
import {
  WEATHER_BROWSER_CACHE,
  WEATHER_BROWSER_CACHE_STORAGE_KEY,
  WEATHER_ENDPOINT_PATH,
  WEATHER_LOCAL_CLOCK_INTERVAL_MILLISECONDS,
  WEATHER_WIDGET_OBSERVER_OPTIONS,
} from '@config/weather';
import {
  readWeatherCache,
  writeWeatherCache,
} from '@utils/weather/browser-cache';
import {
  formatKohSamuiTime,
  formatWeatherClockTime,
} from '@utils/weather/format-weather-time';
import { summariseWeather } from '@utils/weather/summarise-weather';
import type { WeatherSnapshot } from '@utils/weather/types';
import { getWeatherCodeDefinition } from '@utils/weather/weather-codes';

const TAG_NAME = 'dnb-weather-widget';
const CLIENT_REQUEST_TIMEOUT_MILLISECONDS = 8000;
// Only mention "Gefühlt X °C" when it would actually read differently from
// the rounded current temperature.
const FEELS_LIKE_MINIMUM_DIFFERENCE_CELSIUS = 2;

function scheduleLowPriority(run: () => void): void {
  const idle = (window as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (idle) {
    idle(run);
  } else {
    setTimeout(run, 200);
  }
}

if (!customElements.get(TAG_NAME)) {
  class DnbWeatherWidget extends HTMLElement {
    #initialised = false;
    #clockIntervalId: ReturnType<typeof setInterval> | undefined;

    static #observer: IntersectionObserver | undefined;

    static get observer(): IntersectionObserver {
      if (!DnbWeatherWidget.#observer) {
        DnbWeatherWidget.#observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const element = entry.target as DnbWeatherWidget;
              void element.load();
              DnbWeatherWidget.#observer?.unobserve(element);
            }
          }
        }, WEATHER_WIDGET_OBSERVER_OPTIONS);
      }
      return DnbWeatherWidget.#observer;
    }

    connectedCallback(): void {
      if (this.#initialised || this.hasAttribute('data-initialised')) return;

      if (typeof IntersectionObserver === 'undefined') {
        scheduleLowPriority(() => void this.load());
        return;
      }

      DnbWeatherWidget.observer.observe(this);
    }

    disconnectedCallback(): void {
      DnbWeatherWidget.observer.unobserve(this);
      this.stopClock();
    }

    async load(): Promise<void> {
      if (this.#initialised || this.hasAttribute('data-initialised')) return;
      this.#initialised = true;
      this.setAttribute('data-initialised', 'true');

      const cacheState = readWeatherCache(
        WEATHER_BROWSER_CACHE_STORAGE_KEY,
        WEATHER_BROWSER_CACHE,
      );

      if (cacheState.status === 'fresh') {
        this.render(cacheState.snapshot);
        return;
      }

      if (cacheState.status === 'stale') {
        // Show something immediately, then quietly try to refresh it.
        this.render(cacheState.snapshot);
        await this.fetchAndRender({ hasFallback: true });
        return;
      }

      await this.fetchAndRender({ hasFallback: false });
    }

    async fetchAndRender({
      hasFallback,
    }: {
      hasFallback: boolean;
    }): Promise<void> {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CLIENT_REQUEST_TIMEOUT_MILLISECONDS,
      );

      try {
        const response = await fetch(WEATHER_ENDPOINT_PATH, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`/api/weather responded with ${response.status}`);
        }

        const snapshot = (await response.json()) as WeatherSnapshot;
        writeWeatherCache(WEATHER_BROWSER_CACHE_STORAGE_KEY, snapshot);
        this.render(snapshot);
      } catch (error) {
        // hasFallback: a stale-but-usable render is already on screen --
        // leave it up rather than replacing it with nothing. Otherwise the
        // widget simply stays hidden; visitors never see a raw error.
        if (import.meta.env.DEV) {
          console.warn(
            `[weather] request failed (hasFallback=${hasFallback}):`,
            error,
          );
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    render(snapshot: WeatherSnapshot): void {
      const { current, location } = snapshot;
      const definition = getWeatherCodeDefinition(current.weatherCode);
      const iconName = current.isDay
        ? definition.dayIcon
        : definition.nightIcon;

      const iconHost = this.querySelector<HTMLElement>('[data-weather-icon]');
      if (iconHost) iconHost.dataset['activeIcon'] = iconName;

      const tempElement = this.querySelector('[data-weather-temp]');
      if (tempElement) {
        tempElement.textContent = String(
          Math.round(current.temperatureCelsius),
        );
      }

      const summaryElement = this.querySelector('[data-weather-summary]');
      if (summaryElement) {
        summaryElement.textContent = summariseWeather(snapshot);
      }

      const feelsLikeElement = this.querySelector<HTMLElement>(
        '[data-weather-feels-like]',
      );
      if (feelsLikeElement) {
        const apparent = current.apparentTemperatureCelsius;
        const difference =
          apparent === null
            ? 0
            : Math.abs(apparent - current.temperatureCelsius);
        if (
          apparent !== null &&
          difference >= FEELS_LIKE_MINIMUM_DIFFERENCE_CELSIUS
        ) {
          feelsLikeElement.textContent = `Gefühlt ${Math.round(apparent)} °C`;
          feelsLikeElement.hidden = false;
        } else {
          feelsLikeElement.hidden = true;
        }
      }

      const standElement = this.querySelector('[data-weather-stand]');
      if (standElement) {
        standElement.textContent = formatWeatherClockTime(
          current.observedAt,
          location.timezone,
        );
      }

      this.removeAttribute('inert');
      this.startClock(location.timezone);
    }

    startClock(timeZone: string): void {
      const localTimeElement = this.querySelector('[data-weather-local-time]');
      if (!localTimeElement) return;

      const update = (): void => {
        localTimeElement.textContent = formatKohSamuiTime(new Date(), timeZone);
      };

      update();
      this.stopClock();
      this.#clockIntervalId = setInterval(
        update,
        WEATHER_LOCAL_CLOCK_INTERVAL_MILLISECONDS,
      );
    }

    stopClock(): void {
      if (this.#clockIntervalId !== undefined) {
        clearInterval(this.#clockIntervalId);
        this.#clockIntervalId = undefined;
      }
    }
  }

  customElements.define(TAG_NAME, DnbWeatherWidget);
}
