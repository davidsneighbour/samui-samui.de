// Layer 1+2: turns Open-Meteo's raw forecast response into the
// provider-independent WeatherSnapshot model, treating the upstream payload
// as untrusted input throughout. See
// documentation/features/weather-widget.md#raw-provider-format and
// #internal-normalised-format for the exact contracts validated here.
//
// Validation rule of thumb: a required field that is missing or malformed
// invalidates the whole response (throws WeatherValidationError, which the
// Netlify function turns into a generic 5xx). An optional field that is
// merely *absent* becomes `null`; an optional field that is *present but the
// wrong type/non-finite* also invalidates the response, since a
// present-but-corrupt value is a stronger signal of a broken/malicious
// payload than a field the provider simply didn't include -- we do not
// silently coerce it into a plausible number.

import type { WeatherLocation } from '@config/weather';
import type {
  WeatherCurrentConditions,
  WeatherForecastHour,
  WeatherSnapshot,
} from './types';

export class WeatherValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherValidationError';
  }
}

function fail(message: string): never {
  throw new WeatherValidationError(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`Missing or non-finite required field "${field}".`);
  }
  return value;
}

function optionalFiniteNumberOrNull(
  value: unknown,
  field: string,
): number | null {
  if (value === undefined) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`Field "${field}" is present but not a finite number.`);
  }
  return value;
}

function requireValidTimestamp(value: unknown, field: string): string {
  if (typeof value !== 'string' || Number.isNaN(new Date(value).valueOf())) {
    fail(`Missing or invalid timestamp for "${field}".`);
  }
  return value;
}

function requireArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    fail(`Missing or non-array hourly field "${field}".`);
  }
  return value;
}

function normaliseCurrent(raw: unknown): WeatherCurrentConditions {
  if (!isRecord(raw)) fail('Missing "current" object.');

  const isDayRaw = raw['is_day'];
  if (isDayRaw !== 0 && isDayRaw !== 1) {
    fail('Missing or invalid required field "is_day".');
  }

  return {
    apparentTemperatureCelsius: optionalFiniteNumberOrNull(
      raw['apparent_temperature'],
      'current.apparent_temperature',
    ),
    cloudCoverPercent: optionalFiniteNumberOrNull(
      raw['cloud_cover'],
      'current.cloud_cover',
    ),
    isDay: isDayRaw === 1,
    observedAt: requireValidTimestamp(raw['time'], 'current.time'),
    precipitationMillimetres: optionalFiniteNumberOrNull(
      raw['precipitation'],
      'current.precipitation',
    ),
    rainMillimetres: optionalFiniteNumberOrNull(raw['rain'], 'current.rain'),
    relativeHumidityPercent: optionalFiniteNumberOrNull(
      raw['relative_humidity_2m'],
      'current.relative_humidity_2m',
    ),
    temperatureCelsius: requireFiniteNumber(
      raw['temperature_2m'],
      'current.temperature_2m',
    ),
    weatherCode: requireFiniteNumber(
      raw['weather_code'],
      'current.weather_code',
    ),
    windSpeedKilometresPerHour: optionalFiniteNumberOrNull(
      raw['wind_speed_10m'],
      'current.wind_speed_10m',
    ),
  };
}

function normaliseHourly(raw: unknown): WeatherForecastHour[] {
  if (!isRecord(raw)) fail('Missing "hourly" object.');

  const time = requireArray(raw['time'], 'hourly.time');
  const temperature = requireArray(
    raw['temperature_2m'],
    'hourly.temperature_2m',
  );
  const apparentTemperature = requireArray(
    raw['apparent_temperature'],
    'hourly.apparent_temperature',
  );
  const precipitationProbability = requireArray(
    raw['precipitation_probability'],
    'hourly.precipitation_probability',
  );
  const precipitation = requireArray(
    raw['precipitation'],
    'hourly.precipitation',
  );
  const rain = requireArray(raw['rain'], 'hourly.rain');
  const weatherCode = requireArray(raw['weather_code'], 'hourly.weather_code');

  const length = time.length;
  const arrays = {
    apparentTemperature,
    precipitation,
    precipitationProbability,
    rain,
    temperature,
    weatherCode,
  };
  for (const [name, values] of Object.entries(arrays)) {
    if (values.length !== length) {
      fail(
        `Hourly array "${name}" length (${values.length}) does not match "time" length (${length}).`,
      );
    }
  }

  return time.map(
    (entryTime, index): WeatherForecastHour => ({
      apparentTemperatureCelsius: optionalFiniteNumberOrNull(
        apparentTemperature[index],
        `hourly.apparent_temperature[${index}]`,
      ),
      precipitationMillimetres: optionalFiniteNumberOrNull(
        precipitation[index],
        `hourly.precipitation[${index}]`,
      ),
      precipitationProbabilityPercent: optionalFiniteNumberOrNull(
        precipitationProbability[index],
        `hourly.precipitation_probability[${index}]`,
      ),
      rainMillimetres: optionalFiniteNumberOrNull(
        rain[index],
        `hourly.rain[${index}]`,
      ),
      temperatureCelsius: requireFiniteNumber(
        temperature[index],
        `hourly.temperature_2m[${index}]`,
      ),
      time: requireValidTimestamp(entryTime, `hourly.time[${index}]`),
      weatherCode: requireFiniteNumber(
        weatherCode[index],
        `hourly.weather_code[${index}]`,
      ),
    }),
  );
}

export function normaliseOpenMeteoResponse(
  raw: unknown,
  location: WeatherLocation,
): WeatherSnapshot {
  if (!isRecord(raw)) {
    fail('Open-Meteo response is not a JSON object.');
  }

  const current = normaliseCurrent(raw['current']);
  const hourly = normaliseHourly(raw['hourly']);

  return {
    current,
    generatedAt: new Date().toISOString(),
    hourly,
    location,
    provider: {
      id: 'open-meteo',
      label: 'Open-Meteo',
    },
    schemaVersion: 1,
  };
}
