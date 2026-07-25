// Layer 3: deterministic, rule-based German summary generation. No AI
// service is involved and no raw English provider text is ever shown -- see
// documentation/features/weather-widget.md#forecast-summary-rules for the
// full rule table and worked examples this implementation follows.

import type { WeatherForecastRules } from '@config/weather';
import { WEATHER_FORECAST_RULES } from '@config/weather';
import {
  formatWeatherHourLabel,
  parseWeatherTimestamp,
  readLocalHour,
} from './format-weather-time';
import type { WeatherForecastHour, WeatherSnapshot } from './types';
import { getWeatherCodeDefinition } from './weather-codes';

// Codes 0/1 ("clear sky" / "mainly clear") are the only ones whose German
// wording needs to change for night, since "sonnig" (sunny) doesn't make
// sense after dark. Every other code's GermanLabel already reads fine at
// night (e.g. "Bewölkt", "Regen").
function describeCurrentCondition(weatherCode: number, isDay: boolean): string {
  if (weatherCode === 0) return isDay ? 'Sonnig' : 'Klarer Himmel';
  if (weatherCode === 1)
    return isDay ? 'Überwiegend sonnig' : 'Überwiegend klar';
  return getWeatherCodeDefinition(weatherCode).GermanLabel;
}

function describeTimeOfDay(hour: number): string {
  if (hour < 12) return 'Laufe des Vormittags';
  if (hour < 18) return 'Laufe des Nachmittags';
  return 'Laufe des Abends';
}

interface FutureRainSignal {
  hour: WeatherForecastHour;
  probabilityPercent: number;
  isThunderstorm: boolean;
  isHeavy: boolean;
  isShowerCategory: boolean;
}

function findFutureRainSignal(
  snapshot: WeatherSnapshot,
  rules: WeatherForecastRules,
): FutureRainSignal | undefined {
  const observedAtMs = parseWeatherTimestamp(
    snapshot.current.observedAt,
  ).valueOf();
  const windowEndMs = observedAtMs + rules.lookAheadHours * 60 * 60 * 1000;

  for (const hour of snapshot.hourly) {
    const hourMs = parseWeatherTimestamp(hour.time).valueOf();
    if (hourMs <= observedAtMs || hourMs > windowEndMs) continue;

    const definition = getWeatherCodeDefinition(hour.weatherCode);
    const probabilityPercent = hour.precipitationProbabilityPercent ?? 0;
    const amountMillimetres = Math.max(
      hour.precipitationMillimetres ?? 0,
      hour.rainMillimetres ?? 0,
    );
    const isThunderstorm = definition.category === 'thunderstorm';
    const isNotable = amountMillimetres >= rules.notableRainMillimetres;

    if (
      isThunderstorm ||
      probabilityPercent >= rules.possibleRainProbabilityPercent ||
      isNotable
    ) {
      return {
        hour,
        isHeavy: amountMillimetres >= rules.heavyRainMillimetres,
        isShowerCategory: definition.category === 'showers',
        isThunderstorm,
        probabilityPercent,
      };
    }
  }

  return undefined;
}

function describeFutureRain(
  signal: FutureRainSignal,
  timeZone: string,
  rules: WeatherForecastRules,
): string {
  // formatWeatherHourLabel already renders "19 Uhr" (Intl's de-DE
  // hour-numeric format includes the unit), so sentences below must not
  // append a second "Uhr".
  const hourLabel = formatWeatherHourLabel(signal.hour.time, timeZone);

  if (signal.isThunderstorm) {
    return 'Später sind Gewitter möglich.';
  }

  if (signal.probabilityPercent >= rules.likelyRainProbabilityPercent) {
    return `Ab etwa ${hourLabel} ist Regen wahrscheinlich.`;
  }

  if (signal.isShowerCategory) {
    return signal.isHeavy
      ? `Gegen ${hourLabel} sind kräftige Schauer möglich.`
      : `Gegen ${hourLabel} sind Schauer möglich.`;
  }

  return `Gegen ${hourLabel} kann es regnen.`;
}

/**
 * Generates the compact German weather statement from a normalised
 * WeatherSnapshot. Pure and deterministic -- same input always produces the
 * same output, so it is safe to call from the client controller after every
 * fetch or cache read.
 */
export function summariseWeather(
  snapshot: WeatherSnapshot,
  rules: WeatherForecastRules = WEATHER_FORECAST_RULES,
): string {
  const { current } = snapshot;
  const definition = getWeatherCodeDefinition(current.weatherCode);
  const isRainingNow =
    (current.rainMillimetres ?? 0) >= rules.notableRainMillimetres ||
    definition.category === 'rain' ||
    definition.category === 'showers' ||
    definition.category === 'drizzle';
  const isHumidAndCloudy =
    (current.relativeHumidityPercent ?? 0) >= 80 &&
    (definition.category === 'cloudy' ||
      definition.category === 'partly-cloudy');

  const currentSentence = isRainingNow
    ? 'Es regnet.'
    : isHumidAndCloudy
      ? 'Schwül und bewölkt.'
      : `${describeCurrentCondition(current.weatherCode, current.isDay)}.`;

  const signal = findFutureRainSignal(snapshot, rules);

  let outlookSentence: string;
  if (isRainingNow) {
    const observedHour = readLocalHour(current.observedAt);
    outlookSentence = signal
      ? 'Der Regen dürfte in den kommenden Stunden anhalten.'
      : `Im ${describeTimeOfDay(observedHour)} lässt der Regen voraussichtlich nach.`;
  } else if (signal) {
    outlookSentence = describeFutureRain(
      signal,
      snapshot.location.timezone,
      rules,
    );
  } else {
    outlookSentence =
      'In den nächsten Stunden bleibt es voraussichtlich trocken.';
  }

  return `${currentSentence} ${outlookSentence}`;
}
