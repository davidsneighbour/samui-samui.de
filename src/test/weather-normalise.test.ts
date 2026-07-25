import type { WeatherLocation } from '@config/weather';
import {
  normaliseOpenMeteoResponse,
  WeatherValidationError,
} from '@utils/weather/normalise-open-meteo';
import { getWeatherCodeDefinition } from '@utils/weather/weather-codes';
import { describe, expect, it } from 'vitest';

const location: WeatherLocation = {
  id: 'koh-samui-west',
  label: 'Westen von Koh Samui',
  latitude: 9.578488,
  longitude: 99.958293,
  timezone: 'Asia/Bangkok',
};

function validRaw(): Record<string, unknown> {
  return {
    current: {
      apparent_temperature: 35,
      cloud_cover: 40,
      is_day: 1,
      precipitation: 0,
      rain: 0,
      relative_humidity_2m: 70,
      temperature_2m: 30,
      time: '2026-07-25T17:45',
      weather_code: 2,
      wind_speed_10m: 10,
    },
    hourly: {
      apparent_temperature: [35, 34],
      precipitation: [0, 0.5],
      precipitation_probability: [10, 50],
      rain: [0, 0.5],
      temperature_2m: [30, 29],
      time: ['2026-07-25T18:00', '2026-07-25T19:00'],
      weather_code: [2, 61],
    },
  };
}

describe('normaliseOpenMeteoResponse', () => {
  it('normalises a valid Open-Meteo response', () => {
    const snapshot = normaliseOpenMeteoResponse(validRaw(), location);

    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.provider).toEqual({
      id: 'open-meteo',
      label: 'Open-Meteo',
    });
    expect(snapshot.location).toEqual(location);
    expect(snapshot.current).toMatchObject({
      isDay: true,
      observedAt: '2026-07-25T17:45',
      temperatureCelsius: 30,
      weatherCode: 2,
    });
    expect(snapshot.hourly).toHaveLength(2);
    expect(snapshot.hourly[1]).toMatchObject({
      precipitationProbabilityPercent: 50,
      temperatureCelsius: 29,
      weatherCode: 61,
    });
  });

  it('rejects a malformed top-level response', () => {
    expect(() => normaliseOpenMeteoResponse(null, location)).toThrow(
      WeatherValidationError,
    );
    expect(() => normaliseOpenMeteoResponse('nope', location)).toThrow(
      WeatherValidationError,
    );
    expect(() => normaliseOpenMeteoResponse({}, location)).toThrow(
      WeatherValidationError,
    );
  });

  it('rejects mismatched hourly array lengths', () => {
    const raw = validRaw();
    (raw['hourly'] as Record<string, unknown>)['temperature_2m'] = [30];

    expect(() => normaliseOpenMeteoResponse(raw, location)).toThrow(
      WeatherValidationError,
    );
  });

  it('rejects a response missing required current values', () => {
    const missingTemperature = validRaw();
    delete (missingTemperature['current'] as Record<string, unknown>)[
      'temperature_2m'
    ];
    expect(() =>
      normaliseOpenMeteoResponse(missingTemperature, location),
    ).toThrow(WeatherValidationError);

    const missingWeatherCode = validRaw();
    delete (missingWeatherCode['current'] as Record<string, unknown>)[
      'weather_code'
    ];
    expect(() =>
      normaliseOpenMeteoResponse(missingWeatherCode, location),
    ).toThrow(WeatherValidationError);

    const missingIsDay = validRaw();
    delete (missingIsDay['current'] as Record<string, unknown>)['is_day'];
    expect(() => normaliseOpenMeteoResponse(missingIsDay, location)).toThrow(
      WeatherValidationError,
    );
  });

  it('rejects non-finite numbers, including in optional fields', () => {
    const badCurrent = validRaw();
    (badCurrent['current'] as Record<string, unknown>)['temperature_2m'] =
      Number.NaN;
    expect(() => normaliseOpenMeteoResponse(badCurrent, location)).toThrow(
      WeatherValidationError,
    );

    const badOptional = validRaw();
    (badOptional['current'] as Record<string, unknown>)[
      'apparent_temperature'
    ] = Number.POSITIVE_INFINITY;
    expect(() => normaliseOpenMeteoResponse(badOptional, location)).toThrow(
      WeatherValidationError,
    );
  });

  it('accepts an unknown weather code via the safe fallback', () => {
    const raw = validRaw();
    (raw['current'] as Record<string, unknown>)['weather_code'] = 12345;

    const snapshot = normaliseOpenMeteoResponse(raw, location);

    expect(snapshot.current.weatherCode).toBe(12345);
    expect(
      getWeatherCodeDefinition(snapshot.current.weatherCode).category,
    ).toBe('unknown');
  });

  it('treats a missing optional field as null but a malformed one as invalid', () => {
    const missingOptional = validRaw();
    delete (missingOptional['current'] as Record<string, unknown>)[
      'relative_humidity_2m'
    ];
    const snapshot = normaliseOpenMeteoResponse(missingOptional, location);
    expect(snapshot.current.relativeHumidityPercent).toBeNull();
  });
});
