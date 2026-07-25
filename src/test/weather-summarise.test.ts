import { WEATHER_FORECAST_RULES } from '@config/weather';
import { summariseWeather } from '@utils/weather/summarise-weather';
import type {
  WeatherCurrentConditions,
  WeatherForecastHour,
  WeatherSnapshot,
} from '@utils/weather/types';
import { describe, expect, it } from 'vitest';

function hour(
  time: string,
  overrides: Partial<WeatherForecastHour> = {},
): WeatherForecastHour {
  return {
    apparentTemperatureCelsius: null,
    precipitationMillimetres: 0,
    precipitationProbabilityPercent: 0,
    rainMillimetres: 0,
    temperatureCelsius: 29,
    time,
    weatherCode: 1,
    ...overrides,
  };
}

function snapshot(
  currentOverrides: Partial<WeatherCurrentConditions>,
  hourly: WeatherForecastHour[] = [],
): WeatherSnapshot {
  return {
    current: {
      apparentTemperatureCelsius: null,
      cloudCoverPercent: null,
      isDay: true,
      observedAt: '2026-07-25T14:00',
      precipitationMillimetres: 0,
      rainMillimetres: 0,
      relativeHumidityPercent: 50,
      temperatureCelsius: 30,
      weatherCode: 0,
      windSpeedKilometresPerHour: null,
      ...currentOverrides,
    },
    generatedAt: '2026-07-25T14:00:00.000Z',
    hourly,
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

describe('summariseWeather', () => {
  it('describes a clear, dry afternoon with no notable forecast rain', () => {
    const result = summariseWeather(snapshot({}, []));

    expect(result).toBe(
      'Sonnig. In den nächsten Stunden bleibt es voraussichtlich trocken.',
    );
  });

  it('omits rain below the possible-rain threshold (39%)', () => {
    const result = summariseWeather(
      snapshot({}, [
        hour('2026-07-25T15:00', {
          precipitationProbabilityPercent: 39,
          weatherCode: 61,
        }),
      ]),
    );

    expect(result).toBe(
      'Sonnig. In den nächsten Stunden bleibt es voraussichtlich trocken.',
    );
  });

  it('mentions possible rain at the 40% boundary', () => {
    const result = summariseWeather(
      snapshot({}, [
        hour('2026-07-25T15:00', {
          precipitationProbabilityPercent: 40,
          weatherCode: 61,
        }),
      ]),
    );

    expect(result).toBe('Sonnig. Gegen 15 Uhr kann es regnen.');
  });

  it('still phrases 59% as possible, not likely, rain', () => {
    const result = summariseWeather(
      snapshot({}, [
        hour('2026-07-25T15:00', {
          precipitationProbabilityPercent: 59,
          weatherCode: 61,
        }),
      ]),
    );

    expect(result).toBe('Sonnig. Gegen 15 Uhr kann es regnen.');
  });

  it('phrases rain as likely at the 60% boundary', () => {
    const result = summariseWeather(
      snapshot({}, [
        hour('2026-07-25T15:00', {
          precipitationProbabilityPercent: 60,
          weatherCode: 61,
        }),
      ]),
    );

    expect(result).toBe('Sonnig. Ab etwa 15 Uhr ist Regen wahrscheinlich.');
  });

  it('mentions current rain ending later in the day', () => {
    const result = summariseWeather(
      snapshot(
        {
          observedAt: '2026-07-25T19:00',
          rainMillimetres: 1.5,
          weatherCode: 61,
        },
        [],
      ),
    );

    expect(result).toBe(
      'Es regnet. Im Laufe des Abends lässt der Regen voraussichtlich nach.',
    );
  });

  it('mentions persistent rain when the forecast stays wet', () => {
    const result = summariseWeather(
      snapshot({ rainMillimetres: 1.5, weatherCode: 61 }, [
        hour('2026-07-25T15:00', {
          precipitationProbabilityPercent: 70,
          weatherCode: 61,
        }),
      ]),
    );

    expect(result).toBe(
      'Es regnet. Der Regen dürfte in den kommenden Stunden anhalten.',
    );
  });

  it('calls out a future thunderstorm regardless of probability', () => {
    const result = summariseWeather(
      snapshot({}, [
        hour('2026-07-25T20:00', {
          precipitationProbabilityPercent: 10,
          weatherCode: 95,
        }),
      ]),
    );

    expect(result).toBe('Sonnig. Später sind Gewitter möglich.');
  });

  it('uses night wording for a clear sky after dark', () => {
    const result = summariseWeather(
      snapshot({ isDay: false, weatherCode: 0 }, []),
    );

    expect(result).toBe(
      'Klarer Himmel. In den nächsten Stunden bleibt es voraussichtlich trocken.',
    );
  });

  it('has no relevant precipitation when the hourly forecast is empty', () => {
    const result = summariseWeather(snapshot({}, []));

    expect(result).toContain('bleibt es voraussichtlich trocken.');
  });

  it('describes showers distinctly from plain rain', () => {
    const result = summariseWeather(
      snapshot({}, [
        hour('2026-07-25T15:00', {
          precipitationMillimetres: 3,
          precipitationProbabilityPercent: 45,
          rainMillimetres: 3,
          weatherCode: 82,
        }),
      ]),
    );

    expect(result).toBe('Sonnig. Gegen 15 Uhr sind kräftige Schauer möglich.');
  });

  it('calls out humid, cloudy conditions distinctly from plain cloudy', () => {
    const result = summariseWeather(
      snapshot({ relativeHumidityPercent: 85, weatherCode: 3 }, []),
    );

    expect(result.startsWith('Schwül und bewölkt.')).toBe(true);
  });

  it('only bounds the look-ahead window by WEATHER_FORECAST_RULES.lookAheadHours', () => {
    const justOutsideWindow = summariseWeather(
      snapshot({}, [
        hour('2026-07-26T03:00', {
          // 13h after 2026-07-25T14:00 -- past the 12h look-ahead window.
          precipitationProbabilityPercent: 90,
          weatherCode: 61,
        }),
      ]),
    );

    expect(justOutsideWindow).toBe(
      'Sonnig. In den nächsten Stunden bleibt es voraussichtlich trocken.',
    );
    expect(WEATHER_FORECAST_RULES.lookAheadHours).toBe(12);
  });
});
